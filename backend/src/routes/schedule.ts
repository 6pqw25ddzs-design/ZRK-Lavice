import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { sendTeamPushNotification } from '../services/notifications';

const router = Router();
const prisma = new PrismaClient();

const eventSchema = z.object({
  teamId: z.string().uuid(),
  type: z.enum(['training', 'match']),
  title: z.string().min(2),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  location: z.string().optional(),
  opponent: z.string().optional(),
  notes: z.string().optional(),
});

// Public: get upcoming events optionally filtered by team
router.get('/', async (req, res) => {
  const { teamId, from, to } = req.query as Record<string, string>;
  const where: Record<string, unknown> = { isCancelled: false };
  if (teamId) where.teamId = teamId;
  if (from || to) {
    where.startsAt = {};
    if (from) (where.startsAt as Record<string, unknown>).gte = new Date(from);
    if (to) (where.startsAt as Record<string, unknown>).lte = new Date(to);
  }

  const events = await prisma.scheduleEvent.findMany({
    where,
    include: { team: { select: { name: true, category: true } }, result: true },
    orderBy: { startsAt: 'asc' },
  });
  res.json(events);
});

router.get('/:id', async (req, res) => {
  const event = await prisma.scheduleEvent.findUnique({
    where: { id: req.params.id },
    include: { team: true, result: true, attendance: { include: { player: true } } },
  });
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event);
});

router.post('/', requireAuth, requireRole('coach', 'admin'), async (req: AuthRequest, res: Response) => {
  const parse = eventSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const event = await prisma.scheduleEvent.create({ data: parse.data as any });

  const team = await prisma.team.findUnique({ where: { id: parse.data.teamId } });
  if (team) {
    await sendTeamPushNotification(parse.data.teamId, {
      title: `Novi termin — ${team.name}`,
      body: `${parse.data.title} · ${new Date(parse.data.startsAt).toLocaleDateString('sr-ME')}`,
    });
  }

  res.status(201).json(event);
});

router.patch('/:id', requireAuth, requireRole('coach', 'admin'), async (req: AuthRequest, res: Response) => {
  const event = await prisma.scheduleEvent.update({
    where: { id: req.params.id },
    data: req.body,
  });

  // Notify parents if event was cancelled or time changed
  if (req.body.isCancelled || req.body.startsAt) {
    await sendTeamPushNotification(event.teamId, {
      title: req.body.isCancelled ? `Otkazan termin` : `Izmjena termina`,
      body: `${event.title} je ${req.body.isCancelled ? 'otkazan' : 'promijenjen'}`,
    });
  }

  res.json(event);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (_req, res) => {
  await prisma.scheduleEvent.delete({ where: { id: _req.params.id } });
  res.status(204).send();
});

export default router;
