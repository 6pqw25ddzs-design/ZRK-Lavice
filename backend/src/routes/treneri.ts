import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: list active coaches
router.get('/', async (_req, res) => {
  try {
    const rows = await prisma.trener.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    res.json(rows);
  } catch (e: any) {
    console.error('Treneri list error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const row = await prisma.trener.create({ data: req.body });
    res.status(201).json(row);
  } catch (e: any) {
    console.error('Trener create error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const row = await prisma.trener.update({ where: { id: req.params.id }, data: req.body });
    res.json(row);
  } catch (e: any) {
    console.error('Trener update error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.trener.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: any) {
    console.error('Trener delete error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
