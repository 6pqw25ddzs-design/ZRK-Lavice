import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const seasons = await prisma.season.findMany({ orderBy: { startsAt: 'desc' } });
    res.json(seasons);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.get('/active', async (_req: Request, res: Response) => {
  try {
    const season = await prisma.season.findFirst({ where: { isActive: true } });
    res.json(season);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, startsAt, endsAt } = req.body;
    if (!name || !startsAt || !endsAt) return res.status(400).json({ error: 'name, startsAt i endsAt su obavezni' });
    const season = await prisma.season.create({
      data: { name, startsAt: new Date(startsAt), endsAt: new Date(endsAt) },
    });
    res.status(201).json(season);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Aktivacija sezone deaktivira sve ostale
router.patch('/:id/activate', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.$transaction([
      prisma.season.updateMany({ data: { isActive: false } }),
      prisma.season.update({ where: { id: req.params.id }, data: { isActive: true } }),
    ]);
    const season = await prisma.season.findUnique({ where: { id: req.params.id } });
    res.json(season);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
