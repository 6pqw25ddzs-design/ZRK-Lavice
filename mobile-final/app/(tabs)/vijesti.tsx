import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/AppColors';
import { getNews } from '../../lib/api';
import VijestDetailView from '../../components/VijestDetailView';

export default function VijestiScreen() {
  const insets = useSafeAreaInsets();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    getNews(20).then((r: any) => {
      setArticles(Array.isArray(r) ? r : r?.data ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (openSlug) {
    return <VijestDetailView slug={openSlug} onBack={() => setOpenSlug(null)} />;
  }

  const [featured, ...rest] = articles;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={[s.header, { paddingTop: insets.top + 14 }]}>
        <Text style={s.headerTitle}>Vijesti</Text>
        <Text style={s.headerSub}>Sve iz svijeta ŽRK Lavice</Text>
      </View>

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}

      {/* FEATURED — hero vijest */}
      {featured && (
        <TouchableOpacity activeOpacity={0.92} style={s.hero} onPress={() => setOpenSlug(featured.slug)}>
          {featured.coverUrl ? (
            <Image source={{ uri: featured.coverUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#2a0d14' }]} />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(8,8,8,0.5)', 'rgba(8,8,8,0.95)']}
            locations={[0.25, 0.6, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={s.heroBody}>
            <View style={s.heroTag}><Text style={s.heroTagText}>NAJNOVIJE</Text></View>
            <Text style={s.heroTitle} numberOfLines={4}>{featured.title}</Text>
            <Text style={s.heroDate}>
              {new Date(featured.publishedAt).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* OSTALE — editorial redovi */}
      <View style={s.list}>
        {rest.map((a: any, i: number) => (
          <TouchableOpacity key={a.id} activeOpacity={0.7}
            style={[s.row, i < rest.length - 1 && s.rowBorder]}
            onPress={() => setOpenSlug(a.slug)}>
            <View style={{ flex: 1, paddingRight: 14 }}>
              {a.tags?.[0] && <Text style={s.rowTag}>{String(a.tags[0]).toUpperCase()}</Text>}
              <Text style={s.rowTitle} numberOfLines={3}>{a.title}</Text>
              <Text style={s.rowDate}>{new Date(a.publishedAt).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'long' })}</Text>
            </View>
            {a.coverUrl ? (
              <Image source={{ uri: a.coverUrl }} style={s.rowImg} resizeMode="cover" />
            ) : (
              <View style={[s.rowImg, s.rowImgEmpty]}><Text style={{ fontSize: 22 }}>🦁</Text></View>
            )}
          </TouchableOpacity>
        ))}
        {!loading && articles.length === 0 && (
          <Text style={s.empty}>Nema objavljenih vijesti.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 18 },
  headerTitle: { color: Colors.text, fontSize: 30, fontFamily: Fonts.heading, letterSpacing: -0.5 },
  headerSub: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.body, marginTop: 4 },

  hero: { marginHorizontal: 20, height: 340, borderRadius: 22, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#1A1A1A' },
  heroBody: { padding: 20 },
  heroTag: { backgroundColor: Colors.primary, alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999, marginBottom: 12 },
  heroTagText: { color: '#fff', fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 1.2 },
  heroTitle: { color: '#fff', fontSize: 25, fontFamily: Fonts.heading, lineHeight: 31 },
  heroDate: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: Fonts.body, marginTop: 10 },

  list: { paddingHorizontal: 20, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F2F2' },
  rowTag: { color: Colors.primary, fontSize: 10.5, fontFamily: Fonts.bodyBold, letterSpacing: 1, marginBottom: 5 },
  rowTitle: { color: Colors.text, fontSize: 16.5, fontFamily: Fonts.headingBold, lineHeight: 22 },
  rowDate: { color: '#9a9a9a', fontSize: 12, fontFamily: Fonts.body, marginTop: 6 },
  rowImg: { width: 92, height: 92, borderRadius: 16 },
  rowImgEmpty: { backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontFamily: Fonts.body },
});
