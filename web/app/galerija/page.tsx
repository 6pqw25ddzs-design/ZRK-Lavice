import { getGallery } from '@/lib/api';

export const revalidate = 0;

export default async function GalerijaPage() {
  const images = await getGallery().catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-2">Galerija</h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-10">
        Trenuci sa utakmica, treninga i događaja kluba.
      </p>

      {images.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Uskoro objavljujemo fotografije.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((img: any) => (
            <a key={img.id} href={img.imageUrl} target="_blank" rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden aspect-square"
              style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt={img.title || 'Galerija'} className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
