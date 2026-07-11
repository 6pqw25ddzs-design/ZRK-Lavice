import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { canManageTeam } from '../util/scope';

const router = Router();
const prisma = new PrismaClient();

// Presjek dostupnosti za termin: potvrđene / odbile / bez odgovora
router.get('/', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: 'eventId je obavezan' });

    const event = await prisma.scheduleEvent.findUnique({ where: { id: String(eventId) } });
    if (!event) return res.status(404).json({ error: 'Termin ne postoji' });
    if (!(await canManageTeam(req.user!, event.teamId))) return res.status(403).json({ error: 'Nemate pristup ovoj ekipi' });

    const [roster, responses] = await Promise.all([
      prisma.player.findMany({
        where: { teamId: event.teamId, isActive: true },
        select: { id: true, firstName: true, lastName: true, jerseyNumber: true },
        orderBy: { lastName: 'asc' },
      }),
      prisma.availability.findMany({
        where: { eventId: String(eventId) },
        include: { respondedBy: { select: { fullName: true } } },
      }),
    ]);
    const byPlayer = new Map(responses.map(r => [r.playerId, r]));
    res.json(roster.map(p => {
      const r = byPlayer.get(p.id);
      return {
        ...p,
        status: r?.status ?? null,
        reason: r?.reason ?? null,
        respondedBy: r?.respondedBy.fullName ?? null,
        respondedAt: r?.updatedAt ?? null,
      };
    }));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
