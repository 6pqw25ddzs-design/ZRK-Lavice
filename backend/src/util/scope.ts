import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Admin smije sve; trener samo svoju ekipu (Coach.teamId)
export async function canManageTeam(user: { id: string; role: string }, teamId: string): Promise<boolean> {
  if (user.role === 'admin') return true;
  if (user.role !== 'coach') return false;
  const coach = await prisma.coach.findUnique({ where: { userId: user.id } });
  return coach?.teamId === teamId;
}

// Da li prijavljeni korisnik smije da odgovara u ime igračice (roditelj kroz ParentLink)
export async function canActForPlayer(userId: string, playerId: string): Promise<boolean> {
  const link = await prisma.parentLink.findUnique({
    where: { userId_playerId: { userId, playerId } },
  });
  return !!link;
}
