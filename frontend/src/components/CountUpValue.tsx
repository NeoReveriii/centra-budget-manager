import { useEffect, useRef } from "react";
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";

interface CountUpValueProps {
  value: number;
  formatValue: (value: number) => string;
}

export function CountUpValue({ value, formatValue }: CountUpValueProps) {
  const reduceMotion = useReducedMotion();
  const textRef = useRef<HTMLSpanElement>(null);
  const formatterRef = useRef(formatValue);
  const progress = useMotionValue(0);
  formatterRef.current = formatValue;

  useMotionValueEvent(progress, "change", (latest) => {
    if (textRef.current) textRef.current.textContent = formatterRef.current(latest);
  });

  useEffect(() => {
    progress.set(0);
    const controls = animate(progress, value, {
      duration: reduceMotion ? 0.45 : 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [progress, reduceMotion, value]);

  return (
    <span aria-label={formatValue(value)}>
      <span ref={textRef} aria-hidden="true">{formatValue(0)}</span>
    </span>
  );
}
