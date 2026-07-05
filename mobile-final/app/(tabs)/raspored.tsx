import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/AppColors';
import { getSchedule } from '../../lib/api';

export default function RasporedScreen() {
  const insets = useSafeAreaInsets();
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
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={[s.header, { paddingTop: insets.top + 14 }]}>
        <Text style={s.headerTitle}>Raspored</Text>
        <Text style={s.headerSub}>Treninzi i utakmice svih ekipa</Text>
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

      {/* Timeline */}
      <View style={s.timeline}>
        {filtered.map((event: any, i: number) => {
          const d = new Date(event.startsAt);
          const isMatch = event.type === 'match';
          const accent = isMatch ? Colors.primary : Colors.gold;
          return (
            <View key={event.id} style={s.tlRow}>
              {/* Lijeva kolona: datum + linija */}
              <View style={s.tlLeft}>
                <Text style={s.tlDay}>{d.getDate()}</Text>
                <Text style={s.tlMon}>{d.toLocaleString('sr-Latn-ME', { month: 'short' }).replace('.', '').toUpperCase()}</Text>
                <View style={[s.tlDot, { backgroundColor: accent }]} />
                {i < filtered.length - 1 && <View style={s.tlLine} />}
              </View>

              {/* Kartica događaja */}
              <View style={[s.card, event.isCancelled && s.cancelled]}>
                <View style={[s.cardAccent, { backgroundColor: accent }]} />
                <View style={{ flex: 1, padding: 15 }}>
                  <View style={s.cardTop}>
                    <Text style={s.time}>{d.toLocaleTimeString('sr-ME', { hour: '2-digit', minute: '2-digit' })}</Text>
                    <View style={[s.badge, { backgroundColor: isMatch ? 'rgba(196,18,48,0.09)' : 'rgba(212,172,13,0.13)' }]}>
                      <Text style={[s.badgeText, { color: isMatch ? Colors.primary : '#A8860B' }]}>
                        {isMatch ? 'Utakmica' : 'Trening'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.eventTitle}>{event.title}</Text>
                  {event.location && (
                    <View style={s.metaRow}>
                      <Ionicons name="location-outline" size={13} color="#9a9a9a" />
                      <Text style={s.eventMeta}>{event.location}</Text>
                    </View>
                  )}
                  {event.team?.name && (
                    <View style={s.metaRow}>
                      <Ionicons name="people-outline" size={13} color="#9a9a9a" />
                      <Text style={s.eventMeta}>{event.team.name}</Text>
                    </View>
                  )}
                  {event.isCancelled && <Text style={s.cancelledText}>OTKAZANO</Text>}
                </View>
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  headerTitle: { color: Colors.text, fontSize: 30, fontFamily: Fonts.heading, letterSpacing: -0.5 },
  headerSub: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.body, marginTop: 4, marginBottom: 18 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 999, backgroundColor: '#F5F5F5' },
  filterActive: { backgroundColor: Colors.primary },
  filterText: { color: '#7a7a7a', fontSize: 13.5, fontFamily: Fonts.bodyBold },
  filterTextActive: { color: '#fff' },

  timeline: { paddingHorizontal: 20 },
  tlRow: { flexDirection: 'row', gap: 14 },
  tlLeft: { alignItems: 'center', width: 44 },
  tlDay: { color: Colors.text, fontSize: 22, fontFamily: Fonts.heading, lineHeight: 26 },
  tlMon: { color: '#a0a0a0', fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 1 },
  tlDot: { width: 9, height: 9, borderRadius: 5, marginTop: 8 },
  tlLine: { flex: 1, width: 1.5, backgroundColor: '#EFEFEF', marginTop: 4, marginBottom: -4 },

  card: {
    flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardAccent: { width: 4 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  time: { color: Colors.text, fontSize: 15, fontFamily: Fonts.heading },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontFamily: Fonts.bodyBold },
  eventTitle: { color: Colors.text, fontSize: 15, fontFamily: Fonts.bodyBold, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  eventMeta: { color: '#9a9a9a', fontSize: 12.5, fontFamily: Fonts.body },
  cancelledText: { color: Colors.primary, fontSize: 10, fontFamily: Fonts.bodyBold, marginTop: 6, letterSpacing: 1 },
  cancelled: { opacity: 0.45 },

  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontFamily: Fonts.body },
});
