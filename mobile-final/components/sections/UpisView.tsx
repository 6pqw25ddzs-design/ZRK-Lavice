import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';
import { submitRegistration } from '../../lib/api';

export default function UpisView() {
  const [form, setForm] = useState({ childName: '', birthYear: '', parentName: '', parentPhone: '', parentEmail: '' });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    const year = Number(form.birthYear);
    if (!form.childName || !form.parentName || !form.parentPhone || !form.parentEmail) { setError('Popunite sva polja.'); return; }
    if (!year || year < 2010 || year > 2020) { setError('Godište mora biti između 2010 i 2020.'); return; }
    setSaving(true); setError('');
    try {
      await submitRegistration({ ...form, birthYear: year });
      setDone(true);
    } catch (e: any) {
      setError('Greška pri slanju: ' + (e?.message || ''));
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <View style={s.center}>
        <Text style={s.doneTitle}>Hvala!</Text>
        <Text style={s.doneText}>Registracija je primljena. Kontaktiraćemo vas uskoro.</Text>
      </View>
    );
  }

  const field = (key: keyof typeof form, label: string, opts: any = {}) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        value={form[key]} onChangeText={t => setForm(f => ({ ...f, [key]: t }))}
        placeholderTextColor={Colors.textMuted} style={s.input} {...opts} />
    </View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={s.intro}>Prijavi dijete za upis. Popunite podatke pa ćemo vas kontaktirati.</Text>
      {field('childName', 'Ime i prezime djeteta')}
      {field('birthYear', 'Godište (2010–2020)', { keyboardType: 'number-pad', maxLength: 4 })}
      {field('parentName', 'Ime i prezime roditelja')}
      {field('parentPhone', 'Telefon roditelja', { keyboardType: 'phone-pad' })}
      {field('parentEmail', 'Email roditelja', { keyboardType: 'email-address', autoCapitalize: 'none' })}
      {!!error && <Text style={s.error}>{error}</Text>}
      <TouchableOpacity style={[s.btn, saving && { opacity: 0.6 }]} disabled={saving} onPress={submit}>
        <Text style={s.btnText}>{saving ? 'Slanje...' : 'Pošalji prijavu'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  intro: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.body, lineHeight: 21, marginBottom: 18 },
  label: { color: Colors.textMuted, fontSize: 12, fontFamily: Fonts.body, marginBottom: 6 },
  input: { backgroundColor: Colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: Colors.text, fontSize: 15, fontFamily: Fonts.body, borderWidth: 1, borderColor: Colors.border },
  error: { color: Colors.primary, fontSize: 13, fontFamily: Fonts.body, marginBottom: 12 },
  btn: { backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 15, fontFamily: Fonts.bodyBold },
  doneTitle: { color: Colors.primary, fontSize: 28, fontFamily: Fonts.heading, marginBottom: 8 },
  doneText: { color: Colors.text, fontSize: 15, fontFamily: Fonts.body, textAlign: 'center', lineHeight: 22 },
});
