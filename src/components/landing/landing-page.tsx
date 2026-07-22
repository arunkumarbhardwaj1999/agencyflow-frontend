"use client";

import { HeroSection } from "./hero-section";
import { IntroSection } from "./intro-section";
import { FeaturesSection } from "./features-section";
import { ShowcaseSection } from "./showcase-section";
import { ClientsSection } from "./clients-section";
import { ContactSection } from "./contact-section";
import { FaqSection } from "./faq-section";
import { FooterSection } from "./footer-section";
import { BackToTop } from "./back-to-top";
import { LandingNav } from "./landing-nav";

export function LandingPage() {
  return (
    <div className="landing-page">
      <LandingNav overHero />
      <div className="landing-gradient">
        <HeroSection />
      </div>
      <div className="bg-white">
        <IntroSection />
      </div>
      <div className="bg-white">
        <FeaturesSection />
      </div>
      <div className="bg-slate-50">
        <ShowcaseSection />
      </div>
      <div className="bg-slate-100">
        <ClientsSection />
      </div>
      <div className="bg-white">
        <ContactSection />
      </div>
      <FaqSection />
      <FooterSection />
      <BackToTop />
    </div>
  );
}
