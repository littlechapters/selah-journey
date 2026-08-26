"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { GlowCopy, type GlowLine } from "./glow";
import { Cta, useImmersive } from "./chrome";
import { useJourney } from "./store";

const SCREENS: { lines: GlowLine[]; cta: string }[] = [
  {
    lines: [
      { text: "Are you ready to", quiet: true },
      { text: "start your journey?", glow: true, display: true },
    ],
    cta: "Yes, I am.",
  },
  {
    lines: [
      { text: "A spiritual journey is" },
      { text: "a personal process of" },
      { text: "self-discovery and inner growth", glow: true },
      { text: "that moves beyond the physical ego" },
      { text: "to explore deeper questions" },
      { text: "about existence.", glow: true },
    ],
    cta: "Continue",
  },
  {
    lines: [
      { text: "Your journey", quiet: true },
      { text: "begins here.", glow: true, display: true },
    ],
    cta: "Begin my journey",
  },
];

export function Onboarding({ onDone }: { onDone?: () => void }) {
  const finish = useJourney((s) => s.finishOnboard);
  const [i, setI] = useState(0);
  const ctaRef = useRef<HTMLDivElement>(null);
  const screen = SCREENS[i];
  useImmersive(true);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.85, ease: "power3.out" });
  }, [i]);

  const next = () => {
    if (i >= SCREENS.length - 1) {
      finish();
      onDone?.();
    } else setI(i + 1);
  };

  return (
    <div className="jny jny-full" role="region" aria-label="Begin the journey">
      <div className="jny-stage jny-threshold">
        <div className="jny-center" key={i}>
          <GlowCopy lines={screen.lines} />
        </div>
        <div ref={ctaRef} className="jny-cta-slot">
          <Cta hold onClick={next}>
            {screen.cta}
          </Cta>
        </div>
      </div>
    </div>
  );
}
