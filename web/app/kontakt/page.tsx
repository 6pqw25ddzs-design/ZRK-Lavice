import { getSettings } from '@/lib/api';

export const revalidate = 0;
export const metadata = { title: 'Kontakt — ŽRK Lavice' };

export default async function KontaktPage() {
  const s = await getSettings().catch(() => ({} as Record<string, string>));

  const email = s.contact_email || 'info@zrklavice.me';
  const phone = s.contact_phone || '+382 67 000 000';
  const location = s.contact_location || 'SC Morača';
  const address = s.contact_address || 'Ulica Moskovska bb, Podgorica, Crna Gora';
  const training = s.contact_training || 'Utorak, četvrtak i petak — po rasporedu ekipa.';
  const phoneTel = phone.replace(/[^0-9+]/g, '');

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-2">Kontakt</h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-10">
        Za sva pitanja o upisu, treninzima i saradnji — javite nam se.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-5">
          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
            <div style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase tracking-widest mb-2">Lokacija</div>
            <div className="text-white font-semibold">{location}</div>
            <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">{address}</div>
          </div>

          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
            <div style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase tracking-widest mb-2">Treninzi</div>
            <div style={{ color: 'var(--text-muted)' }} className="text-sm">{training}</div>
          </div>

          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
            <div style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase tracking-widest mb-2">Email</div>
            <a href={`mailto:${email}`} className="text-white font-semibold hover:underline">{email}</a>
            <div style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase tracking-widest mb-2 mt-4">Telefon</div>
            <a href={`tel:${phoneTel}`} className="text-white font-semibold hover:underline">{phone}</a>
          </div>

          <a href={`mailto:${email}`}
            style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-3 text-white font-bold rounded-lg hover:opacity-90 text-center">
            Pošalji nam email
          </a>
        </div>

        <div style={{ border: '1px solid var(--border)' }} className="rounded-xl overflow-hidden min-h-[360px]">
          <iframe
            title="Lokacija na mapi"
            src={`https://www.google.com/maps?q=${encodeURIComponent(address || location)}&output=embed`}
            width="100%" height="100%" style={{ border: 0, minHeight: 360 }}
            loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}
