import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';

const DOMAIN_LABELS: Record<string, string> = {
  technical: 'Tehnika', tactical: 'Taktika', physical: 'Fizička priprema',
  mental: 'Mentalitet', goalkeeper: 'Golmanski rad',
};
const STATUS_LABEL: Record<string, { text: string; color: string }> = {
  ready: { text: 'Spremna za trening i utakmice', color: '#16a34a' },
  caution: { text: 'Trenira uz oprez', color: '#d4ac0d' },
  out: { text: 'Trenutno van terena', color: '#dc2626' },
};

export default function RazvojView() {
  const { activeChild } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeChild) { setLoading(false); return; }
    setLoading(true);
    api.development(activeChild.id).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [activeChild?.id]);

  if (loading) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />;
  if (!data || !activeChild) return <Text style={s.empty}>Nema podataka.</Text>;

  const status = STATUS_LABEL[data.injuryStatus] || STATUS_LABEL.ready;
  const activeGoals = (data.goals || []).filter((g: any) => g.status === 'active');
  const doneGoals = (data.goals || []).filter((g: any) => g.status === 'done');

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={s.header}>{activeChild.firstName} {activeChild.lastName}</Text>
      <View style={[s.statusPill, { backgroundColor: `${status.color}18` }]}>
        <View style={[s.statusDot, { backgroundColor: status.color }]} />
        <Text style={[s.statusText, { color: status.color }]}>{status.text}</Text>
      </View>

      {/* Ciljevi */}
      <Text style={s.sectionTitle}>🎯 Na čemu radimo</Text>
      <View style={s.card}>
        {activeGoals.length === 0 && <Text style={s.meta}>Trener još nije postavio ciljeve.</Text>}
        {activeGoals.map((g: any) => (
          <View key={g.id} style={s.goalRow}>
            <Text style={s.goalTitle}>{g.title}</Text>
            {g.description && <Text style={s.meta}>{g.description}</Text>}
          </View>
        ))}
        {doneGoals.length > 0 && (
          <Text style={[s.meta, { marginTop: 8 }]}>✅ Ostvareno: {doneGoals.map((g: any) => g.title).join(' · ')}</Text>
        )}
      </View>

      {/* Evaluacije */}
      <Text style={s.sectionTitle}>📋 Evaluacije trenera</Text>
      {(data.evaluations || []).length === 0 && (
        <View style={s.card}><Text style={s.meta}>Prva evaluacija stiže tokom sezone.</Text></View>
      )}
      {(data.evaluations || []).map((ev: any) => (
        <View key={ev.id} style={[s.card, { marginBottom: 10 }]}>
          <Text style={s.goalTitle}>{ev.period}</Text>
          <Text style={s.meta}>{ev.coach} · {new Date(ev.createdAt).toLocaleDateString('sr-Latn-ME')}</Text>
          <View style={s.domRow}>
            {Object.entries(ev.domains || {}).map(([d, avg]: any) => (
              <View key={d} style={s.domBadge}>
                <Text style={s.domName}>{DOMAIN_LABELS[d] || d}</Text>
                <View style={s.dots}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <View key={n} style={[s.dot, n <= Math.round(avg) && { backgroundColor: Colors.primary }]} />
                  ))}
                </View>
              </View>
            ))}
          </View>
          {ev.comment && <Text style={s.comment}>„{ev.comment}"</Text>}
        </View>
      ))}

      {/* Prekretnice */}
      <Text style={s.sectionTitle}>⭐ Prekretnice</Text>
      <View style={s.card}>
        {(data.milestones || []).length === 0 && <Text style={s.meta}>Bedževi i prekretnice će se pojavljivati ovdje.</Text>}
        {(data.milestones || []).map((m: any) => (
          <View key={m.id} style={s.goalRow}>
            <Text style={s.goalTitle}>{m.badge || '⭐'} {m.title}</Text>
            <Text style={s.meta}>{new Date(m.achievedAt).toLocaleDateString('sr-Latn-ME')}</Text>
          </View>
        ))}
      </View>

      <Text style={s.note}>Napredak se poredi samo sa prethodnim stanjem vašeg djeteta — nikada sa drugom đecom. 🦁</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { color: Colors.text, fontSize: 20, fontFamily: Fonts.heading, marginBottom: 8 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 8,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontFamily: Fonts.bodyBold },
  sectionTitle: { color: Colors.text, fontSize: 15, fontFamily: Fonts.heading, marginTop: 16, marginBottom: 8 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#F0F0F0' },
  goalRow: { paddingVertical: 6 },
  goalTitle: { color: Colors.text, fontSize: 14.5, fontFamily: Fonts.bodyBold },
  meta: { color: Colors.textMuted, fontSize: 12.5, fontFamily: Fonts.body, marginTop: 2 },
  domRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  domBadge: { minWidth: 100 },
  domName: { color: Colors.textMuted, fontSize: 11.5, fontFamily: Fonts.bodyBold, marginBottom: 4 },
  dots: { flexDirection: 'row', gap: 3 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E8E8E8' },
  comment: { color: Colors.textMuted, fontSize: 13.5, fontFamily: Fonts.body, fontStyle: 'italic', lineHeight: 20, marginTop: 12 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontFamily: Fonts.body },
  note: { color: '#9a9a9a', fontSize: 12, fontFamily: Fonts.body, textAlign: 'center', marginTop: 22, lineHeight: 18 },
});
