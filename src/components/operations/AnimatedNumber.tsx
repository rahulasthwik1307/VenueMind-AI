'use client';

import { useState, useEffect } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  suffix?: string;
  formatter?: (val: number) => string;
}

export function AnimatedNumber({
  value,
  duration = 750,
  suffix = '',
  formatter,
}: AnimatedNumberProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const end = value;
    if (end === 0) {
      const frame = requestAnimationFrame(() => setCurrent(0));
      return () => cancelAnimationFrame(frame);
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress); // easeOutQuad
      const currentVal = Math.round(easedProgress * end);

      setCurrent(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = formatter ? formatter(current) : current.toLocaleString();
  return <span className="tabular-nums font-bold">{formatted}{suffix}</span>;
}
