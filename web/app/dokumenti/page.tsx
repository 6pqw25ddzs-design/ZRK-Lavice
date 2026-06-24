import { getPublicDocuments } from '@/lib/api';

export const revalidate = 0;

export default async function DokumentiPage() {
  const docs = await getPublicDocuments().catch(() => []);

  // group by category
  const groups: Record<string, any[]> = {};
  for (const d of docs) {
    const cat = d.category || 'Ostalo';
    (groups[cat] ||= []).push(d);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-2">Dokumenti</h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-10">
        Obrasci, pravilnici i ostali dokumenti za preuzimanje.
      </p>

      {docs.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Trenutno nema dostupnih dokumenata.</p>
      ) : (
        Object.entries(groups).map(([cat, items]) => (
          <div key={cat} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div style={{ backgroundColor: 'var(--primary)' }} className="w-1 h-6 rounded-full" />
              <h2 className="text-lg font-black text-white">{cat}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {items.map((d: any) => (
                <a key={d.id} href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                  style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  className="rounded-xl p-4 flex items-center justify-between gap-4 hover:border-red-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <span className="text-white font-semibold">{d.title}</span>
                  </div>
                  <span style={{ color: 'var(--primary)' }} className="text-sm font-medium shrink-0">Preuzmi ↓</span>
                </a>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
