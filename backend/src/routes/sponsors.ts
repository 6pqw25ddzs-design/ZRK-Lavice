import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const sponsors = await prisma.sponsor.findMany({
    where: { isActive: true },
    orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }],
  });
  res.json(sponsors);
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const sponsor = await prisma.sponsor.create({ data: req.body });
  res.status(201).json(sponsor);
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const sponsor = await prisma.sponsor.update({ where: { id: req.params.id }, data: req.body });
  res.json(sponsor);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await prisma.sponsor.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(204).send();
});

export default router;
