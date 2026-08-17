import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/AppColors';
import { getTeams, getPlayers } from '../../lib/api';
import IgracView from '../../components/IgracView';

export default function EkipeScreen() {
  const insets = useSafeAreaInsets();
  const [teams, setTeams] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openPlayer, setOpenPlayer] = useState<string | null>(null);

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

  if (openPlayer) {
    return <IgracView id={openPlayer} onBack={() => setOpenPlayer(null)} />;
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={[s.header, { paddingTop: insets.top + 14 }]}>
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
          <TouchableOpacity key={p.id} style={s.playerCard} activeOpacity={0.8} onPress={() => setOpenPlayer(p.id)}>
            {p.photoUrl ? (
              <Image source={{ uri: p.photoUrl }} style={s.photo} contentFit="cover" contentPosition="top" transition={150} />
            ) : (
              <View style={[s.photo, s.photoEmpty]}>
                <View style={s.jersey}><Text style={s.jerseyNum}>{p.jerseyNumber ?? '?'}</Text></View>
              </View>
            )}
            <View style={s.cardBody}>
              <Text style={s.playerName}>{p.firstName} {p.lastName}</Text>
              <Text style={s.playerPos}>
                {[p.position ?? 'Igračica', p.birthDate ? String(new Date(p.birthDate).getFullYear()) : null].filter(Boolean).join(' · ')}
              </Text>
            </View>
          </TouchableOpacity>
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
  headerTitle: { color: Colors.text, fontSize: 24, fontFamily: Fonts.heading, marginBottom: 16 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.bodyBold },
  tabTextActive: { color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10 },
  playerCard: { width: '47.8%', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 4 / 5 },
  photoEmpty: { backgroundColor: '#ECECEC', alignItems: 'center', justifyContent: 'center' },
  jersey: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  jerseyNum: { color: '#fff', fontSize: 22, fontFamily: Fonts.heading },
  cardBody: { padding: 10, alignItems: 'center' },
  playerName: { color: Colors.text, fontSize: 13.5, fontFamily: Fonts.bodyBold, textAlign: 'center', marginBottom: 2 },
  playerPos: { color: Colors.textMuted, fontSize: 11.5, textAlign: 'center' },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, width: '100%', paddingHorizontal: 16 },
});
