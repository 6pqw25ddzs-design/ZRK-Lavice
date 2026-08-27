import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { sendNotifyEmail } from '../services/email';

const router = Router();
const prisma = new PrismaClient();

const memberSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().max(1000).optional(),
});

// Javno: pristupnica
router.post('/', async (req: Request, res: Response) => {
  try {
    const parse = memberSchema.safeParse(req.body);
    if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
    const { fullName, email, phone, message } = parse.data;
    const m = await prisma.clubMember.create({
      data: { fullName, email, phone: phone ?? null, message: message ?? null },
    });
    void sendNotifyEmail(
      `Nova pristupnica za članstvo: ${m.fullName}`,
      `<div style="font-family:sans-serif"><h2 style="color:#C8102E">Nova pristupnica 🦁</h2>
       <p><b>${m.fullName}</b><br/>${m.email}${m.phone ? '<br/>' + m.phone : ''}</p>
       ${m.message ? `<p>${m.message}</p>` : ''}
       <p><a href="https://zrklavice.me/admin/clanovi" style="color:#C8102E">Otvori u admin panelu →</a></p></div>`
    );
    res.status(201).json({ id: m.id, message: 'Hvala! Pristupnica je primljena — javićemo vam se uskoro.' });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Admin: lista + status
router.get('/', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const members = await prisma.clubMember.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(members);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ error: 'Nevažeći status' });
    const m = await prisma.clubMember.update({ where: { id: req.params.id }, data: { status } });
    res.json(m);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.clubMember.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
