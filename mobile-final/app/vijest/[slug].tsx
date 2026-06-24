import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/AppColors';
import { getNewsBySlug } from '../../lib/api';

export default function VijestDetalj() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getNewsBySlug(String(slug))
      .then(setArticle)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={s.center}>
        <Text style={s.empty}>Vijest nije pronađena.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={s.tags}>
        {(article.tags || []).map((tag: string) => (
          <View key={tag} style={s.tag}>
            <Text style={s.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <Text style={s.title}>{article.title}</Text>
      <Text style={s.date}>{new Date(article.publishedAt).toLocaleDateString('sr-Latn-ME')}</Text>
      {!!article.body && <Text style={s.body}>{article.body}</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  tags: { flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  tag: { backgroundColor: Colors.primary + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  title: { color: Colors.text, fontSize: 24, fontWeight: '800', lineHeight: 30, marginBottom: 8 },
  date: { color: Colors.textMuted, fontSize: 13, marginBottom: 20 },
  body: { color: Colors.text, fontSize: 16, lineHeight: 26 },
  empty: { color: Colors.textMuted, fontSize: 15 },
});
