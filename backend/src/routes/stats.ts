import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// Statistika ekipe iz zvaničnih rezultata: bilans + lista strijelaca.
// Javno dostupno za ekipe koje igraju zvanična takmičenja (prva_liga + pioniri).
router.get('/', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.query;
    if (!teamId) return res.status(400).json({ error: 'teamId je obavezan' });

    const team = await prisma.team.findUnique({ where: { id: String(teamId) } });
    if (!team) return res.status(404).json({ error: 'Ekipa ne postoji' });
    if (!['prva_liga', 'pioniri'].includes(team.category)) {
      return res.status(403).json({ error: 'Statistika je javna samo za takmičarske kategorije' });
    }

    const [results, players, matchAttendance] = await Promise.all([
      // WRHL (Regionalna liga) mečevi se vode pod istom ekipom (notes prefiks "WRHL"):
      // bilans ih izostavlja (samo domaće prvenstvo), a lista strijelaca broji SVA takmičenja.
      prisma.matchResult.findMany({
        where: { event: { teamId: String(teamId) } },
        include: { event: { select: { startsAt: true, opponent: true, title: true, location: true, notes: true } } },
        orderBy: { event: { startsAt: 'desc' } },
      } as any),
      prisma.player.findMany({
        where: { teamId: String(teamId) },
        select: { id: true, firstName: true, lastName: true, jerseyNumber: true, photoUrl: true, isActive: true },
      }),
      prisma.attendance.findMany({
        where: { status: 'present', event: { teamId: String(teamId), type: 'match' } },
        select: { playerId: true, eventId: true, event: { select: { notes: true } } },
      }),
    ]);

    let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
    // Statistika strijelaca se vodi ODVOJENO po takmičenju (liga vs WRHL),
    // da prosjek po meču odgovara zvaničnim tabelama svakog takmičenja.
    // nastupi = prisustvo na utakmici ILI postignut gol (zapisnik)
    const isRRLNote = (n?: string | null) => (n || '').startsWith('WRHL');
    const playedBy: Record<string, Set<string>> = {};
    const playedByRRL: Record<string, Set<string>> = {};
    for (const a of matchAttendance as any[]) {
      const bucket = isRRLNote(a.event?.notes) ? playedByRRL : playedBy;
      (bucket[a.playerId] ||= new Set()).add(a.eventId);
    }
    const goalsByPlayer: Record<string, { goals: number }> = {};
    const goalsByPlayerRRL: Record<string, { goals: number }> = {};
    let leaguePlayed = 0;
    for (const r of results as any[]) {
      const isFriendly = ((r.event?.notes || '') + (r.event?.title || '')).includes('rijateljsk');
      if (isFriendly) continue; // prijateljske ne ulaze ni u bilans ni u liste strijelaca
      const isRRL = isRRLNote(r.event?.notes);
      if (!isRRL) {
        leaguePlayed++;
        gf += r.homeScore; ga += r.awayScore;
        if (r.homeScore > r.awayScore) wins++;
        else if (r.homeScore === r.awayScore) draws++;
        else losses++;
      }
      const s = r.scorers as Record<string, unknown> | null;
      if (s && typeof s === 'object') {
        for (const [pid, g] of Object.entries(s)) {
          const n = Number(g) || 0;
          if (n <= 0) continue;
          const goalsBucket = isRRL ? goalsByPlayerRRL : goalsByPlayer;
          const playedBucket = isRRL ? playedByRRL : playedBy;
          (goalsBucket[pid] ||= { goals: 0 }).goals += n;
          (playedBucket[pid] ||= new Set()).add(r.eventId);
        }
      }
    }

    const pMap = new Map(players.map(p => [p.id, p]));
    const toScorers = (goals: Record<string, { goals: number }>, played: Record<string, Set<string>>) =>
      Object.entries(goals)
        .map(([pid, s]) => {
          const p = pMap.get(pid);
          const matches = played[pid]?.size || 1;
          return p ? {
            playerId: pid, firstName: p.firstName, lastName: p.lastName,
            jerseyNumber: p.jerseyNumber, photoUrl: p.photoUrl,
            goals: s.goals, matches,
            avg: Math.round((s.goals / matches) * 10) / 10,
          } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.goals - a.goals);
    const scorers = toScorers(goalsByPlayer, playedBy);
    const scorersRRL = toScorers(goalsByPlayerRRL, playedByRRL);

    res.json({
      team: { id: team.id, name: team.name },
      record: { played: leaguePlayed, wins, draws, losses, goalsFor: gf, goalsAgainst: ga, diff: gf - ga },
      scorers,
      scorersRRL,
      results: (results as any[]).map(r => ({
        date: r.event.startsAt, opponent: r.event.opponent || r.event.title,
        location: r.event.location,
        score: `${r.homeScore}:${r.awayScore}`,
        outcome: r.homeScore > r.awayScore ? 'W' : r.homeScore === r.awayScore ? 'D' : 'L',
      })),
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Detalj jedne utakmice: rezultat + strijelci sa imenima i fotografijama.
// Strijelci su javni samo za seniorsku kategoriju (mlađe kategorije se javno ne rangiraju).
router.get('/match/:id', async (req: Request, res: Response) => {
  try {
    const result: any = await prisma.matchResult.findUnique({
      where: { id: String(req.params.id) },
      include: { event: { include: { team: { select: { id: true, name: true, category: true } } } } },
    } as any);
    if (!result) return res.status(404).json({ error: 'Utakmica ne postoji' });

    const isSenior = result.event?.team?.category === 'prva_liga';
    let scorers: any[] = [];
    let roster: any[] = [];
    let keepers: any[] = [];

    if (isSenior) {
      const s = (result.scorers || {}) as Record<string, unknown>;
      const ids = Object.keys(s);
      const attendance = await prisma.attendance.findMany({
        where: { eventId: result.eventId, status: 'present' },
        select: { playerId: true },
      });
      const allIds = Array.from(new Set([...ids, ...attendance.map(a => a.playerId)]));
      const players = allIds.length
        ? await prisma.player.findMany({
            where: { id: { in: allIds } },
            select: { id: true, firstName: true, lastName: true, jerseyNumber: true, photoUrl: true },
          })
        : [];
      const pMap = new Map(players.map(p => [p.id, p]));
      scorers = ids
        .map(pid => {
          const p = pMap.get(pid);
          const goals = Number(s[pid]) || 0;
          return p && goals > 0 ? { playerId: pid, firstName: p.firstName, lastName: p.lastName, jerseyNumber: p.jerseyNumber, photoUrl: p.photoUrl, goals } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.goals - a.goals);
      const kp = (result.keepers || {}) as Record<string, any>;
      const kpIds = Object.keys(kp);
      if (kpIds.length) {
        const kPlayers = await prisma.player.findMany({
          where: { id: { in: kpIds } },
          select: { id: true, firstName: true, lastName: true, jerseyNumber: true, photoUrl: true },
        });
        const kMap = new Map(kPlayers.map(p => [p.id, p]));
        keepers = kpIds.map(pid => {
          const p = kMap.get(pid); const k = kp[pid] || {};
          const saves = Number(k.saves) || 0, conceded = Number(k.conceded) || 0;
          return p ? { playerId: pid, firstName: p.firstName, lastName: p.lastName, jerseyNumber: p.jerseyNumber, photoUrl: p.photoUrl,
            saves, conceded, savePct: saves + conceded > 0 ? Math.round((saves / (saves + conceded)) * 100) : 0 } : null;
        }).filter(Boolean);
      }
      const scorerIds = new Set(ids.filter(pid => (Number(s[pid]) || 0) > 0));
      const keeperIds = new Set(kpIds);
      roster = attendance
        .map(a => pMap.get(a.playerId))
        .filter((p): p is NonNullable<typeof p> => !!p && !scorerIds.has(p.id) && !keeperIds.has(p.id))
        .map(p => ({ playerId: p.id, firstName: p.firstName, lastName: p.lastName, jerseyNumber: p.jerseyNumber, photoUrl: p.photoUrl }))
        .sort((a, b) => (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99));
    }

    res.json({
      id: result.id,
      homeScore: result.homeScore,
      awayScore: result.awayScore,
      notes: result.notes,
      event: {
        title: result.event?.title,
        opponent: result.event?.opponent,
        location: result.event?.location,
        startsAt: result.event?.startsAt,
        team: result.event?.team ? { id: result.event.team.id, name: result.event.team.name } : null,
      },
      scorersPublic: isSenior,
      scorers,
      keepers,
      roster,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
