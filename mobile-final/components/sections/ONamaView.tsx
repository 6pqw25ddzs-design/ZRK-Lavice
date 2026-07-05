import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../constants/AppColors';

const BASE = 'https://zrklavice.me/osnivaci';

const OSNIVACI = [
  { ime: 'Milena Raičević', uloga: 'Osnivačica i predsjednica kluba', god: '1990, Podgorica', foto: `${BASE}/milena.JPG`,
    bio: 'Jedna od najvećih rukometašica u istoriji Crne Gore. Olimpijska i evropska medaljistkinja, višestruka osvajačica EHF Lige šampiona. Svoje iskustvo i autoritet danas usmjerava ka izgradnji vizije ŽRK Lavice.' },
  { ime: 'Radmila Petrović', uloga: 'Osnivačica i direktorica kluba', god: '1988, Nikšić', foto: `${BASE}/radmila.JPG`,
    bio: 'Generacija koja je ispisala najljepše stranice crnogorskog rukometa. Olimpijska i evropska medaljistkinja. Kao direktorica kluba stvara zdravo i podsticajno okruženje za nove generacije.' },
  { ime: 'Anđela Bulatović', uloga: 'Osnivačica i trenerica kluba', god: '1986, Podgorica', foto: `${BASE}/andjela.JPG`,
    bio: 'Istinska legenda crnogorskog rukometa. Osvajačica najprestižnijih evropskih trofeja. Energiju i iskustvo danas usmjerava ka radu sa mladim igračicama.' },
  { ime: 'Sonja Barjaktarović', uloga: 'Osnivačica i trenerica kluba', god: '1986, Berane', foto: `${BASE}/sonja.jpg`,
    bio: 'Jedna od najuspješnijih golmanki u istoriji crnogorskog rukometa. Višestruka evropska i olimpijska medaljistkinja, sinonim za posvećenost i pobjednički karakter.' },
  { ime: 'Igor Marković', uloga: 'Osnivač i trener kluba', god: '1981, Cetinje', foto: `${BASE}/igor.jpg`,
    bio: 'Nekadašnji reprezentativac Crne Gore, višestruki učesnik evropskih i svjetskih prvenstava. Svoje znanje stavlja u službu razvoja mladih rukometašica.' },
];

export default function ONamaView() {
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text style={s.intro}>
        ŽRK Lavice osnovali su istaknuti predstavnici crnogorskog rukometa — olimpijske medaljistkinje i reprezentativci — sa željom da stvore okruženje u kojem će nove generacije djevojčica rasti kroz sport.
      </Text>
      {OSNIVACI.map(o => (
        <View key={o.ime} style={s.card}>
          <Image source={{ uri: o.foto }} style={s.photo} resizeMode="cover" />
          <View style={s.body}>
            <Text style={s.name}>{o.ime}</Text>
            <Text style={s.role}>{o.uloga}</Text>
            <Text style={s.god}>{o.god}</Text>
            <Text style={s.bio}>{o.bio}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  intro: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.body, lineHeight: 21, marginBottom: 20 },
  card: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  photo: { width: '100%', height: 260, backgroundColor: Colors.border },
  body: { padding: 16 },
  name: { color: Colors.text, fontSize: 18, fontFamily: Fonts.heading },
  role: { color: Colors.primary, fontSize: 13, fontFamily: Fonts.bodyBold, marginTop: 2 },
  god: { color: Colors.textMuted, fontSize: 12, fontFamily: Fonts.body, marginTop: 2 },
  bio: { color: Colors.textMuted, fontSize: 14, fontFamily: Fonts.body, lineHeight: 21, marginTop: 10 },
});
