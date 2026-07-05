import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';
import { getResults } from '../../lib/api';

export default function RezultatiView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults().then(r => setRows(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}
      {!loading && rows.length === 0 && <Text style={s.empty}>Još nema unesenih rezultata.</Text>}
      {rows.map(r => (
        <View key={r.id} style={s.card}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{r.event?.title}</Text>
            <Text style={s.meta}>
              {r.event?.startsAt && new Date(r.event.startsAt).toLocaleDateString('sr-Latn-ME')}
              {r.event?.team?.name ? ` · ${r.event.team.name}` : ''}
            </Text>
          </View>
          <Text style={s.score}>{r.homeScore} : {r.awayScore}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontFamily: Fonts.body },
  card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: Colors.text, fontSize: 14, fontFamily: Fonts.bodyBold },
  meta: { color: Colors.textMuted, fontSize: 12, fontFamily: Fonts.body, marginTop: 2 },
  score: { color: Colors.primary, fontSize: 22, fontFamily: Fonts.heading },
});
