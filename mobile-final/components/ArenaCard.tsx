import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts } from '../constants/AppColors';
import { getSchedule, getResults } from '../lib/api';

const RED = '#C41230', GOLD = '#D4AC0D';

/*
 * Arena kartica — živi centar početnog ekrana:
 *  - na dan utakmice Prvog tima: najava + odbrojavanje
 *  - 48h poslije rezultata: semafor + najefikasnija
 *  - inače: ništa (manifest hero ostaje sam)
 */
export default function ArenaCard() {
  const [state, setState] = useState<any>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => tick(x => x + 1), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    Promise.all([getSchedule().catch(() => []), getResults().catch(() => [])]).then(([sch, res]) => {
      const events = Array.isArray(sch) ? sch : [];
      const results = Array.isArray(res) ? res : [];
      const now = Date.now();
      const dayPG = (d: string) => new Date(d).toLocaleDateString('sv-SE', { timeZone: 'Europe/Podgorica' });
      const today = dayPG(new Date().toISOString());

      const match = events.find((e: any) =>
        e.type === 'match' && e.team?.category === 'prva_liga' &&
        dayPG(e.startsAt) === today && now < new Date(e.startsAt).getTime() + 2 * 3600_000);
      if (match) { setState({ kind: 'matchday', match }); return; }

      const fresh = results.find((r: any) => {
        if (r.event?.team?.category !== 'prva_liga') return false;
        const t = new Date(r.event?.startsAt).getTime();
        return now > t && now - t < 48 * 3600_000;
      });
      if (fresh) setState({ kind: 'postmatch', r: fresh });
    });
  }, []);

  if (!state) return null;

  if (state.kind === 'matchday') {
    const m = state.match;
    const diff = Math.max(0, new Date(m.startsAt).getTime() - Date.now());
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), min = Math.floor((diff % 3600000) / 60000);
    return (
      <LinearGradient colors={['#4a0f1d', '#26090f', '#1a1a1a']} start={{ x: 0.8, y: 0 }} end={{ x: 0.2, y: 1 }} style={s.card}>
        <View style={s.sigRow}><View style={s.sigLine} /><Text style={s.sigText}>MATCHDAY</Text></View>
        <Text style={s.matchTitle}>{m.title}</Text>
        {m.location ? <Text style={s.meta}>📍 {m.location}</Text> : null}
        {diff > 0 ? (
          <View style={s.cdRow}>
            {[[d, 'DANA'], [h, 'SATI'], [min, 'MIN']].map(([v, l], i) => (
              <View key={String(l)} style={s.cdBox}>
                <Text style={[s.cdNum, i === 2 && { color: GOLD }]}>{String(v)}</Text>
                <Text style={s.cdLbl}>{String(l)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[s.matchTitle, { color: GOLD, marginTop: 10 }]}>Utakmica je u toku</Text>
        )}
      </LinearGradient>
    );
  }

  const r = state.r;
  const win = r.homeScore > r.awayScore, draw = r.homeScore === r.awayScore;
  return (
    <LinearGradient colors={['#4a0f1d', '#26090f', '#1a1a1a']} start={{ x: 0.8, y: 0 }} end={{ x: 0.2, y: 1 }} style={s.card}>
      <View style={s.sigRow}><View style={s.sigLine} /><Text style={s.sigText}>KRAJ · {(r.event?.title || '').toUpperCase()}</Text></View>
      <View style={s.scoreRow}>
        <Text style={s.scoreHome}>{r.homeScore}</Text>
        <Text style={s.scoreColon}>:</Text>
        <Text style={s.scoreAway}>{r.awayScore}</Text>
      </View>
      <Text style={[s.outcome, { color: win ? '#2ebd6b' : draw ? GOLD : 'rgba(255,255,255,0.75)' }]}>
        {win ? 'POBJEDA LAVICA 🦁' : draw ? 'NERIJEŠENO' : 'Idemo dalje — glave gore.'}
      </Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 20, marginTop: 18, borderRadius: 22, padding: 22, borderWidth: 1, borderColor: 'rgba(212,172,13,0.25)' },
  sigRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sigLine: { width: 34, height: 3, backgroundColor: RED },
  sigText: { color: GOLD, fontSize: 11, fontFamily: Fonts.bodyBold, letterSpacing: 3 },
  matchTitle: { color: '#fff', fontSize: 22, fontFamily: Fonts.heading, lineHeight: 27 },
  meta: { color: 'rgba(255,255,255,0.55)', fontSize: 13, fontFamily: Fonts.body, marginTop: 6 },
  cdRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cdBox: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingVertical: 10, minWidth: 74, alignItems: 'center' },
  cdNum: { color: '#fff', fontSize: 28, fontFamily: Fonts.heading },
  cdLbl: { color: 'rgba(255,255,255,0.45)', fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 2, marginTop: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 12 },
  scoreHome: { color: '#fff', fontSize: 74, fontFamily: Fonts.heading, lineHeight: 80 },
  scoreColon: { color: RED, fontSize: 44, fontFamily: Fonts.heading },
  scoreAway: { color: GOLD, fontSize: 74, fontFamily: Fonts.heading, lineHeight: 80 },
  outcome: { fontSize: 15, fontFamily: Fonts.bodyBold, marginTop: 6 },
});
