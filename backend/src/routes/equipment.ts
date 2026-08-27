import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.query;
    const items = await prisma.equipmentItem.findMany({
      where: playerId ? { playerId: String(playerId) } : {},
      include: { player: { select: { firstName: true, lastName: true, jerseyNumber: true } } },
      orderBy: [{ returnedAt: 'asc' }, { issuedAt: 'desc' }],
    });
    res.json(items);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, itemType, label, size, issuedAt, note } = req.body;
    if (!itemType) return res.status(400).json({ error: 'itemType je obavezan' });
    const item = await prisma.equipmentItem.create({
      data: {
        playerId: playerId || null, itemType,
        label: label || null, size: size || null, note: note || null,
        issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
      },
    });
    res.status(201).json(item);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Razduženje (ili poništavanje razduženja)
router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { returned } = req.body;
    const item = await prisma.equipmentItem.update({
      where: { id: req.params.id },
      data: { returnedAt: returned ? new Date() : null },
    });
    res.json(item);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.equipmentItem.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
