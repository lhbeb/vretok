import { brand } from '@/config/brand';
import React from 'react';
import Image from 'next/image';
import { Instagram, ExternalLink } from 'lucide-react';

const InstagramWidget: React.FC = () => {
  if (!brand.instagram) return null;
  return (
    <div className="bg-[#F7F3E8]/40 rounded-xl shadow-sm border border-[#123E52]/10 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Profile Info */}
        <div className="flex items-center space-x-4">
          {/* Profile Picture with Instagram Gradient Border */}
          <div className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5 flex-shrink-0">
            <div className="w-full h-full bg-white rounded-full overflow-hidden">
              <Image
                src="/icon.png"
                alt="Vretok Profile"
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          {/* Profile Details */}
          <div>
            <h3 className="font-bold text-[#123E52] text-lg mb-0.5">Vretok</h3>
            <p className="text-gray-600 text-sm mb-2">Vretok Activewear</p>

            {/* Statistics */}
            <p className="text-sm text-gray-600">Style made for movement.</p>
          </div>
        </div>

        {/* Follow Us Button */}
        <div className="flex-shrink-0">
          <a
            href={brand.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-[#123E52] hover:bg-[#0C2C3D] text-[#F7F3E8] text-sm font-medium rounded-full transition-all duration-200 shadow-sm"
          >
            <Instagram className="h-4 w-4 mr-2 text-[#397F86]" />
            <span>Follow</span>
            <ExternalLink className="h-3.5 w-3.5 ml-1.5 opacity-70" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default InstagramWidget;
