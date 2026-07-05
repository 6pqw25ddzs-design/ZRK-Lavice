import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';

const REASONS = [
  { icon: '🏐', title: 'Oprema', desc: 'Lopte, dresovi, štitnici i ostala oprema za treninge i utakmice.' },
  { icon: '🚌', title: 'Takmičenja', desc: 'Prevoz i smještaj za djevojčice koje nastupaju širom Crne Gore.' },
  { icon: '🏟️', title: 'Dvorane', desc: 'Iznajmljivanje prostora za treninge i razvoj kluba.' },
];

const PAYMENT = [
  { label: 'Naziv primaoca', value: 'ŽRK Lavice' },
  { label: 'IBAN', value: 'Uskoro dostupno' },
  { label: 'BIC / SWIFT', value: 'Uskoro dostupno' },
  { label: 'Banka', value: 'Uskoro dostupno' },
  { label: 'Svrha uplate', value: 'Donacija — ŽRK Lavice' },
];

export default function PodrziView() {
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={s.intro}>
        Svaka uplata direktno pomaže razvoju mladih rukometašica u Podgorici — od opreme i dvorana do putnih troškova na takmičenjima.
      </Text>

      {REASONS.map(r => (
        <View key={r.title} style={s.reason}>
          <Text style={s.icon}>{r.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.rTitle}>{r.title}</Text>
            <Text style={s.rDesc}>{r.desc}</Text>
          </View>
        </View>
      ))}

      <View style={s.payCard}>
        <Text style={s.payTitle}>Podaci za uplatu</Text>
        {PAYMENT.map(p => (
          <View key={p.label} style={s.payRow}>
            <Text style={s.payLabel}>{p.label}</Text>
            <Text style={[s.payValue, p.value === 'Uskoro dostupno' && s.payMuted]}>{p.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.btn} onPress={() => Linking.openURL('mailto:info@zrklavice.me')}>
        <Text style={s.btnText}>Kontaktiraj za sponzorstvo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  intro: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.body, lineHeight: 21, marginBottom: 18 },
  reason: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { fontSize: 26 },
  rTitle: { color: Colors.text, fontSize: 15, fontFamily: Fonts.bodyBold },
  rDesc: { color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.body, marginTop: 2, lineHeight: 18 },
  payCard: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 18, marginTop: 12, marginBottom: 16 },
  payTitle: { color: Colors.text, fontSize: 18, fontFamily: Fonts.heading, marginBottom: 12 },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  payLabel: { color: Colors.textMuted, fontSize: 13, fontFamily: Fonts.body },
  payValue: { color: Colors.text, fontSize: 14, fontFamily: Fonts.bodyBold },
  payMuted: { color: Colors.textMuted, fontStyle: 'italic', fontSize: 13 },
  btn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontFamily: Fonts.bodyBold },
});
