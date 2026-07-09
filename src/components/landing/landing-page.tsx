"use client";

import { useEffect, useRef } from "react";
import { HeroSection } from "./hero-section";
import { IntroSection } from "./intro-section";
import { FeaturesSection } from "./features-section";
import { ShowcaseSection } from "./showcase-section";
import { ClientsSection } from "./clients-section";
import { ContactSection } from "./contact-section";
import { FooterSection } from "./footer-section";
import { BackToTop } from "./back-to-top";
import { StackSection } from "./stack-section";
import { LandingNav } from "./landing-nav";

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const panels = Array.from(root.querySelectorAll<HTMLElement>(".stack-panel"));
    const inners = panels.map((p) => p.querySelector<HTMLElement>(".stack-inner"));
    let tops: number[] = [];

    const measure = () => {
      tops = panels.map((p) => p.offsetTop);
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      const scrollY = window.scrollY;
      for (let i = 0; i < panels.length; i++) {
        const inner = inners[i];
        if (!inner) continue;
        const start = tops[i];
        const end = tops[i + 1] ?? start; // last panel: no next → never recedes
        const span = end - start;
        const isLast = panels[i].dataset.last === "true" || span <= 0;

        let progress = 0;
        if (!isLast) {
          progress = (scrollY - start) / span;
          progress = progress < 0 ? 0 : progress > 1 ? 1 : progress;
        }

        // Ease the progress for a smoother recede
        const eased = progress * progress * (3 - 2 * progress);

        if (eased <= 0.0005) {
          // No transform at rest so fixed/overlay children position correctly
          inner.style.transform = "none";
          inner.style.filter = "none";
          inner.style.borderRadius = "0px";
        } else {
          const scale = 1 - 0.08 * eased;
          const translate = -3 * eased; // percent
          const brightness = 1 - 0.45 * eased;
          const radius = 28 * eased;
          inner.style.transform = `scale(${scale}) translateY(${translate}%)`;
          inner.style.filter = `brightness(${brightness})`;
          inner.style.borderRadius = `${radius}px`;
        }

        // Shadow on the panel that is currently covering something
        const covering = i > 0 && scrollY > tops[i] - window.innerHeight * 0.5;
        panels[i].classList.toggle("is-stacking", covering && progress < 1);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    measure();
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      update();
    });

    // Re-measure once fonts/images settle
    const t = setTimeout(() => {
      measure();
      update();
    }, 400);

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  return (
    <div ref={rootRef} className="landing-page">
      <LandingNav overHero />
      <StackSection bgClassName="landing-gradient">
        <HeroSection />
      </StackSection>
      <StackSection bgClassName="bg-white">
        <IntroSection />
      </StackSection>
      <StackSection bgClassName="bg-white">
        <FeaturesSection />
      </StackSection>
      <StackSection bgClassName="bg-slate-50">
        <ShowcaseSection />
      </StackSection>
      <StackSection bgClassName="bg-slate-100">
        <ClientsSection />
      </StackSection>
      <StackSection bgClassName="bg-white" last>
        <ContactSection />
      </StackSection>

      <FooterSection />
      <BackToTop />
    </div>
  );
}
