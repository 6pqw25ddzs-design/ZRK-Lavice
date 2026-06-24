import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: only documents marked public (no auth)
router.get('/public', async (_req, res) => {
  try {
    const docs = await prisma.document.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(docs);
  } catch (e: any) {
    console.error('Public documents error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = ['admin', 'coach'].includes(req.user!.role);
    const docs = await prisma.document.findMany({
      where: isAdmin ? {} : { isPublic: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(docs);
  } catch (e: any) {
    console.error('Documents list error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const doc = await prisma.document.create({
      data: { ...req.body, uploadedBy: req.user!.id },
    });
    res.status(201).json(doc);
  } catch (e: any) {
    console.error('Document create error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.document.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e: any) {
    console.error('Document delete error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
