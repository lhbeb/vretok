import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { jwtVerify } from 'jose';
import { getStripeConfig } from '@/lib/supabase/payment-settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AdminAuth = { email: string; role: string };

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

async function getAdminAuth(request: NextRequest): Promise<AdminAuth | null> {
  const { shouldBypassAuth } = await import('@/lib/supabase/auth');
  if (process.env.NODE_ENV === 'development' && shouldBypassAuth()) {
    return { email: 'dev@localhost', role: 'SUPER_ADMIN' };
  }

  const token = request.cookies.get('admin_token')?.value
    || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const { payload } = await jwtVerify(token, secret);
    const role = String(payload.role || '').toUpperCase().replace('-', '_');
    if (payload.isActive !== true || !['SUPER_ADMIN', 'REGULAR_ADMIN', 'ADMIN'].includes(role)) return null;
    return { email: String(payload.email || ''), role };
  } catch {
    return null;
  }
}

async function getStripe() {
  const config = await getStripeConfig();
  if (!config.isActive || !config.secretKey || !config.secretKey.startsWith('sk_')) {
    throw new Error('Stripe is not configured or is inactive.');
  }
  return {
    stripe: new Stripe(config.secretKey, { apiVersion: '2026-01-28.clover' as any }),
    mode: config.mode,
  };
}

function customerSummary(customer: Stripe.Customer | Stripe.DeletedCustomer | string | null) {
  if (!customer || typeof customer === 'string') {
    return { id: typeof customer === 'string' ? customer : '', name: '', email: '', deleted: false };
  }
  if (customer.deleted) return { id: customer.id, name: 'Deleted customer', email: '', deleted: true };
  return { id: customer.id, name: customer.name || '', email: customer.email || '', deleted: false };
}

function paymentMethodSummary(method: Stripe.PaymentMethod | string | null | undefined) {
  if (!method || typeof method === 'string') return method ? { id: method, brand: '', last4: '', expMonth: null, expYear: null } : null;
  return {
    id: method.id,
    brand: method.card?.brand || method.type,
    last4: method.card?.last4 || '',
    expMonth: method.card?.exp_month || null,
    expYear: method.card?.exp_year || null,
  };
}

function safeStripeMessage(error: unknown) {
  if (error instanceof Stripe.errors.StripeCardError) {
    if (error.code === 'authentication_required') return 'The customer must authenticate this payment. Ask them to complete a new checkout.';
    if (error.code === 'card_declined') return 'The saved card was declined.';
    return 'Stripe could not charge the saved card.';
  }
  if (error instanceof Error && error.message === 'Stripe is not configured or is inactive.') return error.message;
  return 'Stripe could not complete this request.';
}

export async function GET(request: NextRequest) {
  const auth = await getAdminAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { stripe, mode } = await getStripe();
    const [customerList, subscriptionList, paymentList, invoiceList] = await Promise.all([
      stripe.customers.list({ limit: 100, expand: ['data.invoice_settings.default_payment_method'] }),
      stripe.subscriptions.list({ limit: 100, status: 'all', expand: ['data.customer', 'data.default_payment_method'] }),
      stripe.paymentIntents.list({ limit: 100, expand: ['data.customer', 'data.payment_method'] }),
      stripe.invoices.list({ limit: 100, expand: ['data.customer'] }),
    ]);

    const paymentMethodsByCustomer = new Map<string, ReturnType<typeof paymentMethodSummary>>();
    for (const payment of paymentList.data) {
      const customerId = customerSummary(payment.customer).id;
      const method = paymentMethodSummary(payment.payment_method);
      if (customerId && method && !paymentMethodsByCustomer.has(customerId)) {
        paymentMethodsByCustomer.set(customerId, method);
      }
    }

    const customers = customerList.data.map((customer) => ({
      ...customerSummary(customer),
      created: customer.created,
      currency: customer.currency || null,
      defaultPaymentMethod: paymentMethodSummary(customer.invoice_settings.default_payment_method)
        || paymentMethodsByCustomer.get(customer.id)
        || null,
    }));
    const customerPaymentMethods = new Map(customers.map((customer) => [customer.id, customer.defaultPaymentMethod]));

    const subscriptions = subscriptionList.data.map((subscription) => {
      const item = subscription.items.data[0];
      const raw = subscription as any;
      return {
        id: subscription.id,
        customer: customerSummary(subscription.customer),
        status: subscription.status,
        amount: item?.price?.unit_amount || 0,
        currency: item?.price?.currency || 'gbp',
        interval: item?.price?.recurring?.interval || null,
        intervalCount: item?.price?.recurring?.interval_count || 1,
        productName: typeof item?.price?.product === 'object' && item.price.product && !('deleted' in item.price.product)
          ? item.price.product.name
          : item?.price?.nickname || 'Subscription',
        quantity: item?.quantity || 1,
        currentPeriodEnd: raw.current_period_end || item?.current_period_end || null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        defaultPaymentMethod: paymentMethodSummary(subscription.default_payment_method)
          || customerPaymentMethods.get(customerSummary(subscription.customer).id)
          || null,
        created: subscription.created,
      };
    });

    const payments = paymentList.data.map((payment) => ({
      id: payment.id,
      customer: customerSummary(payment.customer),
      amount: payment.amount,
      amountReceived: payment.amount_received,
      currency: payment.currency,
      status: payment.status,
      description: payment.description || '',
      created: payment.created,
      paymentMethod: paymentMethodSummary(payment.payment_method),
    }));

    const invoices = invoiceList.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      customer: customerSummary(invoice.customer),
      status: invoice.status,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      currency: invoice.currency,
      created: invoice.created,
      hostedInvoiceUrl: invoice.hosted_invoice_url,
    }));

    return NextResponse.json({
      mode,
      customers,
      subscriptions,
      payments,
      invoices,
      hasMore: {
        customers: customerList.has_more,
        subscriptions: subscriptionList.has_more,
        payments: paymentList.has_more,
        invoices: invoiceList.has_more,
      },
    });
  } catch (error) {
    console.error('[Subscription Manager] Failed to load Stripe data:', error);
    return NextResponse.json({ error: safeStripeMessage(error) }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAdminAuth(request);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (auth.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Only a Super Admin can create a manual charge.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const customerId = String(body.customerId || '').trim();
    const paymentMethodId = String(body.paymentMethodId || '').trim();
    const amountText = String(body.amount || '').trim();
    const currency = String(body.currency || 'gbp').trim().toLowerCase();
    const description = String(body.description || '').trim().slice(0, 500);
    const idempotencyKey = String(body.idempotencyKey || '').trim();

    if (!customerId.startsWith('cus_')) return NextResponse.json({ error: 'Select a valid Stripe customer.' }, { status: 400 });
    if (!/^[a-z]{3}$/.test(currency)) return NextResponse.json({ error: 'Select a valid currency.' }, { status: 400 });
    if (!/^\d+(\.\d{1,2})?$/.test(amountText)) return NextResponse.json({ error: 'Enter a valid amount.' }, { status: 400 });
    if (body.authorized !== true) return NextResponse.json({ error: 'Confirm that the customer authorised this charge.' }, { status: 400 });
    if (body.confirmationText !== 'CHARGE') return NextResponse.json({ error: 'Type CHARGE to confirm.' }, { status: 400 });
    if (idempotencyKey.length < 16 || idempotencyKey.length > 255) return NextResponse.json({ error: 'Invalid charge request. Refresh and try again.' }, { status: 400 });

    const decimalAmount = Number(amountText);
    const amount = Math.round(decimalAmount * (ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 100));
    const minimum = ZERO_DECIMAL_CURRENCIES.has(currency) ? 1 : 50;
    if (!Number.isSafeInteger(amount) || amount < minimum || amount > 10_000_000) {
      return NextResponse.json({ error: 'The amount is outside the allowed range.' }, { status: 400 });
    }

    const { stripe } = await getStripe();
    const customer = await stripe.customers.retrieve(customerId, { expand: ['invoice_settings.default_payment_method'] });
    if (customer.deleted) return NextResponse.json({ error: 'This Stripe customer has been deleted.' }, { status: 400 });

    let methodId = paymentMethodId;
    if (!methodId) {
      const defaultMethod = customer.invoice_settings.default_payment_method;
      methodId = typeof defaultMethod === 'string' ? defaultMethod : defaultMethod?.id || '';
    }
    if (!methodId) {
      const methods = await stripe.paymentMethods.list({ customer: customerId, type: 'card', limit: 1 });
      methodId = methods.data[0]?.id || '';
    }
    if (!methodId.startsWith('pm_')) return NextResponse.json({ error: 'This customer has no saved card to charge.' }, { status: 400 });

    const method = await stripe.paymentMethods.retrieve(methodId);
    const methodCustomerId = typeof method.customer === 'string' ? method.customer : method.customer?.id;
    if (methodCustomerId !== customerId || method.type !== 'card') {
      return NextResponse.json({ error: 'The selected saved card does not belong to this customer.' }, { status: 400 });
    }

    const priorPayments = await stripe.paymentIntents.list({ customer: customerId, limit: 100 });
    const hasRecordedConsent = priorPayments.data.some((priorPayment) => {
      const priorMethodId = typeof priorPayment.payment_method === 'string'
        ? priorPayment.payment_method
        : priorPayment.payment_method?.id;
      return priorMethodId === methodId && priorPayment.metadata.future_charge_consent === 'granted';
    });
    if (!hasRecordedConsent) {
      return NextResponse.json(
        { error: 'No recorded customer consent exists for future charges on this saved card.' },
        { status: 400 },
      );
    }

    const payment = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method: methodId,
      payment_method_types: ['card'],
      confirm: true,
      off_session: true,
      description: description || 'Manual charge from Vretok Subscription Manager',
      metadata: {
        source: 'vretok_admin_subscription_manager',
        initiated_by: auth.email,
      },
    }, { idempotencyKey });

    console.info('[Subscription Manager] Manual charge created', {
      paymentIntentId: payment.id,
      customerId,
      amount,
      currency,
      status: payment.status,
      initiatedBy: auth.email,
    });

    return NextResponse.json({
      success: payment.status === 'succeeded' || payment.status === 'processing',
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      },
    });
  } catch (error) {
    console.error('[Subscription Manager] Manual charge failed:', error);
    const status = error instanceof Stripe.errors.StripeCardError ? 402 : 502;
    return NextResponse.json({ error: safeStripeMessage(error) }, { status });
  }
}
