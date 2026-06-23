import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/AppColors';
import { getNews, getResults } from '../../lib/api';

export default function HomeScreen() {
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getNews(3).catch(() => []),
      getResults().catch(() => []),
    ]).then(([n, r]) => {
      setNews(Array.isArray(n) ? n : []);
      setResults(Array.isArray(r) ? r.slice(0, 3) : []);
    }).finally(() => setLoading(false));
  }, []);

  const stats = [
    { num: '47', label: 'Igracica' },
    { num: '3', label: 'Ekipe' },
    { num: '7', label: 'Trenera' },
    { num: '2026', label: 'Osnovano' },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={s.hero}>
        <Text style={s.heroSub}>PODGORICA, CRNA GORA</Text>
        <Text style={s.heroTitle}>Razvijamo sampionke buducnosti</Text>
        <TouchableOpacity style={s.btn} onPress={() => router.push('/ekipe')}>
          <Text style={s.btnText}>Nase ekipe</Text>
        </TouchableOpacity>
      </View>
      <View style={s.statsRow}>
        {stats.map(st => (
          <View key={st.label} style={s.statCard}>
            <Text style={s.statNum}>{st.num}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 32 }} />}
      {results.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Posljednji rezultati</Text>
          {results.map((r: any) => (
            <View key={r.id} style={s.resultCard}>
              <Text style={s.resultTitle}>{r.event?.title}</Text>
              <Text style={s.resultScore}>{r.homeScore} : {r.awayScore}</Text>
            </View>
          ))}
        </View>
      )}
      {news.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Vijesti</Text>
          {news.map((a: any) => (
            <View key={a.id} style={s.newsCard}>
              <Text style={s.newsTitle}>{a.title}</Text>
              <Text style={s.newsDate}>{new Date(a.publishedAt).toLocaleDateString('sr-Latn-ME')}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  hero: { backgroundColor: Colors.dark, padding: 24, paddingTop: 48 },
  heroSub: { color: Colors.gold, fontSize: 11, fontWeight: '600', letterSpacing: 1.5, marginBottom: 8 },
  heroTitle: { color: Colors.text, fontSize: 28, fontWeight: '800', lineHeight: 36, marginBottom: 20 },
  btn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, alignSelf: 'flex-start' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  statsRow: { flexDirection: 'row', padding: 16, gap: 8 },
  statCard: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, padding: 12, alignItems: 'center' },
  statNum: { color: Colors.primary, fontSize: 22, fontWeight: '800' },
  statLabel: { color: Colors.textMuted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { color: Colors.text, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  resultCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultTitle: { color: Colors.text, fontSize: 13, flex: 1 },
  resultScore: { color: Colors.primary, fontSize: 20, fontWeight: '800' },
  newsCard: { backgroundColor: Colors.card, borderRadius: 12, padding: 14, marginBottom: 8 },
  newsTitle: { color: Colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  newsDate: { color: Colors.textMuted, fontSize: 12 },
});
