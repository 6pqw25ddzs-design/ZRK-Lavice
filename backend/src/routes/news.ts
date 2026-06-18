import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const articleSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  body: z.string().min(10),
  coverUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
});

router.get('/', async (req, res) => {
  const { tag, limit } = req.query;
  const articles = await prisma.newsArticle.findMany({
    where: {
      isPublished: true,
      ...(tag ? { tags: { has: String(tag) } } : {}),
    },
    select: { id: true, title: true, slug: true, coverUrl: true, publishedAt: true, tags: true },
    orderBy: { publishedAt: 'desc' },
    take: limit ? parseInt(String(limit)) : 20,
  });
  res.json(articles);
});

router.get('/:slug', async (req, res) => {
  const article = await prisma.newsArticle.findUnique({
    where: { slug: req.params.slug },
    include: { author: { select: { fullName: true } } },
  });
  if (!article || (!article.isPublished)) return res.status(404).json({ error: 'Not found' });
  res.json(article);
});

router.post('/', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  const parse = articleSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });

  const article = await prisma.newsArticle.create({
    data: {
      ...parse.data,
      authorId: req.user!.id,
      publishedAt: parse.data.isPublished ? new Date() : null,
    } as any,
  });
  res.status(201).json(article);
});

router.patch('/:id', requireAuth, requireRole('admin', 'coach'), async (req: AuthRequest, res: Response) => {
  const current = await prisma.newsArticle.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ error: 'Not found' });

  const article = await prisma.newsArticle.update({
    where: { id: req.params.id },
    data: {
      ...req.body,
      publishedAt: req.body.isPublished && !current.publishedAt ? new Date() : current.publishedAt,
    },
  });
  res.json(article);
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  await prisma.newsArticle.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
