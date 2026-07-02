import { HeroSection } from "./hero-section";
import { IntroSection } from "./intro-section";
import { FeaturesSection } from "./features-section";
import { ShowcaseSection } from "./showcase-section";
import { ClientsSection } from "./clients-section";
import { ContactSection } from "./contact-section";
import { FooterSection } from "./footer-section";
import { BackToTop } from "./back-to-top";

export function LandingPage() {
  return (
    <div className="landing-page">
      <HeroSection />
      <IntroSection />
      <FeaturesSection />
      <ShowcaseSection />
      <ClientsSection />
      <ContactSection />
      <FooterSection />
      <BackToTop />
    </div>
  );
}
