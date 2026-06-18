import type { Metadata } from 'next';
import { Inter, Barlow_Condensed } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-barlow' });

export const metadata: Metadata = {
  title: { default: 'ZRK Lavice Podgorica', template: '%s | ZRK Lavice' },
  description: 'Ženski rukometni klub Lavice — Podgorica, Crna Gora. Razvijamo šampionke budućnosti.',
  keywords: ['rukomet', 'ženski rukomet', 'Podgorica', 'Crna Gora', 'ZRK Lavice'],
  openGraph: {
    type: 'website',
    locale: 'sr_ME',
    url: 'https://zrklavice.me',
    siteName: 'ZRK Lavice',
    title: 'ZRK Lavice Podgorica',
    description: 'Ženski rukometni klub Lavice — razvijamo šampionke budućnosti.',
  },
  metadataBase: new URL('https://zrklavice.me'),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={`${inter.variable} ${barlow.variable}`}>
      <body className="bg-white text-dark font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
