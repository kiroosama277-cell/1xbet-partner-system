"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";

// Deterministic pseudo-random based on index (no Math.random in render)
function seededValue(index: number, offset: number, range: number): number {
  const x = Math.sin(index * 9301 + offset * 49297) * 49297;
  return (x - Math.floor(x)) * range;
}

export function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { t } = useLanguage();

  // Pre-compute particle styles deterministically (no Math.random in render)
  const [mounted, setMounted] = useState(false);

  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      width: `${seededValue(i, 1, 4) + 2}px`,
      height: `${seededValue(i, 2, 4) + 2}px`,
      left: `${seededValue(i, 3, 100)}%`,
      top: `${seededValue(i, 4, 100)}%`,
      animationDuration: `${seededValue(i, 5, 6) + 4}s`,
      animationDelay: `${seededValue(i, 6, 3)}s`,
    }));
  }, []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsLoading(false), 400);
          return 100;
        }
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-navy-900"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Floating particles */}
          {mounted && <div className="absolute inset-0 overflow-hidden">
            {particles.map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-electric-blue/20"
                style={{
                  width: p.width,
                  height: p.height,
                  left: p.left,
                  top: p.top,
                  animation: `particle-float ${p.animationDuration} ease-in-out infinite`,
                  animationDelay: p.animationDelay,
                }}
              />
            ))}
          </div>}

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mb-8"
          >
            <div className="text-4xl font-bold tracking-wider">
              <span className="gradient-text">1X</span>
              <span className="text-white">BET</span>
            </div>
            <div className="mt-1 text-center text-xs font-medium text-electric-blue-light/60 tracking-widest uppercase">
              Affiliate
            </div>
          </motion.div>

          {/* Progress bar */}
          <div className="relative h-1 w-64 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="absolute inset-y-0 left-0 progress-gradient rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Percentage */}
          <motion.div
            className="mt-4 text-sm font-medium text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {t.preloaderText}{" "}
            <span className="text-electric-blue-light">{Math.floor(progress)}%</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
