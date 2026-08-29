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
  birthDate: z.string().datetime(),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  position: z.string().optional(),
  photoUrl: z.string().url().optional(),
});

router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;
    const players = await prisma.player.findMany({
      where: { ...(teamId ? { teamId: String(teamId) } : {}), isActive: true },
      include: { team: { select: { name: true, category: true } } },
      orderBy: { lastName: 'asc' },
    });
    res.json(players);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
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

    // Golovi iz zvaničnih rezultata + broj utakmica (prisustvo ILI gol na utakmici)
    let goals = 0;
    const playedEvents = new Set<string>(
      (player.attendance || [])
        .filter((a: any) => a.event?.type === 'match' && a.status === 'present')
        .map((a: any) => a.eventId)
    );
    try {
      const results = await prisma.matchResult.findMany({
        where: { event: { teamId: player.teamId } },
        select: { eventId: true, scorers: true },
      });
      for (const r of results) {
        const s = r.scorers as Record<string, unknown> | null;
        const g = s && typeof s === 'object' ? Number(s[player.id]) || 0 : 0;
        goals += g;
        if (g > 0) playedEvents.add(r.eventId);
      }
    } catch {}

    res.json({ ...player, goals, matchesPlayed: playedEvents.size });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, requireRole('coach', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const parse = playerSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const player = await prisma.player.create({ data: parse.data as any });
    res.status(201).json(player);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id', requireAuth, requireRole('coach', 'admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const player = await prisma.player.update({
      where: { id: _req.params.id },
      data: _req.body,
    });
    res.json(player);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    await prisma.player.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.status(204).send();
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
