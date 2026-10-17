import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';
import { getPrvaLigaTabela, getRrlTabela, type TabelaRed } from '../../lib/tabele';

// Žive tabele — isti izvori kao zrklavice.me/tabela (RSCG feed + rr-liga.com)
export default function TabelaScreen() {
  const [prva, setPrva] = useState<TabelaRed[] | null>(null);
  const [rrl, setRrl] = useState<TabelaRed[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPrvaLigaTabela(), getRrlTabela()])
      .then(([a, b]) => { setPrva(a); setRrl(b); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}
      {!loading && <Liga title="Prva ženska liga Crne Gore" source="Izvor: RSCG" rows={prva} />}
      {!loading && <Liga title="Regionalna liga (WRHL) · Grupa B" source="Izvor: rr-liga.com" rows={rrl} />}
    </ScrollView>
  );
}

function Liga({ title, source, rows }: { title: string; source: string; rows: TabelaRed[] | null }) {
  return (
    <View style={{ marginBottom: 26 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <Text style={s.league}>{title}</Text>
        <Text style={s.source}>{source}</Text>
      </View>
      {!rows ? (
        <Text style={s.empty}>Tabela trenutno nije dostupna.</Text>
      ) : (
        <View style={s.table}>
          <View style={[s.tr, s.head]}>
            <Text style={[s.cellRank, s.th]}>#</Text>
            <Text style={[s.cellTeam, s.th]}>Klub</Text>
            <Text style={[s.cell, s.th]}>U</Text>
            <Text style={[s.cell, s.th]}>P</Text>
            <Text style={[s.cell, s.th]}>I</Text>
            <Text style={[s.cellGd, s.th]}>G-raz.</Text>
            <Text style={[s.cell, s.th]}>Bod</Text>
          </View>
          {rows.map(r => (
            <View key={r.rank + r.name} style={[s.tr, r.nasa && s.ownRow]}>
              <Text style={[s.cellRank, s.td]}>{r.rank}.</Text>
              <Text style={[s.cellTeam, s.td, r.nasa && s.ownTeam]} numberOfLines={1}>{r.name}</Text>
              <Text style={[s.cell, s.td]}>{r.played}</Text>
              <Text style={[s.cell, s.td]}>{r.won}</Text>
              <Text style={[s.cell, s.td]}>{r.lost}</Text>
              <Text style={[s.cellGd, s.td]}>{r.gf}:{r.ga}</Text>
              <Text style={[s.cell, s.td, s.points]}>{r.points}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  league: { color: Colors.text, fontSize: 17, fontFamily: Fonts.heading },
  source: { color: Colors.textMuted, fontSize: 10, fontFamily: Fonts.body },
  empty: { color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.body },
  table: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  tr: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  head: { paddingVertical: 8 },
  th: { color: Colors.textMuted, fontSize: 10, fontFamily: Fonts.bodyBold, textTransform: 'uppercase', letterSpacing: 0.4 },
  td: { color: 'rgba(0,0,0,0.75)', fontSize: 13, fontFamily: Fonts.body },
  cellRank: { width: 26 },
  cellTeam: { flex: 1 },
  cell: { width: 24, textAlign: 'center' },
  cellGd: { width: 50, textAlign: 'center' },
  ownRow: { backgroundColor: 'rgba(196,18,48,0.10)', borderLeftWidth: 3, borderLeftColor: '#C41230' },
  ownTeam: { fontFamily: Fonts.bodyBold },
  points: { fontFamily: Fonts.bodyBold, color: '#C41230' },
});
