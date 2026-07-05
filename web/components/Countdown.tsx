'use client';
import { useEffect, useState } from 'react';

const TARGET = new Date('2026-07-16T19:00:00+02:00').getTime();

function calc() {
  const diff = Math.max(0, TARGET - Date.now());
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

export default function Countdown() {
  const [t, setT] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!t) return <div style={{ height: 96 }} />;

  const items = [
    { v: t.d, l: 'dana' },
    { v: t.h, l: 'sati' },
    { v: t.m, l: 'min' },
    { v: t.s, l: 'sek' },
  ];

  return (
    <div className="flex gap-3 sm:gap-5 justify-center">
      {items.map((it, i) => (
        <div key={it.l} className="flex flex-col items-center">
          <div
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              minWidth: 64,
            }}
            className="rounded-xl px-3 sm:px-4 py-3 backdrop-blur-sm"
          >
            <span
              className="text-3xl sm:text-5xl font-black tabular-nums"
              style={{ color: i === 0 ? 'var(--primary)' : 'white' }}
            >
              {String(it.v).padStart(2, '0')}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)' }} className="text-[10px] sm:text-xs uppercase tracking-widest mt-2">
            {it.l}
          </span>
        </div>
      ))}
    </div>
  );
}
