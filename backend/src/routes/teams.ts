import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  const teams = await prisma.team.findMany({
    include: {
      coaches: { include: { user: { select: { fullName: true } } } },
      _count: { select: { players: true } },
    },
  });
  res.json(teams);
});

router.get('/:id', async (req, res) => {
  const team = await prisma.team.findUnique({
    where: { id: req.params.id },
    include: {
      players: { where: { isActive: true }, orderBy: { jerseyNumber: 'asc' } },
      coaches: { include: { user: { select: { fullName: true, email: true, phone: true } } } },
    },
  });
  if (!team) return res.status(404).json({ error: 'Not found' });
  res.json(team);
});

export default router;
