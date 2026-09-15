import { getSchedule } from '@/lib/api';
import ScheduleList from '@/components/ScheduleList';

export const revalidate = 60;

export default async function RasporedPage() {
  const events = await getSchedule().catch(() => []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black text-white mb-2">Raspored</h1>
      <p style={{ color: 'var(--text-muted)' }} className="mb-8">Treninzi i utakmice svih generacija — svaka ekipa u svojoj boji.</p>
      <ScheduleList events={events} />
    </div>
  );
}
