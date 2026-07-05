import Image from 'next/image';
import Countdown from '@/components/Countdown';

export default function ComingSoonPage() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-16 overflow-hidden"
      style={{ background: 'radial-gradient(130% 100% at 50% -10%, #3a0e16 0%, #1A1A1A 45%, #0d0d0d 100%)' }}
    >
      {/* Glow iza logoa */}
      <div
        aria-hidden
        className="t-glow"
        style={{
          position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)',
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,18,48,0.35) 0%, rgba(196,18,48,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Suptilni dekorativni lukovi terena */}
      <svg aria-hidden viewBox="0 0 800 800" className="absolute inset-0 w-full h-full" style={{ opacity: 0.05, pointerEvents: 'none' }}>
        <circle cx="400" cy="400" r="120" fill="none" stroke="white" strokeWidth="1.5" />
        <circle cx="400" cy="400" r="300" fill="none" stroke="white" strokeWidth="1" />
        <line x1="400" y1="0" x2="400" y2="800" stroke="white" strokeWidth="1" />
      </svg>

      {/* Sadržaj */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="t-float">
          <Image src="/logo.png" alt="ŽRK Lavice" width={150} height={150} priority className="object-contain mb-7 t-fade t-d1" />
        </div>

        <p style={{ color: 'var(--gold)' }} className="t-fade t-d1 text-xs md:text-sm font-bold tracking-[0.3em] uppercase mb-5">
          Zvanično predstavljanje kluba
        </p>

        <h1 className="t-fade t-d2 text-4xl md:text-6xl font-black text-white leading-[1.05] mb-5 max-w-3xl">
          Nešto veliko<br />
          počinje u <span style={{ color: 'var(--primary)' }}>Podgorici</span>
        </h1>

        <p style={{ color: 'var(--text-muted)' }} className="t-fade t-d3 text-base md:text-lg leading-relaxed max-w-xl mb-10">
          Ženski rukometni klub osnovan od strane evropskih šampionki.
          Nove šampionke. Nova priča.
        </p>

        {/* Datum */}
        <div className="t-fade t-d3 mb-8">
          <div className="text-6xl md:text-8xl font-black text-white leading-none tracking-tight">
            16<span style={{ color: 'var(--primary)' }}>.</span>07
          </div>
          <div style={{ color: 'var(--text-muted)' }} className="text-lg md:text-xl font-bold mt-2 tracking-[0.2em]">2026</div>
        </div>

        {/* Odbrojavanje */}
        <div className="t-fade t-d4 mb-10">
          <Countdown />
        </div>

        <div className="t-fade t-d5 flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
          <span style={{ backgroundColor: 'var(--primary)' }} className="w-8 h-px" />
          <span className="text-xs tracking-widest uppercase">Konferencija za medije · Podgorica, Crna Gora</span>
          <span style={{ backgroundColor: 'var(--primary)' }} className="w-8 h-px" />
        </div>
      </div>
    </div>
  );
}
