import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// PRIVREMENO: potpuni izvoz podataka za migraciju na novi server (samo admin).
// Ukloniti nakon migracije.
router.get('/', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const tables: { table_name: string }[] = await prisma.$queryRawUnsafe(
      `select table_name from information_schema.tables
       where table_schema='public' and table_name <> '_prisma_migrations'
       order by table_name`
    );
    const out: Record<string, unknown[]> = {};
    for (const t of tables) {
      out[t.table_name] = await prisma.$queryRawUnsafe(`select * from "${t.table_name}"`);
    }
    res.json(out);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
