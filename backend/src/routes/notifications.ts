import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { sendTeamPushNotification, sendBroadcastPushNotification } from '../services/notifications';

const router = Router();
const prisma = new PrismaClient();

const notifSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  teamId: z.string().uuid().optional(),
});

router.post('/send', requireAuth, requireRole('coach', 'admin'), async (req: AuthRequest, res: Response) => {
  const parse = notifSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { title, body, teamId } = parse.data;

  if (teamId) {
    await sendTeamPushNotification(teamId, { title, body });
  } else {
    await sendBroadcastPushNotification({ title, body });
  }

  res.json({ sent: true });
});

router.get('/history', requireAuth, requireRole('admin'), async (_req, res) => {
  const notifs = await prisma.notification.findMany({
    include: { sender: { select: { fullName: true } }, team: { select: { name: true } } },
    orderBy: { sentAt: 'desc' },
    take: 50,
  });
  res.json(notifs);
});

export default router;
