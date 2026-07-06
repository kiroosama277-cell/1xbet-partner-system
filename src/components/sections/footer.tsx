"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";

export function Footer() {
  const { t } = useLanguage();
  const { ref, isRevealed } = useReveal();

  return (
    <footer ref={ref} className="relative border-t border-white/5 bg-navy-900 py-12">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6 text-center"
        >
          {/* Logo */}
          <div className="text-2xl font-bold">
            <span className="gradient-text">1X</span>
            <span className="text-white">BET</span>
            <span className="text-xs font-medium text-muted-foreground ms-2"> Affiliate</span>
          </div>

          {/* Description */}
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t.footerDesc}
          </p>

          {/* Divider */}
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-electric-blue/30 to-transparent" />

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/60">
            {t.footerCopy}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
