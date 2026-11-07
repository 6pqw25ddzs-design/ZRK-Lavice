import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

// Anonimna registracija Expo push tokena — bez prijave, poziva se pri otvaranju aplikacije.
// Ako token već postoji (npr. vezan za roditeljski nalog), ne dira user_id.
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { token, platform } = req.body;
    if (typeof token !== 'string' || !token.startsWith('ExponentPushToken')) {
      return res.status(400).json({ error: 'token je obavezan' });
    }
    await prisma.pushToken.upsert({
      where: { token },
      update: { platform },
      create: { token, platform },
    });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

export default router;
