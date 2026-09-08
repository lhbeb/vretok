"use client";

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';

const Hero = () => {
  const typingTextRef = useRef<HTMLSpanElement>(null);
  const placeholder = '\u00a0';

  useEffect(() => {
    const element = typingTextRef.current;
    if (!element) return;

    const words = [
      'Squat-Proof Leggings',
      'Performance Activewear',
      'Seamless Gym Sets',
      'Premium Workout Fits'
    ];
    let isAnimating = true;
    let currentIndex = 0;

    const sleep = (duration: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, duration));

    const typeWord = async (word: string) => {
      element.textContent = '';
      const letters = word.split('');
      for (const letter of letters) {
        if (!isAnimating) return;
        element.textContent = `${element.textContent}${letter}`;
        await sleep(80);
      }
    };

    const deleteWord = async () => {
      while (isAnimating && (element.textContent?.length ?? 0) > 0) {
        element.textContent = element.textContent?.slice(0, -1) ?? '';
        await sleep(35);
      }
      element.textContent = placeholder;
    };

    const animateLoop = async () => {
      element.textContent = placeholder;

      while (isAnimating) {
        const word = words[currentIndex];

        await typeWord(word);
        if (!isAnimating) break;

        await sleep(2200);
        if (!isAnimating) break;

        await deleteWord();
        if (!isAnimating) break;

        await sleep(300);
        if (!isAnimating) break;

        currentIndex = (currentIndex + 1) % words.length;
      }
    };

    animateLoop();

    return () => {
      isAnimating = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden w-full min-h-[500px] flex items-center bg-[#0F172A]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/herosection.png"
          alt="Vretok blush-pink activewear collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center md:object-right"
        />
        {/* Dark overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24 lg:py-32">
        <div className="max-w-2xl">
          {/* Brand introduction */}
          <h1 className="text-3xl font-bold leading-tight text-[#F8FAFC] md:text-4xl lg:text-5xl">
            <span
              ref={typingTextRef}
              className="mb-1 block min-h-[1.2em] text-[#F43F5E]"
            >
              {placeholder}
            </span>
            <span className="block leading-tight text-white mt-2">
              Engineered Leggings & Gym Fashion
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-[580px] text-base leading-relaxed text-slate-200 md:text-lg font-normal drop-shadow-md">
            High-waisted compression, squat-proof fabric, and sculpting gym wear engineered for ultimate confidence in every rep.
          </p>
          
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/search?category=Leggings" className="inline-flex rounded-full bg-[#E11D48] hover:bg-[#BE123C] px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.02]">
              Explore Leggings →
            </Link>
            <Link href="/about" className="inline-flex rounded-full border border-white/40 hover:border-white/80 px-7 py-3.5 text-sm font-medium text-white hover:bg-white/10 transition-colors backdrop-blur-sm">
              About Vretok
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
