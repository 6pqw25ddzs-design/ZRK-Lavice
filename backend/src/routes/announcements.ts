import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
import { canManageTeam } from '../util/scope';

const router = Router();
const prisma = new PrismaClient();

// Objava ekipi (admin ili trener svoje ekipe)
router.post('/', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, title, body, requiresAck } = req.body;
    if (!teamId || !title || !body) return res.status(400).json({ error: 'teamId, title i body su obavezni' });
    if (!(await canManageTeam(req.user!, teamId))) return res.status(403).json({ error: 'Nemate pristup ovoj ekipi' });

    const announcement = await prisma.announcement.create({
      data: { teamId, title, body, requiresAck: !!requiresAck, authorId: req.user!.id },
    });
    res.status(201).json(announcement);
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška pri objavi' });
  }
});

// Lista objava sa brojem čitanja (admin/trener)
router.get('/', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.query;
    if (teamId && !(await canManageTeam(req.user!, String(teamId)))) {
      return res.status(403).json({ error: 'Nemate pristup ovoj ekipi' });
    }
    const items = await prisma.announcement.findMany({
      where: teamId ? { teamId: String(teamId) } : {},
      include: {
        team: { select: { name: true } },
        author: { select: { fullName: true } },
        _count: { select: { reads: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(items.map(a => ({
      id: a.id, teamId: a.teamId, teamName: a.team.name, title: a.title, body: a.body,
      requiresAck: a.requiresAck, author: a.author.fullName, createdAt: a.createdAt,
      readCount: a._count.reads,
    })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

// Ko je pročitao (za requiresAck objave)
router.get('/:id/reads', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!announcement) return res.status(404).json({ error: 'Objava ne postoji' });
    if (!(await canManageTeam(req.user!, announcement.teamId))) return res.status(403).json({ error: 'Nemate pristup' });

    const reads = await prisma.announcementRead.findMany({
      where: { announcementId: req.params.id },
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { readAt: 'asc' },
    });
    res.json(reads.map(r => ({ fullName: r.user.fullName, email: r.user.email, readAt: r.readAt })));
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška' });
  }
});

router.delete('/:id', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id } });
    if (!announcement) return res.status(404).json({ error: 'Objava ne postoji' });
    if (!(await canManageTeam(req.user!, announcement.teamId))) return res.status(403).json({ error: 'Nemate pristup' });

    await prisma.$transaction([
      prisma.announcementRead.deleteMany({ where: { announcementId: req.params.id } }),
      prisma.announcement.delete({ where: { id: req.params.id } }),
    ]);
    res.status(204).end();
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Greška pri brisanju' });
  }
});

export default router;
