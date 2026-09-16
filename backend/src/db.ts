import { PrismaClient } from '@prisma/client';

// Jedan zajednički klijent za cijelu aplikaciju.
// Supabase session pooler dozvoljava 15 konekcija ukupno — jedan pool
// (connection_limit u DATABASE_URL) umjesto po jednog pool-a po ruti.
export const prisma = new PrismaClient();
