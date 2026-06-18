import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const playerSchema = z.object({
  teamId: z.string().uuid(),
  parentUserId: z.string().uuid().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  birthDate: z.string(),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  position: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

router.get('/', async (req, res) => {
  const { teamId } = req.query;
  const players = await prisma.player.findMany({
    where: { ...(teamId ? { teamId: String(teamId) } : {}), isActive: true },
    include: { team: { select: { name: true, category: true } } },
    orderBy: { lastName: 'asc' },
  });
  res.json(players);
});

router.get('/:id', async (req, res) => {
  const player = await prisma.player.findUnique({
    where: { id: req.params.id },
    include: {
      team: true,
      attendance: {
        include: { event: true },
        orderBy: { event: { startsAt: 'desc' } },
        take: 20,
      },
    },
  });
  if (!player) return res.status(404).json({ error: 'Not found' });
  res.json(player);
});

router.post('/', requireAuth, requireRole('coach', 'admin'), async (req: AuthRequest, res: Response) => {
  const parse = playerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const player = await prisma.player.create({ data: parse.data as any });
  res.status(201).json(player);
});

router.patch('/:id', requireAuth, requireRole('coach', 'admin'), async (_req: AuthRequest, res: Response) => {
  const player = await prisma.player.update({
    where: { id: _req.params.id },
    data: _req.body,
  });
  res.json(player);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await prisma.player.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(204).send();
});

export default router;
