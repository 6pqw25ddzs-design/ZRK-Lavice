import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const resultSchema = z.object({
  eventId: z.string().uuid(),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  scorers: z.any().optional(),
  notes: z.string().optional(),
});

router.get('/', async (req, res) => {
  const { teamId, season } = req.query;
  const results = await prisma.matchResult.findMany({
    include: {
      event: {
        include: { team: { select: { name: true, category: true } } },
        where: {
          ...(teamId ? { teamId: String(teamId) } : {}),
          type: 'match',
        },
      },
    },
    orderBy: { event: { startsAt: 'desc' } },
  });
  res.json(results);
});

router.post('/', requireAuth, requireRole('coach', 'admin'), async (req: AuthRequest, res: Response) => {
  const parse = resultSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const result = await prisma.matchResult.create({ data: parse.data });
  res.status(201).json(result);
});

router.patch('/:id', requireAuth, requireRole('coach', 'admin'), async (req: AuthRequest, res: Response) => {
  const result = await prisma.matchResult.update({ where: { id: req.params.id }, data: req.body });
  res.json(result);
});

export default router;
