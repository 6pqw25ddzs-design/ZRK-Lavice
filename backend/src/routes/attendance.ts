import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { canManageTeam } from '../util/scope';

const router = Router();
const prisma = new PrismaClient();

// Prisustvo za jedan termin + roster ekipe (i one bez unosa)
router.get('/', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: 'eventId je obavezan' });

    const event = await prisma.scheduleEvent.findUnique({ where: { id: String(eventId) } });
    if (!event) return res.status(404).json({ error: 'Termin ne postoji' });
    if (!(await canManageTeam(req.user!, event.teamId))) return res.status(403).json({ error: 'Nemate pristup ovoj ekipi' });

    const [roster, records] = await Promise.all([
      prisma.player.findMany({
        where: { teamId: event.teamId, isActive: true },
        select: { id: true, firstName: true, lastName: true, jerseyNumber: true },
        orderBy: { lastName: 'asc' },
      }),
      prisma.attendance.findMany({ where: { eventId: String(eventId) } }),
    ]);
    const byPlayer = Object.fromEntries(records.map(r => [r.playerId, r.status]));
    res.json(roster.map(p => ({ ...p, status: byPlayer[p.id] ?? null })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Bulk upis prisustva za termin
router.put('/', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, records } = req.body as { eventId: string; records: { playerId: string; status: 'present' | 'absent' | 'excused' | null }[] };
    if (!eventId || !Array.isArray(records)) return res.status(400).json({ error: 'eventId i records su obavezni' });

    const event = await prisma.scheduleEvent.findUnique({ where: { id: eventId } });
    if (!event) return res.status(404).json({ error: 'Termin ne postoji' });
    if (!(await canManageTeam(req.user!, event.teamId))) return res.status(403).json({ error: 'Nemate pristup ovoj ekipi' });

    await prisma.$transaction(records.map(r =>
      r.status === null
        ? prisma.attendance.deleteMany({ where: { eventId, playerId: r.playerId } })
        : prisma.attendance.upsert({
            where: { eventId_playerId: { eventId, playerId: r.playerId } },
            update: { status: r.status },
            create: { eventId, playerId: r.playerId, status: r.status },
          })
    ));
    res.json({ ok: true, count: records.length });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška pri upisu prisustva' });
  }
});

// Rezime po igračici za ekipu (procenat dolaznosti)
router.get('/summary', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.query;
    if (!teamId) return res.status(400).json({ error: 'teamId je obavezan' });
    if (!(await canManageTeam(req.user!, String(teamId)))) return res.status(403).json({ error: 'Nemate pristup ovoj ekipi' });

    const players = await prisma.player.findMany({
      where: { teamId: String(teamId), isActive: true },
      select: {
        id: true, firstName: true, lastName: true, jerseyNumber: true,
        attendance: { select: { status: true } },
      },
      orderBy: { lastName: 'asc' },
    });
    res.json(players.map(p => {
      const total = p.attendance.length;
      const present = p.attendance.filter(a => a.status === 'present').length;
      return {
        id: p.id, firstName: p.firstName, lastName: p.lastName, jerseyNumber: p.jerseyNumber,
        total, present,
        excused: p.attendance.filter(a => a.status === 'excused').length,
        absent: p.attendance.filter(a => a.status === 'absent').length,
        pct: total ? Math.round((present / total) * 100) : null,
      };
    }));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
