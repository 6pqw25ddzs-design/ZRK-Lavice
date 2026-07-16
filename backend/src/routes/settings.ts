import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: get all settings as { key: value } — tajne (secret_*) se NIKAD ne vraćaju javno
router.get('/', async (_req, res) => {
  try {
    const rows = await prisma.siteSetting.findMany();
    const obj: Record<string, string> = {};
    for (const r of rows) if (!r.key.startsWith('secret_')) obj[r.key] = r.value;
    res.json(obj);
  } catch (e: any) {
    console.error('Settings list error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

// Admin: sva podešavanja uključujući tajne (za admin formu)
router.get('/all', requireAuth, requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const rows = await prisma.siteSetting.findMany();
    const obj: Record<string, string> = {};
    for (const r of rows) obj[r.key] = r.value;
    res.json(obj);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

// Admin: bulk upsert { key: value, ... }
router.put('/', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const entries = Object.entries(req.body as Record<string, string>);
    await Promise.all(entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    ));
    res.json({ ok: true });
  } catch (e: any) {
    console.error('Settings update error:', e);
    res.status(500).json({ error: e?.message || 'Server error' });
  }
});

export default router;
