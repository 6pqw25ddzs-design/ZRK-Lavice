// Tabele liga — isti izvori kao sajt (zrklavice.me/tabela).
export type TabelaRed = {
  rank: number; name: string; played: number; won: number; drawn: number; lost: number;
  gf: number; ga: number; points: number; nasa: boolean;
};

const RSCG_URL = 'https://www.sportinfocentar2.com/coman/natjecanje2123.js';
const RRL_URL =
  'https://supabase.rr-liga.com/rest/v1/v_public_standings?group_id=eq.33333333-0000-0000-0000-0000000000a2&select=*&order=rank';
const RRL_ANON = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc4OTU2MzYwMCwiZXhwIjo0OTQ1MjM3MjAwLCJyb2xlIjoiYW5vbiJ9.s9NcQtH8WnX3RdY_b_5qUmDytlgY3bgoSiHj1EuHgQ0';

export async function getPrvaLigaTabela(): Promise<TabelaRed[] | null> {
  try {
    const res = await fetch(RSCG_URL + '?t=' + Date.now());
    if (!res.ok) return null;
    const txt = await res.text();
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
  try {
    const res = await fetch(RRL_URL, {
      headers: { apikey: RRL_ANON, Authorization: 'Bearer ' + RRL_ANON },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as any[];
    return rows.map(r => ({
      rank: r.rank, name: r.club_name, played: r.played, won: r.won, drawn: r.drawn, lost: r.lost,
      gf: r.goals_for, ga: r.goals_against, points: r.points, nasa: /lavice/i.test(r.club_name),
    }));
  } catch { return null; }
}
