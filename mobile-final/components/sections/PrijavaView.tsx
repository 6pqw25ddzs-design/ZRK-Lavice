import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/AppColors';
import { useAuth } from '../../lib/auth';

type Mode = 'login' | 'activate';

export default function PrijavaView() {
  const { login, activate } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    if (mode === 'activate' && (!code.trim() || !fullName.trim())) {
      setError('Unesite pozivni kod i ime i prezime.'); return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Unesite ispravnu email adresu (npr. ime@gmail.com).'); return;
    }
    if (password.length < 8) {
      setError('Lozinka mora imati najmanje 8 znakova.'); return;
    }
    setBusy(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await activate(code.trim().toUpperCase(), email.trim(), password, fullName.trim(), phone.trim() || undefined);
    } catch (e: any) {
      setError(e?.message || 'Greška pri prijavi');
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <View style={s.heroIcon}><Ionicons name="paw" size={30} color={Colors.primary} /></View>
        <Text style={s.title}>{mode === 'login' ? 'Prijava za roditelje' : 'Aktivacija naloga'}</Text>
        <Text style={s.sub}>
          {mode === 'login'
            ? 'Pratite raspored, potvrde dolazaka, objave trenera i razvoj svog djeteta.'
            : 'Unesite pozivni kod koji ste dobili od kluba — njime se vaš nalog vezuje za vaše dijete.'}
        </Text>

        {mode === 'activate' && (
          <>
            <TextInput style={[s.input, s.codeInput]} placeholder="LAV-XXXXXX" placeholderTextColor="#b5b5b5"
              autoCapitalize="characters" autoCorrect={false} value={code} onChangeText={setCode} />
            <TextInput style={s.input} placeholder="Ime i prezime" placeholderTextColor="#b5b5b5"
              value={fullName} onChangeText={setFullName} />
            <TextInput style={s.input} placeholder="Telefon (opciono)" placeholderTextColor="#b5b5b5"
              keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          </>
        )}

        <TextInput style={s.input} placeholder="Email" placeholderTextColor="#b5b5b5"
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={email} onChangeText={setEmail} />
        <TextInput style={s.input} placeholder="Lozinka" placeholderTextColor="#b5b5b5"
          secureTextEntry value={password} onChangeText={setPassword} />

        {!!error && <Text style={s.error}>{error}</Text>}

        <TouchableOpacity style={s.btn} activeOpacity={0.85} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : (
            <Text style={s.btnText}>{mode === 'login' ? 'Prijavi se' : 'Aktiviraj nalog'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'activate' : 'login'); setError(''); }}>
          <Text style={s.switch}>
            {mode === 'login' ? 'Imate pozivni kod od kluba? Aktivirajte nalog →' : 'Već imate nalog? Prijavite se →'}
          </Text>
        </TouchableOpacity>

        <Text style={s.note}>
          Pozivni kod dobijate od kluba pri upisu djeteta. Nemate ga još? Javite se na info@zrklavice.me.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  heroIcon: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(200,16,46,0.09)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  title: { color: Colors.text, fontSize: 24, fontFamily: Fonts.heading, marginBottom: 6 },
  sub: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.body, lineHeight: 20, marginBottom: 22 },
  input: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: Colors.text,
    fontFamily: Fonts.body, marginBottom: 10,
  },
  codeInput: { fontFamily: Fonts.heading, letterSpacing: 2, textAlign: 'center', fontSize: 18 },
  error: { color: Colors.primary, fontSize: 13, fontFamily: Fonts.body, marginBottom: 8 },
  btn: {
    backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 15,
    alignItems: 'center', marginTop: 6,
  },
  btnText: { color: '#fff', fontSize: 16, fontFamily: Fonts.heading },
  switch: { color: Colors.primary, fontSize: 14, fontFamily: Fonts.bodyBold, textAlign: 'center', marginTop: 18 },
  note: { color: '#9a9a9a', fontSize: 12, fontFamily: Fonts.body, textAlign: 'center', marginTop: 22, lineHeight: 18 },
});
