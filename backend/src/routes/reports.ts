import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Mjesečni izvještaj za upravu — svi ključni pokazatelji jednog mjeseca
router.get('/monthly', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const year = Number(req.query.year), month = Number(req.query.month);
    if (!year || !month) return res.status(400).json({ error: 'year i month su obavezni' });
    const from = new Date(Date.UTC(year, month - 1, 1, -2));
    const to = new Date(Date.UTC(year, month, 1, -2));

    const [
      teams, activePlayers, parentUsers, clubMembers,
      newRegs, newMembers,
      feesAll, financeEntries, paidFeesSum,
      attendance, matches,
    ] = await Promise.all([
      prisma.team.findMany({ select: { id: true, name: true } }),
      prisma.player.count({ where: { isActive: true } }),
      prisma.parentLink.groupBy({ by: ['userId'] }).then(r => r.length),
      prisma.clubMember.count({ where: { status: 'approved' } }),
      prisma.registration.count({ where: { createdAt: { gte: from, lt: to } } }),
      prisma.clubMember.count({ where: { createdAt: { gte: from, lt: to } } }),
      prisma.membershipFee.findMany({ where: { year, month }, include: { player: { select: { teamId: true } } } }),
      prisma.financeEntry.findMany({ where: { date: { gte: from, lt: to } }, orderBy: { date: 'asc' } }),
      prisma.membershipFee.aggregate({ where: { status: 'paid', paidAt: { gte: from, lt: to } }, _sum: { amountEur: true }, _count: true }),
      prisma.attendance.findMany({
        where: { event: { startsAt: { gte: from, lt: to }, type: 'training' } },
        select: { status: true, event: { select: { teamId: true } } },
      }),
      prisma.matchResult.findMany({
        where: { event: { startsAt: { gte: from, lt: to } } },
        include: { event: { select: { startsAt: true, title: true, opponent: true, team: { select: { name: true } } } } },
        orderBy: { event: { startsAt: 'asc' } },
      } as any),
    ]);

    // članarine po ekipi
    const feesByTeam = teams.map(t => {
      const rows = feesAll.filter(f => f.player.teamId === t.id);
      return {
        team: t.name, charged: rows.length,
        paid: rows.filter(r => r.status === 'paid').length,
        unpaidSum: rows.filter(r => r.status === 'unpaid').reduce((s, r) => s + r.amountEur, 0),
      };
    });

    // prisustvo po ekipi
    const attByTeam: Record<string, { present: number; total: number }> = {};
    for (const a of attendance) {
      const e = (attByTeam[a.event.teamId] ||= { present: 0, total: 0 });
      e.total++; if (a.status === 'present') e.present++;
    }
    const attendanceByTeam = teams.map(t => ({
      team: t.name,
      pct: attByTeam[t.id]?.total ? Math.round((attByTeam[t.id].present / attByTeam[t.id].total) * 100) : null,
    }));

    const income = financeEntries.filter(e => e.kind === 'income').reduce((s, e) => s + e.amountEur, 0);
    const expense = financeEntries.filter(e => e.kind === 'expense').reduce((s, e) => s + e.amountEur, 0);
    const feesIncome = paidFeesSum._sum.amountEur || 0;

    res.json({
      period: { year, month },
      club: { activePlayers, parentUsers, clubMembers, newRegs, newMembers },
      fees: feesByTeam,
      attendance: attendanceByTeam,
      finance: {
        entries: financeEntries,
        income, expense, feesIncome, feesCount: paidFeesSum._count,
        totalIncome: income + feesIncome, balance: income + feesIncome - expense,
      },
      matches: (matches as any[]).map(m => ({
        date: m.event.startsAt, team: m.event.team.name,
        opponent: m.event.opponent || m.event.title, score: `${m.homeScore}:${m.awayScore}`,
        outcome: m.homeScore > m.awayScore ? 'P' : m.homeScore === m.awayScore ? 'N' : 'I',
      })),
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
