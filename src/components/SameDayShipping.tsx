"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Truck, Package } from 'lucide-react';

interface SameDayShippingProps {
  fullWidth?: boolean;
  contained?: boolean;
}

const SameDayShipping: React.FC<SameDayShippingProps> = ({ fullWidth = false, contained = false }) => {
  const content = (
    <div className={`w-full ${fullWidth ? '' : 'max-w-7xl'} mx-auto`}>
      {/* Main Banner */}
      <div className="rounded-2xl overflow-hidden shadow-sm mb-8 border border-[#0F172A]/10">
        <div className="flex flex-col md:flex-row">
          {/* Left Section - Image */}
          <div className="relative min-h-[360px] w-full md:min-h-[400px] md:w-[45%]">
            <Image
              src="/vretok-fashion-delivery.webp"
              alt="Vretok activewear neatly packed for delivery"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover object-center"
              priority
            />
          </div>

          {/* Right Section - Content */}
          <div className="md:w-[55%] bg-[#0F172A] text-[#F8FAFC] p-8 sm:p-12 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-white">
              Delivery & Dispatch
            </h2>

            <p className="text-base sm:text-lg leading-relaxed font-normal mb-8 text-[#F8FAFC]/90">
              Building your next training look? Review the <strong>Vretok</strong> shipping policy for delivery options and dispatch details before placing your order.
            </p>
            <Link
              href="/shipping-policy"
              className="text-[#F8FAFC] hover:text-white text-base sm:text-lg underline underline-offset-4 transition-colors font-medium"
            >
              See our delivery & shipping policy →
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#0F172A]/10">
          <div className="flex items-start gap-4">
            <div className="bg-[#0F172A] rounded-full p-3 flex-shrink-0">
              <Clock className="w-6 h-6 text-[#F8FAFC]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-lg mb-2">
                Order Processing
              </h3>
              <p className="text-gray-600 text-sm">
                Orders normally leave our fulfillment process within 1–2 business days after payment is confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#0F172A]/10">
          <div className="flex items-start gap-4">
            <div className="bg-[#0F172A] rounded-full p-3 flex-shrink-0">
              <Package className="w-6 h-6 text-[#F8FAFC]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-lg mb-2">
                30-Day Returns
              </h3>
              <p className="text-gray-600 text-sm">
                Eligible items may be returned by mail within 30 days. Conditions and shipping responsibility are explained in our return policy.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#0F172A]/10">
          <div className="flex items-start gap-4">
            <div className="bg-[#0F172A] rounded-full p-3 flex-shrink-0">
              <Truck className="w-6 h-6 text-[#F8FAFC]" />
            </div>
            <div>
              <h3 className="font-bold text-[#0F172A] text-lg mb-2">
                Shipment Tracking
              </h3>
              <p className="text-gray-600 text-sm">
                When tracking is available, it is sent after dispatch so you can follow carrier updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-[#0F172A]/10">
        <div>
          <p className="text-gray-500 text-sm mb-1">
            Ready to experience the Vretok difference?
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#0F172A]">
            Order today for <span className="text-[#E11D48]">fast worldwide shipping</span>
          </p>
        </div>
        <a
          href="#products"
          className="bg-[#0F172A] hover:bg-[#020617] text-[#F8FAFC] font-bold py-3.5 px-8 rounded-full text-base sm:text-lg transition-colors whitespace-nowrap shadow-sm"
        >
          Browse Leggings
        </a>
      </div>
    </div>
  );

  if (contained) {
    return (
      <div className="py-8 bg-[#F8FAFC] rounded-xl">
        {content}
      </div>
    );
  }

  return (
    <section className="py-16 bg-[#F8FAFC]">
      <div className="container mx-auto px-4">
        {content}
      </div>
    </section>
  );
};

export default SameDayShipping;
