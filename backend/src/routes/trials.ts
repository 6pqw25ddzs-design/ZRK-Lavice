import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Javno: otvoreni termini probnih treninga sa slobodnim mjestima
router.get('/', async (_req: Request, res: Response) => {
  try {
    const slots = await prisma.trialSlot.findMany({
      where: { isActive: true, startsAt: { gte: new Date() } },
      include: { _count: { select: { registrations: true } } },
      orderBy: { startsAt: 'asc' },
    });
    res.json(slots.map(s => ({
      id: s.id, startsAt: s.startsAt, category: s.category, location: s.location, notes: s.notes,
      capacity: s.capacity, taken: s._count.registrations,
      full: s._count.registrations >= s.capacity,
    })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Admin: svi termini (i prošli) sa prijavama
router.get('/all', requireAuth, requireRole('admin', 'coach'), async (_req: AuthRequest, res: Response) => {
  try {
    const slots = await prisma.trialSlot.findMany({
      include: {
        registrations: {
          select: { id: true, childName: true, birthYear: true, parentName: true, parentPhone: true, status: true },
        },
      },
      orderBy: { startsAt: 'desc' },
      take: 50,
    });
    res.json(slots);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { startsAt, category, capacity, location, notes } = req.body;
    if (!startsAt) return res.status(400).json({ error: 'startsAt je obavezan' });
    const slot = await prisma.trialSlot.create({
      data: {
        startsAt: new Date(startsAt),
        category: category || null,
        capacity: capacity ?? 10,
        location: location || null,
        notes: notes || null,
      },
    });
    res.status(201).json(slot);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { startsAt, category, capacity, location, notes, isActive } = req.body;
    const slot = await prisma.trialSlot.update({
      where: { id: req.params.id },
      data: {
        ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(capacity !== undefined ? { capacity } : {}),
        ...(location !== undefined ? { location } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });
    res.json(slot);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
