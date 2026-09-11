import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const API = 'https://zrk-lavice-api.onrender.com';

// Monri callback: POST JSON o odobrenoj transakciji.
// Verifikacija: authorization header "WP3-callback <digest>", digest = SHA512(merchant_key + raw_body)
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const key = process.env.MONRI_MERCHANT_KEY!;
    const auth = req.headers.get('authorization') || req.headers.get('http-authorization') || '';
    const expected = createHash('sha512').update(key + raw).digest('hex');
    const received = auth.replace(/^WP3-callback\s+/i, '').trim();

    if (!received || received !== expected) {
      console.error('Monri callback: neispravan digest');
      return NextResponse.json({ error: 'invalid digest' }, { status: 403 });
    }

    const tx = JSON.parse(raw);
    const status = tx.status || tx.response_message || '';
    const responseCode = String(tx.response_code ?? '');
    const approved = status === 'approved' || responseCode === '0000';
    if (!approved) return NextResponse.json({ ok: true, skipped: true });

    const eur = Number(tx.amount) / 100;
    const orderNumber = String(tx.order_number || '');
    const isClanarina = orderNumber.startsWith('cla-');
    const donor = tx.ch_full_name ? String(tx.ch_full_name) : 'Anonimno';

    // Upis u Finansije preko servisnog naloga
    const login = await fetch(`${API}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: process.env.LAVICE_API_EMAIL, password: process.env.LAVICE_API_PASSWORD }),
    }).then(r => r.json());

    if (login?.token) {
      await fetch(`${API}/api/finance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${login.token}` },
        body: JSON.stringify({
          kind: 'income',
          category: isClanarina ? 'Članarina (online)' : 'Donacija (online)',
          amountEur: eur,
          date: new Date().toISOString(),
          description: `${isClanarina ? 'Online članarina' : 'Online donacija'} — ${donor} (Monri ${orderNumber})`,
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Monri callback error:', e);
    // 200 da Monri ne ponavlja unedogled ako je greška na našoj strani upisa
    return NextResponse.json({ ok: false });
  }
}
