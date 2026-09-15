'use client';
import { useEffect, useRef, useState } from 'react';

const API = 'https://api.zrklavice.me';
const W = 1080, H = 1350;
const RED = '#C41230', GOLD = '#D4AC0D';

type Mode = 'rezultat' | 'najava' | 'igracica';

/* ------------------------------ crtanje ------------------------------ */

function bg(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(W * 0.78, -100, 100, W * 0.5, H * 0.4, H * 1.1);
  g.addColorStop(0, '#4a0f1d'); g.addColorStop(0.45, '#26090f'); g.addColorStop(1, '#141414');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

function signature(ctx: CanvasRenderingContext2D, text: string, y: number) {
  const grad = ctx.createLinearGradient(80, 0, 190, 0);
  grad.addColorStop(0, RED); grad.addColorStop(1, GOLD);
  ctx.fillStyle = grad; ctx.fillRect(80, y - 8, 90, 5);
  ctx.fillStyle = GOLD; ctx.font = '700 26px Montserrat';
  ctx.textAlign = 'left';
  ctx.fillText(text.toUpperCase().split('').join(' '), 192, y + 3);
}

function footer(ctx: CanvasRenderingContext2D, logo: HTMLImageElement | null) {
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(0, H - 110, W, 1);
  if (logo) ctx.drawImage(logo, 80, H - 88, 56, 56);
  ctx.fillStyle = '#fff'; ctx.font = '900 30px Montserrat'; ctx.textAlign = 'left';
  ctx.fillText('ŽRK LAVICE-UDG', 152, H - 50);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '600 24px Inter';
  ctx.textAlign = 'right'; ctx.fillText('zrklavice.me', W - 80, H - 50);
}

function outlineNumber(ctx: CanvasRenderingContext2D, num: string, x: number, y: number, size: number) {
  ctx.save();
  ctx.font = `900 ${size}px Montserrat`; ctx.textAlign = 'right';
  ctx.strokeStyle = 'rgba(212,172,13,0.16)'; ctx.lineWidth = 3;
  ctx.strokeText(num, x, y);
  ctx.restore();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxW: number, base: number, weight = 900, font = 'Montserrat') {
  let size = base;
  do { ctx.font = `${weight} ${size}px ${font}`; size -= 4; }
  while (ctx.measureText(text).width > maxW && size > 20);
}

function drawRezultat(ctx: CanvasRenderingContext2D, r: any, detail: any, logo: HTMLImageElement | null) {
  bg(ctx);
  const win = r.homeScore > r.awayScore, draw = r.homeScore === r.awayScore;
  outlineNumber(ctx, String(r.homeScore), W + 60, 560, 700);
  signature(ctx, `Kraj · ${(r.notes || 'Utakmica').split('·')[0].trim()}`, 150);

  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.85)';
  fitText(ctx, r.event?.title || '', W - 160, 64);
  ctx.fillText(r.event?.title || '', 80, 250);

  // semafor
  ctx.textAlign = 'center';
  ctx.font = '900 330px Montserrat';
  ctx.fillStyle = '#fff'; ctx.fillText(String(r.homeScore), W * 0.30, 680);
  ctx.fillStyle = RED; ctx.font = '900 160px Montserrat'; ctx.fillText(':', W * 0.5, 650);
  ctx.fillStyle = GOLD; ctx.font = '900 330px Montserrat'; ctx.fillText(String(r.awayScore), W * 0.70, 680);

  ctx.font = '900 44px Montserrat';
  ctx.fillStyle = win ? '#2ebd6b' : draw ? GOLD : 'rgba(255,255,255,0.75)';
  ctx.fillText(win ? 'POBJEDA LAVICA' : draw ? 'NERIJEŠENO' : 'BORILE SMO SE DO KRAJA', W / 2, 790);

  // strijelci (top 5)
  const scorers = (detail?.scorers || []).slice(0, 5);
  if (scorers.length) {
    ctx.textAlign = 'left'; ctx.fillStyle = GOLD; ctx.font = '700 26px Montserrat';
    ctx.fillText('S T R I J E L C I', 80, 890);
    scorers.forEach((s: any, i: number) => {
      const y = 950 + i * 58;
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = '700 34px Inter';
      ctx.fillText(`${s.firstName} ${s.lastName}`, 80, y);
      ctx.fillStyle = GOLD; ctx.font = '900 34px Montserrat'; ctx.textAlign = 'right';
      ctx.fillText(String(s.goals), W - 80, y);
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(80, y + 16, W - 160, 1);
    });
  }
  footer(ctx, logo);
}

function drawNajava(ctx: CanvasRenderingContext2D, e: any, logo: HTMLImageElement | null) {
  bg(ctx);
  outlineNumber(ctx, 'VS', W + 40, 760, 560);
  signature(ctx, 'Matchday', 150);

  const d = new Date(e.startsAt);
  const parts = (e.title || '').split('—').map((x: string) => x.trim());
  const [t1, t2] = parts.length === 2 ? parts : [e.title, ''];

  ctx.textAlign = 'left';
  ctx.fillStyle = t1?.toLowerCase().includes('lavice') ? RED : 'rgba(255,255,255,0.88)';
  fitText(ctx, (t1 || '').toUpperCase(), W - 200, 110);
  ctx.fillText((t1 || '').toUpperCase(), 80, 420);
  ctx.fillStyle = GOLD; ctx.font = '900 70px Montserrat'; ctx.fillText('—', 80, 540);
  if (t2) {
    ctx.fillStyle = t2.toLowerCase().includes('lavice') ? RED : 'rgba(255,255,255,0.88)';
    fitText(ctx, t2.toUpperCase(), W - 200, 110);
    ctx.fillText(t2.toUpperCase(), 80, 670);
  }

  const when = d.toLocaleString('sr-Latn-ME', { timeZone: 'Europe/Podgorica', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  ctx.fillStyle = '#fff'; ctx.font = '700 46px Inter';
  ctx.fillText(when.charAt(0).toUpperCase() + when.slice(1), 80, 830);
  if (e.location) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '600 38px Inter';
    ctx.fillText(`📍 ${e.location}`, 80, 900);
  }
  if (e.notes) {
    ctx.fillStyle = GOLD; ctx.font = '700 32px Inter';
    ctx.fillText(e.notes, 80, 970);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = '600 34px Inter';
  ctx.fillText('Dođi da nas podržiš! 🦁', 80, 1090);
  footer(ctx, logo);
}

function drawIgracica(ctx: CanvasRenderingContext2D, p: any, photo: HTMLImageElement | null, logo: HTMLImageElement | null) {
  bg(ctx);
  if (p.jerseyNumber != null) outlineNumber(ctx, String(p.jerseyNumber), W + 50, 700, 720);
  signature(ctx, p.team?.name || 'ŽRK Lavice', 150);

  // fotografija (4:5) u zaobljenom okviru
  if (photo) {
    const pw = 470, ph = 588, px = 80, py = 230, rad = 34;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(px + rad, py); ctx.arcTo(px + pw, py, px + pw, py + ph, rad);
    ctx.arcTo(px + pw, py + ph, px, py + ph, rad); ctx.arcTo(px, py + ph, px, py, rad); ctx.arcTo(px, py, px + pw, py, rad);
    ctx.closePath(); ctx.clip();
    const scale = Math.max(pw / photo.width, ph / photo.height);
    ctx.drawImage(photo, px + (pw - photo.width * scale) / 2, py, photo.width * scale, photo.height * scale);
    ctx.restore();
  }

  ctx.textAlign = 'left';
  const first = (p.firstName || '').toUpperCase(), last = (p.lastName || '').toUpperCase();
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  fitText(ctx, first, W - 200, 120); const fFont = ctx.font;
  ctx.fillText(first, 80, 990);
  ctx.fillStyle = RED;
  fitText(ctx, last, W - 200, 120);
  ctx.fillText(last, 80, 1110);

  // statistika
  const isK = (p.saves ?? 0) > 0;
  const stats = isK
    ? [[String(p.saves), 'ODBRANA'], [`${p.savePct}%`, 'SAVE'], [String(p.matchesPlayed ?? 0), 'UTAKMICA']]
    : [[String(p.goals ?? 0), 'GOLOVA'], [String(p.matchesPlayed ?? 0), 'UTAKMICA'], [p.jerseyNumber != null ? `#${p.jerseyNumber}` : '—', 'DRES']];
  stats.forEach(([v, l], i) => {
    const x = 80 + i * 300;
    ctx.fillStyle = GOLD; ctx.font = '900 72px Montserrat'; ctx.fillText(v, x, 1210);
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '700 24px Inter'; ctx.fillText(l, x, 1250);
  });
  footer(ctx, logo);
}

/* ------------------------------ stranica ------------------------------ */

export default function GrafikePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<Mode>('rezultat');
  const [results, setResults] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selId, setSelId] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/results`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/schedule`).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/players`).then(r => r.json()).catch(() => []),
    ]).then(([r, e, p]) => {
      setResults(Array.isArray(r) ? r : []);
      setEvents((Array.isArray(e) ? e : []).filter((x: any) => x.type === 'match'));
      setPlayers(Array.isArray(p) ? p : []);
    });
  }, []);

  const options = mode === 'rezultat'
    ? results.map((r: any) => ({ id: r.id, label: `${r.event?.title} · ${r.homeScore}:${r.awayScore}` }))
    : mode === 'najava'
      ? events.map((e: any) => ({ id: e.id, label: `${e.title} · ${new Date(e.startsAt).toLocaleDateString('sr-Latn-ME', { timeZone: 'Europe/Podgorica' })}` }))
      : players.map((p: any) => ({ id: p.id, label: `${p.firstName} ${p.lastName}${p.jerseyNumber != null ? ` (#${p.jerseyNumber})` : ''}` }));

  async function loadImg(src: string): Promise<HTMLImageElement | null> {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => res(img); img.onerror = () => res(null);
      img.src = src;
    });
  }

  async function render() {
    if (!selId) { setStatus('Izaberi stavku iz liste.'); return; }
    setStatus('Crtam…');
    await Promise.all([
      (document as any).fonts.load('900 100px Montserrat'),
      (document as any).fonts.load('700 30px Inter'),
    ]).catch(() => {});
    const ctx = canvasRef.current!.getContext('2d')!;
    const logo = await loadImg('/logo.png');

    if (mode === 'rezultat') {
      const r = results.find(x => x.id === selId);
      const detail = await fetch(`${API}/api/stats/match/${selId}`).then(x => x.ok ? x.json() : null).catch(() => null);
      drawRezultat(ctx, r, detail, logo);
    } else if (mode === 'najava') {
      drawNajava(ctx, events.find(x => x.id === selId), logo);
    } else {
      const p = await fetch(`${API}/api/players/${selId}`).then(x => x.json());
      const photo = p.photoUrl ? await loadImg(p.photoUrl) : null;
      drawIgracica(ctx, p, photo, logo);
    }
    setStatus('');
  }

  function download() {
    const a = document.createElement('a');
    a.download = `lavice-${mode}-${Date.now()}.png`;
    a.href = canvasRef.current!.toDataURL('image/png');
    a.click();
  }

  const btn = (m: Mode, l: string) => (
    <button onClick={() => { setMode(m); setSelId(''); }}
      className="px-4 py-2 rounded-full text-sm font-bold transition-colors"
      style={mode === m ? { backgroundColor: 'var(--primary)', color: '#fff' } : { border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
      {l}
    </button>
  );

  return (
    <div>
      <h1 className="text-2xl font-black text-white mb-2">Grafike za objave</h1>
      <p style={{ color: 'var(--text-muted)' }} className="text-sm mb-6">Instagram/Facebook kartice (1080×1350) u klupskom dizajnu — izaberi, generiši, preuzmi.</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {btn('rezultat', '🏆 Rezultat')}{btn('najava', '📣 Najava')}{btn('igracica', '⭐ Igračica')}
      </div>

      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <select value={selId} onChange={e => setSelId(e.target.value)}
          style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'white' }}
          className="px-4 py-2.5 rounded-lg outline-none max-w-md">
          <option value="">— izaberi —</option>
          {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <button onClick={render} style={{ backgroundColor: 'var(--primary)' }}
          className="px-5 py-2.5 rounded-lg text-white font-bold">Generiši</button>
        <button onClick={download} style={{ border: '1px solid var(--gold)', color: 'var(--gold)' }}
          className="px-5 py-2.5 rounded-lg font-bold">⬇️ Preuzmi PNG</button>
        {status && <span style={{ color: 'var(--text-muted)' }} className="text-sm">{status}</span>}
      </div>

      <canvas ref={canvasRef} width={W} height={H}
        style={{ width: 360, height: 450, border: '1px solid var(--border)', borderRadius: 12, backgroundColor: '#141414' }} />
    </div>
  );
}
