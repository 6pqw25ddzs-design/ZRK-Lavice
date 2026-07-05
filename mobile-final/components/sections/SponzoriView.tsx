import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';
import { getSponsors } from '../../lib/api';

const LEVELS = [
  { value: 'gold', label: 'Generalni sponzori' },
  { value: 'silver', label: 'Sponzori' },
  { value: 'bronze', label: 'Partneri' },
];

export default function SponzoriScreen() {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSponsors().then(r => setSponsors(Array.isArray(r) ? r : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}
      {!loading && sponsors.length === 0 && <Text style={s.empty}>Uskoro objavljujemo naše sponzore.</Text>}
      {LEVELS.map(level => {
        const group = sponsors.filter(sp => sp.level === level.value);
        if (group.length === 0) return null;
        return (
          <View key={level.value} style={{ marginBottom: 24 }}>
            <Text style={s.level}>{level.label}</Text>
            <View style={s.grid}>
              {group.map(sp => (
                <View key={sp.id} style={s.card}>
                  {sp.logoUrl
                    ? <Image source={{ uri: sp.logoUrl }} style={s.logo} resizeMode="contain" />
                    : <Text style={s.name}>{sp.name}</Text>}
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontFamily: Fonts.body },
  level: { color: Colors.text, fontSize: 16, fontFamily: Fonts.headingBold, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47%', height: 90, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, alignItems: 'center', justifyContent: 'center', padding: 12 },
  logo: { width: '100%', height: '100%' },
  name: { color: Colors.text, fontFamily: Fonts.bodyBold, textAlign: 'center' },
});
