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

// Roditelj odgovara na poziv u ime svog djeteta
router.post('/availability', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, playerId, status, reason } = req.body;
    if (!eventId || !playerId || !['yes', 'no', 'maybe'].includes(status)) {
      return res.status(400).json({ error: 'eventId, playerId i status (yes/no/maybe) su obavezni' });
    }
    const link = await prisma.parentLink.findUnique({
      where: { userId_playerId: { userId: req.user!.id, playerId } },
    });
    if (!link) return res.status(403).json({ error: 'Niste povezani sa ovom igračicom' });

    const [event, player] = await Promise.all([
      prisma.scheduleEvent.findUnique({ where: { id: eventId } }),
      prisma.player.findUnique({ where: { id: playerId } }),
    ]);
    if (!event || !player) return res.status(404).json({ error: 'Termin ili igračica ne postoji' });
    if (event.teamId !== player.teamId) return res.status(400).json({ error: 'Termin ne pripada ekipi igračice' });

    const availability = await prisma.availability.upsert({
      where: { eventId_playerId: { eventId, playerId } },
      update: { status, reason: reason || null, respondedById: req.user!.id },
      create: { eventId, playerId, status, reason: reason || null, respondedById: req.user!.id },
    });
    res.json(availability);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Objave za ekipe moje djece, sa oznakom pročitanog
router.get('/announcements', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const links = await prisma.parentLink.findMany({
      where: { userId: req.user!.id },
      include: { player: { select: { teamId: true } } },
    });
    const teamIds = [...new Set(links.map(l => l.player.teamId))];
    if (teamIds.length === 0) return res.json([]);

    const items = await prisma.announcement.findMany({
      where: { teamId: { in: teamIds } },
      include: {
        team: { select: { name: true } },
        author: { select: { fullName: true } },
        reads: { where: { userId: req.user!.id }, select: { readAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(items.map(a => ({
      id: a.id, teamName: a.team.name, title: a.title, body: a.body,
      requiresAck: a.requiresAck, author: a.author.fullName, createdAt: a.createdAt,
      readAt: a.reads[0]?.readAt ?? null,
    })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Potvrda čitanja objave
router.post('/announcements/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!announcement) return res.status(404).json({ error: 'Objava ne postoji' });
    await prisma.announcementRead.upsert({
      where: { announcementId_userId: { announcementId: req.params.id, userId: req.user!.id } },
      update: {},
      create: { announcementId: req.params.id, userId: req.user!.id },
    });
    res.json({ ok: true });
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
