import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/AppColors';
import { getSettings } from '../../lib/api';

export default function KontaktScreen() {
  const [s2, setS2] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then(d => setS2(d || {})).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const email = s2.contact_email || 'info@zrklavice.me';
  const phone = s2.contact_phone || '+382 67 000 000';
  const location = s2.contact_location || 'SC Morača';
  const address = s2.contact_address || 'Ulica Moskovska bb, Podgorica';
  const training = s2.contact_training || 'Utorak, četvrtak i petak — po rasporedu ekipa.';

  if (loading) return <View style={s.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}>
      <View style={s.card}>
        <Text style={s.label}>LOKACIJA</Text>
        <Text style={s.value}>{location}</Text>
        <Text style={s.sub}>{address}</Text>
      </View>
      <View style={s.card}>
        <Text style={s.label}>TRENINZI</Text>
        <Text style={s.sub}>{training}</Text>
      </View>
      <TouchableOpacity style={s.card} onPress={() => Linking.openURL(`mailto:${email}`)}>
        <Text style={s.label}>EMAIL</Text>
        <View style={s.linkRow}>
          <Ionicons name="mail" size={18} color={Colors.primary} />
          <Text style={s.value}>{email}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={s.card} onPress={() => Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`)}>
        <Text style={s.label}>TELEFON</Text>
        <View style={s.linkRow}>
          <Ionicons name="call" size={18} color={Colors.primary} />
          <Text style={s.value}>{phone}</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 16 },
  label: { color: Colors.primary, fontSize: 11, fontFamily: Fonts.bodyBold, letterSpacing: 1, marginBottom: 6 },
  value: { color: Colors.text, fontSize: 15, fontFamily: Fonts.bodyBold },
  sub: { color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.body, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
