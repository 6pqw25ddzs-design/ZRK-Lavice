import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Profil prijavljenog korisnika
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, fullName: true, role: true, phone: true },
    });
    if (!user) return res.status(404).json({ error: 'Nalog ne postoji' });
    res.json(user);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Djeca prijavljenog roditelja (kroz ParentLink)
router.get('/children', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const links = await prisma.parentLink.findMany({
      where: { userId: req.user!.id },
      include: {
        player: {
          include: { team: { select: { id: true, name: true, category: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(links.map(l => ({
      linkId: l.id,
      relation: l.relation,
      player: {
        id: l.player.id,
        firstName: l.player.firstName,
        lastName: l.player.lastName,
        birthDate: l.player.birthDate,
        jerseyNumber: l.player.jerseyNumber,
        position: l.player.position,
        photoUrl: l.player.photoUrl,
        team: l.player.team,
      },
    })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Registracija Expo push tokena za uređaj
router.post('/push-token', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ error: 'token je obavezan' });
    await prisma.pushToken.upsert({
      where: { token },
      update: { userId: req.user!.id, platform },
      create: { userId: req.user!.id, token, platform },
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
