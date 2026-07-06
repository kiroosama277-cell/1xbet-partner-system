"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { Menu, X, Globe } from "lucide-react";

const navItems = [
  { key: "navPromo", href: "#promo" },
  { key: "navSteps", href: "#steps" },
  { key: "navProgram", href: "#program" },
  { key: "navWithdraw", href: "#withdraw" },
  { key: "navRegister", href: "#register" },
] as const;

export function Header() {
  const { lang, t, setLang, isRTL } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Only modify after mount to avoid hydration mismatch
    // The server-rendered <html> has dir="rtl" lang="ar"
    if (typeof document !== "undefined") {
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  }, [isRTL, lang]);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-navy-900/90 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="gradient-text">1X</span>
              <span className="text-white">BET</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.href)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-white hover:bg-white/5"
              >
                {t[item.key as keyof typeof t]}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle - cycles through ar → en → ru → ar */}
            <button
              onClick={() => {
                const next = lang === "ar" ? "en" : lang === "en" ? "ru" : "ar";
                setLang(next);
              }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-white hover:bg-white/5"
              title={lang === "ar" ? "Switch language" : lang === "en" ? "Сменить язык" : "تغيير اللغة"}
            >
              <Globe className="h-4 w-4" />
              <span>{lang === "ar" ? "EN" : lang === "en" ? "RU" : "عربي"}</span>
            </button>

            {/* CTA Button */}
            <button
              onClick={() => handleNavClick("#register")}
              className="btn-shimmer hidden rounded-lg bg-gradient-to-r from-gold to-gold-light px-4 py-2 text-sm font-bold text-navy-900 transition-all hover:shadow-lg hover:shadow-gold/20 sm:block"
            >
              {t.headerCta}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-white hover:bg-white/5 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mobile-menu-overlay fixed inset-0 z-40 bg-navy-900/95 pt-20 md:hidden"
          >
            <nav className="flex flex-col items-center gap-4 p-8">
              {navItems.map((item, i) => (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleNavClick(item.href)}
                  className="text-lg font-medium text-white/80 transition-colors hover:text-white"
                >
                  {t[item.key as keyof typeof t]}
                </motion.button>
              ))}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.1 }}
                onClick={() => handleNavClick("#register")}
                className="btn-shimmer mt-4 rounded-lg bg-gradient-to-r from-gold to-gold-light px-8 py-3 text-base font-bold text-navy-900"
              >
                {t.headerCta}
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
