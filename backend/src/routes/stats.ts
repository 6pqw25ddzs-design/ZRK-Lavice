import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Statistika ekipe iz zvaničnih rezultata: bilans + lista strijelaca.
// Javno dostupno samo za seniorsku kategoriju (prva_liga) — mlađe kategorije se javno ne rangiraju.
router.get('/', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.query;
    if (!teamId) return res.status(400).json({ error: 'teamId je obavezan' });

    const team = await prisma.team.findUnique({ where: { id: String(teamId) } });
    if (!team) return res.status(404).json({ error: 'Ekipa ne postoji' });
    if (team.category !== 'prva_liga') {
      return res.status(403).json({ error: 'Statistika je javna samo za seniorsku kategoriju' });
    }

    const [results, players] = await Promise.all([
      prisma.matchResult.findMany({
        where: { event: { teamId: String(teamId) } },
        include: { event: { select: { startsAt: true, opponent: true, title: true, location: true } } },
        orderBy: { event: { startsAt: 'desc' } },
      } as any),
      prisma.player.findMany({
        where: { teamId: String(teamId) },
        select: { id: true, firstName: true, lastName: true, jerseyNumber: true, photoUrl: true, isActive: true },
      }),
    ]);

    let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
    const goalsByPlayer: Record<string, { goals: number; matches: number }> = {};
    for (const r of results as any[]) {
      gf += r.homeScore; ga += r.awayScore;
      if (r.homeScore > r.awayScore) wins++;
      else if (r.homeScore === r.awayScore) draws++;
      else losses++;
      const s = r.scorers as Record<string, unknown> | null;
      if (s && typeof s === 'object') {
        for (const [pid, g] of Object.entries(s)) {
          const n = Number(g) || 0;
          if (n <= 0) continue;
          const e = (goalsByPlayer[pid] ||= { goals: 0, matches: 0 });
          e.goals += n; e.matches++;
        }
      }
    }

    const pMap = new Map(players.map(p => [p.id, p]));
    const scorers = Object.entries(goalsByPlayer)
      .map(([pid, s]) => {
        const p = pMap.get(pid);
        return p ? {
          playerId: pid, firstName: p.firstName, lastName: p.lastName,
          jerseyNumber: p.jerseyNumber, photoUrl: p.photoUrl,
          goals: s.goals, matches: s.matches,
          avg: Math.round((s.goals / s.matches) * 10) / 10,
        } : null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.goals - a.goals);

    res.json({
      team: { id: team.id, name: team.name },
      record: { played: results.length, wins, draws, losses, goalsFor: gf, goalsAgainst: ga, diff: gf - ga },
      scorers,
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

export default router;
