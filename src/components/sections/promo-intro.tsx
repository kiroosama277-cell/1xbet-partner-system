"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";
import { Tag } from "lucide-react";

export function PromoIntro() {
  const { t } = useLanguage();
  const { ref, isRevealed } = useReveal();

  return (
    <section id="promo" ref={ref} className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-electric-blue/[0.02] to-transparent pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* Kicker */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold">
            <Tag className="h-3 w-3" />
            {t.promoKicker}
          </div>

          {/* Title */}
          <h2 className="mb-6 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
            <span className="text-white">{t.promoTitle.split(" ").slice(0, -3).join(" ")}</span>{" "}
            <span className="gradient-text">{t.promoTitle.split(" ").slice(-3).join(" ")}</span>
          </h2>

          {/* Copy */}
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.promoCopy}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
