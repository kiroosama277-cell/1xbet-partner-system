"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useLanguage } from "@/hooks/use-language";
import { useReveal } from "@/hooks/use-reveal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, CheckCircle, Loader2, Eye, AlertCircle } from "lucide-react";

export function RegistrationForm() {
  const { t } = useLanguage();
  const { ref, isRevealed } = useReveal();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    promoCode: "",
    trafficSource: "",
    channelDesc: "",
  });
  const [refCode, setRefCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoAvailable, setPromoAvailable] = useState<boolean | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Read ?ref= from URL on mount
  useEffect(() => {
    const refParam = searchParams.get("ref");
    if (refParam) {
      setRefCode(refParam);
    }
  }, [searchParams]);

  const countryItems = [
    { key: "countryEgypt", value: "egypt" },
    { key: "countrySaudi", value: "saudi" },
    { key: "countryUAE", value: "uae" },
    { key: "countryMorocco", value: "morocco" },
    { key: "countryAlgeria", value: "algeria" },
    { key: "countryIraq", value: "iraq" },
    { key: "countryJordan", value: "jordan" },
    { key: "countryRussia", value: "russia" },
    { key: "countryOther", value: "other" },
  ];

  const trafficItems = [
    { key: "trafficTelegram", value: "telegram" },
    { key: "trafficFacebook", value: "facebook" },
    { key: "trafficTiktok", value: "tiktok" },
    { key: "trafficYoutube", value: "youtube" },
    { key: "trafficWebsite", value: "website" },
    { key: "trafficOther", value: "other" },
  ];

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    // Reset promo availability when code changes
    if (field === "promoCode") {
      setPromoAvailable(null);
    }
  };

  // Mark field as touched and validate on blur
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // Real-time validation for touched fields
    const newErrors: Record<string, string> = { ...errors };

    if (field === "name") {
      const nameValue = formData.name.trim();
      if (!nameValue) newErrors.name = t.formNameTooShort;
      else if (nameValue.length < 3) newErrors.name = t.formNameTooShort;
      else if (!/^[\p{L}\p{M}\s'-]+$/u.test(nameValue)) newErrors.name = t.formNameInvalid;
      else delete newErrors.name;
    }

    if (field === "email") {
      const emailValue = formData.email.trim().toLowerCase();
      if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) newErrors.email = t.formEmailInvalid;
      else delete newErrors.email;
    }

    if (field === "phone") {
      const phoneValue = formData.phone.trim();
      const phoneDigits = phoneValue.replace(/\D/g, "");
      if (!phoneValue || !/^\+?[\d\s-]{7,20}$/.test(phoneValue) || phoneDigits.length < 7 || phoneDigits.length > 15) newErrors.phone = t.formPhoneInvalid;
      else delete newErrors.phone;
    }

    setErrors(newErrors);
  };

  // Check promo code availability
  const checkPromoCode = useCallback(async (code: string) => {
    if (!code.trim() || code.trim().length < 2) {
      setPromoAvailable(null);
      return;
    }
    setPromoChecking(true);
    try {
      const res = await fetch(`/api/check-promo?code=${encodeURIComponent(code.trim().toUpperCase())}`);
      if (res.ok) {
        const data = await res.json();
        setPromoAvailable(data.available);
      }
    } catch {
      // Silently fail - will catch on submit
    } finally {
      setPromoChecking(false);
    }
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    // Name: at least 3 characters, only letters (Latin, Arabic, Cyrillic), spaces, hyphens, apostrophes
    const nameValue = formData.name.trim();
    if (!nameValue) {
      newErrors.name = t.formNameTooShort;
    } else if (nameValue.length < 3) {
      newErrors.name = t.formNameTooShort;
    } else if (!/^[\p{L}\p{M}\s'-]+$/u.test(nameValue)) {
      newErrors.name = t.formNameInvalid;
    }

    // Email: strict format
    const emailValue = formData.email.trim().toLowerCase();
    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailValue)) {
      newErrors.email = t.formEmailInvalid;
    }

    // Phone: must start with + and contain 7-15 digits (E.164-style international format)
    const phoneValue = formData.phone.trim();
    const phoneDigits = phoneValue.replace(/\D/g, "");
    if (!phoneValue) {
      newErrors.phone = t.formPhoneInvalid;
    } else if (!/^\+?[\d\s-]{7,20}$/.test(phoneValue) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      newErrors.phone = t.formPhoneInvalid;
    }

    if (!formData.country) newErrors.country = "Required";
    if (!formData.promoCode.trim()) newErrors.promoCode = "Required";
    if (promoAvailable === false) newErrors.promoCode = t.formPromoTaken;
    if (!formData.trafficSource) newErrors.trafficSource = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          refCode: refCode || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setIsSuccess(true);
      setPromoAvailable(null);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: "", email: "", phone: "", country: "", promoCode: "", trafficSource: "", channelDesc: "" });
      }, 4000);
    } catch (err: any) {
      setSubmitError(err.message || t.formError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" ref={ref} className="relative py-20 sm:py-28 section-gradient-dark">
      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 text-xs font-medium text-gold">
            {t.formKicker}
          </div>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
            <span className="gradient-text">{t.formTitle}</span>
          </h2>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          animate={isRevealed ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-card p-4 sm:p-6 lg:p-10"
        >
          {/* Promo code preview */}
          {formData.promoCode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden rounded-xl border border-electric-blue/30 bg-navy-900/50 p-4"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Eye className="h-3 w-3" />
                {t.formPromoPreview}
              </div>
              <div className="text-2xl font-bold gradient-text tracking-wider">
                {formData.promoCode.toUpperCase()}
              </div>
            </motion.div>
          )}

          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80">{t.formName}</Label>
              <Input
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                placeholder={t.formNamePlaceholder}
                className={`form-input-focus bg-navy-800/50 border-white/10 text-white placeholder:text-muted-foreground/50 h-11 ${errors.name ? "border-red-500 ring-red-500/20" : ""}`}
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80">{t.formEmail}</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder={t.formEmailPlaceholder}
                className={`form-input-focus bg-navy-800/50 border-white/10 text-white placeholder:text-muted-foreground/50 h-11 ${errors.email ? "border-red-500 ring-red-500/20" : ""}`}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80">{t.formPhone}</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                onBlur={() => handleBlur("phone")}
                placeholder={t.formPhonePlaceholder}
                className={`form-input-focus bg-navy-800/50 border-white/10 text-white placeholder:text-muted-foreground/50 h-11 ${errors.phone ? "border-red-500 ring-red-500/20" : ""}`}
              />
              {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80">{t.formCountry}</Label>
              <Select value={formData.country} onValueChange={(v) => updateField("country", v)}>
                <SelectTrigger className={`form-input-focus bg-navy-800/50 border-white/10 text-white h-11 w-full ${errors.country ? "border-red-500" : ""}`}>
                  <SelectValue placeholder={t.formCountryPlaceholder} />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-white/10">
                  {countryItems.map((item) => (
                    <SelectItem key={item.value} value={item.value} className="text-white/80 focus:bg-electric-blue/20 focus:text-white">
                      {t[item.key as keyof typeof t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-xs text-red-400">{errors.country}</p>}
            </div>

            {/* Promo code */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80">{t.formPromo}</Label>
              <div className="relative">
                <Input
                  value={formData.promoCode}
                  onChange={(e) => updateField("promoCode", e.target.value)}
                  onBlur={() => checkPromoCode(formData.promoCode)}
                  placeholder={t.formPromoPlaceholder}
                  className={`form-input-focus bg-navy-800/50 border-white/10 text-white placeholder:text-muted-foreground/50 h-11 uppercase pe-10 ${errors.promoCode ? "border-red-500 ring-red-500/20" : promoAvailable === false ? "border-red-500 ring-red-500/20" : promoAvailable === true ? "border-green-500 ring-green-500/20" : ""}`}
                />
                {promoChecking && (
                  <div className="absolute end-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                  </div>
                )}
                {!promoChecking && promoAvailable === true && (
                  <div className="absolute end-3 top-1/2 -translate-y-1/2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                )}
                {!promoChecking && promoAvailable === false && (
                  <div className="absolute end-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  </div>
                )}
              </div>
              {errors.promoCode && <p className="text-xs text-red-400">{errors.promoCode}</p>}
              {!errors.promoCode && promoAvailable === false && <p className="text-xs text-red-400">{t.formPromoTaken}</p>}
              {!errors.promoCode && promoAvailable === true && <p className="text-xs text-green-400">{t.formPromoAvailable}</p>}
            </div>

            {/* Traffic source */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white/80">{t.formTraffic}</Label>
              <Select value={formData.trafficSource} onValueChange={(v) => updateField("trafficSource", v)}>
                <SelectTrigger className={`form-input-focus bg-navy-800/50 border-white/10 text-white h-11 w-full ${errors.trafficSource ? "border-red-500" : ""}`}>
                  <SelectValue placeholder={t.formTrafficPlaceholder} />
                </SelectTrigger>
                <SelectContent className="bg-navy-800 border-white/10">
                  {trafficItems.map((item) => (
                    <SelectItem key={item.value} value={item.value} className="text-white/80 focus:bg-electric-blue/20 focus:text-white">
                      {t[item.key as keyof typeof t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.trafficSource && <p className="text-xs text-red-400">{errors.trafficSource}</p>}
            </div>

            {/* Channel description - full width */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-white/80">{t.formChannel}</Label>
              <Textarea
                value={formData.channelDesc}
                onChange={(e) => updateField("channelDesc", e.target.value)}
                placeholder={t.formChannelPlaceholder}
                className="form-input-focus bg-navy-800/50 border-white/10 text-white placeholder:text-muted-foreground/50 min-h-[100px] resize-none"
              />
            </div>
          </div>

          {/* Error message */}
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {submitError}
            </motion.div>
          )}

          {/* Submit button */}
          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="btn-shimmer group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-light px-8 py-3.5 text-base font-bold text-navy-900 transition-all hover:shadow-lg hover:shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t.formSubmitting}
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  {t.formSuccess}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {t.formSubmit}
                </>
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
