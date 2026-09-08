import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#F7F3E8]">
      <div className="container relative z-10 mx-auto px-4 py-8 md:py-10">
        <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-2xl shadow-xl md:min-h-[440px] md:grid-cols-[1fr_1fr] md:items-stretch border border-[#123E52]/10">
          {/* Content panel */}
          <div className="order-2 flex w-full flex-col justify-center bg-[#123E52] p-6 sm:p-8 md:order-1 md:p-10 lg:p-12 text-[#F7F3E8]">
            {/* Brand introduction */}
            <h1 className="max-w-[620px] text-2xl font-bold leading-tight text-[#F7F3E8] md:text-3xl lg:text-[36px]">
              <span className="mb-4 block text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F3E8]/80">Vretok Performance Activewear</span>
              <span className="block leading-tight text-white">
                Own Your Movement
              </span>
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-[580px] text-sm leading-relaxed text-[#F7F3E8]/85 md:text-base">
              Performance leggings and gym fashion designed for training, recovery, and every move between.
            </p>
            <Link href="/about" className="mt-7 inline-flex w-fit rounded-full border border-[#F7F3E8]/50 px-6 py-3 text-sm font-semibold text-[#F7F3E8] hover:bg-[#F7F3E8] hover:text-[#123E52]">About the Vretok Brand →</Link>
          </div>

          {/* Image panel */}
          <div className="relative order-1 min-h-[280px] overflow-hidden md:order-2 md:min-h-0 bg-[#123E52]/20">
            <Image
              src="/vretok-wave-hero.webp"
              alt="Vretok performance collection campaign"
              fill
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#123E52]/60 via-transparent to-transparent" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
