import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';
import { getStandings } from '../../lib/api';

export default function TabelaScreen() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStandings().then(r => setRows(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const groups: Record<string, any[]> = {};
  for (const r of rows) (groups[r.league] ||= []).push(r);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}
      {!loading && rows.length === 0 && <Text style={s.empty}>Tabela još nije objavljena.</Text>}
      {Object.entries(groups).map(([league, items]) => (
        <View key={league} style={{ marginBottom: 24 }}>
          <Text style={s.league}>{league}</Text>
          <View style={s.table}>
            <View style={[s.tr, s.head]}>
              <Text style={[s.cellRank, s.th]}>#</Text>
              <Text style={[s.cellTeam, s.th]}>Ekipa</Text>
              <Text style={[s.cell, s.th]}>Od</Text>
              <Text style={[s.cell, s.th]}>P</Text>
              <Text style={[s.cell, s.th]}>N</Text>
              <Text style={[s.cell, s.th]}>I</Text>
              <Text style={[s.cell, s.th]}>Bod</Text>
            </View>
            {items.map((r, i) => (
              <View key={r.id} style={[s.tr, r.isOwnTeam && s.ownRow]}>
                <Text style={[s.cellRank, s.td]}>{i + 1}</Text>
                <Text style={[s.cellTeam, s.td, r.isOwnTeam && s.ownTeam]} numberOfLines={1}>{r.teamName}</Text>
                <Text style={[s.cell, s.td]}>{r.played}</Text>
                <Text style={[s.cell, s.td]}>{r.wins}</Text>
                <Text style={[s.cell, s.td]}>{r.draws}</Text>
                <Text style={[s.cell, s.td]}>{r.losses}</Text>
                <Text style={[s.cell, s.points]}>{r.points}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontFamily: Fonts.body },
  league: { color: Colors.text, fontSize: 16, fontFamily: Fonts.headingBold, marginBottom: 10 },
  table: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: Colors.border },
  head: { borderBottomColor: Colors.border },
  ownRow: { backgroundColor: Colors.primary + '1F' },
  th: { color: Colors.textMuted, fontSize: 11, fontFamily: Fonts.bodyBold },
  td: { color: Colors.text, fontSize: 13, fontFamily: Fonts.body },
  cellRank: { width: 24, textAlign: 'center' },
  cellTeam: { flex: 1, paddingLeft: 4 },
  ownTeam: { color: Colors.primary, fontFamily: Fonts.bodyBold },
  cell: { width: 30, textAlign: 'center' },
  points: { width: 36, textAlign: 'center', color: Colors.primary, fontFamily: Fonts.heading, fontSize: 14 },
});
