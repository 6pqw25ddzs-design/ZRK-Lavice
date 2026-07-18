import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/AppColors';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';

type Ev = {
  id: string; type: 'training' | 'match'; title: string; startsAt: string;
  location?: string; opponent?: string; isCancelled: boolean;
  myStatus?: 'yes' | 'no' | 'maybe' | null;
};
type Ann = {
  id: string; teamName: string; title: string; body: string;
  requiresAck: boolean; author: string; createdAt: string; readAt: string | null;
};

export default function MojeView({ onOpen }: { onOpen: (section: 'dosije' | 'razvoj') => void }) {
  const { user, children, activeChild, setActiveChildId, logout } = useAuth();
  const [events, setEvents] = useState<Ev[]>([]);
  const [anns, setAnns] = useState<Ann[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!activeChild) { setLoading(false); return; }
    try {
      const [evs, announcements] = await Promise.all([
        api.scheduleForTeam(activeChild.team.id),
        api.myAnnouncements(),
      ]);
      setEvents((evs || []).slice(0, 5));
      setAnns((announcements || []).slice(0, 10));
    } catch {} finally {
      setLoading(false); setRefreshing(false);
    }
  }, [activeChild?.id]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function respond(ev: Ev, status: 'yes' | 'no') {
    if (!activeChild) return;
    try {
      await api.setAvailability(ev.id, activeChild.id, status);
      setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, myStatus: status } : e));
    } catch (e: any) {
      Alert.alert('Greška', e?.message || 'Pokušajte ponovo');
    }
  }

  async function ack(a: Ann) {
    try {
      await api.markAnnouncementRead(a.id);
      setAnns(prev => prev.map(x => x.id === a.id ? { ...x, readAt: new Date().toISOString() } : x));
    } catch {}
  }

  if (loading) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}>

      <Text style={s.hello}>Zdravo, {user?.fullName?.split(' ')[0]} 👋</Text>

      {/* Selektor djeteta */}
      {children.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {children.map(k => (
            <TouchableOpacity key={k.id} onPress={() => setActiveChildId(k.id)}
              style={[s.chip, activeChild?.id === k.id && s.chipActive]}>
              <Text style={[s.chipText, activeChild?.id === k.id && s.chipTextActive]}>{k.firstName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Kartica djeteta */}
      {activeChild ? (
        <View style={s.childCard}>
          {activeChild.photoUrl ? (
            <Image source={{ uri: activeChild.photoUrl }} style={s.childPhoto} />
          ) : (
            <View style={[s.childPhoto, s.childPhotoEmpty]}>
              <Text style={s.childNum}>{activeChild.jerseyNumber ?? activeChild.firstName.charAt(0)}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={s.childName}>{activeChild.firstName} {activeChild.lastName}</Text>
            <Text style={s.childMeta}>{activeChild.team.name}{activeChild.position ? ` · ${activeChild.position}` : ''}</Text>
          </View>
        </View>
      ) : (
        <View style={s.childCard}><Text style={s.childMeta}>Nalog još nije povezan ni sa jednim djetetom.</Text></View>
      )}

      {/* Brzi linkovi */}
      <View style={s.quickRow}>
        <TouchableOpacity style={s.quick} onPress={() => onOpen('razvoj')} activeOpacity={0.8}>
          <Ionicons name="trending-up" size={20} color={Colors.primary} />
          <Text style={s.quickText}>Razvoj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.quick} onPress={() => onOpen('dosije')} activeOpacity={0.8}>
          <Ionicons name="folder-open" size={20} color={Colors.primary} />
          <Text style={s.quickText}>Dosije</Text>
        </TouchableOpacity>
      </View>

      {/* Termini sa potvrdom */}
      <Text style={s.sectionTitle}>Termini</Text>
      {events.length === 0 && <Text style={s.empty}>Nema zakazanih termina.</Text>}
      {events.map(ev => (
        <View key={ev.id} style={s.evCard}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.evTitle}>{ev.type === 'match' ? '🏆 ' : ''}{ev.title}</Text>
            <Text style={s.evMeta}>
              {new Date(ev.startsAt).toLocaleDateString('sr-Latn-ME', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              {ev.location ? ` · ${ev.location}` : ''}
            </Text>
          </View>
          <View style={s.evBtns}>
            <TouchableOpacity onPress={() => respond(ev, 'yes')}
              style={[s.evBtn, ev.myStatus === 'yes' && { backgroundColor: '#16a34a', borderColor: '#16a34a' }]}>
              <Ionicons name="checkmark" size={18} color={ev.myStatus === 'yes' ? '#fff' : '#16a34a'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => respond(ev, 'no')}
              style={[s.evBtn, ev.myStatus === 'no' && { backgroundColor: Colors.primary, borderColor: Colors.primary }]}>
              <Ionicons name="close" size={18} color={ev.myStatus === 'no' ? '#fff' : Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Objave */}
      <Text style={s.sectionTitle}>Objave trenera</Text>
      {anns.length === 0 && <Text style={s.empty}>Još nema objava za vašu ekipu.</Text>}
      {anns.map(a => (
        <View key={a.id} style={s.annCard}>
          <Text style={s.annTitle}>{a.title}</Text>
          <Text style={s.annMeta}>{a.teamName} · {a.author} · {new Date(a.createdAt).toLocaleDateString('sr-Latn-ME', { day: 'numeric', month: 'short' })}</Text>
          <Text style={s.annBody}>{a.body}</Text>
          {a.requiresAck && (
            a.readAt ? (
              <Text style={s.ackDone}>✓ Potvrđeno da ste pročitali</Text>
            ) : (
              <TouchableOpacity style={s.ackBtn} onPress={() => ack(a)}>
                <Text style={s.ackBtnText}>Pročitala/o sam</Text>
              </TouchableOpacity>
            )
          )}
        </View>
      ))}

      <TouchableOpacity
        onPress={() => {
          Alert.alert('Odjava', `Odjaviti nalog ${user?.email}?`, [
            { text: 'Otkaži', style: 'cancel' },
            { text: 'Odjavi se', style: 'destructive', onPress: () => logout() },
          ]);
        }}
        style={s.logout} activeOpacity={0.7} hitSlop={12}>
        <Ionicons name="log-out-outline" size={18} color={Colors.primary} />
        <Text style={s.logoutText}>Odjavi se ({user?.email})</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  hello: { color: Colors.text, fontSize: 22, fontFamily: Fonts.heading, marginBottom: 12 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 8,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.bodyBold },
  chipTextActive: { color: '#fff' },
  childCard: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, flexDirection: 'row',
    alignItems: 'center', gap: 14, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 2, marginBottom: 12,
  },
  childPhoto: { width: 56, height: 56, borderRadius: 28 },
  childPhotoEmpty: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  childNum: { color: '#fff', fontSize: 20, fontFamily: Fonts.heading },
  childName: { color: Colors.text, fontSize: 17, fontFamily: Fonts.heading },
  childMeta: { color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.body, marginTop: 1 },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  quick: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#F0F0F0',
  },
  quickText: { color: Colors.text, fontSize: 13, fontFamily: Fonts.bodyBold },
  sectionTitle: { color: Colors.text, fontSize: 16, fontFamily: Fonts.heading, marginBottom: 10, marginTop: 6 },
  empty: { color: Colors.textMuted, fontSize: 13.5, fontFamily: Fonts.body, marginBottom: 16 },
  evCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#F0F0F0',
  },
  evTitle: { color: Colors.text, fontSize: 14.5, fontFamily: Fonts.bodyBold },
  evMeta: { color: Colors.textMuted, fontSize: 12.5, fontFamily: Fonts.body, marginTop: 2 },
  evBtns: { flexDirection: 'row', gap: 6 },
  evBtn: {
    width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  annCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  annTitle: { color: Colors.text, fontSize: 15, fontFamily: Fonts.bodyBold },
  annMeta: { color: '#9a9a9a', fontSize: 11.5, fontFamily: Fonts.body, marginTop: 2 },
  annBody: { color: Colors.textMuted, fontSize: 13.5, fontFamily: Fonts.body, lineHeight: 19, marginTop: 8 },
  ackDone: { color: '#16a34a', fontSize: 12.5, fontFamily: Fonts.bodyBold, marginTop: 10 },
  ackBtn: {
    backgroundColor: 'rgba(200,16,46,0.08)', borderRadius: 999, paddingVertical: 8,
    alignItems: 'center', marginTop: 10,
  },
  ackBtnText: { color: Colors.primary, fontSize: 13, fontFamily: Fonts.bodyBold },
  logout: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    marginTop: 26, paddingVertical: 13, borderRadius: 999,
    borderWidth: 1, borderColor: 'rgba(200,16,46,0.35)', backgroundColor: '#FFFFFF',
  },
  logoutText: { color: Colors.primary, fontSize: 14, fontFamily: Fonts.bodyBold },
});
