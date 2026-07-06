"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export function FAQ() {
  const { t } = useLanguage();
  const { ref, isRevealed } = useReveal();

  const faqs = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
  ];

  return (
    <section ref={ref} className="relative py-20 sm:py-28 section-gradient-accent">
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-electric-blue/20 bg-electric-blue/10 px-4 py-1.5 text-xs font-medium text-electric-blue-light">
            <HelpCircle className="h-3 w-3" />
            {t.faqKicker}
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            <span className="gradient-text">{t.faqTitle}</span>
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass-card overflow-hidden rounded-xl border-0 px-6 data-[state=open]:border-electric-blue/20"
              >
                <AccordionTrigger className="text-start text-base font-semibold text-white hover:no-underline hover:text-electric-blue-light py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
