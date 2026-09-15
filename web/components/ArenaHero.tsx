import Link from 'next/link';
import MatchCountdown from './MatchCountdown';
import { TEAM_META } from '@/lib/teamColors';

/*
 * Identitet prije rezultata:
 *  - hero je uvijek fotografski, sa porukom i probnim treningom
 *  - sportski podaci (posljednji rezultat, sljedeća utakmica, najefikasnija) žive
 *    u kompaktnom bloku odmah ispod heroa
 */

type HeroData = {
  match?: { title: string; opponent?: string; location?: string; startsAt: string; notes?: string } | null;
  lastResult?: {
    id: string; homeScore: number; awayScore: number; title: string; notes?: string; date?: string;
    mvp?: { id: string; name: string; goals: number; photoUrl?: string | null; jerseyNumber?: number | null } | null;
  } | null;
  clubStats: { igracica: number; generacije: number };
  nextByTeam: { category: string; when: string; title: string }[];
};

export default function ArenaHero({ data }: { data: HeroData }) {
  const r = data.lastResult;
  const m = data.match;
  const win = r ? r.homeScore > r.awayScore : false;
  const draw = r ? r.homeScore === r.awayScore : false;

  return (
    <>
      {/* HERO — tekst lijevo, fotografija A desno */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--lav-black)' }}>
        <div className="grid lg:grid-cols-[2fr_3fr] min-h-[auto] lg:min-h-[78svh]">
          {/* Tekst */}
          <div className="flex items-center relative z-10 px-6 lg:pl-12 lg:pr-0 pt-14 pb-10 lg:py-20">
            <div className="max-w-xl">
              <div className="flex items-center gap-3.5 mb-5">
                <span className="w-11 h-[3px]" style={{ background: 'linear-gradient(90deg, var(--lav-red), var(--lav-gold))' }} />
                <span className="eyebrow" style={{ color: 'var(--lav-gold)' }}>Podgorica, Crna Gora</span>
              </div>
              <h1 className="display text-white leading-[0.9]" style={{ fontSize: 'clamp(2.9rem, 6.5vw, 6rem)' }}>
                Stvaramo nove <span style={{ color: '#E8546F' }}>Lavice.</span>
              </h1>
              <p className="mt-4 text-lg md:text-2xl font-medium text-white/90">
                Rukomet. Samopouzdanje. Zajedništvo.
              </p>
              <div className="mt-7 flex flex-wrap gap-4">
                <a href="#upis" style={{ backgroundColor: 'var(--lav-red)' }}
                  className="px-8 py-4 rounded-full text-white font-bold hover:brightness-110 transition-all shadow-xl shadow-red-900/40">
                  Dođi na probni trening
                </a>
                <a href="#o-klubu" style={{ border: '1.5px solid rgba(255,255,255,0.55)', color: '#fff' }}
                  className="px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all">
                  Upoznaj klub
                </a>
              </div>
            </div>
          </div>

          {/* Fotografija — skok-šut, lice i lopta sačuvani */}
          <div className="relative min-h-[46svh] lg:min-h-0">
            <picture>
              <source media="(max-width: 1023px)" srcSet="/foto/lavice-hero-akcija-m.webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/foto/lavice-hero-akcija.webp"
                alt="Rukometašica Lavica u skok-šutu tokom utakmice"
                fetchPriority="high"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ objectPosition: '42% 18%' }} />
            </picture>
            {/* blagi prelaz ka tekstualnom dijelu */}
            <div aria-hidden className="absolute inset-0 pointer-events-none hidden lg:block"
              style={{ background: 'linear-gradient(to right, var(--lav-black) 0%, rgba(11,10,12,0.35) 22%, transparent 45%)' }} />
            <div aria-hidden className="absolute inset-x-0 top-0 h-16 pointer-events-none lg:hidden"
              style={{ background: 'linear-gradient(to bottom, var(--lav-black), transparent)' }} />
          </div>
        </div>
      </section>

      {/* KOMPAKTAN SPORTSKI BLOK */}
      <section aria-label="Aktuelno" style={{ backgroundColor: '#0E0C0F', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-6 grid md:grid-cols-3 gap-x-10 gap-y-5">
          {/* Posljednji rezultat */}
          {r ? (
            <Link href={`/utakmica/${r.id}`} className="flex items-center gap-4 group">
              <span className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: win ? '#2ebd6b' : draw ? 'var(--lav-gold)' : 'var(--lav-red)' }} />
              <div className="min-w-0">
                <div className="eyebrow !text-[10.5px] mb-1">{win ? 'Pobjeda' : draw ? 'Neriješeno' : 'Posljednji rezultat'}{r.notes ? ` · ${r.notes.split('·')[0].trim()}` : ''}</div>
                <div className="text-white text-[15px] font-bold group-hover:underline truncate">
                  Lavice <span className="display nums text-xl" style={{ color: 'var(--lav-gold)' }}>{r.homeScore} : {r.awayScore}</span> {r.title}
                </div>
                {r.date && <div className="text-xs mt-0.5" style={{ color: 'var(--lav-grey-400)' }}>
                  {new Date(r.date).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', day: 'numeric', month: 'long' })}
                </div>}
              </div>
            </Link>
          ) : (
            <div className="text-sm" style={{ color: 'var(--lav-grey-400)' }}>Sezona uskoro počinje.</div>
          )}

          {/* Sljedeća utakmica */}
          {m ? (
            <Link href="/raspored" className="flex items-center gap-4 group">
              <span className="w-1 h-12 rounded-full shrink-0" style={{ backgroundColor: 'var(--lav-red)' }} />
              <div className="min-w-0">
                <div className="eyebrow !text-[10.5px] mb-1">Sljedeća utakmica{m.notes ? ` · ${m.notes.split('·').slice(-1)[0].trim()}` : ''}</div>
                <div className="text-white text-[15px] font-bold group-hover:underline truncate">{m.title}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--lav-grey-400)' }}>
                  {new Date(m.startsAt).toLocaleString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {m.location ? ` · ${m.location}` : ''}
                </div>
              </div>
            </Link>
          ) : (
            <div className="text-sm" style={{ color: 'var(--lav-grey-400)' }}>Naredna utakmica biće objavljena u rasporedu.</div>
          )}

          {/* Najefikasnija — horizontalna kartica */}
          {r?.mvp ? (
            <Link href={`/igrac/${r.mvp.id}`} className="flex items-center gap-3.5 group">
              {r.mvp.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.mvp.photoUrl} alt={r.mvp.name} loading="lazy" decoding="async"
                  className="w-14 h-16 rounded-lg object-cover object-top shrink-0" />
              ) : (
                <span className="w-14 h-16 rounded-lg flex items-center justify-center display text-xl text-white shrink-0" style={{ backgroundColor: 'var(--lav-red)' }}>
                  {r.mvp.jerseyNumber ?? '?'}
                </span>
              )}
              <div className="min-w-0">
                <div className="eyebrow !text-[10.5px] mb-1">Najefikasnija na posljednjem meču</div>
                <div className="text-white text-[15px] font-bold group-hover:underline truncate">{r.mvp.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--lav-gold)' }}>
                  <span className="display nums text-base">{r.mvp.goals}</span> golova
                </div>
              </div>
            </Link>
          ) : (
            <div className="hidden md:flex items-center text-sm" style={{ color: 'var(--lav-grey-400)' }}>
              {data.clubStats.igracica}+ djevojčica · {data.clubStats.generacije} generacije · 2 lige
            </div>
          )}
        </div>
      </section>
    </>
  );
}
