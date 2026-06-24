import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { isActive: true },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(sponsors);
  } catch (e: any) {
    console.error('Sponsors list error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const sponsor = await prisma.sponsor.create({ data: req.body });
    res.status(201).json(sponsor);
  } catch (e: any) {
    console.error('Sponsor create error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const sponsor = await prisma.sponsor.update({ where: { id: req.params.id }, data: req.body });
    res.json(sponsor);
  } catch (e: any) {
    console.error('Sponsor update error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.sponsor.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.status(204).send();
  } catch (e: any) {
    console.error('Sponsor delete error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
