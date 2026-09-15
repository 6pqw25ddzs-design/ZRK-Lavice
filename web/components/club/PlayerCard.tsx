import Link from 'next/link';

/* Trading-card format: 3:4, broj dresa kao vodeni žig, prezime veće */
export default function PlayerCard({ p }: { p: any }) {
  return (
    <Link href={`/igrac/${p.id}`}
      className="relative rounded-xl overflow-hidden group block"
      style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', aspectRatio: '3/4' }}>
      {p.jerseyNumber != null && (
        <span aria-hidden className="display absolute -right-2 -top-4 select-none pointer-events-none leading-none z-0"
          style={{ fontSize: '190px', color: 'rgba(212,172,13,0.08)' }}>{p.jerseyNumber}</span>
      )}
      {p.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={p.photoUrl} alt={`${p.firstName} ${p.lastName}`} loading="lazy" decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-16 h-16 rounded-full flex items-center justify-center text-white display text-2xl" style={{ backgroundColor: 'var(--lav-red)' }}>
            {p.jerseyNumber ?? (p.firstName?.charAt(0) ?? '?')}
          </span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 pt-14 z-10"
        style={{ background: 'linear-gradient(to top, rgba(8,7,9,0.96) 20%, rgba(8,7,9,0.55) 65%, transparent)' }}>
        {p.position && <div className="eyebrow !text-[10px] mb-1" style={{ color: 'var(--lav-gold)' }}>{p.position}</div>}
        <div className="text-white/85 text-sm font-medium leading-none">{p.firstName}</div>
        <div className="display text-white text-2xl leading-[1.05]">{p.lastName}</div>
      </div>
    </Link>
  );
}
