"use client";

import { useScrollProgress } from "@/hooks/use-reveal";
import { motion } from "framer-motion";

export function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[100] h-1 progress-gradient origin-left"
      style={{ scaleX: progress / 100 }}
      initial={{ scaleX: 0 }}
    />
  );
}
