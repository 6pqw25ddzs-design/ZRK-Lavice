import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const messageSchema = z.object({
  recipientId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  body: z.string().min(1).max(2000),
  isGroup: z.boolean().default(false),
});

router.get('/inbox', requireAuth, async (req: AuthRequest, res: Response) => {
  const messages = await prisma.message.findMany({
    where: { recipientId: req.user!.id },
    include: { sender: { select: { fullName: true, role: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(messages);
});

router.get('/conversation/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  const myId = req.user!.id;
  const otherId = req.params.userId;

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: myId, recipientId: otherId },
        { senderId: otherId, recipientId: myId },
      ],
    },
    include: { sender: { select: { fullName: true } } },
    orderBy: { createdAt: 'asc' },
  });

  await prisma.message.updateMany({
    where: { senderId: otherId, recipientId: myId, readAt: null },
    data: { readAt: new Date() },
  });

  res.json(messages);
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const parse = messageSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const msg = await prisma.message.create({
    data: { ...parse.data, senderId: req.user!.id },
    include: { sender: { select: { fullName: true } } },
  });
  res.status(201).json(msg);
});

export default router;
