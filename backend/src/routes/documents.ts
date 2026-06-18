import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const isAdmin = ['admin', 'coach'].includes(req.user!.role);
  const docs = await prisma.document.findMany({
    where: isAdmin ? {} : { isPublic: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(docs);
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const doc = await prisma.document.create({
    data: { ...req.body, uploadedBy: req.user!.id },
  });
  res.status(201).json(doc);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await prisma.document.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
