import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/AppColors';
import { getSchedule } from '../../lib/api';

export default function RasporedScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getSchedule().then((r: any) => {
      setEvents(Array.isArray(r) ? r : r?.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filters = [
    { val: 'all', label: 'Sve' },
    { val: 'training', label: 'Treninzi' },
    { val: 'match', label: 'Utakmice' },
  ];

  const filtered = events.filter(e => filter === 'all' || e.type === filter);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Raspored</Text>
        <View style={s.filterRow}>
          {filters.map(f => (
            <TouchableOpacity key={f.val} onPress={() => setFilter(f.val)}
              style={[s.filterBtn, filter === f.val && s.filterActive]}>
              <Text style={[s.filterText, filter === f.val && s.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}

      <View style={s.list}>
        {filtered.map((event: any) => {
          const d = new Date(event.startsAt);
          return (
            <View key={event.id} style={[s.card, event.type === 'match' && s.matchCard, event.isCancelled && s.cancelled]}>
              <View style={s.dateBox}>
                <Text style={s.dateDay}>{d.getDate()}</Text>
                <Text style={s.dateMon}>{d.toLocaleString('sr-Latn-ME', { month: 'short' }).toUpperCase()}</Text>
              </View>
              <View style={[s.dot, { backgroundColor: event.type === 'match' ? Colors.primary : Colors.gold }]} />
              <View style={s.info}>
                <Text style={s.eventTitle}>{event.title}</Text>
                <Text style={s.eventMeta}>
                  {d.toLocaleTimeString('sr-ME', { hour: '2-digit', minute: '2-digit' })}
                  {event.location ? `  📍 ${event.location}` : ''}
                </Text>
                {event.isCancelled && <Text style={s.cancelled_text}>OTKAZANO</Text>}
              </View>
              <View style={[s.badge, event.type === 'match' ? s.matchBadge : s.trainBadge]}>
                <Text style={[s.badgeText, { color: event.type === 'match' ? Colors.primary : Colors.gold }]}>
                  {event.type === 'match' ? 'Utakmica' : 'Trening'}
                </Text>
              </View>
            </View>
          );
        })}
        {!loading && filtered.length === 0 && (
          <Text style={s.empty}>Nema zakazanih događaja.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 20, paddingTop: 24 },
  headerTitle: { color: Colors.text, fontSize: 24, fontWeight: '800', marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card },
  filterActive: { backgroundColor: Colors.primary },
  filterText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  list: { paddingHorizontal: 16, gap: 8 },
  card: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  matchCard: { backgroundColor: '#C41230' + '18', borderWidth: 1, borderColor: Colors.primary + '40' },
  cancelled: { opacity: 0.5 },
  dateBox: { alignItems: 'center', minWidth: 40 },
  dateDay: { color: Colors.text, fontSize: 24, fontWeight: '800', lineHeight: 26 },
  dateMon: { color: Colors.textMuted, fontSize: 10, letterSpacing: 0.5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  info: { flex: 1 },
  eventTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 3 },
  eventMeta: { color: Colors.textMuted, fontSize: 12 },
  cancelled_text: { color: Colors.textMuted, fontSize: 10, fontWeight: '700', marginTop: 3 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  matchBadge: { backgroundColor: Colors.primary + '20' },
  trainBadge: { backgroundColor: Colors.gold + '20' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15 },
});
