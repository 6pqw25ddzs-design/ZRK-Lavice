import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        coaches: { include: { user: { select: { fullName: true } } } },
        _count: { select: { players: true } },
      },
    });
    res.json(teams);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const team = await prisma.team.findUnique({
      where: { id: req.params.id },
      include: {
        players: { where: { isActive: true }, orderBy: { jerseyNumber: 'asc' } },
        coaches: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
      },
    });
    if (!team) return res.status(404).json({ error: 'Not found' });
    res.json(team);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

// Admin: izmjena naziva/opisa ekipe (kategorija se ne mijenja — vezana je za logiku)
router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, birthYear } = req.body;
    const team = await prisma.team.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(birthYear !== undefined ? { birthYear: birthYear === null ? null : Number(birthYear) } : {}),
      },
    });
    res.json(team);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
