import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES = '30d';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['parent', 'coach', 'admin']).default('parent'),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signToken(id: string, role: string) {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

router.post('/register', async (req: Request, res: Response) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const { email, password, fullName, phone, role } = parse.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, fullName, phone, role },
    select: { id: true, email: true, fullName: true, role: true },
  });

  res.status(201).json({ user, token: signToken(user.id, user.role) });
});

router.post('/login', async (req: Request, res: Response) => {
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
});

router.post('/fcm-token', async (req: Request, res: Response) => {
  const { userId, fcmToken } = req.body;
  if (!userId || !fcmToken) return res.status(400).json({ error: 'Missing fields' });
  await prisma.user.update({ where: { id: userId }, data: { fcmToken } });
  res.json({ ok: true });
});

export default router;
