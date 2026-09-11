import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

// Prima formu sa /doniraj i preusmjerava na Monri WebPay (Form Redirect).
// digest = SHA512(merchant_key + order_number + amount + currency)
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const eur = Math.round(Number(form.get('amount')) * 100) / 100;
    const name = String(form.get('name') || '').trim().slice(0, 100);
    const email = String(form.get('email') || '').trim().slice(0, 100);
    const purpose = String(form.get('purpose') || 'donacija');

    if (!eur || eur < 1 || eur > 10000 || !name || !email) {
      return NextResponse.redirect(new URL('/doniraj?greska=1', req.url), 303);
    }

    const key = process.env.MONRI_MERCHANT_KEY!;
    const token = process.env.MONRI_AUTH_TOKEN!;
    const base = process.env.MONRI_BASE || 'https://ipgtest.monri.com';

    const amount = String(Math.round(eur * 100)); // minor units
    const currency = 'EUR';
    const orderNumber = `${purpose === 'clanarina' ? 'cla' : 'don'}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const digest = createHash('sha512').update(key + orderNumber + amount + currency).digest('hex');

    const origin = new URL(req.url).origin;
    const fields: Record<string, string> = {
      authenticity_token: token,
      digest,
      amount,
      currency,
      order_number: orderNumber,
      order_info: purpose === 'clanarina' ? 'Članarina — ŽRK Lavice-UDG' : 'Donacija — ŽRK Lavice-UDG',
      transaction_type: 'purchase',
      language: 'hr',
      ch_full_name: name,
      ch_email: email,
      ch_address: '-', ch_city: '-', ch_zip: '-', ch_country: 'ME', ch_phone: '-',
      success_url: `${origin}/doniraj/hvala`,
      cancel_url: `${origin}/doniraj/otkazano`,
      callback_url: `${origin}/api/monri/callback`,
    };

    const inputs = Object.entries(fields)
      .map(([k, v]) => `<input type="hidden" name="${k}" value="${v.replace(/"/g, '&quot;')}">`)
      .join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Preusmjeravanje…</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#141414;color:#fff">
<form id="f" action="${base}/v2/form" method="POST">${inputs}</form>
<p>Preusmjeravamo vas na sigurnu stranicu za plaćanje…</p>
<script>document.getElementById('f').submit()</script></body></html>`;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  } catch {
    return NextResponse.redirect(new URL('/doniraj?greska=1', req.url), 303);
  }
}
