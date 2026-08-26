"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import gsap from "gsap";

export function tap() {
  try {
    navigator.vibrate?.(10);
  } catch {
    /* no haptic on this device */
  }
}

export function Stage({
  children,
  immersive,
  className = "",
}: {
  children: ReactNode;
  immersive?: boolean;
  className?: string;
}) {
  return (
    <div className={`jny${immersive ? " jny-full" : ""} ${className}`.trim()}>
      <div className="jny-stage">{children}</div>
    </div>
  );
}

export function Back({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" className="jny-back" onClick={onClick}>
      {children}
    </button>
  );
}

export function Cta({
  children,
  onClick,
  disabled,
  hold,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  hold?: boolean;
}) {
  return (
    <button type="button" className={`jny-cta${hold ? " hold" : ""}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="jny-kicker">{children}</p>;
}

export function Reveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const root = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const words = el.querySelectorAll("span[data-w]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(words, { opacity: 1, y: 0, filter: "none" });
      return;
    }
    const tween = gsap.fromTo(
      words,
      { opacity: 0, y: 10, filter: "blur(6px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.7,
        stagger: 0.045,
        delay,
        ease: "power3.out",
      },
    );
    return () => {
      tween.kill();
    };
  }, [text, delay]);

  const parts = text.split(" ");
  return (
    <h1 ref={root} className={className ?? "jny-title"}>
      {parts.map((word, i) => (
        <span key={`${word}-${i}`} data-w>
          {word}
          {i < parts.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </h1>
  );
}

export function useImmersive(on: boolean) {
  useEffect(() => {
    if (!on) return;
    document.body.classList.add("jny-immersive");
    return () => document.body.classList.remove("jny-immersive");
  }, [on]);
}

export function useDrag(onFlick: (dir: "left" | "right") => void, threshold = 64) {
  const origin = useRef({ x: 0, y: 0 });
  const live = useRef({ x: 0, y: 0 });
  const [dx, setDx] = useState(0);
  const active = useRef(false);
  const cb = useRef(onFlick);
  cb.current = onFlick;

  const bind = {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      active.current = true;
      origin.current = { x: e.clientX, y: e.clientY };
      live.current = { x: 0, y: 0 };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (!active.current) return;
      const x = e.clientX - origin.current.x;
      const y = e.clientY - origin.current.y;
      live.current = { x, y };
      if (Math.abs(x) > Math.abs(y)) setDx(x);
    },
    onPointerUp: () => {
      if (!active.current) return;
      active.current = false;
      const { x, y } = live.current;
      live.current = { x: 0, y: 0 };
      setDx(0);
      if (Math.abs(x) < threshold || Math.abs(x) < Math.abs(y)) return;
      cb.current(x > 0 ? "right" : "left");
    },
    onPointerCancel: () => {
      active.current = false;
      setDx(0);
    },
  };

  return { dx, bind };
}

export function Choices({ children }: { children: ReactNode }) {
  return <div className="jny-choices">{children}</div>;
}

export function Choice({
  kicker,
  title,
  line,
  onClick,
  on,
}: {
  kicker?: string;
  title: string;
  line?: string;
  onClick: () => void;
  on?: boolean;
}) {
  return (
    <button
      type="button"
      className={`jny-choice${on ? " on" : ""}`}
      onClick={() => {
        tap();
        onClick();
      }}
    >
      {kicker ? <small>{kicker}</small> : null}
      <strong>{title}</strong>
      {line ? <span>{line}</span> : null}
    </button>
  );
}

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const [mount, setMount] = useState(open);

  useEffect(() => {
    if (open) {
      setMount(true);
      return;
    }
    const t = window.setTimeout(() => setMount(false), 280);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!mount) return null;

  return (
    <div className={`jny-sheet-root${open ? " open" : ""}`}>
      <button type="button" className="jny-sheet-back" aria-label="Close" onClick={onClose} />
      <div className="jny-sheet" role="dialog" aria-modal="true">
        {title ? <p className="jny-kicker">{title}</p> : null}
        {children}
      </div>
    </div>
  );
}
