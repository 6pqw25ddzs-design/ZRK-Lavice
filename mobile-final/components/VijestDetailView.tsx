import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../constants/AppColors';
import { getNewsBySlug } from '../lib/api';

export default function VijestDetailView({ slug, onBack }: { slug: string; onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getNewsBySlug(slug)
      .then(a => { if (alive) setArticle(a); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [slug]);

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
      ) : !article ? (
        <View style={s.center}><Text style={s.empty}>Vijest nije pronađena.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {!!article.coverUrl && (
            <Image source={{ uri: article.coverUrl }} style={s.cover} resizeMode="cover" />
          )}
          <View style={{ padding: 20 }}>
            <View style={s.tags}>
              {(article.tags || []).map((tag: string) => (
                <View key={tag} style={s.tag}><Text style={s.tagText}>{tag}</Text></View>
              ))}
            </View>
            <Text style={s.title}>{article.title}</Text>
            <Text style={s.date}>{new Date(article.publishedAt).toLocaleDateString('sr-Latn-ME')}</Text>
            {!!article.body && <Text style={s.body}>{article.body}</Text>}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingTop: 12, paddingBottom: 4 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: Colors.text, fontSize: 16, fontFamily: Fonts.bodyBold },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 240, backgroundColor: Colors.card },
  tags: { flexDirection: 'row', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  tag: { backgroundColor: Colors.primary + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { color: Colors.primary, fontSize: 11, fontFamily: Fonts.bodyBold },
  title: { color: Colors.text, fontSize: 24, fontFamily: Fonts.heading, lineHeight: 30, marginBottom: 8 },
  date: { color: Colors.textMuted, fontSize: 13, marginBottom: 20, fontFamily: Fonts.body },
  body: { color: Colors.text, fontSize: 16, lineHeight: 26, fontFamily: Fonts.body },
  empty: { color: Colors.textMuted, fontSize: 15, fontFamily: Fonts.body },
});
