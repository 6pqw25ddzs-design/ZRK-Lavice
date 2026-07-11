import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Presjek članarina za ekipu i mjesec (i igračice bez zaduženja)
router.get('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, year, month } = req.query;
    if (!teamId || !year || !month) return res.status(400).json({ error: 'teamId, year i month su obavezni' });

    const players = await prisma.player.findMany({
      where: { teamId: String(teamId), isActive: true },
      select: {
        id: true, firstName: true, lastName: true,
        fees: { where: { year: Number(year), month: Number(month) } },
      },
      orderBy: { lastName: 'asc' },
    });
    res.json(players.map(p => ({
      playerId: p.id, firstName: p.firstName, lastName: p.lastName,
      fee: p.fees[0] ?? null,
    })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Generisanje zaduženja za sve igračice ekipe za mjesec (preskače postojeća)
router.post('/generate', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, year, month, amountEur } = req.body;
    if (!teamId || !year || !month || !amountEur) {
      return res.status(400).json({ error: 'teamId, year, month i amountEur su obavezni' });
    }
    const players = await prisma.player.findMany({ where: { teamId, isActive: true }, select: { id: true } });
    const result = await prisma.membershipFee.createMany({
      data: players.map(p => ({ playerId: p.id, year, month, amountEur })),
      skipDuplicates: true,
    });
    res.status(201).json({ created: result.count, players: players.length });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Promjena statusa uplate
router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, method, note, amountEur } = req.body;
    if (status && !['unpaid', 'paid', 'waived'].includes(status)) {
      return res.status(400).json({ error: 'status mora biti unpaid/paid/waived' });
    }
    const fee = await prisma.membershipFee.update({
      where: { id: req.params.id },
      data: {
        ...(status ? { status, paidAt: status === 'paid' ? new Date() : null } : {}),
        ...(method !== undefined ? { method } : {}),
        ...(note !== undefined ? { note } : {}),
        ...(amountEur !== undefined ? { amountEur } : {}),
      },
    });
    res.json(fee);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Dugovanja po klubu (za dashboard)
router.get('/outstanding', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const fees = await prisma.membershipFee.findMany({
      where: { status: 'unpaid' },
      include: { player: { select: { firstName: true, lastName: true, team: { select: { name: true } } } } },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
    res.json(fees.map(f => ({
      id: f.id, player: `${f.player.firstName} ${f.player.lastName}`, team: f.player.team.name,
      year: f.year, month: f.month, amountEur: f.amountEur,
    })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
