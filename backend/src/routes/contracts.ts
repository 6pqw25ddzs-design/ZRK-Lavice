import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const contracts = await prisma.contract.findMany({ orderBy: { expiresAt: 'asc' } });
    res.json(contracts);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, party, kind, signedAt, expiresAt, amountEur, fileUrl, note } = req.body;
    if (!title || !kind || !expiresAt) return res.status(400).json({ error: 'title, kind i expiresAt su obavezni' });
    const c = await prisma.contract.create({
      data: {
        title, kind, party: party || null,
        signedAt: signedAt ? new Date(signedAt) : null,
        expiresAt: new Date(expiresAt),
        amountEur: amountEur ? Number(amountEur) : null,
        fileUrl: fileUrl || null, note: note || null,
      },
    });
    res.status(201).json(c);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, party, kind, signedAt, expiresAt, amountEur, fileUrl, note } = req.body;
    const c = await prisma.contract.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(party !== undefined ? { party: party || null } : {}),
        ...(kind !== undefined ? { kind } : {}),
        ...(signedAt !== undefined ? { signedAt: signedAt ? new Date(signedAt) : null } : {}),
        ...(expiresAt !== undefined ? { expiresAt: new Date(expiresAt) } : {}),
        ...(amountEur !== undefined ? { amountEur: amountEur ? Number(amountEur) : null } : {}),
        ...(fileUrl !== undefined ? { fileUrl: fileUrl || null } : {}),
        ...(note !== undefined ? { note: note || null } : {}),
      },
    });
    res.json(c);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.contract.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
