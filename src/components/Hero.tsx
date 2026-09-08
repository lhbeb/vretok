import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC]">
      <div className="container relative z-10 mx-auto px-4 py-8 md:py-10">
        <div className="mx-auto grid w-full max-w-7xl overflow-hidden rounded-2xl shadow-xl md:min-h-[440px] md:grid-cols-[1fr_1fr] md:items-stretch border border-[#0F172A]/10">
          {/* Content panel */}
          <div className="order-2 flex w-full flex-col justify-center bg-[#0F172A] p-6 sm:p-8 md:order-1 md:p-10 lg:p-12 text-[#F8FAFC]">
            {/* Brand introduction */}
            <h1 className="max-w-[620px] text-2xl font-bold leading-tight text-[#F8FAFC] md:text-3xl lg:text-[36px]">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E11D48]/15 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#F43F5E] border border-[#E11D48]/30 w-fit">Vretok Gym & Activewear</span>
              <span className="block leading-tight text-white mt-1">
                Engineered Leggings & Gym Fashion
              </span>
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-[580px] text-sm leading-relaxed text-slate-300 md:text-base font-normal">
              High-waisted compression, squat-proof fabric, and sculpting gym wear engineered for ultimate confidence in every rep.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/search?category=Leggings" className="inline-flex rounded-full bg-[#E11D48] hover:bg-[#BE123C] px-7 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02]">
                Explore Leggings →
              </Link>
              <Link href="/about" className="inline-flex rounded-full border border-white/20 hover:border-white/50 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors">
                About Vretok
              </Link>
            </div>
          </div>

          {/* Image panel */}
          <div className="relative order-1 min-h-[280px] overflow-hidden md:order-2 md:min-h-0 bg-[#0F172A]/20">
            <Image
              src="/vretok-wave-hero.webp"
              alt="Vretok performance collection campaign"
              fill
              priority
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 via-transparent to-transparent" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
