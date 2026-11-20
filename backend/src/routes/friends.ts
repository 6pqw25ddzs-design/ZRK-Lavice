import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Javna lista — zid „Prijatelji kluba"
router.get('/', async (_req, res) => {
  try {
    const friends = await prisma.friend.findMany({
      where: { visible: true },
      orderBy: [{ kind: 'desc' }, { createdAt: 'desc' }],
      select: { id: true, name: true, kind: true, logoUrl: true, websiteUrl: true, createdAt: true },
    });
    res.json(friends);
  } catch (e: any) {
    console.error('Friends list error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const friend = await prisma.friend.create({ data: req.body });
    res.status(201).json(friend);
  } catch (e: any) {
    console.error('Friend create error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const friend = await prisma.friend.update({ where: { id: req.params.id }, data: req.body });
    res.json(friend);
  } catch (e: any) {
    console.error('Friend update error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.friend.update({ where: { id: req.params.id }, data: { visible: false } });
    res.status(204).send();
  } catch (e: any) {
    console.error('Friend delete error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
