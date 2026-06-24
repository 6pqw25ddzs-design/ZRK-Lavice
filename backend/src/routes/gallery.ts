import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: list all gallery images
router.get('/', async (_req, res) => {
  try {
    const images = await prisma.galleryImage.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(images);
  } catch (e: any) {
    console.error('Gallery list error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const image = await prisma.galleryImage.create({ data: req.body });
    res.status(201).json(image);
  } catch (e: any) {
    console.error('Gallery create error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.galleryImage.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: any) {
    console.error('Gallery delete error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
