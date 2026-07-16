import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

const prisma = new PrismaClient();

if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

// Slanje kroz Expo Push servis (aplikacija v1.1+ registruje tokene kroz /api/me/push-token)
async function sendExpoPush(tokens: string[], payload: { title: string; body: string }) {
  const valid = tokens.filter(t => t.startsWith('ExponentPushToken'));
  for (let i = 0; i < valid.length; i += 100) {
    const chunk = valid.slice(i, i + 100);
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk.map(to => ({ to, title: payload.title, body: payload.body, sound: 'default' }))),
      });
    } catch (e) {
      console.error('Expo push error:', e);
    }
  }
}

// Push svim roditeljima čija su djeca u ekipi (ParentLink → PushToken), plus stari FCM kanal ako je konfigurisan
export async function sendTeamPushNotification(
  teamId: string,
  payload: { title: string; body: string }
) {
  // Expo push preko parent_links
  try {
    const links = await prisma.parentLink.findMany({
      where: { player: { teamId, isActive: true } },
      select: { userId: true },
    });
    const userIds = [...new Set(links.map(l => l.userId))];
    if (userIds.length) {
      const rows = await prisma.pushToken.findMany({ where: { userId: { in: userIds } } });
      await sendExpoPush(rows.map(r => r.token), payload);
    }
  } catch (e) {
    console.error('Expo team push error:', e);
  }

  // Zaostali FCM kanal (radi samo ako je FIREBASE_SERVICE_ACCOUNT podešen)
  try {
    if (admin.apps.length) {
      const players = await prisma.player.findMany({
        where: { teamId, isActive: true, parentUser: { isNot: null } },
        include: { parentUser: { select: { fcmToken: true } } },
      });
      const tokens = players.map(p => p.parentUser?.fcmToken).filter((t): t is string => Boolean(t));
      for (let i = 0; i < tokens.length; i += 500) {
        await admin.messaging().sendEachForMulticast({
          tokens: tokens.slice(i, i + 500),
          notification: payload,
          android: { priority: 'high' },
          apns: { payload: { aps: { sound: 'default' } } },
        });
      }
    }
  } catch (e) {
    console.error('FCM push error:', e);
  }
}

export async function sendBroadcastPushNotification(payload: { title: string; body: string }) {
  try {
    const rows = await prisma.pushToken.findMany();
    await sendExpoPush(rows.map(r => r.token), payload);
  } catch (e) {
    console.error('Expo broadcast error:', e);
  }
  try {
    if (admin.apps.length) {
      const users = await prisma.user.findMany({
        where: { isActive: true, fcmToken: { not: null } },
        select: { fcmToken: true },
      });
      const tokens = users.map(u => u.fcmToken!).filter(Boolean);
      if (tokens.length) await admin.messaging().sendEachForMulticast({ tokens, notification: payload });
    }
  } catch (e) {
    console.error('FCM broadcast error:', e);
  }
}
