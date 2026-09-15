'use client';
import { useEffect, useRef, useState } from 'react';

export default function CountUp({ value, className, style }: { value: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return;
      started.current = true;
      const t0 = performance.now(), dur = 800;
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const ease = 1 - Math.pow(2, -10 * p);
        setN(Math.round(value * ease));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return <span ref={ref} className={className} style={style}>{n}</span>;
}
