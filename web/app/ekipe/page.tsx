import PageHero from '@/components/site/PageHero';
import TeamGrid from '@/components/club/TeamGrid';
import { getTeams, getPlayers } from '@/lib/api';

export const revalidate = 120;
export const metadata = { title: 'Ekipe | ŽRK Lavice-UDG', description: 'Prvi tim, Pionirke i Mini rukomet — sve naše igračice.' };

export default async function EkipePage() {
  const [teams, players] = await Promise.all([
    getTeams().catch(() => []),
    getPlayers().catch(() => []),
  ]);

  return (
    <div>
      <PageHero eyebrow="Tri generacije, jedan klub" title="Naše ekipe" sub="Svaka igračica pronalazi svoju generaciju i svoje mjesto u timu." />
      <div className="max-w-[1320px] mx-auto px-6 lg:px-12 py-14">
        <TeamGrid teams={teams} players={players} />
      </div>
    </div>
  );
}
