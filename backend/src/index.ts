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
import treneriRoutes from './routes/treneri';
import invitesRoutes from './routes/invites';
import meRoutes from './routes/me';
import seasonsRoutes from './routes/seasons';
import attendanceRoutes from './routes/attendance';
import availabilityRoutes from './routes/availability';
import announcementsRoutes from './routes/announcements';
import dossierRoutes from './routes/dossier';
import feesRoutes from './routes/fees';
import trialsRoutes from './routes/trials';
import developmentRoutes from './routes/development';
import financeRoutes from './routes/finance';
import dashboardRoutes from './routes/dashboard';
import membersRoutes from './routes/members';

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
app.use('/api/treneri', treneriRoutes);
app.use('/api/invites', invitesRoutes);
app.use('/api/me', meRoutes);
app.use('/api/seasons', seasonsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/dossier', dossierRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/trial-slots', trialsRoutes);
app.use('/api/development', developmentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/members', membersRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => console.log(`ZRK Lavice API running on :${PORT}`));
