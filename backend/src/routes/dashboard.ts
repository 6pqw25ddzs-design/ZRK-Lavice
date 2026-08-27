import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Jedan agregatni poziv za admin dashboard — "kako smo?" na jednom ekranu
router.get('/', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth() + 1;
    const monthFrom = new Date(Date.UTC(year, month - 1, 1, -2));
    const monthTo = new Date(Date.UTC(year, month, 1, -2));
    const soon = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
    const last30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000);

    const [
      activePlayers, parentUsers, pendingRegs,
      feesCharged, feesPaid, feesUnpaidSum,
      expiringDocs, teams, attendance30,
      lastAnnouncement, financeEntries, paidFeesMonth,
      upcoming,
    ] = await Promise.all([
      prisma.player.count({ where: { isActive: true } }),
      prisma.parentLink.groupBy({ by: ['userId'] }).then(r => r.length),
      prisma.registration.count({ where: { status: 'pending' } }),
      prisma.membershipFee.count({ where: { year, month } }),
      prisma.membershipFee.count({ where: { year, month, status: 'paid' } }),
      prisma.membershipFee.aggregate({ where: { year, month, status: 'unpaid' }, _sum: { amountEur: true } }),
      prisma.playerDocument.findMany({
        where: { expiresAt: { not: null, lte: soon } },
        include: { player: { select: { firstName: true, lastName: true } }, type: { select: { name: true } } },
        orderBy: { expiresAt: 'asc' }, take: 8,
      }),
      prisma.team.findMany({ select: { id: true, name: true } }),
      prisma.attendance.findMany({
        where: { event: { startsAt: { gte: last30, lte: now }, type: 'training' } },
        select: { status: true, event: { select: { teamId: true } } },
      }),
      prisma.announcement.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { team: { select: { name: true } }, _count: { select: { reads: true } } },
      }),
      prisma.financeEntry.findMany({ where: { date: { gte: monthFrom, lt: monthTo } }, select: { kind: true, amountEur: true } }),
      prisma.membershipFee.aggregate({ where: { status: 'paid', paidAt: { gte: monthFrom, lt: monthTo } }, _sum: { amountEur: true } }),
      prisma.scheduleEvent.findMany({
        where: { startsAt: { gte: now }, isCancelled: false },
        include: { team: { select: { name: true } } },
        orderBy: { startsAt: 'asc' }, take: 5,
      }),
    ]);

    // prisustvo po ekipi (posljednjih 30 dana, treninzi)
    const attByTeam: Record<string, { present: number; total: number }> = {};
    for (const a of attendance30) {
      const t = (attByTeam[a.event.teamId] ||= { present: 0, total: 0 });
      t.total++;
      if (a.status === 'present') t.present++;
    }
    const attendance = teams.map(t => ({
      team: t.name,
      pct: attByTeam[t.id]?.total ? Math.round((attByTeam[t.id].present / attByTeam[t.id].total) * 100) : null,
      records: attByTeam[t.id]?.total || 0,
    }));

    const finIncome = financeEntries.filter(e => e.kind === 'income').reduce((s, e) => s + e.amountEur, 0)
      + (paidFeesMonth._sum.amountEur || 0);
    const finExpense = financeEntries.filter(e => e.kind === 'expense').reduce((s, e) => s + e.amountEur, 0);

    res.json({
      counts: { activePlayers, parentUsers, pendingRegs },
      fees: {
        charged: feesCharged, paid: feesPaid,
        unpaidSum: feesUnpaidSum._sum.amountEur || 0,
      },
      expiringDocs: expiringDocs.map(d => ({
        player: `${d.player.firstName} ${d.player.lastName}`, type: d.type.name,
        expiresAt: d.expiresAt, expired: d.expiresAt! < now,
      })),
      attendance,
      lastAnnouncement: lastAnnouncement ? {
        title: lastAnnouncement.title, team: lastAnnouncement.team.name,
        readCount: lastAnnouncement._count.reads, requiresAck: lastAnnouncement.requiresAck,
        createdAt: lastAnnouncement.createdAt,
      } : null,
      finance: { income: finIncome, expense: finExpense, balance: finIncome - finExpense },
      upcoming: upcoming.map(e => ({
        title: e.title, type: e.type, startsAt: e.startsAt, team: e.team.name, location: e.location,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
