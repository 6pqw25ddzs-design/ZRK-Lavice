import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';
import { getTreneri } from '../../lib/api';

export default function TreneriView() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTreneri().then(r => setRows(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}
      {!loading && rows.length === 0 && <Text style={s.empty}>Uskoro predstavljamo stručni tim.</Text>}
      {rows.map(t => (
        <View key={t.id} style={s.card}>
          <View style={s.top}>
            {t.photoUrl ? (
              <Image source={{ uri: t.photoUrl }} style={s.photo} />
            ) : (
              <View style={[s.photo, s.photoEmpty]}>
                <Text style={s.initial}>{t.fullName?.charAt(0)}</Text>
              </View>
            )}
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.name}>{t.fullName}</Text>
              <Text style={s.role}>{t.role}</Text>
              {!!t.category && (
                <View style={s.catBadge}><Text style={s.catText}>{t.category}</Text></View>
              )}
            </View>
          </View>
          {!!t.bio && <Text style={s.bio}>{t.bio}</Text>}
          {!!t.licenseNo && <Text style={s.license}>Licenca: {t.licenseNo}</Text>}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontFamily: Fonts.body },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 18, marginBottom: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  photo: { width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: Colors.primary },
  photoEmpty: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 0 },
  initial: { color: '#fff', fontSize: 24, fontFamily: Fonts.heading },
  name: { color: Colors.text, fontSize: 17, fontFamily: Fonts.heading },
  role: { color: Colors.primary, fontSize: 13, fontFamily: Fonts.bodyBold, marginTop: 1 },
  catBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(212,172,13,0.13)', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, marginTop: 5 },
  catText: { color: '#A8860B', fontSize: 10.5, fontFamily: Fonts.bodyBold },
  bio: { color: Colors.textMuted, fontSize: 13.5, fontFamily: Fonts.body, lineHeight: 20, marginTop: 12 },
  license: { color: '#9a9a9a', fontSize: 11.5, fontFamily: Fonts.body, marginTop: 10 },
});
