import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Chases `target` with exponential easing so the sky glides through dusk
 * instead of snapping when the pointer jumps between hours.
 * `settle` is roughly how many ms it takes to close most of the gap.
 */
export function useEased(target: number, settle = 450): number {
  const [value, setValue] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    if (prefersReducedMotion()) {
      current.current = target;
      setValue(target);
      return;
    }

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const gap = target - current.current;
      if (Math.abs(gap) < 0.05) {
        current.current = target;
        setValue(target);
        return;
      }
      current.current += gap * (1 - Math.exp((-dt * 3) / settle));
      setValue(current.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, settle]);

  return value;
}
