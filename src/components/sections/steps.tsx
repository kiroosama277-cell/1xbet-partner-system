"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";
import { UserPlus, MapPin, Tag, Clock } from "lucide-react";

const stepIcons = [UserPlus, MapPin, Tag, Clock];
const stepKeys = ["step1", "step2", "step3", "step4"] as const;

export function Steps() {
  const { t } = useLanguage();
  const { ref, isRevealed } = useReveal();

  const steps = stepKeys.map((key, i) => {
    const Icon = stepIcons[i];
    return {
      title: t[`${key}Title` as keyof typeof t],
      desc: t[`${key}Desc` as keyof typeof t],
      icon: Icon,
      num: i + 1,
    };
  });

  return (
    <section id="steps" ref={ref} className="relative py-20 sm:py-28 section-gradient-accent">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle, #2db8ff 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-blue/20 bg-electric-blue/10 px-4 py-1.5 text-xs font-medium text-electric-blue-light">
            {t.stepsKicker}
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            <span className="gradient-text">{t.stepsTitle}</span>
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={isRevealed ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="step-card-border group glass-card relative p-6 transition-all duration-300 hover:scale-[1.02] hover:border-electric-blue/30 hover:shadow-lg hover:shadow-electric-blue/5"
              >
                {/* Step number */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-electric-blue to-electric-blue-light text-sm font-bold text-white shadow-lg shadow-electric-blue/20">
                    {step.num}
                  </div>
                  {/* Timeline connector (hidden on last item and mobile) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block h-px flex-1 bg-gradient-to-r from-electric-blue/50 to-transparent" />
                  )}
                </div>

                {/* Icon */}
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-electric-blue/10 text-electric-blue-light transition-colors group-hover:bg-electric-blue/20">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
