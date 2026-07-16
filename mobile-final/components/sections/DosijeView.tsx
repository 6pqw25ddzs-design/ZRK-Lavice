import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';

const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
const CONSENT_LABELS: Record<string, string> = { media: 'Media saglasnost', data: 'Obrada podataka', travel: 'Putovanja' };

export default function DosijeView() {
  const { activeChild } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeChild) { setLoading(false); return; }
    setLoading(true);
    api.dossier(activeChild.id).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [activeChild?.id]);

  if (loading) return <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />;
  if (!data || !activeChild) return <Text style={s.empty}>Nema podataka.</Text>;

  const now = new Date();
  const docsForType = (typeId: string) => (data.documents || []).filter((d: any) => d.typeId === typeId);
  const hasConsent = (type: string) => (data.consents || []).some((c: any) => c.type === type);

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={s.header}>{activeChild.firstName} {activeChild.lastName}</Text>

      <Text style={s.sectionTitle}>📄 Dokumenti</Text>
      <View style={s.card}>
        {(data.types || []).map((t: any) => {
          const latest = docsForType(t.id)[0];
          const expired = latest?.expiresAt && new Date(latest.expiresAt) < now;
          return (
            <View key={t.id} style={s.row}>
              <Text style={s.rowIcon}>{latest ? (expired ? '🔴' : '🟢') : t.isRequired ? '🟡' : '⚪'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.rowTitle}>{t.name}</Text>
                <Text style={s.rowMeta}>
                  {latest
                    ? latest.expiresAt
                      ? `${expired ? 'Istekao' : 'Važi do'} ${new Date(latest.expiresAt).toLocaleDateString('sr-Latn-ME')}`
                      : `Predat ${new Date(latest.issuedAt).toLocaleDateString('sr-Latn-ME')}`
                    : t.isRequired ? 'Obavezan — još nije predat klubu' : 'Nije predat (opciono)'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={s.sectionTitle}>✍️ Saglasnosti</Text>
      <View style={s.card}>
        {(['media', 'data', 'travel'] as const).map(type => (
          <View key={type} style={s.row}>
            <Text style={s.rowIcon}>{hasConsent(type) ? '🟢' : '⚪'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>{CONSENT_LABELS[type]}</Text>
              <Text style={s.rowMeta}>{hasConsent(type) ? 'Potpisana' : 'Nije potpisana — javite se klubu'}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={s.sectionTitle}>💶 Članarina</Text>
      <View style={s.card}>
        {(data.fees || []).length === 0 && <Text style={s.rowMeta}>Još nema zaduženja.</Text>}
        {(data.fees || []).map((f: any) => (
          <View key={f.id} style={s.row}>
            <Text style={s.rowIcon}>{f.status === 'paid' ? '🟢' : f.status === 'waived' ? '⚪' : '🔴'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>{MONTHS[f.month - 1]} {f.year}. — {f.amountEur}€</Text>
              <Text style={s.rowMeta}>
                {f.status === 'paid' ? `Plaćeno${f.paidAt ? ' ' + new Date(f.paidAt).toLocaleDateString('sr-Latn-ME') : ''}` : f.status === 'waived' ? 'Oslobođena' : 'Nije plaćeno'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {(data.medical?.notes || data.medical?.coachNote || (data.contacts || []).length > 0) && (
        <>
          <Text style={s.sectionTitle}>🏥 Zdravlje i hitni kontakti</Text>
          <View style={s.card}>
            {data.medical?.coachNote && <Text style={s.rowTitle}>Vidljivo treneru: {data.medical.coachNote}</Text>}
            {data.medical?.notes && <Text style={[s.rowMeta, { marginTop: 4 }]}>{data.medical.notes}</Text>}
            {(data.contacts || []).map((c: any) => (
              <Text key={c.id} style={[s.rowMeta, { marginTop: 6 }]}>☎️ {c.name} ({c.relation || 'kontakt'}) — {c.phone}</Text>
            ))}
          </View>
        </>
      )}

      <Text style={s.note}>Izmjene podataka (dokumenti, zdravlje, kontakti) za sada idu preko kluba — uskoro i direktno iz aplikacije.</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { color: Colors.text, fontSize: 20, fontFamily: Fonts.heading, marginBottom: 6 },
  sectionTitle: { color: Colors.text, fontSize: 15, fontFamily: Fonts.heading, marginTop: 16, marginBottom: 8 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center', paddingVertical: 7 },
  rowIcon: { fontSize: 14 },
  rowTitle: { color: Colors.text, fontSize: 14, fontFamily: Fonts.bodyBold },
  rowMeta: { color: Colors.textMuted, fontSize: 12.5, fontFamily: Fonts.body, marginTop: 1 },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 60, fontFamily: Fonts.body },
  note: { color: '#9a9a9a', fontSize: 12, fontFamily: Fonts.body, marginTop: 20, textAlign: 'center', lineHeight: 18 },
});
