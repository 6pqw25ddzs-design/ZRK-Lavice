import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: list standings (sorted by league, then points desc)
router.get('/', async (_req, res) => {
  try {
    const rows = await prisma.leagueStanding.findMany({
      orderBy: [{ league: 'asc' }, { points: 'desc' }, { goalsFor: 'desc' }],
    });
    res.json(rows);
  } catch (e: any) {
    console.error('Standings list error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const row = await prisma.leagueStanding.create({ data: req.body });
    res.status(201).json(row);
  } catch (e: any) {
    console.error('Standing create error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const row = await prisma.leagueStanding.update({ where: { id: req.params.id }, data: req.body });
    res.json(row);
  } catch (e: any) {
    console.error('Standing update error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.leagueStanding.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: any) {
    console.error('Standing delete error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
