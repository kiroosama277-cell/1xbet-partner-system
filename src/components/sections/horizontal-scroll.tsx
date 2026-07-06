"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";
import { UserPlus, Globe, Tag, BarChart3, Wallet } from "lucide-react";

const cardIcons = [UserPlus, Globe, Tag, BarChart3, Wallet];
const cardColors = [
  { icon: "bg-[#2db8ff]/10 text-[#2db8ff]", border: "border-[#2db8ff]/20", glow: "from-[#2db8ff]/5", dot: "bg-[#2db8ff]", shadow: "shadow-[#2db8ff]/20", hoverBg: "bg-[#2db8ff]/5" },
  { icon: "bg-purple-500/10 text-purple-400", border: "border-purple-500/20", glow: "from-purple-500/5", dot: "bg-purple-400", shadow: "shadow-purple-500/20", hoverBg: "bg-purple-500/5" },
  { icon: "bg-gold/10 text-gold", border: "border-gold/20", glow: "from-gold/5", dot: "bg-gold", shadow: "shadow-gold/20", hoverBg: "bg-gold/5" },
  { icon: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/20", glow: "from-emerald-500/5", dot: "bg-emerald-400", shadow: "shadow-emerald-500/20", hoverBg: "bg-emerald-500/5" },
  { icon: "bg-rose-500/10 text-rose-400", border: "border-rose-500/20", glow: "from-rose-500/5", dot: "bg-rose-400", shadow: "shadow-rose-500/20", hoverBg: "bg-rose-500/5" },
];
const cardKeys = ["card1", "card2", "card3", "card4", "card5"] as const;

export function HorizontalScroll() {
  const { t } = useLanguage();
  const { ref, isRevealed } = useReveal();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cards = cardKeys.map((key, i) => {
    const Icon = cardIcons[i];
    return {
      title: t[`${key}Title` as keyof typeof t],
      desc: t[`${key}Desc` as keyof typeof t],
      icon: Icon,
      index: i + 1,
      color: cardColors[i],
    };
  });

  return (
    <section ref={ref} id="flow" className="relative py-20 sm:py-28 section-gradient-dark">
      {/* Subtle dot grid */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: "radial-gradient(circle, #2db8ff 1px, transparent 1px)",
        backgroundSize: "50px 50px",
      }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-blue/20 bg-electric-blue/10 px-4 py-1.5 text-xs font-medium text-electric-blue-light">
            {t.card1Title} → {t.card5Title}
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="gradient-text">{t.card1Title}</span>
            <span className="mx-2 text-white/30">→</span>
            <span className="gradient-text">{t.card5Title}</span>
          </h2>
        </motion.div>

        {/* Desktop: Horizontal timeline with cards */}
        <div className="hidden lg:block">
          <div className="relative mx-auto max-w-5xl">
            {/* Connecting line - background */}
            <div className="absolute top-[44px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-[#2db8ff]/30 via-gold/30 to-rose-400/30" />
            {/* Connecting line - animated fill */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isRevealed ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
              className="absolute top-[44px] left-[10%] right-[10%] h-[2px] origin-left bg-gradient-to-r from-[#2db8ff] via-gold to-rose-400"
            />

            <div className="flex justify-between gap-4">
              {cards.map((card, i) => {
                const Icon = card.icon;
                const isHovered = hoveredCard === i;
                const isOtherHovered = hoveredCard !== null && hoveredCard !== i;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isRevealed ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group flex flex-col items-center text-center flex-1"
                  >
                    {/* Step dot on line */}
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.5 : 1,
                        boxShadow: isHovered ? `0 0 20px ${card.color.dot === 'bg-[#2db8ff]' ? '#2db8ff' : card.color.dot === 'bg-gold' ? '#d4a017' : card.color.dot === 'bg-purple-400' ? '#a855f7' : card.color.dot === 'bg-emerald-400' ? '#34d399' : '#fb7185'}40` : '0 10px 15px -3px rgba(0,0,0,0.1)',
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`relative z-10 mb-4 flex h-[22px] w-[22px] items-center justify-center rounded-full ${card.color.dot} shadow-lg`}
                    >
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </motion.div>

                    {/* Card */}
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.08 : 1,
                        opacity: isOtherHovered ? 0.6 : 1,
                        y: isHovered ? -8 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 250, damping: 20 }}
                      className={`w-full rounded-2xl border ${card.color.border} bg-gradient-to-b ${card.color.glow} to-[#0f1f3d]/80 p-5 cursor-pointer overflow-hidden relative`}
                    >
                      {/* Glow effect on hover */}
                      <motion.div
                        animate={{
                          opacity: isHovered ? 1 : 0,
                          scale: isHovered ? 1 : 0.8,
                        }}
                        transition={{ duration: 0.3 }}
                        className={`absolute inset-0 ${card.color.hoverBg} rounded-2xl`}
                      />

                      {/* Shine sweep on hover */}
                      <motion.div
                        animate={{
                          x: isHovered ? ["0%", "200%"] : "0%",
                        }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.07] to-transparent pointer-events-none"
                      />

                      <div className="relative z-10">
                        <motion.div
                          animate={
                            isHovered
                              ? { scale: 1.2, rotate: [0, -10, 10, 0] }
                              : { scale: 1, rotate: 0 }
                          }
                          transition={
                            isHovered
                              ? { scale: { type: "spring", stiffness: 300, damping: 15 }, rotate: { duration: 0.5, ease: "easeInOut" } }
                              : { type: "spring", stiffness: 300, damping: 15 }
                          }
                          className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.color.icon}`}
                        >
                          <Icon className="h-5 w-5" />
                        </motion.div>
                        <div className="mb-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">0{card.index}</div>
                        <h3 className="mb-2 text-base font-bold text-white transition-colors group-hover:text-white">{card.title}</h3>
                        <p className="text-xs leading-relaxed text-white/60 transition-colors group-hover:text-white/80">{card.desc}</p>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet: Vertical timeline */}
        <div className="lg:hidden">
          <div className="relative">
            {/* Vertical line - background */}
            <div className="absolute top-0 bottom-0 start-6 w-[2px] bg-gradient-to-b from-[#2db8ff]/30 via-gold/30 to-rose-400/30" />
            {/* Vertical line - animated fill */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={isRevealed ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
              className="absolute top-0 bottom-0 start-6 w-[2px] origin-top bg-gradient-to-b from-[#2db8ff] via-gold to-rose-400"
            />

            <div className="space-y-5">
              {cards.map((card, i) => {
                const Icon = card.icon;
                const isHovered = hoveredCard === i;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 30 }}
                    animate={isRevealed ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    onMouseEnter={() => setHoveredCard(i)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group relative flex items-start gap-5 ps-3"
                  >
                    {/* Step dot */}
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.4 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`relative z-10 mt-1 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full ${card.color.dot} shadow-lg`}
                    >
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    </motion.div>

                    {/* Card */}
                    <motion.div
                      animate={{
                        scale: isHovered ? 1.03 : 1,
                        x: isHovered ? 4 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`flex-1 rounded-2xl border ${card.color.border} bg-gradient-to-b ${card.color.glow} to-[#0f1f3d]/80 p-4 overflow-hidden relative cursor-pointer`}
                    >
                      {/* Glow on hover */}
                      <motion.div
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute inset-0 ${card.color.hoverBg} rounded-2xl`}
                      />

                      <div className="relative z-10 flex items-center gap-3 mb-2">
                        <motion.div
                          animate={
                            isHovered
                              ? { scale: 1.15, rotate: [0, -10, 10, 0] }
                              : { scale: 1, rotate: 0 }
                          }
                          transition={
                            isHovered
                              ? { scale: { type: "spring", stiffness: 300, damping: 15 }, rotate: { duration: 0.5, ease: "easeInOut" } }
                              : { type: "spring", stiffness: 300, damping: 15 }
                          }
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.color.icon}`}
                        >
                          <Icon className="h-4 w-4" />
                        </motion.div>
                        <div>
                          <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">0{card.index}</span>
                          <h3 className="text-sm font-bold text-white leading-tight">{card.title}</h3>
                        </div>
                      </div>
                      <p className="relative z-10 text-xs leading-relaxed text-white/60 transition-colors group-hover:text-white/80">{card.desc}</p>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
