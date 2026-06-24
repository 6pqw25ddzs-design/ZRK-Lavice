import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth';
import playerRoutes from './routes/players';
import teamRoutes from './routes/teams';
import scheduleRoutes from './routes/schedule';
import resultRoutes from './routes/results';
import newsRoutes from './routes/news';
import messageRoutes from './routes/messages';
import registrationRoutes from './routes/registrations';
import notificationRoutes from './routes/notifications';
import sponsorRoutes from './routes/sponsors';
import documentRoutes from './routes/documents';
import galleryRoutes from './routes/gallery';
import standingsRoutes from './routes/standings';
import settingsRoutes from './routes/settings';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`ZRK Lavice API running on :${PORT}`));
