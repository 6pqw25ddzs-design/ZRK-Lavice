import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES = '30d';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const activateSchema = z.object({
  code: z.string().min(4),
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  relation: z.string().optional(),
});

function signToken(id: string, role: string) {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

// Otvorena registracija je ukinuta — nalozi se prave isključivo pozivnim kodom
// (roditelji) ili kroz admin (treneri/administratori).
router.post('/register', (_req: Request, res: Response) => {
  res.status(403).json({ error: 'Registracija je moguća samo uz pozivni kod kluba' });
});

// Aktivacija roditeljskog naloga pozivnim kodom igračice.
// Ako nalog sa tim emailom već postoji, kod ga vezuje za novo dijete.
router.post('/activate', async (req: Request, res: Response) => {
  try {
    const parse = activateSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { code, email, password, fullName, phone, relation } = parse.data;

    const invite = await prisma.inviteCode.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { player: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!invite) return res.status(404).json({ error: 'Nepostojeći pozivni kod' });
    if (invite.usedAt) return res.status(409).json({ error: 'Kod je već iskorišćen' });
    if (invite.expiresAt < new Date()) return res.status(410).json({ error: 'Kod je istekao — zatražite novi od kluba' });

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      if (!user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
        return res.status(401).json({ error: 'Nalog sa ovim emailom postoji — unesite ispravnu lozinku da dodate dijete' });
      }
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      user = await prisma.user.create({
        data: { email, passwordHash, fullName, phone, role: 'parent' },
      });
    }

    await prisma.$transaction([
      prisma.parentLink.upsert({
        where: { userId_playerId: { userId: user.id, playerId: invite.playerId } },
        update: {},
        create: { userId: user.id, playerId: invite.playerId, relation },
      }),
      prisma.inviteCode.update({
        where: { id: invite.id },
        data: { usedByUserId: user.id, usedAt: new Date() },
      }),
    ]);

    res.status(201).json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      child: { id: invite.player.id, firstName: invite.player.firstName, lastName: invite.player.lastName },
      token: signToken(user.id, user.role),
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška pri aktivaciji' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

    const { email, password } = parse.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user?.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ error: 'Account disabled' });

    res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
      token: signToken(user.id, user.role),
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška pri prijavi' });
  }
});

router.post('/fcm-token', async (req: Request, res: Response) => {
  try {
    const { userId, fcmToken } = req.body;
    if (!userId || !fcmToken) return res.status(400).json({ error: 'Missing fields' });
    await prisma.user.update({ where: { id: userId }, data: { fcmToken } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
