/**
 * VIEW — CountUp
 * Animates a number from 0 up to `value` when `active` flips true, easing out to
 * stay in sync with the bars (~easeOutCubic). Shows `placeholder` while inactive.
 * Honors prefers-reduced-motion (jumps straight to the value).
 */

import { useEffect, useRef, useState } from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface Props {
  value: number;
  active: boolean;
  duration?: number;
  placeholder?: string;
}

export default function CountUp({ value, active, duration = 800, placeholder = "?" }: Props) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplay(0);
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * easeOutCubic(p)));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, value, duration]);

  return <>{active ? display : placeholder}</>;
}
