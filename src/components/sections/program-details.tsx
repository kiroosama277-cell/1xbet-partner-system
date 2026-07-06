"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";
import { Shield, DollarSign, Calendar, Clock } from "lucide-react";

export function ProgramDetails() {
  const { t } = useLanguage();
  const { ref, isRevealed } = useReveal();

  const details = [
    {
      icon: Shield,
      value: t.detailAge,
      label: t.detailAgeLabel,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
    {
      icon: DollarSign,
      value: t.detailMin,
      label: t.detailMinLabel,
      color: "text-electric-blue-light",
      bgColor: "bg-electric-blue/10",
    },
    {
      icon: Calendar,
      value: t.detailPeriod,
      label: t.detailPeriodLabel,
      color: "text-electric-blue-light",
      bgColor: "bg-electric-blue/10",
    },
    {
      icon: Clock,
      value: t.detailDay,
      label: t.detailDayLabel,
      color: "text-gold",
      bgColor: "bg-gold/10",
    },
  ];

  return (
    <section id="program" ref={ref} className="relative py-20 sm:py-28 section-gradient-dark">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold">
            {t.programKicker}
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            <span className="gradient-text">{t.programTitle}</span>
          </h2>
        </motion.div>

        {/* Details grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((detail, i) => {
            const Icon = detail.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={isRevealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="glass-card group relative flex flex-col items-center gap-3 p-8 text-center transition-all duration-300 hover:scale-[1.03] hover:border-electric-blue/30 hover:shadow-lg hover:shadow-electric-blue/5"
              >
                {/* Icon */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${detail.bgColor} ${detail.color} transition-transform group-hover:scale-110`}>
                  <Icon className="h-7 w-7" />
                </div>

                {/* Value */}
                <div className={`text-3xl font-extrabold ${detail.color}`}>
                  {detail.value}
                </div>

                {/* Label */}
                <div className="text-sm text-muted-foreground">{detail.label}</div>

                {/* Top gradient border */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-blue/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
