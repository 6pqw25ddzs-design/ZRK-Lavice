import Link from 'next/link';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-dark text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-xl">🦁</div>
              <span className="text-white font-bold text-lg">ZRK <span className="text-gold">Lavice</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              Ženski rukometni klub iz Podgorice.<br />
              Razvijamo šampionke budućnosti.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><Facebook size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Klub</h4>
            {['O klubu', 'Ekipe', 'Treneri', 'Historija'].map(l => (
              <Link key={l} href="#" className="block text-sm py-1.5 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Aktivnosti</h4>
            {['Raspored', 'Rezultati', 'Vijesti', 'Galerija'].map(l => (
              <Link key={l} href="#" className="block text-sm py-1.5 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Kontakt</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Mail size={14} /> info@zrklavice.me</div>
              <div className="flex items-center gap-2"><Phone size={14} /> +382 69 123 456</div>
              <div className="mt-3">SC Morača<br />Ulica Moskovska bb<br />Podgorica, CG</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs">
          <span>© {new Date().getFullYear()} ZRK Lavice Podgorica. Sva prava zadržana.</span>
          <Link href="/admin" className="hover:text-white transition-colors">Admin panel</Link>
        </div>
      </div>
    </footer>
  );
}
