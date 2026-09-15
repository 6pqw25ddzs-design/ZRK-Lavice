import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../constants/AppColors';
import { getPlayerProfile } from '../lib/api';

const TEAM_COLORS: Record<string, string> = { prva_liga: '#C41230', pioniri: '#2563EB', mini: '#0D9488' };
const TEAM_LABELS: Record<string, string> = { prva_liga: 'PRVI TIM', pioniri: 'PIONIRKE', mini: 'MINI RUKOMET' };
const GOLD = '#D4AC0D';

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
  const tc = TEAM_COLORS[p?.team?.category] || '#8a8a8a';
  const isFirst = p?.team?.category === 'prva_liga';
  const isKeeper = (p?.saves ?? 0) + (p?.conceded ?? 0) > 0;

  const stats = !p ? [] : isFirst && isKeeper
    ? [
        { label: 'ODBRANA', value: p.saves ?? 0 },
        { label: 'SAVE %', value: `${p.savePct ?? 0}%` },
        { label: 'UTAKMICA', value: matches },
        { label: 'GODIŠTE', value: p.birthDate ? new Date(p.birthDate).getFullYear() : '—' },
      ]
    : [
        isFirst ? { label: 'GOLOVA', value: p.goals ?? 0 } : { label: 'TRENINGA', value: trainings },
        { label: 'UTAKMICA', value: matches },
        { label: 'BROJ DRESA', value: p.jerseyNumber ?? '—' },
        { label: 'GODIŠTE', value: p.birthDate ? new Date(p.birthDate).getFullYear() : '—' },
      ];

  return (
    <View style={s.container}>
      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : !p ? (
        <View style={s.center}><Text style={s.empty}>Igračica nije pronađena.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* ARENA HERO */}
          <LinearGradient colors={[tc + '55', tc + '22', '#141414']} start={{ x: 0.85, y: 0 }} end={{ x: 0.2, y: 1 }}
            style={[s.heroWrap, { paddingTop: insets.top + 8 }]}>
            {p.jerseyNumber != null && (
              <Text style={s.bgNumber}>{p.jerseyNumber}</Text>
            )}
            <TouchableOpacity onPress={onBack} style={s.backBtn} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
              <Text style={s.backText}>Nazad</Text>
            </TouchableOpacity>

            <View style={s.heroRow}>
              {p.photoUrl ? (
                <Image source={{ uri: p.photoUrl }} style={s.heroPhoto} contentFit="cover" contentPosition="top" transition={150} />
              ) : (
                <View style={[s.heroPhoto, s.photoEmpty]}>
                  <View style={[s.jersey, { backgroundColor: tc }]}>
                    <Text style={s.jerseyNum}>{p.jerseyNumber ?? (p.firstName?.[0] ?? '?')}</Text>
                  </View>
                </View>
              )}
              <View style={{ flex: 1, paddingBottom: 4 }}>
                <View style={s.badgeRow}>
                  {p.jerseyNumber != null && <Text style={s.goldNum}>{p.jerseyNumber}</Text>}
                  <View style={[s.badge, { backgroundColor: tc }]}>
                    <Text style={s.badgeText}>{(p.position || 'IGRAČICA').toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={s.nameFirst}>{(p.firstName || '').toUpperCase()}</Text>
                <Text style={[s.nameLast, { color: tc === '#8a8a8a' ? '#fff' : tc }]}>{(p.lastName || '').toUpperCase()}</Text>
                <View style={[s.teamBadge, { borderColor: tc + '88' }]}>
                  <Text style={[s.teamBadgeText, { color: tc }]}>{TEAM_LABELS[p.team?.category] || p.team?.name || ''}</Text>
                </View>
              </View>
            </View>
            <LinearGradient colors={['transparent', GOLD, tc, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.goldLine} />
          </LinearGradient>

          {/* STATISTIKA */}
          <View style={s.statsRow}>
            {stats.map(st => (
              <View key={st.label} style={s.statCard}>
                <View style={[s.statAccent, { backgroundColor: tc }]} />
                <Text style={[s.statNum, { color: tc === '#8a8a8a' ? Colors.text : tc }]}>{String(st.value)}</Text>
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
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.textMuted, fontSize: 15, fontFamily: Fonts.body },

  heroWrap: { paddingHorizontal: 20, paddingBottom: 0, overflow: 'hidden' },
  bgNumber: { position: 'absolute', right: -14, top: 30, fontSize: 260, lineHeight: 260, fontFamily: Fonts.heading, color: 'rgba(212,172,13,0.10)' },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backText: { color: '#fff', fontSize: 15, fontFamily: Fonts.bodyBold },

  heroRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  heroPhoto: { width: 150, height: 188, borderTopLeftRadius: 20, borderTopRightRadius: 20, backgroundColor: '#2a2a2a' },
  photoEmpty: { alignItems: 'center', justifyContent: 'center' },
  jersey: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  jerseyNum: { color: '#fff', fontSize: 26, fontFamily: Fonts.heading },

  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  goldNum: { color: GOLD, fontSize: 34, fontFamily: Fonts.heading, lineHeight: 36 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { color: '#fff', fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 1.5 },
  nameFirst: { color: 'rgba(255,255,255,0.85)', fontSize: 30, fontFamily: Fonts.heading, lineHeight: 32, letterSpacing: -0.5 },
  nameLast: { fontSize: 30, fontFamily: Fonts.heading, lineHeight: 34, letterSpacing: -0.5 },
  teamBadge: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 10 },
  teamBadgeText: { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 2 },
  goldLine: { height: 3, marginHorizontal: -20, marginTop: 0 },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 20 },
  statCard: { width: '47.5%', flexGrow: 1, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 18, alignItems: 'center', overflow: 'hidden' },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  statNum: { fontSize: 30, fontFamily: Fonts.heading },
  statLabel: { color: Colors.textMuted, fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 1.5, marginTop: 4 },
});
