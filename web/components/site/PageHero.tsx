import LiveTicker from "./LiveTicker";

export default function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <>
    <LiveTicker />
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg, var(--lav-maroon-2), var(--lav-maroon) 45%, var(--lav-black))' }}>
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 pt-16 pb-12">
        <div className="eyebrow mb-3" style={{ color: 'var(--lav-gold)' }}>{eyebrow}</div>
        <h1 className="display text-white leading-[0.9]" style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5.5rem)' }}>{title}</h1>
        {sub && <p className="mt-4 max-w-xl text-[17px]" style={{ color: 'var(--lav-grey-400)' }}>{sub}</p>}
      </div>
      <div className="gold-line" />
    </div>
    </>
  );
}
