"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal, useCountUp } from "@/hooks/use-reveal";
import { ArrowDown, ChevronLeft } from "lucide-react";

export function Hero() {
  const { t, isRTL } = useLanguage();
  const { ref, isRevealed } = useReveal({ threshold: 0.1 });
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count1 = useCountUp(30, 2000, isRevealed);
  const count2 = useCountUp(3, 1500, isRevealed);
  const count3 = useCountUp(6, 1500, isRevealed);

  // Typing effect
  const phrases = t.phrases as unknown as string[];

  useEffect(() => {
    const current = phrases[currentPhrase];

    if (!isDeleting) {
      if (displayText.length < current.length) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(current.slice(0, displayText.length + 1));
        }, 80);
      } else {
        timeoutRef.current = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeoutRef.current = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1));
        }, 40);
      } else {
        timeoutRef.current = setTimeout(() => {
          setIsDeleting(false);
          setCurrentPhrase((prev) => (prev + 1) % phrases.length);
        }, 0);
      }
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayText, isDeleting, currentPhrase, phrases]);

  const handleScroll = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen overflow-x-hidden pt-16 section-gradient-dark"
    >
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-shape-1 absolute top-20 right-[10%] h-32 w-32 rounded-full bg-electric-blue/5 blur-xl" />
        <div className="floating-shape-2 absolute top-40 left-[15%] h-48 w-48 rounded-full bg-gold/5 blur-2xl" />
        <div className="floating-shape-3 absolute bottom-20 right-[20%] h-24 w-24 rounded-full bg-electric-blue-light/5 blur-lg" />
        <div className="floating-shape-1 absolute bottom-40 left-[5%] h-36 w-36 rounded-full bg-electric-blue/3 blur-xl" />
        {/* Grid dots */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #2db8ff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col-reverse items-center gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:gap-16 lg:px-8 lg:py-24">
        {/* Text side */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex-1 text-center lg:text-start"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-blue/20 bg-electric-blue/10 px-4 py-1.5 text-xs font-medium text-electric-blue-light"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-electric-blue-light animate-pulse" />
            {t.heroEyebrow}
          </motion.div>

          {/* Title */}
          <h1 className="mb-4 text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="text-white">{t.heroTitleLead}</span>
            <br />
            <span className="gradient-text typing-cursor">{displayText}</span>
          </h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg"
          >
            {t.heroCopy}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <button
              onClick={() => handleScroll("#register")}
              className="btn-shimmer group relative rounded-xl bg-gradient-to-r from-gold to-gold-light px-6 py-3 text-base font-bold text-navy-900 transition-all hover:shadow-lg hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.heroPrimary}
              <ChevronLeft className={`inline-block h-4 w-4 transition-transform ${isRTL ? 'mr-1 rotate-180 group-hover:-translate-x-1' : 'ml-1 group-hover:translate-x-1'}`} />
            </button>
            <button
              onClick={() => handleScroll("#promo")}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t.heroSecondary}
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex items-center justify-center gap-8 lg:justify-start"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gold">${count1}</div>
              <div className="text-xs text-muted-foreground">{t.heroStat1Label}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-blue-light">{count2}+</div>
              <div className="text-xs text-muted-foreground">{t.heroStat2Label}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-blue-light">{count3}+</div>
              <div className="text-xs text-muted-foreground">{t.heroStat3Label}</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Phone mockup */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -50 : 50, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 flex justify-center lg:justify-end"
        >
          <div className="relative">
            {/* Glow behind phone */}
            <div className="absolute -inset-6 rounded-[40px] bg-electric-blue/8 blur-3xl pulse-glow" />

            {/* Phone frame */}
            <div className="phone-card-glow relative w-[270px] overflow-hidden rounded-[36px] border-2 border-white/10 bg-gradient-to-b from-navy-800/90 to-navy-900/95 backdrop-blur-xl sm:w-[300px]">
              {/* Notch */}
              <div className="mx-auto mt-3 h-5 w-28 rounded-full bg-navy-900/80" />

              {/* Status bar */}
              <div className="flex items-center justify-between px-6 pt-1 pb-2 text-[10px] text-white/40">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-3 rounded-sm border border-white/30" />
                  <div className="h-2.5 w-1 rounded-sm bg-white/30" />
                </div>
              </div>

              {/* App header */}
              <div className="mx-4 mt-2 flex items-center justify-between">
                <span className="text-sm font-bold">
                  <span className="gradient-text">1X</span>
                  <span className="text-white">BET</span>
                </span>
                <span className="text-[10px] text-muted-foreground">{t.heroEyebrow}</span>
              </div>

              {/* Promo code section - empty with question mark */}
              <div className="mx-4 mt-4 overflow-hidden rounded-2xl border-2 border-dashed border-electric-blue/30 bg-gradient-to-br from-electric-blue/5 to-navy-900/50 p-5 text-center">
                {/* Shimmer overlay */}
                <div className="shimmer absolute inset-0 pointer-events-none rounded-2xl" />

                <div className="text-xs text-muted-foreground/60 mb-3">
                  {t.formPromoPreview}
                </div>

                {/* Question mark - eye catching */}
                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 to-gold/5"
                >
                  <span className="text-4xl font-black text-gold">?</span>
                </motion.div>

                <div className="text-base font-bold text-white/80 tracking-[0.3em] mb-1">
                  _ _ _ _ _ _ _ _
                </div>

                <div className="mt-3 text-[11px] text-gold/80 font-medium">
                  {t.heroCardCta}
                </div>
              </div>

              {/* Stats mini */}
              <div className="mx-4 mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <div className="text-lg font-bold text-gold">25-40%</div>
                  <div className="text-[10px] text-muted-foreground">{t.commissionRate}</div>
                </div>
                <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                  <div className="text-lg font-bold text-electric-blue-light">$30</div>
                  <div className="text-[10px] text-muted-foreground">{t.detailMinLabel}</div>
                </div>
              </div>

              {/* CTA button inside phone */}
              <div className="mx-4 mt-4 mb-6">
                <button
                  onClick={() => handleScroll("#register")}
                  className="btn-shimmer w-full rounded-xl bg-gradient-to-r from-gold to-gold-light py-3 text-center text-sm font-bold text-navy-900 transition-all hover:shadow-lg hover:shadow-gold/20 active:scale-[0.98]"
                >
                  {t.heroPrimary}
                </button>
              </div>

              {/* Home indicator */}
              <div className="mx-auto mb-2 h-1 w-24 rounded-full bg-white/15" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <ArrowDown className="h-5 w-5 text-muted-foreground animate-bounce" />
      </motion.div>
    </section>
  );
}
