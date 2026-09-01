import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

function monthRange(year: number, month: number) {
  // granice mjeseca u lokalnoj zoni (CEST ~ UTC+2); dovoljno precizno za evidenciju
  const from = new Date(Date.UTC(year, month - 1, 1, -2));
  const to = new Date(Date.UTC(year, month, 1, -2));
  return { from, to };
}

// Stavke + presjek za mjesec (uklj. naplaćene članarine kao automatski prihod)
router.get('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const year = Number(req.query.year), month = Number(req.query.month);
    if (!year || !month) return res.status(400).json({ error: 'year i month su obavezni' });
    const { from, to } = monthRange(year, month);

    const [entries, paidFees, allIncome, allExpense, allFees] = await Promise.all([
      prisma.financeEntry.findMany({
        where: { date: { gte: from, lt: to } },
        include: { createdBy: { select: { fullName: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.membershipFee.aggregate({
        where: { status: 'paid', paidAt: { gte: from, lt: to } },
        _sum: { amountEur: true }, _count: true,
      }),
      prisma.financeEntry.aggregate({ where: { kind: 'income' }, _sum: { amountEur: true } }),
      prisma.financeEntry.aggregate({ where: { kind: 'expense' }, _sum: { amountEur: true } }),
      prisma.membershipFee.aggregate({ where: { status: 'paid' }, _sum: { amountEur: true } }),
    ]);

    const income = entries.filter(e => e.kind === 'income').reduce((s, e) => s + e.amountEur, 0);
    const expense = entries.filter(e => e.kind === 'expense').reduce((s, e) => s + e.amountEur, 0);
    const feesIncome = paidFees._sum.amountEur || 0;

    res.json({
      entries: entries.map(e => ({ ...e, createdBy: e.createdBy.fullName })),
      summary: {
        income, expense, feesIncome, feesCount: paidFees._count,
        totalIncome: income + feesIncome,
        balance: income + feesIncome - expense,
        totalBalance: (allIncome._sum.amountEur || 0) + (allFees._sum.amountEur || 0) - (allExpense._sum.amountEur || 0),
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.post('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { kind, category, amountEur, date, description, receiptUrl } = req.body;
    if (!['income', 'expense'].includes(kind) || !category || !amountEur || !date) {
      return res.status(400).json({ error: 'kind, category, amountEur i date su obavezni' });
    }
    if (Number(amountEur) <= 0) return res.status(400).json({ error: 'Iznos mora biti veći od 0' });
    const entry = await prisma.financeEntry.create({
      data: {
        kind, category, amountEur: Number(amountEur), date: new Date(date),
        description: description || null, receiptUrl: receiptUrl || null,
        createdById: req.user!.id,
      },
    });
    res.status(201).json(entry);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.financeEntry.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Godišnji presjek po mjesecima (za mini-grafikon)
router.get('/summary', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const year = Number(req.query.year);
    if (!year) return res.status(400).json({ error: 'year je obavezan' });
    const out = [];
    for (let m = 1; m <= 12; m++) {
      const { from, to } = monthRange(year, m);
      const [entries, fees] = await Promise.all([
        prisma.financeEntry.groupBy({
          by: ['kind'], where: { date: { gte: from, lt: to } }, _sum: { amountEur: true },
        }),
        prisma.membershipFee.aggregate({
          where: { status: 'paid', paidAt: { gte: from, lt: to } }, _sum: { amountEur: true },
        }),
      ]);
      const inc = entries.find(e => e.kind === 'income')?._sum.amountEur || 0;
      const exp = entries.find(e => e.kind === 'expense')?._sum.amountEur || 0;
      out.push({ month: m, income: inc + (fees._sum.amountEur || 0), expense: exp });
    }
    res.json(out);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
