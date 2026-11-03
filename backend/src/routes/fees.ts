import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Presjek članarina za ekipu i mjesec (i igračice bez zaduženja)
router.get('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, year, month } = req.query;
    if (!teamId || !year || !month) return res.status(400).json({ error: 'teamId, year i month su obavezni' });

    const players = await prisma.player.findMany({
      where: { teamId: String(teamId), isActive: true },
      select: {
        id: true, firstName: true, lastName: true,
        fees: { where: { year: Number(year), month: Number(month) } },
      },
      orderBy: { lastName: 'asc' },
    });
    res.json(players.map(p => ({
      playerId: p.id, firstName: p.firstName, lastName: p.lastName,
      fee: p.fees[0] ?? null,
    })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Generisanje zaduženja za sve igračice ekipe za mjesec (preskače postojeća).
// Automatska pravila: grupa "OŠ Njegoš, Spuž" plaća 20 €; sestre (zajednički kontakt
// telefon) — prvo dijete puni iznos, drugo 20 €, treće i svako sljedeće 0 € (oslobođena).
const SPUZ_GROUP = 'OŠ Njegoš, Spuž';
const SPUZ_AMOUNT = 20;
const SECOND_CHILD_AMOUNT = 20;

router.post('/generate', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, year, month, amountEur } = req.body;
    if (!teamId || !year || !month || !amountEur) {
      return res.status(400).json({ error: 'teamId, year, month i amountEur su obavezni' });
    }
    const players = await prisma.player.findMany({
      where: { teamId, isActive: true },
      select: { id: true, position: true },
    });

    // Redni broj djeteta u porodici: svi aktivni igrači kluba grupisani po
    // zajedničkom kontakt telefonu, poredani po datumu rođenja (najstarija = prva).
    const [allPlayers, contacts] = await Promise.all([
      prisma.player.findMany({ where: { isActive: true }, select: { id: true, birthDate: true } }),
      prisma.emergencyContact.findMany({ select: { playerId: true, phone: true } }),
    ]);
    const born = new Map(allPlayers.map(p => [p.id, p.birthDate?.getTime() ?? 0]));
    const byPhone = new Map<string, Set<string>>();
    for (const c of contacts) {
      const tel = c.phone.replace(/\D/g, '');
      if (tel.length < 6) continue;
      (byPhone.get(tel) ?? byPhone.set(tel, new Set()).get(tel)!).add(c.playerId);
    }
    // unija grupa koje dijele igračicu (ista porodica preko više brojeva)
    const familyOf = new Map<string, Set<string>>();
    for (const ids of byPhone.values()) {
      if (ids.size < 2) continue;
      const merged = new Set<string>(ids);
      for (const id of ids) for (const x of familyOf.get(id) ?? []) merged.add(x);
      for (const id of merged) familyOf.set(id, merged);
    }
    const childIndex = (pid: string) => {
      const fam = familyOf.get(pid);
      if (!fam) return 0;
      const sorted = [...fam].sort((a, b) => (born.get(a) ?? 0) - (born.get(b) ?? 0) || a.localeCompare(b));
      return sorted.indexOf(pid);
    };

    const data = players.map(p => {
      const base = p.position === SPUZ_GROUP ? SPUZ_AMOUNT : Number(amountEur);
      const idx = childIndex(p.id);
      const amount = idx >= 2 ? 0 : idx === 1 ? Math.min(base, SECOND_CHILD_AMOUNT) : base;
      return {
        playerId: p.id, year, month,
        amountEur: amount,
        status: (idx >= 2 ? 'waived' : 'unpaid') as any,
        note: idx >= 2 ? 'treće dijete — oslobođena' : idx === 1 ? 'drugo dijete — porodični popust' : null,
      };
    });
    const result = await prisma.membershipFee.createMany({ data, skipDuplicates: true });
    res.status(201).json({ created: result.count, players: players.length });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Promjena statusa uplate
router.patch('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, method, note, amountEur } = req.body;
    if (status && !['unpaid', 'paid', 'waived'].includes(status)) {
      return res.status(400).json({ error: 'status mora biti unpaid/paid/waived' });
    }
    const fee = await prisma.membershipFee.update({
      where: { id: req.params.id },
      data: {
        ...(status ? { status, paidAt: status === 'paid' ? new Date() : null } : {}),
        ...(method !== undefined ? { method } : {}),
        ...(note !== undefined ? { note } : {}),
        ...(amountEur !== undefined ? { amountEur } : {}),
      },
    });
    res.json(fee);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Dugovanja po klubu (za dashboard)
router.get('/outstanding', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const fees = await prisma.membershipFee.findMany({
      where: { status: 'unpaid' },
      include: { player: { select: { firstName: true, lastName: true, team: { select: { name: true } } } } },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    });
    res.json(fees.map(f => ({
      id: f.id, player: `${f.player.firstName} ${f.player.lastName}`, team: f.player.team.name,
      year: f.year, month: f.month, amountEur: f.amountEur,
    })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
