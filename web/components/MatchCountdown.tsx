'use client';
import { useEffect, useState } from 'react';

export default function MatchCountdown({ target }: { target: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, new Date(target).getTime() - now);
  if (diff === 0) {
    return <div className="text-2xl font-black text-center" style={{ color: '#D4AC0D' }}>Utakmica je u toku</div>;
  }
  const boxes = [
    { v: Math.floor(diff / 86400000), l: 'dana' },
    { v: Math.floor((diff % 86400000) / 3600000), l: 'sati' },
    { v: Math.floor((diff % 3600000) / 60000), l: 'min', gold: true },
  ];
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.5)' }}>do utakmice</div>
      <div className="flex gap-2.5">
        {boxes.map(b => (
          <div key={b.l} className="rounded-2xl px-4 py-3 text-center min-w-[74px]"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="text-3xl font-black" style={{ color: b.gold ? '#D4AC0D' : '#fff' }}>{b.v}</div>
            <div className="text-[10px] uppercase tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{b.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
