import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

const prisma = new PrismaClient();

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

export async function sendTeamPushNotification(
  teamId: string,
  payload: { title: string; body: string }
) {
  // Get FCM tokens of all parents whose children are in this team
  const players = await prisma.player.findMany({
    where: { teamId, isActive: true, parentUser: { isNot: null } },
    include: { parentUser: { select: { fcmToken: true } } },
  });

  const tokens = players
    .map(p => p.parentUser?.fcmToken)
    .filter((t): t is string => Boolean(t));

  if (!tokens.length) return;

  // FCM multicast (max 500 tokens per call)
  const chunks = [];
  for (let i = 0; i < tokens.length; i += 500) chunks.push(tokens.slice(i, i + 500));

  for (const chunk of chunks) {
    await admin.messaging().sendEachForMulticast({
      tokens: chunk,
      notification: payload,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
  }

  await prisma.notification.create({
    data: {
      senderId: 'system',
      teamId,
      title: payload.title,
      body: payload.body,
      channel: 'push',
    },
  });
}

export async function sendBroadcastPushNotification(payload: { title: string; body: string }) {
  const users = await prisma.user.findMany({
    where: { isActive: true, fcmToken: { not: null } },
    select: { fcmToken: true },
  });

  const tokens = users.map(u => u.fcmToken!).filter(Boolean);
  if (!tokens.length) return;

  await admin.messaging().sendEachForMulticast({
    tokens,
    notification: payload,
  });
}
