import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';
import { getTeams, getPlayers } from '@/lib/api';

export default function EkipeScreen() {
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTeams().catch(() => []), getPlayers().catch(() => [])]).then(([t, p]) => {
      const td = Array.isArray(t) ? t : t?.data ?? [];
      const pd = Array.isArray(p) ? p : p?.data ?? [];
      setTeams(td);
      setPlayers(pd);
      if (td.length) setSelected(td[0].id);
    }).finally(() => setLoading(false));
  }, []);

  const teamPlayers = players.filter(p => p.teamId === selected);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Naše Ekipe</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={s.tabs}>
            {teams.map(t => (
              <TouchableOpacity key={t.id} onPress={() => setSelected(t.id)}
                style={[s.tab, selected === t.id && s.tabActive]}>
                <Text style={[s.tabText, selected === t.id && s.tabTextActive]}>{t.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}

      <View style={s.grid}>
        {teamPlayers.map(p => (
          <View key={p.id} style={s.playerCard}>
            <View style={s.jersey}>
              <Text style={s.jerseyNum}>{p.jerseyNumber ?? '?'}</Text>
            </View>
            <Text style={s.playerName}>{p.firstName}{'\n'}{p.lastName}</Text>
            <Text style={s.playerPos}>{p.position ?? 'Igračica'}</Text>
          </View>
        ))}
        {!loading && teamPlayers.length === 0 && (
          <Text style={s.empty}>Nema igračica za ovu ekipu.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 20, paddingTop: 24 },
  headerTitle: { color: Colors.text, fontSize: 24, fontWeight: '800', marginBottom: 16 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8 },
  playerCard: { width: '30%', backgroundColor: Colors.card, borderRadius: 12, padding: 12, alignItems: 'center' },
  jersey: { width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  jerseyNum: { color: '#fff', fontSize: 20, fontWeight: '800' },
  playerName: { color: Colors.text, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 3 },
  playerPos: { color: Colors.textMuted, fontSize: 11, textAlign: 'center' },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, width: '100%', paddingHorizontal: 16 },
});
