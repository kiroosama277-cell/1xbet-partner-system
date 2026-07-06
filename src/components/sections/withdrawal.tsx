"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";
import { User, Wallet, BarChart3, Mail, TrendingUp, Crown } from "lucide-react";

export function Withdrawal() {
  const { t, isRTL } = useLanguage();
  const { ref, isRevealed } = useReveal();

  const rules = [
    { icon: User, title: t.rule1Title, desc: t.rule1Desc, color: "text-electric-blue-light", bg: "bg-electric-blue/10" },
    { icon: Wallet, title: t.rule2Title, desc: t.rule2Desc, color: "text-gold", bg: "bg-gold/10" },
    { icon: BarChart3, title: t.rule3Title, desc: t.rule3Desc, color: "text-electric-blue-light", bg: "bg-electric-blue/10" },
    { icon: Mail, title: t.rule4Title, desc: t.rule4Desc, color: "text-gold", bg: "bg-gold/10" },
  ];

  const egyptTiers = [
    { ftd: t.egyptTier1, rate: "25%", progress: 25 },
    { ftd: t.egyptTier2, rate: "30%", progress: 30 },
    { ftd: t.egyptTier3, rate: "35%", progress: 35 },
    { ftd: t.egyptTier4, rate: "40%", progress: 40 },
  ];

  const otherTiers = [
    { ftd: t.otherTier1, rate: "30%", progress: 30 },
    { ftd: t.otherTier2, rate: "35%", progress: 35 },
    { ftd: t.otherTier3, rate: "40%", progress: 40 },
  ];

  return (
    <section id="withdraw" ref={ref} className="relative py-20 sm:py-28 section-gradient-accent">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-blue/20 bg-electric-blue/10 px-4 py-1.5 text-xs font-medium text-electric-blue-light">
            {t.withdrawKicker}
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            <span className="gradient-text">{t.withdrawTitle}</span>
          </h2>
        </motion.div>

        {/* Rules Section - Clean organized cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <h3 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric-blue/10">
              <TrendingUp className="h-4 w-4 text-electric-blue-light" />
            </div>
            {t.withdrawRulesTitle}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {rules.map((rule, i) => {
              const Icon = rule.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isRevealed ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                  className="glass-card group flex items-center gap-4 p-5 transition-all duration-300 hover:border-electric-blue/20"
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${rule.bg} ${rule.color} transition-transform group-hover:scale-110`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white">{rule.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{rule.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Commission Section - Organized with progress bars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="mb-6 text-xl font-bold text-white flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/10">
              <Crown className="h-4 w-4 text-gold" />
            </div>
            {t.commissionStructure}
          </h3>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Egypt card */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -40 : 40 }}
              animate={isRevealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card overflow-hidden"
            >
              {/* Card header */}
              <div className="border-b border-white/5 bg-gradient-to-r from-gold/10 to-gold/5 px-6 py-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20">
                  <Crown className="h-4 w-4 text-gold" />
                </div>
                <h4 className="text-base font-bold text-gold">{t.commissionEgypt}</h4>
              </div>

              {/* Table header */}
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.commissionFtd}</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.commissionRate}</span>
              </div>

              {/* Tiers with progress bars */}
              <div className="p-4 space-y-3">
                {egyptTiers.map((tier, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    animate={isRevealed ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-white/80">{tier.ftd}</span>
                      <span className="text-sm font-bold text-gold">{tier.rate}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isRevealed ? { width: `${tier.progress * 2.2}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold-light"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Other countries card */}
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 40 : -40 }}
              animate={isRevealed ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="glass-card overflow-hidden"
            >
              {/* Card header */}
              <div className="border-b border-white/5 bg-gradient-to-r from-electric-blue/10 to-electric-blue/5 px-6 py-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric-blue/20">
                  <TrendingUp className="h-4 w-4 text-electric-blue-light" />
                </div>
                <h4 className="text-base font-bold text-electric-blue-light">{t.commissionOther}</h4>
              </div>

              {/* Table header */}
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-2.5">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.commissionFtd}</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.commissionRate}</span>
              </div>

              {/* Tiers with progress bars */}
              <div className="p-4 space-y-3">
                {otherTiers.map((tier, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    animate={isRevealed ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-white/80">{tier.ftd}</span>
                      <span className="text-sm font-bold text-electric-blue-light">{tier.rate}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isRevealed ? { width: `${tier.progress * 2.2}%` } : { width: 0 }}
                        transition={{ duration: 1, delay: 0.6 + i * 0.15, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-electric-blue/80 to-electric-blue-light"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
