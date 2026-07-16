// Slanje email obavještenja preko Resend API-ja (HTTPS, radi na Render free tieru).
// Ako RESEND_API_KEY/NOTIFY_EMAIL nisu podešeni ili slanje padne, greška se samo loguje —
// email nikad ne smije oboriti registraciju.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DEFAULT_FROM = 'ŽRK Lavice <onboarding@resend.dev>';

// Ključ i adrese se čitaju iz baze (admin Podešavanja), uz env kao fallback; keš 5 min.
let cache: { key?: string; email?: string; from: string; at: number } = { from: DEFAULT_FROM, at: 0 };
async function getConfig() {
  if (Date.now() - cache.at < 5 * 60 * 1000) return cache;
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: ['secret_resend_api_key', 'secret_notify_email', 'secret_notify_from'] } },
    });
    const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
    cache = {
      key: map.secret_resend_api_key || process.env.RESEND_API_KEY,
      email: map.secret_notify_email || process.env.NOTIFY_EMAIL,
      from: map.secret_notify_from || process.env.NOTIFY_FROM || DEFAULT_FROM,
      at: Date.now(),
    };
  } catch {
    cache = { key: process.env.RESEND_API_KEY, email: process.env.NOTIFY_EMAIL, from: process.env.NOTIFY_FROM || DEFAULT_FROM, at: Date.now() };
  }
  return cache;
}

export async function sendNotifyEmail(subject: string, html: string): Promise<void> {
  const { key: RESEND_API_KEY, email: NOTIFY_EMAIL, from: FROM } = await getConfig();
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) return;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [NOTIFY_EMAIL], subject, html }),
    });
    if (!res.ok) console.error('Email notify failed:', res.status, await res.text());
  } catch (e) {
    console.error('Email notify error:', e);
  }
}

export function registrationEmailHtml(r: { childName: string; birthYear: number; parentName: string; parentPhone: string; parentEmail: string; notes?: string | null }): string {
  return `
    <div style="font-family:sans-serif;max-width:520px">
      <h2 style="color:#C8102E;margin-bottom:4px">Nova prijava za upis 🦁</h2>
      <table style="border-collapse:collapse;font-size:15px">
        <tr><td style="padding:4px 12px 4px 0;color:#777">Dijete</td><td><strong>${r.childName}</strong> (${r.birthYear})</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Roditelj</td><td>${r.parentName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Telefon</td><td><a href="tel:${r.parentPhone}">${r.parentPhone}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Email</td><td><a href="mailto:${r.parentEmail}">${r.parentEmail}</a></td></tr>
        ${r.notes ? `<tr><td style="padding:4px 12px 4px 0;color:#777">Napomena</td><td>${r.notes}</td></tr>` : ''}
      </table>
      <p style="margin-top:16px"><a href="https://zrklavice.me/admin/prijave" style="color:#C8102E">Otvori u admin panelu →</a></p>
    </div>`;
}
