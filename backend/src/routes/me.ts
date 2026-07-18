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
        author: { select: { fullName: true, role: true } },
        reads: { where: { userId: req.user!.id }, select: { readAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(items.map(a => ({
      id: a.id, teamName: a.team.name, title: a.title, body: a.body,
      // Objave uprave se potpisuju imenom kluba; treneri svojim imenom
      requiresAck: a.requiresAck,
      author: a.author.role === 'admin' ? 'ŽRK Lavice-UDG' : a.author.fullName,
      createdAt: a.createdAt,
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

// Dosije djeteta za roditelja: dokumenti (checklist), saglasnosti, članarine, medicina, hitni kontakti
router.get('/dossier/:playerId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.params;
    const link = await prisma.parentLink.findUnique({
      where: { userId_playerId: { userId: req.user!.id, playerId } },
    });
    if (!link) return res.status(403).json({ error: 'Niste povezani sa ovom igračicom' });

    const [types, documents, consents, fees, medical, contacts] = await Promise.all([
      prisma.documentType.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.playerDocument.findMany({ where: { playerId }, orderBy: { createdAt: 'desc' } }),
      prisma.consent.findMany({ where: { playerId, revokedAt: null } }),
      prisma.membershipFee.findMany({ where: { playerId }, orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 12 }),
      prisma.medicalInfo.findUnique({ where: { playerId } }),
      prisma.emergencyContact.findMany({ where: { playerId } }),
    ]);
    res.json({ types, documents, consents, fees, medical, contacts });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Roditelj potpisuje saglasnost za svoje dijete
router.post('/consents', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, type } = req.body;
    if (!playerId || !['media', 'data', 'travel'].includes(type)) {
      return res.status(400).json({ error: 'playerId i type (media/data/travel) su obavezni' });
    }
    const link = await prisma.parentLink.findUnique({
      where: { userId_playerId: { userId: req.user!.id, playerId } },
    });
    if (!link) return res.status(403).json({ error: 'Niste povezani sa ovom igračicom' });

    const existing = await prisma.consent.findFirst({ where: { playerId, type, revokedAt: null } });
    if (existing) return res.status(409).json({ error: 'Saglasnost je već potpisana' });

    const consent = await prisma.consent.create({
      data: { playerId, type, signedById: req.user!.id },
    });
    res.status(201).json(consent);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Roditelj povlači saglasnost
router.post('/consents/:id/revoke', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const consent = await prisma.consent.findUnique({ where: { id: req.params.id } });
    if (!consent) return res.status(404).json({ error: 'Saglasnost ne postoji' });
    const link = await prisma.parentLink.findUnique({
      where: { userId_playerId: { userId: req.user!.id, playerId: consent.playerId } },
    });
    if (!link) return res.status(403).json({ error: 'Niste povezani sa ovom igračicom' });

    const updated = await prisma.consent.update({ where: { id: consent.id }, data: { revokedAt: new Date() } });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Roditelj održava medicinske napomene i hitne kontakte svog djeteta
router.put('/medical/:playerId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.params;
    const link = await prisma.parentLink.findUnique({
      where: { userId_playerId: { userId: req.user!.id, playerId } },
    });
    if (!link) return res.status(403).json({ error: 'Niste povezani sa ovom igračicom' });

    const { notes, coachNote } = req.body;
    const medical = await prisma.medicalInfo.upsert({
      where: { playerId },
      update: { notes: notes ?? null, coachNote: coachNote ?? null },
      create: { playerId, notes: notes ?? null, coachNote: coachNote ?? null },
    });
    res.json(medical);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.post('/emergency-contacts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, name, phone, relation } = req.body;
    if (!playerId || !name || !phone) return res.status(400).json({ error: 'playerId, name i phone su obavezni' });
    const link = await prisma.parentLink.findUnique({
      where: { userId_playerId: { userId: req.user!.id, playerId } },
    });
    if (!link) return res.status(403).json({ error: 'Niste povezani sa ovom igračicom' });

    const contact = await prisma.emergencyContact.create({ data: { playerId, name, phone, relation: relation || null } });
    res.status(201).json(contact);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.delete('/emergency-contacts/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const contact = await prisma.emergencyContact.findUnique({ where: { id: req.params.id } });
    if (!contact) return res.status(404).json({ error: 'Kontakt ne postoji' });
    const link = await prisma.parentLink.findUnique({
      where: { userId_playerId: { userId: req.user!.id, playerId: contact.playerId } },
    });
    if (!link) return res.status(403).json({ error: 'Niste povezani sa ovom igračicom' });

    await prisma.emergencyContact.delete({ where: { id: contact.id } });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Razvoj djeteta za roditelja: evaluacije (rezime), ciljevi, prekretnice, status povrede
router.get('/development/:playerId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.params;
    const link = await prisma.parentLink.findUnique({
      where: { userId_playerId: { userId: req.user!.id, playerId } },
    });
    if (!link) return res.status(403).json({ error: 'Niste povezani sa ovom igračicom' });

    const [evaluations, goals, milestones, openInjury] = await Promise.all([
      prisma.evaluation.findMany({
        where: { playerId },
        include: {
          coach: { select: { fullName: true } },
          scores: { include: { criterion: { select: { name: true, domain: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      prisma.developmentGoal.findMany({ where: { playerId }, orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.milestone.findMany({ where: { playerId }, orderBy: { achievedAt: 'desc' }, take: 20 }),
      prisma.injuryRecord.findFirst({ where: { playerId, returnedAt: null, status: { not: 'ready' } } }),
    ]);
    // Rezime po domenu (prosjek), pun detalj ostaje dostupan
    res.json({
      evaluations: evaluations.map(ev => {
        const byDomain: Record<string, number[]> = {};
        ev.scores.forEach(s => { (byDomain[s.criterion.domain] ||= []).push(s.score); });
        return {
          id: ev.id, period: ev.period, comment: ev.comment, coach: ev.coach.fullName, createdAt: ev.createdAt,
          domains: Object.fromEntries(Object.entries(byDomain).map(([d, arr]) =>
            [d, Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10])),
          scores: ev.scores.map(s => ({ name: s.criterion.name, domain: s.criterion.domain, score: s.score })),
        };
      }),
      goals,
      milestones,
      injuryStatus: openInjury ? openInjury.status : 'ready',
    });
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
