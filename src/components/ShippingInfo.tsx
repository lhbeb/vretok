import React from 'react';
import { MapPin, Truck, RefreshCw } from 'lucide-react';
import { getMarket } from '@/lib/markets';

interface ShippingInfoProps {
  className?: string;
  targetMarket?: string | null;
}

const ShippingInfo: React.FC<ShippingInfoProps> = ({ className = '', targetMarket }) => {
  const market = getMarket(targetMarket);

  return (
    <div className={`overflow-hidden rounded-[24px] border border-[#0F172A]/15 bg-white ${className}`}>
      <div className="grid grid-cols-1 divide-y divide-[#0F172A]/10 md:grid-cols-3 md:divide-x md:divide-y-0">
        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#0F172A]">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">Ships from</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A]">
                {market.shipsFrom} {market.shipsFromFlag}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#0F172A]">
              <Truck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">Estimated delivery</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A]">Estimated 6–11 business days</p>
              <p className="mt-1 text-sm text-[#0F172A] font-medium">{market.freeShippingText}</p>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#0F172A]">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-500">Returns</p>
              <p className="mt-1 text-sm font-semibold text-[#0F172A]">{market.returnsText}</p>
              <p className="mt-1 text-sm text-[#0F172A] font-medium">Eligible returns within 30 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingInfo;
