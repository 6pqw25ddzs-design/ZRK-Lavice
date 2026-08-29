import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../constants/AppColors';
import { getPlayerProfile } from '../lib/api';

export default function IgracView({ id, onBack }: { id: string; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getPlayerProfile(id).then(d => { if (alive) setP(d); }).catch(() => {}).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  const trainings = (p?.attendance || []).filter((a: any) => a.event?.type === 'training').length;
  const matches = p?.matchesPlayed ?? (p?.attendance || []).filter((a: any) => a.event?.type === 'match').length;

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onBack} style={s.backBtn} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
          <Text style={s.backText}>Nazad</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : !p ? (
        <View style={s.center}><Text style={s.empty}>Igračica nije pronađena.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View style={s.top}>
            {p.photoUrl ? (
              <Image source={{ uri: p.photoUrl }} style={s.heroPhoto} contentFit="cover" contentPosition="top" transition={150} />
            ) : (
              <View style={s.jersey}><Text style={s.jerseyNum}>{p.jerseyNumber ?? (p.firstName?.[0] ?? '?')}</Text></View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.name}>{p.firstName} {p.lastName}</Text>
              <Text style={s.meta}>{p.position || 'Igračica'}{p.team?.name ? ` · ${p.team.name}` : ''}</Text>
            </View>
          </View>
          <View style={s.statsRow}>
            {[
              { label: 'Broj dresa', value: p.jerseyNumber ?? '—' },
              { label: 'Godište', value: p.birthDate ? new Date(p.birthDate).getFullYear() : '—' },
              p.team?.category === 'prva_liga'
                ? { label: 'Golova', value: p.goals ?? 0 }
                : { label: 'Treninga', value: trainings },
              { label: 'Utakmica', value: matches },
            ].map(st => (
              <View key={st.label} style={s.statCard}>
                <Text style={s.statNum}>{String(st.value)}</Text>
                <Text style={s.statLabel}>{st.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  heroPhoto: { width: 92, height: 115, borderRadius: 16, backgroundColor: '#ECECEC' },
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 12, paddingBottom: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: Colors.text, fontSize: 16, fontFamily: Fonts.bodyBold },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.textMuted, fontSize: 15, fontFamily: Fonts.body },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  jersey: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  jerseyNum: { color: '#fff', fontSize: 28, fontFamily: Fonts.heading },
  name: { color: Colors.text, fontSize: 24, fontFamily: Fonts.heading },
  meta: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.body, marginTop: 2 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16, alignItems: 'center' },
  statNum: { color: Colors.primary, fontSize: 24, fontFamily: Fonts.heading },
  statLabel: { color: Colors.textMuted, fontSize: 11, fontFamily: Fonts.body, marginTop: 2 },
});
