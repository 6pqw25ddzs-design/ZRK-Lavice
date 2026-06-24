export const metadata = { title: 'Kontakt — ŽRK Lavice' };

export default function KontaktPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-2">Kontakt</h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-10">
        Za sva pitanja o upisu, treninzima i saradnji — javite nam se.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Info */}
        <div className="flex flex-col gap-5">
          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
            <div style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase tracking-widest mb-2">Lokacija</div>
            <div className="text-white font-semibold">SC Morača</div>
            <div style={{ color: 'var(--text-muted)' }} className="text-sm mt-1">Ulica Moskovska bb, Podgorica, Crna Gora</div>
          </div>

          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
            <div style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase tracking-widest mb-2">Treninzi</div>
            <div style={{ color: 'var(--text-muted)' }} className="text-sm">Utorak, četvrtak i petak — po rasporedu ekipa.</div>
          </div>

          <div style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} className="rounded-xl p-5">
            <div style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase tracking-widest mb-2">Email</div>
            <a href="mailto:info@zrklavice.me" className="text-white font-semibold hover:underline">info@zrklavice.me</a>
            <div style={{ color: 'var(--primary)' }} className="text-xs font-bold uppercase tracking-widest mb-2 mt-4">Telefon</div>
            <a href="tel:+38267000000" className="text-white font-semibold hover:underline">+382 67 000 000</a>
          </div>

          <a href="mailto:info@zrklavice.me"
            style={{ backgroundColor: 'var(--primary)' }}
            className="px-6 py-3 text-white font-bold rounded-lg hover:opacity-90 text-center">
            Pošalji nam email
          </a>
        </div>

        {/* Map */}
        <div style={{ border: '1px solid var(--border)' }} className="rounded-xl overflow-hidden min-h-[360px]">
          <iframe
            title="SC Morača na mapi"
            src="https://www.google.com/maps?q=SC+Mora%C4%8Da+Podgorica&output=embed"
            width="100%" height="100%" style={{ border: 0, minHeight: 360 }}
            loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </div>
    </div>
  );
}
