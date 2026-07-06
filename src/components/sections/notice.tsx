"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";
import { Zap } from "lucide-react";

export function Notice() {
  const { t, isRTL } = useLanguage();
  const { ref, isRevealed } = useReveal();

  const handleScroll = () => {
    const el = document.querySelector("#register");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="relative overflow-hidden border-y border-white/5 bg-electric-blue/5">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
          animate={isRevealed ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-electric-blue/20">
            <Zap className="h-5 w-5 text-electric-blue-light" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{t.noticeTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.noticeCopy}</p>
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
          animate={isRevealed ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={handleScroll}
          className="btn-shimmer shrink-0 rounded-lg bg-gradient-to-r from-gold to-gold-light px-5 py-2.5 text-sm font-bold text-navy-900 transition-all hover:shadow-lg hover:shadow-gold/20"
        >
          {t.noticeCta}
        </motion.button>
      </div>
    </section>
  );
}
