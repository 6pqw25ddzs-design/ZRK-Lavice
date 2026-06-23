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
  try {
    const results = await prisma.matchResult.findMany({
      include: {
        event: {
          include: { team: { select: { name: true, category: true } } },
        },
      },
      orderBy: { event: { startsAt: 'desc' } },
    } as any);
    res.json(results);
  } catch (e: any) {
    console.error('Results list error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.post('/', requireAuth, requireRole('coach', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const parse = resultSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const result = await prisma.matchResult.create({ data: parse.data as any });
    res.status(201).json(result);
  } catch (e: any) {
    console.error('Result create error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

router.patch('/:id', requireAuth, requireRole('coach', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await prisma.matchResult.update({ where: { id: req.params.id }, data: req.body });
    res.json(result);
  } catch (e: any) {
    console.error('Result update error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
