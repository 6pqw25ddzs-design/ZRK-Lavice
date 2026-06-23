import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';
import { getNews } from '@/lib/api';

export default function VijestiScreen() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNews(20).then((r: any) => {
      setArticles(Array.isArray(r) ? r : r?.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Vijesti Kluba</Text>
      </View>

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}

      <View style={s.list}>
        {articles.map((a: any) => (
          <View key={a.id} style={s.card}>
            <View style={s.cardImg}>
              <Text style={s.cardEmoji}>🏐</Text>
            </View>
            <View style={s.cardContent}>
              <View style={s.tags}>
                {(a.tags || []).slice(0, 2).map((tag: string) => (
                  <View key={tag} style={s.tag}>
                    <Text style={s.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.cardTitle}>{a.title}</Text>
              <Text style={s.cardDate}>{new Date(a.publishedAt).toLocaleDateString('sr-ME')}</Text>
            </View>
          </View>
        ))}
        {!loading && articles.length === 0 && (
          <Text style={s.empty}>Nema objavljenih vijesti.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { padding: 20, paddingTop: 24 },
  headerTitle: { color: Colors.text, fontSize: 24, fontWeight: '800' },
  list: { paddingHorizontal: 16, gap: 12 },
  card: { backgroundColor: Colors.card, borderRadius: 14, overflow: 'hidden' },
  cardImg: { backgroundColor: Colors.primary + '20', height: 100, alignItems: 'center', justifyContent: 'center' },
  cardEmoji: { fontSize: 40 },
  cardContent: { padding: 14 },
  tags: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  tag: { backgroundColor: Colors.primary + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '700', marginBottom: 6, lineHeight: 20 },
  cardDate: { color: Colors.textMuted, fontSize: 12 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15 },
});
