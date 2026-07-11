import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ---- Šifarnik tipova dokumenata ----

router.get('/document-types', requireAuth, requireRole('admin', 'coach'), async (_req: Request, res: Response) => {
  try {
    const types = await prisma.documentType.findMany({ orderBy: { sortOrder: 'asc' } });
    res.json(types);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.post('/document-types', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, isRequired, validMonths, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: 'name je obavezan' });
    const type = await prisma.documentType.create({
      data: { name, isRequired: isRequired ?? true, validMonths: validMonths ?? null, sortOrder: sortOrder ?? 0 },
    });
    res.status(201).json(type);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// ---- Dosije igračice: dokumenti + saglasnosti + medicina + hitni kontakti ----

router.get('/players/:playerId', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.params;
    const [player, types, documents, consents, medical, contacts, fees] = await Promise.all([
      prisma.player.findUnique({ where: { id: playerId }, select: { id: true, firstName: true, lastName: true } }),
      prisma.documentType.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.playerDocument.findMany({ where: { playerId }, orderBy: { createdAt: 'desc' } }),
      prisma.consent.findMany({ where: { playerId }, include: { signedBy: { select: { fullName: true } } }, orderBy: { signedAt: 'desc' } }),
      prisma.medicalInfo.findUnique({ where: { playerId } }),
      prisma.emergencyContact.findMany({ where: { playerId } }),
      prisma.membershipFee.findMany({ where: { playerId }, orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 12 }),
    ]);
    if (!player) return res.status(404).json({ error: 'Igračica ne postoji' });
    res.json({ player, types, documents, consents, medical, contacts, fees });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Upis dokumenta (rok se računa iz validMonths tipa ako nije zadat)
router.post('/documents', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, typeId, issuedAt, expiresAt, fileUrl, note } = req.body;
    if (!playerId || !typeId || !issuedAt) return res.status(400).json({ error: 'playerId, typeId i issuedAt su obavezni' });

    const type = await prisma.documentType.findUnique({ where: { id: typeId } });
    if (!type) return res.status(404).json({ error: 'Tip dokumenta ne postoji' });

    let expires: Date | null = expiresAt ? new Date(expiresAt) : null;
    if (!expires && type.validMonths) {
      expires = new Date(issuedAt);
      expires.setMonth(expires.getMonth() + type.validMonths);
    }
    const doc = await prisma.playerDocument.create({
      data: { playerId, typeId, issuedAt: new Date(issuedAt), expiresAt: expires, fileUrl: fileUrl || null, note: note || null },
    });
    res.status(201).json(doc);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.delete('/documents/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.playerDocument.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Evidencija saglasnosti (admin unosi i papirne; roditelj potpisuje kroz /api/me)
router.post('/consents', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, type } = req.body;
    if (!playerId || !['media', 'data', 'travel'].includes(type)) {
      return res.status(400).json({ error: 'playerId i type (media/data/travel) su obavezni' });
    }
    const consent = await prisma.consent.create({
      data: { playerId, type, signedById: req.user!.id },
    });
    res.status(201).json(consent);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.patch('/consents/:id/revoke', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const consent = await prisma.consent.update({
      where: { id: req.params.id },
      data: { revokedAt: new Date() },
    });
    res.json(consent);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Pregled isteka dokumenata za cio klub (dashboard uprave)
router.get('/expiring', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    const docs = await prisma.playerDocument.findMany({
      where: { expiresAt: { not: null, lte: soon } },
      include: {
        player: { select: { firstName: true, lastName: true, team: { select: { name: true } } } },
        type: { select: { name: true } },
      },
      orderBy: { expiresAt: 'asc' },
    });
    res.json(docs.map(d => ({
      id: d.id, player: `${d.player.firstName} ${d.player.lastName}`, team: d.player.team.name,
      type: d.type.name, expiresAt: d.expiresAt,
      expired: d.expiresAt! < new Date(),
    })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
