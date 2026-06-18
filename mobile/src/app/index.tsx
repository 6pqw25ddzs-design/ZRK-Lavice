import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getSchedule, getNews } from '../lib/api';
import { format } from 'date-fns';
import { sr } from 'date-fns/locale';

const COLORS = { primary: '#C41230', gold: '#D4AC0D', dark: '#1A1A1A', gray: '#6b7280', lightGray: '#f4f4f4' };

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { data: events } = useQuery({ queryKey: ['schedule'], queryFn: () => getSchedule() });
  const { data: news } = useQuery({ queryKey: ['news'], queryFn: () => getNews(3) });

  const nextEvent = events?.[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Dobrodošla,</Text>
          <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'Gost'} 👋</Text>
        </View>
        <View style={styles.notifBadge}>
          <Text style={styles.notifText}>2</Text>
        </View>
      </View>

      {/* Next event card */}
      {nextEvent && (
        <View style={styles.nextEventCard}>
          <Text style={styles.nextEventLabel}>SLJEDEĆI TERMIN</Text>
          <Text style={styles.nextEventTitle}>{nextEvent.title}</Text>
          <Text style={styles.nextEventMeta}>
            📅 {format(new Date(nextEvent.startsAt), 'EEEE, d MMMM', { locale: sr })}
          </Text>
          <Text style={styles.nextEventMeta}>
            🕐 {format(new Date(nextEvent.startsAt), 'HH:mm')}
            {nextEvent.endsAt && ` – ${format(new Date(nextEvent.endsAt), 'HH:mm')}`}
          </Text>
          {nextEvent.location && (
            <Text style={styles.nextEventMeta}>📍 {nextEvent.location}</Text>
          )}
        </View>
      )}

      {/* News */}
      <Text style={styles.sectionTitle}>Vijesti</Text>
      {(news || []).map((article: { id: string; title: string; publishedAt: string }) => (
        <TouchableOpacity key={article.id} style={styles.newsCard}>
          <Text style={styles.newsTitle}>{article.title}</Text>
          <Text style={styles.newsDate}>
            {article.publishedAt ? format(new Date(article.publishedAt), 'd. MMM yyyy.', { locale: sr }) : ''}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Quick stats */}
      <View style={styles.statsRow}>
        {[
          { num: '47', label: 'Igračica' },
          { num: '3', label: 'Ekipe' },
          { num: '12', label: 'Utakmica' },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statNum}>{s.num}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 14, color: COLORS.gray },
  userName: { fontSize: 24, fontWeight: '800', color: COLORS.dark },
  notifBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  notifText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  nextEventCard: { backgroundColor: COLORS.primary, borderRadius: 16, padding: 20, marginBottom: 24 },
  nextEventLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '700', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  nextEventTitle: { fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 12 },
  nextEventMeta: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: COLORS.dark, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  newsCard: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 14, marginBottom: 10 },
  newsTitle: { fontSize: 14, fontWeight: '600', color: COLORS.dark, marginBottom: 6 },
  newsDate: { fontSize: 11, color: COLORS.gray },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
  statCard: { flex: 1, backgroundColor: COLORS.lightGray, borderRadius: 12, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.gray, marginTop: 4 },
});
