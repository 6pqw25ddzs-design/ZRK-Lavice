import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { sendNotifyEmail } from '../services/email';

const router = Router();
const prisma = new PrismaClient();

// Push određenim roditeljima (preko parent_links → push_tokens)
async function pushToPlayersParents(playerIds: string[], title: string, body: string) {
  if (!playerIds.length) return 0;
  const links = await prisma.parentLink.findMany({ where: { playerId: { in: playerIds } }, select: { userId: true } });
  const userIds = [...new Set(links.map(l => l.userId))];
  if (!userIds.length) return 0;
  const rows = await prisma.pushToken.findMany({ where: { userId: { in: userIds } } });
  const tokens = rows.map(r => r.token).filter(t => t.startsWith('ExponentPushToken'));
  for (let i = 0; i < tokens.length; i += 100) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokens.slice(i, i + 100).map(to => ({ to, title, body, sound: 'default' }))),
      });
    } catch (e) { console.error('cron push error', e); }
  }
  return tokens.length;
}

function daysUntil(date: Date, now: Date) {
  return Math.floor((date.getTime() - now.getTime()) / 86400000);
}

// Dnevni podsjetnici — poziva ga Vercel cron jednom dnevno (admin token).
// Dedup prirodno: dokumenti okidaju samo na tačno 14/3/0 dana, članarine samo 5. i 20. u mjesecu.
router.post('/daily', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const day = now.getDate();
    const weekday = now.getDay(); // 1 = ponedjeljak
    const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
    const report: Record<string, unknown> = {};

    // 1) Dokumenti koji ističu (14, 3, 0 dana)
    const soon = new Date(now.getTime() + 15 * 86400000);
    const docs = await prisma.playerDocument.findMany({
      where: { expiresAt: { not: null, lte: soon } },
      include: { player: { select: { id: true, firstName: true } }, type: { select: { name: true } } },
    });
    let docPush = 0;
    const docSummary: string[] = [];
    for (const d of docs) {
      const left = daysUntil(d.expiresAt!, now);
      if (![14, 3, 0].includes(left)) continue;
      const when = left === 0 ? 'ističe DANAS' : `ističe za ${left} dana`;
      docPush += await pushToPlayersParents([d.player.id],
        `📄 ${d.type.name} — podsjetnik`,
        `${d.type.name} za ${d.player.firstName} ${when}. Molimo obnovite i dostavite klubu.`);
      docSummary.push(`${d.player.firstName}: ${d.type.name} ${when}`);
    }
    report.dokumenti = { obavjestenja: docSummary.length, pushPoslato: docPush };

    // 2) Neplaćene članarine (5. i 20. u mjesecu)
    if (day === 5 || day === 20) {
      const unpaid = await prisma.membershipFee.findMany({
        where: { year: now.getFullYear(), month: now.getMonth() + 1, status: 'unpaid' },
        include: { player: { select: { id: true, firstName: true } } },
      });
      let feePush = 0;
      for (const f of unpaid) {
        feePush += await pushToPlayersParents([f.player.id],
          '💶 Podsjetnik — članarina',
          `Članarina za ${MONTHS[now.getMonth()]} (${f.amountEur}€) za ${f.player.firstName} još nije evidentirana. Ako ste već uplatili, zanemarite poruku.`);
      }
      report.clanarine = { neplacenih: unpaid.length, pushPoslato: feePush };
    }

    // 3) Prijave na čekanju — mejl klubu ponedjeljkom
    if (weekday === 1) {
      const pending = await prisma.registration.count({ where: { status: 'pending' } });
      const pendingMembers = await prisma.clubMember.count({ where: { status: 'pending' } });
      if (pending + pendingMembers > 0) {
        await sendNotifyEmail(
          `Sedmični podsjetnik: ${pending + pendingMembers} prijava čeka odgovor`,
          `<div style="font-family:sans-serif"><h2 style="color:#C8102E">Podsjetnik 🦁</h2>
           <p>Na čekanju: <b>${pending}</b> prijava za upis i <b>${pendingMembers}</b> pristupnica za članstvo.</p>
           <p><a href="https://zrklavice.me/admin/prijave" style="color:#C8102E">Otvori prijave →</a></p></div>`);
        report.prijave = { pending, pendingMembers, mejlPoslat: true };
      }
    }

    res.json({ ok: true, at: now.toISOString(), ...report });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
