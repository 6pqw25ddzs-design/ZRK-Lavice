import { Router, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Kod bez dvosmislenih znakova (bez 0/O, 1/I/L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function generateCode() {
  const bytes = crypto.randomBytes(6);
  let out = '';
  for (let i = 0; i < 6; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `LAV-${out}`;
}

// Admin: generiši pozivni kod za igračicu (važi 60 dana)
router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.body;
    if (!playerId) return res.status(400).json({ error: 'playerId je obavezan' });

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) return res.status(404).json({ error: 'Igračica ne postoji' });

    const invite = await prisma.inviteCode.create({
      data: {
        code: generateCode(),
        playerId,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });
    res.status(201).json(invite);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška pri generisanju koda' });
  }
});

// Admin: lista kodova (opciono po igračici)
router.get('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.query;
    const codes = await prisma.inviteCode.findMany({
      where: playerId ? { playerId: String(playerId) } : {},
      include: {
        player: { select: { firstName: true, lastName: true } },
        usedBy: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(codes);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
