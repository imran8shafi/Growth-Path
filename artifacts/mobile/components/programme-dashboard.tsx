import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useProgress } from '@/context/progress';
import { programmeChallenge, programmeTitle, programmeUnits, PROGRAMME_TRACKS } from '@/lib/guided-programmes';
import { SpotlightCard } from './motion-bits';
import { TRACKS } from './path-ui';

export function ProgrammeDashboard({ expanded = false }: { expanded?: boolean }) {
  const { profile, training, planDate } = useProgress();
  return <View style={s.section}>
    <Text style={s.title}>Your programmes</Text>
    <Text style={s.body}>Completion records what you practised. XP does not measure income, health, or mastery.</Text>
    {PROGRAMME_TRACKS.map((track) => {
      const title = programmeTitle(track, profile);
      const units = programmeUnits(track, profile);
      const current = programmeChallenge(track, profile, training, planDate);
      const prefix = current?.quest.id.replace(/\d+$/, '');
      const completed = new Set(training.results.filter((r) => r.successful && (prefix ? r.questId.startsWith(prefix) : Object.values(training.sessions).some((session) => session.key === r.sessionKey && session.challenge.programme?.title === title))).map((r) => r.questId));
      const count = Math.min(units.length, completed.size);
      return <SpotlightCard key={track} color={TRACKS[track].color} style={s.card}>
        <View style={s.row}><Text style={[s.kicker, { color: TRACKS[track].color }]}>{TRACKS[track].label.toUpperCase()}</Text><Text style={s.body}>{count}/{units.length}</Text></View>
        <Text style={s.title}>{title}</Text>
        <View style={s.bar}><View style={{ height: '100%', width: `${count / units.length * 100}%`, backgroundColor: TRACKS[track].color }} /></View>
        {expanded ? units.map((unit, index) => {
          const done = prefix ? completed.has(prefix + (index + 1)) : count === units.length;
          return <View key={unit.title} style={s.unit}><Feather name={done ? 'check-circle' : 'circle'} color={done ? TRACKS[track].color : '#61788A'} size={18} /><View style={{ flex: 1 }}><Text style={s.label}>{index + 1}. {unit.title}</Text><Text style={s.body}>{unit.outcome}</Text></View></View>;
        }) : <Text style={s.body}>{count === units.length ? 'Foundation completed.' : current?.quest.title ?? 'Foundation completed.'}</Text>}
      </SpotlightCard>;
    })}
  </View>;
}
const s = StyleSheet.create({
  section: { marginTop: 22, gap: 12 }, card: { padding: 18, borderRadius: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#F6FBFF', fontSize: 20, fontWeight: '700', lineHeight: 27 },
  body: { color: '#91A7B8', fontSize: 13, lineHeight: 20 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  bar: { height: 5, borderRadius: 5, overflow: 'hidden', backgroundColor: '#203A4F', marginVertical: 14 },
  unit: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#203A4F' },
  label: { color: '#F6FBFF', fontSize: 14, lineHeight: 21, fontWeight: '600' },
});
