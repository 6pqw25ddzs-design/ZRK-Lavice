import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Dimensions, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../../constants/AppColors';
import { getNews, getResults } from '../../lib/api';
import VijestDetailView from '../../components/VijestDetailView';
import FadeInView from '../../components/FadeInView';

const { width: W, height: H } = Dimensions.get('window');
const SLIDE_W = W - 40;

// Hero fotografija — slavlje nakon gola
const HERO_IMG = 'https://zrklavice.me/hero.jpg';

const STATS = [
  { num: '47', label: 'Igračica', icon: 'people' as const },
  { num: '3', label: 'Ekipe', icon: 'shield-checkmark' as const },
  { num: '7', label: 'Trenera', icon: 'medal' as const },
  { num: '2026', label: 'Osnovano', icon: 'flag' as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const [news, setNews] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getNews(6).catch(() => []),
      getResults().catch(() => []),
    ]).then(([n, r]) => {
      setNews(Array.isArray(n) ? n : []);
      setResults(Array.isArray(r) ? r.slice(0, 3) : []);
    }).finally(() => setLoading(false));
  }, []);

  if (openSlug) {
    return <VijestDetailView slug={openSlug} onBack={() => setOpenSlug(null)} />;
  }

  const goUpis = () => router.push('/vise?open=upis' as any);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* HERO — emocionalni centar */}
      <ImageBackground source={{ uri: HERO_IMG }} style={s.hero} imageStyle={s.heroImg}>
        <LinearGradient
          colors={['rgba(26,26,26,0.25)', 'rgba(26,26,26,0.55)', 'rgba(26,26,26,0.94)']}
          locations={[0, 0.55, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.heroContent}>
          <FadeInView delay={80}>
            <View style={s.heroLabelRow}>
              <View style={s.heroLabelLine} />
              <Text style={s.heroSub}>PODGORICA, CRNA GORA</Text>
            </View>
          </FadeInView>
          <FadeInView delay={180}>
            <Text style={s.heroTitle}>
              Stvaramo nove{'\n'}<Text style={{ color: '#E8546F' }}>lavice.</Text>
            </Text>
          </FadeInView>
          <FadeInView delay={280}>
            <Text style={s.heroText}>
              Razvojni rukometni klub za djevojčice koji vode evropske šampionke i olimpijske medaljistkinje.
            </Text>
          </FadeInView>
          <FadeInView delay={380}>
            <View style={s.heroBtns}>
              <TouchableOpacity style={s.btnPrimary} activeOpacity={0.85} onPress={goUpis}>
                <Text style={s.btnPrimaryText}>Upiši dijete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.btnGhost} activeOpacity={0.85} onPress={goUpis}>
                <Text style={s.btnGhostText}>Probni trening</Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        </View>
      </ImageBackground>

      {/* STATISTIKA — premium horizontalne kartice */}
      <FadeInView delay={200}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.statsRow} style={{ marginTop: -34 }}>
          {STATS.map(st => (
            <View key={st.label} style={s.statCard}>
              <View style={s.statIcon}>
                <Ionicons name={st.icon} size={17} color={Colors.primary} />
              </View>
              <Text style={s.statNum}>{st.num}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </ScrollView>
      </FadeInView>

      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}

      {/* VIJESTI */}
      {news.length > 0 && (
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Vijesti</Text>
            <TouchableOpacity onPress={() => router.push('/vijesti' as any)} hitSlop={8}>
              <Text style={s.sectionLink}>Sve →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            snapToInterval={SLIDE_W + 14} decelerationRate="fast"
            onMomentumScrollEnd={e => setSlide(Math.round(e.nativeEvent.contentOffset.x / (SLIDE_W + 14)))}>
            {news.map((a: any) => (
              <TouchableOpacity key={a.id} activeOpacity={0.9}
                style={[s.slide, { width: SLIDE_W }]}
                onPress={() => setOpenSlug(a.slug)}>
                {a.coverUrl ? (
                  <Image source={{ uri: a.coverUrl }} style={s.slideImg} resizeMode="cover" />
                ) : (
                  <View style={[s.slideImg, { backgroundColor: '#2a0d14' }]} />
                )}
                <LinearGradient
                  colors={['transparent', 'rgba(10,10,10,0.55)', 'rgba(10,10,10,0.92)']}
                  locations={[0.3, 0.65, 1]}
                  style={StyleSheet.absoluteFill}
                />
                <View style={s.slideOverlay}>
                  {a.tags?.[0] && <View style={s.slideTag}><Text style={s.slideTagText}>{a.tags[0]}</Text></View>}
                  <Text style={s.slideTitle} numberOfLines={3}>{a.title}</Text>
                  <Text style={s.slideDate}>{new Date(a.publishedAt).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'long' })}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {news.length > 1 && (
            <View style={s.dots}>
              {news.map((_, i) => (
                <View key={i} style={[s.dot, i === slide && s.dotActive]} />
              ))}
            </View>
          )}
        </View>
      )}

      {/* REZULTATI */}
      {results.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Posljednji rezultati</Text>
          <View style={{ gap: 10, marginTop: 14 }}>
            {results.map((r: any) => (
              <View key={r.id} style={s.resultCard}>
                <View style={s.resultBar} />
                <View style={{ flex: 1 }}>
                  <Text style={s.resultTitle}>{r.event?.title}</Text>
                  {r.event?.team?.name && <Text style={s.resultMeta}>{r.event.team.name}</Text>}
                </View>
                <Text style={s.resultScore}>{r.homeScore} : {r.awayScore}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },

  hero: { width: W, height: Math.max(H * 0.44, 380), justifyContent: 'flex-end' },
  heroImg: { resizeMode: 'cover' },
  heroContent: { padding: 24, paddingBottom: 56 },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  heroLabelLine: { width: 22, height: 1.5, backgroundColor: Colors.gold, borderRadius: 1 },
  heroSub: { color: Colors.gold, fontSize: 11, fontFamily: Fonts.bodyBold, letterSpacing: 2.5 },
  heroTitle: { color: '#FFFFFF', fontSize: 40, fontFamily: Fonts.heading, lineHeight: 44, marginBottom: 12, letterSpacing: -0.5 },
  heroText: { color: 'rgba(255,255,255,0.82)', fontSize: 15, fontFamily: Fonts.body, lineHeight: 22, marginBottom: 24, maxWidth: 330 },
  heroBtns: { flexDirection: 'row', gap: 10 },
  btnPrimary: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 999 },
  btnPrimaryText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 15 },
  btnGhost: { paddingHorizontal: 22, paddingVertical: 14, borderRadius: 999, borderWidth: 1.2, borderColor: 'rgba(255,255,255,0.55)' },
  btnGhostText: { color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 15 },

  statsRow: { paddingHorizontal: 20, gap: 10 },
  statCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: 16, paddingHorizontal: 20,
    alignItems: 'center', minWidth: 108,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  statIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(196,18,48,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statNum: { color: Colors.text, fontSize: 22, fontFamily: Fonts.heading },
  statLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2, fontFamily: Fonts.body },

  section: { paddingHorizontal: 20, marginTop: 36 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { color: Colors.text, fontSize: 22, fontFamily: Fonts.heading, letterSpacing: -0.3 },
  sectionLink: { color: Colors.primary, fontSize: 14, fontFamily: Fonts.bodyBold },

  slide: { height: 230, borderRadius: 20, marginRight: 14, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#1A1A1A' },
  slideImg: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  slideOverlay: { padding: 18 },
  slideTag: { backgroundColor: Colors.primary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 10 },
  slideTagText: { color: '#fff', fontSize: 10, fontFamily: Fonts.bodyBold, textTransform: 'uppercase', letterSpacing: 0.5 },
  slideTitle: { color: '#fff', fontSize: 21, fontFamily: Fonts.heading, lineHeight: 27 },
  slideDate: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 8, fontFamily: Fonts.body },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.12)' },
  dotActive: { backgroundColor: Colors.primary, width: 20 },

  resultCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  resultBar: { width: 3.5, alignSelf: 'stretch', borderRadius: 2, backgroundColor: Colors.primary },
  resultTitle: { color: Colors.text, fontSize: 15, fontFamily: Fonts.bodyBold },
  resultMeta: { color: Colors.textMuted, fontSize: 12, fontFamily: Fonts.body, marginTop: 2 },
  resultScore: { color: Colors.primary, fontSize: 22, fontFamily: Fonts.heading },
});
