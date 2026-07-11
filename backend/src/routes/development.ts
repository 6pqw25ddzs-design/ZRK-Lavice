import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { canManageTeam } from '../util/scope';

const router = Router();
const prisma = new PrismaClient();

async function canManagePlayer(user: { id: string; role: string }, playerId: string) {
  const player = await prisma.player.findUnique({ where: { id: playerId }, select: { teamId: true } });
  if (!player) return null;
  return (await canManageTeam(user, player.teamId)) ? player : false;
}

// ---- Kriterijumi ----
router.get('/criteria', requireAuth, requireRole('admin', 'coach'), async (_req: AuthRequest, res: Response) => {
  try {
    const criteria = await prisma.criterion.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    res.json(criteria);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// ---- Evaluacije ----
router.post('/evaluations', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, period, comment, scores } = req.body as {
      playerId: string; period: string; comment?: string; scores: { criterionId: string; score: number }[];
    };
    if (!playerId || !period || !Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({ error: 'playerId, period i scores su obavezni' });
    }
    if (scores.some(s => s.score < 1 || s.score > 5)) return res.status(400).json({ error: 'Ocjene su 1–5' });
    const allowed = await canManagePlayer(req.user!, playerId);
    if (allowed === null) return res.status(404).json({ error: 'Igračica ne postoji' });
    if (!allowed) return res.status(403).json({ error: 'Nemate pristup ovoj igračici' });

    const evaluation = await prisma.evaluation.create({
      data: {
        playerId, period, comment: comment || null, coachUserId: req.user!.id,
        scores: { create: scores.map(s => ({ criterionId: s.criterionId, score: s.score })) },
      },
      include: { scores: true },
    });
    res.status(201).json(evaluation);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška pri čuvanju evaluacije' });
  }
});

router.get('/evaluations', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.query;
    if (!playerId) return res.status(400).json({ error: 'playerId je obavezan' });
    const allowed = await canManagePlayer(req.user!, String(playerId));
    if (allowed === null) return res.status(404).json({ error: 'Igračica ne postoji' });
    if (!allowed) return res.status(403).json({ error: 'Nemate pristup ovoj igračici' });

    const evaluations = await prisma.evaluation.findMany({
      where: { playerId: String(playerId) },
      include: {
        coach: { select: { fullName: true } },
        scores: { include: { criterion: { select: { name: true, domain: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(evaluations);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// ---- Ciljevi ----
router.post('/goals', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, title, description, dueDate } = req.body;
    if (!playerId || !title) return res.status(400).json({ error: 'playerId i title su obavezni' });
    const allowed = await canManagePlayer(req.user!, playerId);
    if (allowed === null) return res.status(404).json({ error: 'Igračica ne postoji' });
    if (!allowed) return res.status(403).json({ error: 'Nemate pristup ovoj igračici' });

    const active = await prisma.developmentGoal.count({ where: { playerId, status: 'active' } });
    if (active >= 3) return res.status(409).json({ error: 'Igračica već ima 3 aktivna cilja — završite ili pauzirajte neki' });

    const goal = await prisma.developmentGoal.create({
      data: {
        playerId, title, description: description || null, coachUserId: req.user!.id,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    res.status(201).json(goal);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.get('/goals', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.query;
    if (!playerId) return res.status(400).json({ error: 'playerId je obavezan' });
    const goals = await prisma.developmentGoal.findMany({
      where: { playerId: String(playerId) },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.patch('/goals/:id', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['active', 'done', 'paused'].includes(status)) return res.status(400).json({ error: 'status mora biti active/done/paused' });
    const goal = await prisma.developmentGoal.findUnique({ where: { id: req.params.id } });
    if (!goal) return res.status(404).json({ error: 'Cilj ne postoji' });
    const allowed = await canManagePlayer(req.user!, goal.playerId);
    if (!allowed) return res.status(403).json({ error: 'Nemate pristup' });

    const updated = await prisma.developmentGoal.update({
      where: { id: goal.id },
      data: { status, doneAt: status === 'done' ? new Date() : null },
    });
    // Završen cilj = prekretnica
    if (status === 'done') {
      await prisma.milestone.create({
        data: { playerId: goal.playerId, title: `Ostvaren cilj: ${goal.title}`, kind: 'goal', badge: '🎯' },
      });
    }
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// ---- Prekretnice ----
router.post('/milestones', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, title, badge } = req.body;
    if (!playerId || !title) return res.status(400).json({ error: 'playerId i title su obavezni' });
    const allowed = await canManagePlayer(req.user!, playerId);
    if (allowed === null) return res.status(404).json({ error: 'Igračica ne postoji' });
    if (!allowed) return res.status(403).json({ error: 'Nemate pristup' });

    const milestone = await prisma.milestone.create({ data: { playerId, title, badge: badge || '⭐' } });
    res.status(201).json(milestone);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// ---- Povrede ----
router.post('/injuries', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, status, note } = req.body;
    if (!playerId || !['ready', 'caution', 'out'].includes(status)) {
      return res.status(400).json({ error: 'playerId i status (ready/caution/out) su obavezni' });
    }
    const allowed = await canManagePlayer(req.user!, playerId);
    if (allowed === null) return res.status(404).json({ error: 'Igračica ne postoji' });
    if (!allowed) return res.status(403).json({ error: 'Nemate pristup' });

    // Zatvori otvorenu epizodu ako se vraća na "spremna"
    const open = await prisma.injuryRecord.findFirst({
      where: { playerId, returnedAt: null, status: { not: 'ready' } },
      orderBy: { startedAt: 'desc' },
    });
    if (status === 'ready') {
      if (open) {
        const closed = await prisma.injuryRecord.update({ where: { id: open.id }, data: { returnedAt: new Date() } });
        return res.json(closed);
      }
      return res.json({ ok: true, message: 'Igračica je već spremna' });
    }
    if (open) {
      const updated = await prisma.injuryRecord.update({ where: { id: open.id }, data: { status, note: note ?? open.note } });
      return res.json(updated);
    }
    const record = await prisma.injuryRecord.create({ data: { playerId, status, note: note || null } });
    res.status(201).json(record);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// ---- Promocija u drugu ekipu (formalan događaj sa istorijom) ----
router.post('/promote', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId, toTeamId, reason } = req.body;
    if (!playerId || !toTeamId) return res.status(400).json({ error: 'playerId i toTeamId su obavezni' });

    const [player, toTeam, season] = await Promise.all([
      prisma.player.findUnique({ where: { id: playerId }, include: { team: true } }),
      prisma.team.findUnique({ where: { id: toTeamId } }),
      prisma.season.findFirst({ where: { isActive: true } }),
    ]);
    if (!player || !toTeam) return res.status(404).json({ error: 'Igračica ili ekipa ne postoji' });
    if (!season) return res.status(409).json({ error: 'Nema aktivne sezone' });
    if (player.teamId === toTeamId) return res.status(400).json({ error: 'Igračica je već u toj ekipi' });

    await prisma.$transaction([
      prisma.teamAssignment.updateMany({
        where: { playerId, teamId: player.teamId, endedAt: null },
        data: { endedAt: new Date(), endReason: reason || 'promocija' },
      }),
      prisma.teamAssignment.create({ data: { playerId, teamId: toTeamId, seasonId: season.id } }),
      prisma.player.update({ where: { id: playerId }, data: { teamId: toTeamId } }),
      prisma.milestone.create({
        data: { playerId, title: `Prelazak: ${player.team.name} → ${toTeam.name}`, kind: 'promotion', badge: '🦁' },
      }),
    ]);
    res.json({ ok: true, from: player.team.name, to: toTeam.name });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška pri promociji' });
  }
});

// ---- Vremenska osa (admin/trener) ----
router.get('/timeline/:playerId', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { playerId } = req.params;
    const allowed = await canManagePlayer(req.user!, playerId);
    if (allowed === null) return res.status(404).json({ error: 'Igračica ne postoji' });
    if (!allowed) return res.status(403).json({ error: 'Nemate pristup' });

    const [player, assignments, evaluations, milestones, injuries] = await Promise.all([
      prisma.player.findUnique({ where: { id: playerId }, select: { joinedDate: true } }),
      prisma.teamAssignment.findMany({ where: { playerId }, include: { team: { select: { name: true } } } }),
      prisma.evaluation.findMany({ where: { playerId }, select: { id: true, period: true, createdAt: true } }),
      prisma.milestone.findMany({ where: { playerId } }),
      prisma.injuryRecord.findMany({ where: { playerId } }),
    ]);
    const events = [
      { kind: 'joined', title: 'Upis u klub', at: player!.joinedDate },
      ...assignments.map(a => ({ kind: 'team', title: `Ekipa: ${a.team.name}`, at: a.startedAt })),
      ...evaluations.map(e => ({ kind: 'evaluation', title: `Evaluacija (${e.period})`, at: e.createdAt })),
      ...milestones.map(m => ({ kind: 'milestone', title: `${m.badge || '⭐'} ${m.title}`, at: m.achievedAt })),
      ...injuries.flatMap(i => [
        { kind: 'injury', title: `Povreda (${i.status === 'out' ? 'van terena' : 'oprez'})${i.note ? `: ${i.note}` : ''}`, at: i.startedAt },
        ...(i.returnedAt ? [{ kind: 'return', title: 'Povratak na teren', at: i.returnedAt }] : []),
      ]),
    ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    res.json(events);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
