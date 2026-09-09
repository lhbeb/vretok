"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  RefreshCw,
  Repeat2,
  Search,
  Users,
  X,
} from 'lucide-react';

type PaymentMethod = { id: string; brand: string; last4: string; expMonth: number | null; expYear: number | null } | null;
type Customer = { id: string; name: string; email: string; deleted: boolean; created: number; currency: string | null; defaultPaymentMethod: PaymentMethod };
type Subscriber = {
  id: string;
  customer: Pick<Customer, 'id' | 'name' | 'email' | 'deleted'>;
  status: string;
  amount: number;
  currency: string;
  interval: string | null;
  intervalCount: number;
  productName: string;
  quantity: number;
  currentPeriodEnd: number | null;
  cancelAtPeriodEnd: boolean;
  defaultPaymentMethod: PaymentMethod;
  created: number;
};
type Payment = {
  id: string;
  customer: Pick<Customer, 'id' | 'name' | 'email' | 'deleted'>;
  amount: number;
  amountReceived: number;
  currency: string;
  status: string;
  description: string;
  created: number;
  paymentMethod: PaymentMethod;
};
type Invoice = {
  id: string;
  number: string | null;
  customer: Pick<Customer, 'id' | 'name' | 'email' | 'deleted'>;
  status: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  created: number;
  hostedInvoiceUrl: string | null;
};
type ManagerData = {
  mode: 'live' | 'test';
  customers: Customer[];
  subscriptions: Subscriber[];
  payments: Payment[];
  invoices: Invoice[];
  hasMore: Record<string, boolean>;
};
type Tab = 'subscribers' | 'payments' | 'invoices' | 'manual';

const statusClasses: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  succeeded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  trialing: 'bg-blue-50 text-blue-700 border-blue-200',
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  past_due: 'bg-amber-50 text-amber-700 border-amber-200',
  requires_action: 'bg-amber-50 text-amber-700 border-amber-200',
  canceled: 'bg-gray-100 text-gray-600 border-gray-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

function money(amount: number, currency: string) {
  const zeroDecimal = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'].includes(currency.toLowerCase());
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency.toUpperCase() }).format(amount / (zeroDecimal ? 1 : 100));
}

function date(timestamp: number | null) {
  return timestamp ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp * 1000) : '—';
}

function customerName(customer: { name: string; email: string; id: string }) {
  return customer.name || customer.email || customer.id;
}

function CardLabel({ method }: { method: PaymentMethod }) {
  if (!method) return <span className="text-gray-400">No saved card</span>;
  return <span className="capitalize">{method.brand} •••• {method.last4}</span>;
}

function StatusBadge({ status }: { status: string | null }) {
  const value = status || 'unknown';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[value] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{value.replaceAll('_', ' ')}</span>;
}

export default function SubscriptionManagerPage() {
  const [data, setData] = useState<ManagerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('subscribers');
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [description, setDescription] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [charging, setCharging] = useState(false);
  const [chargeResult, setChargeResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const token = () => typeof window === 'undefined' ? '' : localStorage.getItem('admin_token') || '';
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/subscription-manager', {
        cache: 'no-store',
        headers: token() ? { Authorization: `Bearer ${token()}` } : {},
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Could not load Stripe data.');
      setData(body);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load Stripe data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!data || !query) return data;
    const has = (...values: Array<string | null | undefined>) => values.some((value) => value?.toLowerCase().includes(query));
    return {
      ...data,
      subscriptions: data.subscriptions.filter((item) => has(item.id, item.status, item.productName, item.customer.name, item.customer.email)),
      payments: data.payments.filter((item) => has(item.id, item.status, item.description, item.customer.name, item.customer.email)),
      invoices: data.invoices.filter((item) => has(item.id, item.number, item.status, item.customer.name, item.customer.email)),
    };
  }, [data, search]);

  const activeSubscriptions = data?.subscriptions.filter((item) => ['active', 'trialing'].includes(item.status)).length || 0;
  const successfulVolume = data?.payments.filter((item) => item.status === 'succeeded').reduce((sum, item) => sum + item.amountReceived, 0) || 0;
  const selectedCustomer = data?.customers.find((customer) => customer.id === customerId);

  const startChargeAgain = (payment: Payment) => {
    setCustomerId(payment.customer.id);
    setAmount((payment.amount / 100).toFixed(2));
    setCurrency(payment.currency.toUpperCase());
    setDescription(payment.description ? `Charge again: ${payment.description}` : `Charge again for ${payment.id}`);
    setChargeResult(null);
    setTab('manual');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitCharge = async () => {
    if (!selectedCustomer) return;
    setCharging(true);
    setChargeResult(null);
    try {
      const response = await fetch('/api/admin/subscription-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token() ? { Authorization: `Bearer ${token()}` } : {}) },
        body: JSON.stringify({
          customerId,
          paymentMethodId: selectedCustomer.defaultPaymentMethod?.id || '',
          amount,
          currency,
          description,
          authorized,
          confirmationText,
          idempotencyKey,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || `Payment status: ${body.payment?.status || 'unknown'}`);
      setChargeResult({ type: 'success', message: `${money(body.payment.amount, body.payment.currency)} charged successfully. Payment ${body.payment.id}.` });
      setReviewOpen(false);
      setAuthorized(false);
      setConfirmationText('');
      await load();
    } catch (chargeError) {
      setChargeResult({ type: 'error', message: chargeError instanceof Error ? chargeError.message : 'The charge failed.' });
    } finally {
      setCharging(false);
    }
  };

  return (
    <AdminLayout title="Subscription Manager" subtitle="Stripe subscribers, invoices, payments, and authorised manual charges">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-950 p-2.5 text-white"><Repeat2 className="h-5 w-5" /></div>
            <div>
              <div className="flex items-center gap-2"><p className="font-semibold text-slate-900">Stripe account</p>{data && <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${data.mode === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{data.mode}</span>}</div>
              <p className="text-sm text-slate-500">Credentials stay on the server and are loaded from Payment Settings.</p>
            </div>
          </div>
          <button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Stripe</button>
        </div>

        {error && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><p className="font-semibold">Stripe data could not be loaded</p><p>{error}</p></div></div>}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Stripe customers', value: data?.customers.length ?? '—', icon: Users },
            { label: 'Active subscribers', value: activeSubscriptions, icon: Repeat2 },
            { label: 'Recent payments', value: data?.payments.length ?? '—', icon: CreditCard },
            { label: 'Successful volume loaded', value: data ? money(successfulVolume, data.payments.find((p) => p.status === 'succeeded')?.currency || 'gbp') : '—', icon: CheckCircle2 },
          ].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5" /></div><p className="text-2xl font-bold text-slate-950">{value}</p><p className="mt-1 text-sm text-slate-500">{label}</p></div>)}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
              {([
                ['subscribers', 'Subscribers'], ['payments', 'Transactions'], ['invoices', 'Invoices'], ['manual', 'Manual charge'],
              ] as Array<[Tab, string]>).map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{label}</button>)}
            </div>
            {tab !== 'manual' && <label className="relative block lg:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Stripe records" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-slate-400" /></label>}
          </div>

          {loading && !data ? <div className="flex min-h-72 items-center justify-center gap-3 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading Stripe records…</div> : null}

          {!loading && data && tab === 'subscribers' && <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Subscriber</th><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Billing</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Next period</th><th className="px-5 py-3">Payment method</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered?.subscriptions.map((item) => <tr key={item.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{customerName(item.customer)}</p><p className="text-xs text-slate-500">{item.customer.email || item.id}</p></td><td className="px-5 py-4"><p className="font-medium text-slate-800">{item.productName}</p><p className="text-xs text-slate-500">{item.id}</p></td><td className="px-5 py-4 font-semibold text-slate-900">{money(item.amount * item.quantity, item.currency)} <span className="font-normal text-slate-500">/ {item.interval || 'period'}</span></td><td className="px-5 py-4"><StatusBadge status={item.status} />{item.cancelAtPeriodEnd && <p className="mt-1 text-xs text-amber-700">Ends after current period</p>}</td><td className="px-5 py-4 text-slate-600">{date(item.currentPeriodEnd)}</td><td className="px-5 py-4 text-slate-600"><CardLabel method={item.defaultPaymentMethod} /></td></tr>)}{!filtered?.subscriptions.length && <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-500">No matching subscriptions.</td></tr>}</tbody></table></div>}

          {!loading && data && tab === 'payments' && <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{filtered?.payments.map((item) => <tr key={item.id} className="hover:bg-slate-50/60"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{customerName(item.customer)}</p><p className="text-xs text-slate-500">{item.customer.email || 'Guest payment'}</p></td><td className="px-5 py-4"><p className="max-w-xs truncate text-slate-700">{item.description || item.id}</p><p className="text-xs text-slate-400"><CardLabel method={item.paymentMethod} /></p></td><td className="px-5 py-4 font-semibold text-slate-900">{money(item.amount, item.currency)}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-slate-600">{date(item.created)}</td><td className="px-5 py-4 text-right"><button disabled={!item.customer.id} onClick={() => startChargeAgain(item)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Charge again</button></td></tr>)}{!filtered?.payments.length && <tr><td colSpan={6} className="px-5 py-16 text-center text-slate-500">No matching transactions.</td></tr>}</tbody></table></div>}

          {!loading && data && tab === 'invoices' && <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered?.invoices.map((item) => <tr key={item.id} className="hover:bg-slate-50/60"><td className="px-5 py-4">{item.hostedInvoiceUrl ? <a href={item.hostedInvoiceUrl} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900">{item.number || item.id}</a> : <span className="font-semibold text-slate-900">{item.number || item.id}</span>}</td><td className="px-5 py-4"><p className="font-medium text-slate-800">{customerName(item.customer)}</p><p className="text-xs text-slate-500">{item.customer.email}</p></td><td className="px-5 py-4 font-semibold text-slate-900">{money(item.amountDue, item.currency)}{item.amountPaid > 0 && <p className="text-xs font-normal text-slate-500">Paid {money(item.amountPaid, item.currency)}</p>}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-slate-600">{date(item.created)}</td></tr>)}{!filtered?.invoices.length && <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-500">No matching invoices.</td></tr>}</tbody></table></div>}

          {!loading && data && tab === 'manual' && <div className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <div><h2 className="text-lg font-bold text-slate-950">Create an authorised manual charge</h2><p className="mt-1 text-sm text-slate-500">Charges the customer’s saved card as an off-session Stripe payment.</p></div>
              {chargeResult && <div className={`flex gap-3 rounded-xl border p-4 text-sm ${chargeResult.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{chargeResult.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}<p>{chargeResult.message}</p></div>}
              <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Stripe customer</span><select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"><option value="">Select a customer</option>{data.customers.filter((c) => !c.deleted).map((customer) => <option key={customer.id} value={customer.id}>{customerName(customer)}{customer.email && customer.name ? ` — ${customer.email}` : ''}{customer.defaultPaymentMethod?.last4 ? ` — •••• ${customer.defaultPaymentMethod.last4}` : ''}</option>)}</select></label>
              <div className="grid gap-4 sm:grid-cols-[1fr_140px]"><label><span className="mb-2 block text-sm font-semibold text-slate-700">Amount</span><input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400" /></label><label><span className="mb-2 block text-sm font-semibold text-slate-700">Currency</span><select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"><option>GBP</option><option>USD</option><option>EUR</option></select></label></div>
              <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Description</span><input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} placeholder="What this charge is for" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400" /></label>
              <button onClick={() => { setAuthorized(false); setConfirmationText(''); setIdempotencyKey(crypto.randomUUID()); setReviewOpen(true); }} disabled={!selectedCustomer || !amount || Number(amount) <= 0} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"><CreditCard className="h-4 w-4" /> Review manual charge</button>
            </div>
            <aside className="rounded-2xl bg-slate-50 p-5"><h3 className="font-bold text-slate-900">Charge safeguards</h3><ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600"><li>• Only a Super Admin can submit a charge.</li><li>• Stripe credentials never leave the server.</li><li>• The saved card must belong to the selected customer.</li><li>• Every request uses an idempotency key to prevent accidental duplicates.</li><li>• Some banks may require the customer to authenticate again.</li></ul>{selectedCustomer && <div className="mt-5 border-t border-slate-200 pt-5"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Selected payment method</p><p className="mt-2 font-semibold text-slate-800"><CardLabel method={selectedCustomer.defaultPaymentMethod} /></p>{!selectedCustomer.defaultPaymentMethod && <p className="mt-2 text-xs leading-5 text-amber-700">No default card is visible. Stripe will try the customer’s first saved card.</p>}</div>}</aside>
          </div>}
        </section>

        {data && Object.values(data.hasMore).some(Boolean) && <p className="text-center text-xs text-slate-500">Showing the 100 most recent records in each Stripe category.</p>}
      </div>

      {reviewOpen && selectedCustomer && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="charge-review-title"><div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-200 p-5"><div><h2 id="charge-review-title" className="text-xl font-bold text-slate-950">Confirm manual charge</h2><p className="mt-1 text-sm text-slate-500">Review the details before sending them to Stripe.</p></div><button onClick={() => setReviewOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="h-5 w-5" /></button></div><div className="space-y-5 p-5"><div className="rounded-xl bg-slate-50 p-4"><dl className="grid grid-cols-[110px_1fr] gap-y-3 text-sm"><dt className="text-slate-500">Customer</dt><dd className="font-semibold text-slate-900">{customerName(selectedCustomer)}</dd><dt className="text-slate-500">Saved card</dt><dd className="font-semibold text-slate-900"><CardLabel method={selectedCustomer.defaultPaymentMethod} /></dd><dt className="text-slate-500">Amount</dt><dd className="text-lg font-bold text-slate-950">{money(Math.round(Number(amount) * 100), currency)}</dd><dt className="text-slate-500">Description</dt><dd className="text-slate-700">{description || 'Manual charge from Vretok Subscription Manager'}</dd></dl></div><label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4"><input type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="mt-1 h-4 w-4 accent-slate-950" /><span className="text-sm leading-6 text-slate-700">I confirm this customer authorised Vretok to charge this amount using their saved payment method.</span></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Type <strong>CHARGE</strong> to confirm</span><input value={confirmationText} onChange={(e) => setConfirmationText(e.target.value)} autoComplete="off" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold tracking-wide outline-none focus:border-slate-400" /></label>{chargeResult?.type === 'error' && <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle className="h-5 w-5 shrink-0" />{chargeResult.message}</div>}</div><div className="flex gap-3 border-t border-slate-200 p-5"><button onClick={() => setReviewOpen(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><button onClick={submitCharge} disabled={charging || !authorized || confirmationText !== 'CHARGE'} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">{charging && <Loader2 className="h-4 w-4 animate-spin" />}{charging ? 'Charging…' : `Charge ${currency} ${amount}`}</button></div></div></div>}
    </AdminLayout>
  );
}
