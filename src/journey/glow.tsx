"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export type GlowLine = {
  text: string;
  glow?: boolean;
  quiet?: boolean;
  display?: boolean;
};

export function GlowCopy({ lines, align = "left" }: { lines: GlowLine[]; align?: "left" | "center" }) {
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = el.querySelectorAll<HTMLElement>("span[data-w]");
    const lit = el.querySelectorAll<HTMLElement>("span.glow");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(words, { opacity: 1, y: 0, filter: "none" });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0, y: 14, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.95,
          stagger: 0.055,
          ease: "power3.out",
        },
      );
      if (lit.length) {
        gsap.fromTo(
          lit,
          { textShadow: "0 0 0 rgba(255,255,255,0)" },
          {
            textShadow: "0 0 10px rgba(255,255,255,0.95), 0 0 28px rgba(255,255,255,0.7), 0 0 56px rgba(255,255,255,0.32)",
            duration: 1.4,
            delay: 0.45,
            ease: "power2.out",
          },
        );
      }
    }, el);
    return () => ctx.revert();
  }, [lines]);

  return (
    <p ref={root} className={`jny-copy${align === "center" ? " center" : ""}`}>
      {lines.map((line, i) => (
        <span
          key={i}
          className={`jny-line${line.glow ? " glow-line" : ""}${line.quiet ? " quiet" : ""}${line.display ? " display" : ""}`}
        >
          {i > 0 ? <br /> : null}
          {line.text.split(" ").map((word, j, arr) => (
            <span key={j} data-w className={line.glow ? "glow" : undefined}>
              {word}
              {j < arr.length - 1 ? "\u00a0" : ""}
            </span>
          ))}
        </span>
      ))}
    </p>
  );
}
