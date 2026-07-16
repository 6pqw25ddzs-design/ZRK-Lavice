import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '../../constants/AppColors';
import TabelaView from '../../components/sections/TabelaView';
import GalerijaView from '../../components/sections/GalerijaView';
import SponzoriView from '../../components/sections/SponzoriView';
import KontaktView from '../../components/sections/KontaktView';
import RezultatiView from '../../components/sections/RezultatiView';
import ONamaView from '../../components/sections/ONamaView';
import DokumentiView from '../../components/sections/DokumentiView';
import UpisView from '../../components/sections/UpisView';
import PodrziView from '../../components/sections/PodrziView';
import TreneriView from '../../components/sections/TreneriView';
import PrijavaView from '../../components/sections/PrijavaView';
import MojeView from '../../components/sections/MojeView';
import DosijeView from '../../components/sections/DosijeView';
import RazvojView from '../../components/sections/RazvojView';
import { useAuth } from '../../lib/auth';

type Section = 'menu' | 'tabela' | 'galerija' | 'sponzori' | 'kontakt' | 'rezultati' | 'onama' | 'dokumenti' | 'upis' | 'podrzi' | 'treneri' | 'prijava' | 'dosije' | 'razvoj';

type Item = { key: Section; label: string; desc: string; icon: any };
type Group = { title: string; items: Item[] };

const GROUPS: Group[] = [
  {
    title: 'KLUB',
    items: [
      { key: 'onama', label: 'O nama', desc: 'Priča i osnivači kluba', icon: 'information-circle' },
      { key: 'treneri', label: 'Stručni tim', desc: 'Treneri po kategorijama', icon: 'clipboard' },
      { key: 'galerija', label: 'Galerija', desc: 'Trenuci sa treninga i utakmica', icon: 'images' },
      { key: 'dokumenti', label: 'Dokumenti', desc: 'Obrasci i pravilnici', icon: 'document-text' },
      { key: 'sponzori', label: 'Sponzori', desc: 'Partneri kluba', icon: 'ribbon' },
    ],
  },
  {
    title: 'SPORT',
    items: [
      { key: 'rezultati', label: 'Rezultati', desc: 'Ishodi utakmica', icon: 'trophy' },
      { key: 'tabela', label: 'Tabela', desc: 'Plasman na ligama', icon: 'podium' },
    ],
  },
  {
    title: 'ZA RODITELJE',
    items: [
      { key: 'upis', label: 'Upis djeteta', desc: 'Prijava za probni trening', icon: 'person-add' },
      { key: 'kontakt', label: 'Kontakt', desc: 'Lokacija, email i telefon', icon: 'call' },
      { key: 'podrzi', label: 'Podržite nas', desc: 'Donacije i sponzorstva', icon: 'heart' },
    ],
  },
];

const EXTRA_ITEMS: Item[] = [
  { key: 'prijava', label: 'Prijava za roditelje', desc: 'Pozivni kod, potvrde, razvoj', icon: 'key' },
  { key: 'dosije', label: 'Dosije', desc: 'Dokumenti, saglasnosti, članarina', icon: 'folder-open' },
  { key: 'razvoj', label: 'Razvoj', desc: 'Evaluacije, ciljevi, prekretnice', icon: 'trending-up' },
];

const ALL_ITEMS = [...GROUPS.flatMap(g => g.items), ...EXTRA_ITEMS];

export default function ViseScreen() {
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState<Section>('menu');
  const params = useLocalSearchParams<{ open?: string }>();
  const { user } = useAuth();

  useEffect(() => {
    if (params.open && ALL_ITEMS.some(i => i.key === params.open)) {
      setActive(params.open as Section);
    }
  }, [params.open]);

  if (active !== 'menu') {
    const item = ALL_ITEMS.find(i => i.key === active)!;
    return (
      <View style={s.container}>
        <View style={[s.subHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={() => setActive('menu')} style={s.backBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={s.subTitle}>{item.label}</Text>
        </View>
        <View style={{ flex: 1 }}>
          {active === 'tabela' && <TabelaView />}
          {active === 'galerija' && <GalerijaView />}
          {active === 'sponzori' && <SponzoriView />}
          {active === 'kontakt' && <KontaktView />}
          {active === 'rezultati' && <RezultatiView />}
          {active === 'onama' && <ONamaView />}
          {active === 'dokumenti' && <DokumentiView />}
          {active === 'upis' && <UpisView />}
          {active === 'podrzi' && <PodrziView />}
          {active === 'treneri' && <TreneriView />}
          {active === 'prijava' && (user ? <MojeView onOpen={sec => setActive(sec)} /> : <PrijavaView />)}
          {active === 'dosije' && (user ? <DosijeView /> : <PrijavaView />)}
          {active === 'razvoj' && (user ? <RazvojView /> : <PrijavaView />)}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 18, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <Text style={s.title}>Klub</Text>
      <Text style={s.subtitle}>Sve o ŽRK Lavice na jednom mjestu.</Text>

      {/* MOJE — lični kutak roditelja */}
      <View style={{ marginTop: 28 }}>
        <Text style={s.groupTitle}>MOJE</Text>
        <View style={s.groupCard}>
          {(user ? EXTRA_ITEMS.map(it => it.key === 'prijava' ? { ...it, label: 'Moj kutak', desc: 'Termini, potvrde i objave', icon: 'person-circle' as any } : it) : [EXTRA_ITEMS[0]]).map((it, idx, arr) => (
            <TouchableOpacity key={it.key} activeOpacity={0.6}
              style={[s.row, idx < arr.length - 1 && s.rowBorder]}
              onPress={() => setActive(it.key)}>
              <View style={s.iconWrap}>
                <Ionicons name={it.icon} size={19} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>{it.label}</Text>
                <Text style={s.desc}>{it.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color="#C9C9C9" />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {GROUPS.map(g => (
        <View key={g.title} style={{ marginTop: 28 }}>
          <Text style={s.groupTitle}>{g.title}</Text>
          <View style={s.groupCard}>
            {g.items.map((it, idx) => (
              <TouchableOpacity key={it.key} activeOpacity={0.6}
                style={[s.row, idx < g.items.length - 1 && s.rowBorder]}
                onPress={() => setActive(it.key)}>
                <View style={s.iconWrap}>
                  <Ionicons name={it.icon} size={19} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.label}>{it.label}</Text>
                  <Text style={s.desc}>{it.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color="#C9C9C9" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  title: { color: Colors.text, fontSize: 30, fontFamily: Fonts.heading, letterSpacing: -0.5 },
  subtitle: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.body, marginTop: 4 },
  groupTitle: { color: '#9a9a9a', fontSize: 12, fontFamily: Fonts.bodyBold, letterSpacing: 1.6, marginBottom: 10, marginLeft: 4 },
  groupCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 5 },
    elevation: 2, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4F4' },
  iconWrap: { width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(196,18,48,0.08)', alignItems: 'center', justifyContent: 'center' },
  label: { color: Colors.text, fontSize: 15.5, fontFamily: Fonts.bodyBold },
  desc: { color: '#9a9a9a', fontSize: 12, fontFamily: Fonts.body, marginTop: 1 },
  subHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 16, paddingBottom: 8 },
  backBtn: { padding: 4 },
  subTitle: { color: Colors.text, fontSize: 20, fontFamily: Fonts.heading },
});
