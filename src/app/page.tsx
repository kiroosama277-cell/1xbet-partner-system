"use client";

import { Suspense } from "react";
import { LanguageProvider } from "@/hooks/use-language";
import { Preloader } from "@/components/sections/preloader";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Notice } from "@/components/sections/notice";
import { PromoIntro } from "@/components/sections/promo-intro";
import { HorizontalScroll } from "@/components/sections/horizontal-scroll";
import { Steps } from "@/components/sections/steps";
import { ProgramDetails } from "@/components/sections/program-details";
import { Withdrawal } from "@/components/sections/withdrawal";
import { RegistrationForm } from "@/components/sections/registration-form";
import { FAQ } from "@/components/sections/faq";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { CursorGlow } from "@/components/ui/cursor-glow";

export default function Home() {
  return (
    <LanguageProvider>
      <div className="relative min-h-screen bg-background overflow-x-hidden">
        <Preloader />
        <ScrollProgress />
        <CursorGlow />
        <Header />
        <main>
          <Hero />
          <Notice />
          <PromoIntro />
          <HorizontalScroll />
          <Steps />
          <ProgramDetails />
          <Withdrawal />
          <Suspense>
            <RegistrationForm />
          </Suspense>
          <FAQ />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
