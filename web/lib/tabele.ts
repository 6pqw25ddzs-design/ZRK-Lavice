// Tabele liga u kojima nastupaju Lavice.
// Prva ženska liga CG: zvanični podaci RSCG (sportinfocentar feed koji i rscg.me prikazuje).
// RRL (WRHL, Grupa B): naš LiveStats sistem.

export type TabelaRed = {
  rank: number; name: string; played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; points: number; nasa: boolean;
};

const RSCG_URL = 'https://www.sportinfocentar2.com/coman/natjecanje2123.js';
const RRL_URL =
  'https://supabase.rr-liga.com/rest/v1/v_public_standings?group_name=eq.Grupa%20B&select=*&order=rank';
const RRL_ANON = process.env.NEXT_PUBLIC_RRL_SUPABASE_ANON || '';

export async function getPrvaLigaTabela(): Promise<TabelaRed[] | null> {
  try {
    const res = await fetch(RSCG_URL, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const txt = await res.text();
    // izvuci "tablica": [ ... ] (prvi balansirani niz)
    const key = txt.indexOf('"tablica"');
    if (key === -1) return null;
    const start = txt.indexOf('[', key);
    let depth = 0, end = start;
    for (let i = start; i < txt.length; i++) {
      if (txt[i] === '[') depth++;
      else if (txt[i] === ']') { depth--; if (depth === 0) { end = i + 1; break; } }
    }
    const rows = JSON.parse(txt.slice(start, end)) as any[];
    return rows.map(r => ({
      rank: r.por, name: r.n, played: r.utk, won: r.pob, drawn: r.ner, lost: r.izg,
      gf: r.dat, ga: r.prim, points: r.bod, nasa: /lavice/i.test(r.n),
    }));
  } catch { return null; }
}

export async function getRrlTabela(): Promise<TabelaRed[] | null> {
  if (!RRL_ANON) return null;
  try {
    const res = await fetch(RRL_URL, {
      headers: { apikey: RRL_ANON, Authorization: `Bearer ${RRL_ANON}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as any[];
    return rows.map(r => ({
      rank: r.rank, name: r.club_name, played: r.played, won: r.won, drawn: r.drawn, lost: r.lost,
      gf: r.goals_for, ga: r.goals_against, points: r.points, nasa: /lavice/i.test(r.club_name),
    }));
  } catch { return null; }
}
