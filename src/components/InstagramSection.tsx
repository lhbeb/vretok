import { brand } from '@/config/brand';
import React from 'react';
import Image from 'next/image';
import { Instagram, ExternalLink } from 'lucide-react';

const InstagramSection: React.FC = () => {
  if (!brand.instagram) return null;
  return (
    <section className="py-8 bg-white border-t border-gray-100">
      <div className="w-full px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#F8FAFC]/40 rounded-xl shadow-sm border border-[#0F172A]/10 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Profile Info */}
              <div className="flex items-center space-x-4">
                {/* Profile Picture with Instagram Gradient Border */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full p-0.5 flex-shrink-0">
                  <div className="w-full h-full bg-white rounded-full overflow-hidden">
                    <Image
                      src="/icon.png"
                      alt="Vretok Profile"
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-grow">
                  <h3 className="font-bold text-[#0F172A] text-lg sm:text-xl mb-0.5">Vretok</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-2">Vretok Activewear</p>

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
                  className="inline-flex items-center justify-center px-6 py-3 bg-[#0F172A] hover:bg-[#020617] text-[#F8FAFC] font-medium rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Instagram className="h-5 w-5 mr-2 text-[#E11D48]" />
                  <span className="hidden sm:inline">Follow on Instagram</span>
                  <span className="sm:hidden">Follow</span>
                  <ExternalLink className="h-4 w-4 ml-2 opacity-70" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
