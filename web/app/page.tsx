import Teaser from '@/components/Teaser';
import PocetnaPage from './pocetna/page';

// Vremenska brava: do 16.07.2026. u 10:00 prikazuje se teaser sa odbrojavanjem,
// od 10:00 puna naslovna — bez ručnog deploya na dan lansiranja.
const LAUNCH_AT = new Date('2026-07-16T10:00:00+02:00').getTime();

export const revalidate = 60;

export const metadata = {
  title: 'ŽRK Lavice Podgorica — Stvaramo nove lavice',
  description: 'Razvojni ženski rukometni klub za djevojčice u Podgorici, osnovan od strane evropskih šampionki i olimpijskih medaljistkinja.',
};

export default async function HomePage() {
  if (Date.now() < LAUNCH_AT) return <Teaser />;
  return <PocetnaPage />;
}
