import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/AppColors';
import { getPublicDocuments } from '../../lib/api';

export default function DokumentiView() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicDocuments().then(d => setDocs(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const groups: Record<string, any[]> = {};
  for (const d of docs) (groups[d.category || 'Ostalo'] ||= []).push(d);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}
      {!loading && docs.length === 0 && <Text style={s.empty}>Trenutno nema dostupnih dokumenata.</Text>}
      {Object.entries(groups).map(([cat, items]) => (
        <View key={cat} style={{ marginBottom: 20 }}>
          <Text style={s.cat}>{cat}</Text>
          {items.map(d => (
            <TouchableOpacity key={d.id} style={s.row} activeOpacity={0.7} onPress={() => Linking.openURL(d.fileUrl)}>
              <Ionicons name="document-text" size={22} color={Colors.primary} />
              <Text style={s.title}>{d.title}</Text>
              <Ionicons name="download" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontSize: 15, fontFamily: Fonts.body },
  cat: { color: Colors.text, fontSize: 16, fontFamily: Fonts.headingBold, marginBottom: 10 },
  row: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { color: Colors.text, fontSize: 14, fontFamily: Fonts.bodyBold, flex: 1 },
});
