import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const registrationSchema = z.object({
  childName: z.string().min(2),
  birthYear: z.number().int().min(2010).max(2020),
  parentName: z.string().min(2),
  parentPhone: z.string().min(6),
  parentEmail: z.string().email(),
});

// Public: submit registration
router.post('/', async (req, res) => {
  const parse = registrationSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const reg = await prisma.registration.create({ data: parse.data as any });
  res.status(201).json({ id: reg.id, message: 'Registracija primljena. Kontaktiraćemo vas uskoro.' });
});

// Admin: list all registrations
router.get('/', requireAuth, requireRole('admin', 'coach'), async (_req, res) => {
  const regs = await prisma.registration.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(regs);
});

// Admin: update status
router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  const { status, notes } = req.body;
  const reg = await prisma.registration.update({
    where: { id: req.params.id },
    data: { status, notes },
  });
  res.json(reg);
});

export default router;
