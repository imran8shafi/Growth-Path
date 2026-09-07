import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useProgress, type TrackKey } from '@/context/progress';
import { ScreenShell, TRACKS } from '@/components/path-ui';
import { RANKS, rankName } from '@/components/level-journey';
import { guidedPlan, programmeTitle, programmeUnits, PROGRAMME_TRACKS } from '@/lib/guided-programmes';
import { sessionKey, type Challenge } from '@/lib/training-model';

export default function EvolveRoute() {
  const { profile, training, planDate, level, totalXp, dispatchTraining } = useProgress();
  const router = useRouter(); const [selected, setSelected] = useState<TrackKey | null>(null);
  const plan = guidedPlan(profile, training, planDate);
  const nextRank = RANKS.find(r => r.level > level);
  const done = (c: Challenge) => training.results.some(r => r.sessionKey === sessionKey(c));
  const start = (c: Challenge) => {
    if (done(c)) return;
    dispatchTraining({ type: 'start', challenge: c, now: new Date().toISOString() });
    router.push(`/session?session=${encodeURIComponent(sessionKey(c))}` as Href);
  };
  return <ScreenShell><View style={s.page}>
    <Text style={s.heading}>Evolve</Text><Text style={s.body}>Your rank. Your next steps.</Text>
    <LinearGradient colors={['#183F4B', '#171D36']} style={s.rank}>
      <View style={s.row}><Feather name="award" size={35} color="#6ADDD1" /><Text style={s.kicker}>CURRENT RANK · LEVEL {level}</Text></View>
      <Text style={[s.heading, { marginTop: 20 }]}>{rankName(level)}</Text>
      <Text style={s.body}>{nextRank ? `${Math.max(0, (nextRank.level - 1) * 250 - totalXp)} XP to ${nextRank.name}` : 'Your highest rank is unlocked'}</Text>
    </LinearGradient>
    <Text style={s.section}>Available at your level</Text>
    {PROGRAMME_TRACKS.map(track => {
      const quest = plan.find(c => c.quest.track === track); const expanded = selected === track;
      return <View key={track} style={s.card}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Explore ${TRACKS[track].label}`} accessibilityState={{ expanded }} onPress={() => setSelected(expanded ? null : track)}>
          <View style={s.row}><View style={[s.icon, { backgroundColor: TRACKS[track].color + '20' }]}><Feather name={track === 'mind' ? 'book-open' : track === 'body' ? 'activity' : 'briefcase'} size={25} color={TRACKS[track].color} /></View><View style={{ flex: 1 }}><Text style={s.title}>{TRACKS[track].label}</Text><Text style={s.body}>{programmeTitle(track, profile)}</Text></View><Feather name={expanded ? 'chevron-up' : 'chevron-down'} color="#B1C8D8" size={22} /></View>
          <Text style={[s.kicker, { color: TRACKS[track].color, marginTop: 20 }]}>{quest ? 'YOUR CURRENT QUEST' : 'FOUNDATION COMPLETE'}</Text><Text style={s.quest}>{quest?.quest.title ?? 'Keep applying what you have learned.'}</Text>
        </Pressable>
        {expanded ? <View>
          {quest ? <Pressable accessibilityRole="button" disabled={done(quest)} onPress={() => start(quest)} style={[s.button, done(quest) && { opacity: .5 }]}><Text style={s.buttonText}>{done(quest) ? 'Today’s quest completed' : training.sessions[sessionKey(quest)] ? 'Resume quest' : 'Start quest'}</Text></Pressable> : null}
          <Text style={[s.body, { marginVertical: 18 }]}>In your current programme</Text>
          {programmeUnits(track, profile).map((unit, i) => <View key={unit.title} style={s.unit}><Text style={s.number}>{String(i + 1).padStart(2, '0')}</Text><Text style={[s.quest, { flex: 1, marginTop: 0 }]}>{unit.title}</Text>{quest?.programme?.step === i + 1 ? <Text style={s.now}>NOW</Text> : null}</View>)}
        </View> : null}
      </View>;
    })}
    <Text style={s.section}>Next ranks</Text>
    {RANKS.filter(r => r.level > level).map(rank => <View key={rank.level} accessibilityLabel={`${rank.name}, locked until level ${rank.level}`} style={s.locked}>
      <Feather name="lock" size={22} color="#768D9F" /><View style={{ flex: 1 }}><Text style={s.lockTitle}>{rank.name}</Text><Text style={s.body}>Unlocks at level {rank.level}</Text></View><Text style={s.kicker}>LOCKED</Text>
    </View>)}
    {!nextRank ? <Text style={s.body}>All ranks unlocked.</Text> : null}
  </View></ScreenShell>;
}
const s = StyleSheet.create({
  page: { paddingHorizontal: 22, paddingTop: 20, maxWidth: 680, width: '100%', alignSelf: 'center' },
  heading: { color: '#F4FAFF', fontSize: 34, fontWeight: '800' }, body: { color: '#9BB3C5', fontSize: 14, lineHeight: 21, marginTop: 6 },
  rank: { borderRadius: 25, padding: 24, marginTop: 25 }, row: { flexDirection: 'row', alignItems: 'center', gap: 14 }, kicker: { color: '#8FAFBF', fontSize: 10, letterSpacing: 1, fontWeight: '700' },
  section: { color: '#F4FAFF', fontSize: 22, fontWeight: '700', marginTop: 30, marginBottom: 8 },
  card: { backgroundColor: '#122638', borderRadius: 22, padding: 20, marginTop: 12 }, icon: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  title: { color: '#F4FAFF', fontSize: 20, fontWeight: '700' }, quest: { color: '#E5F0F7', fontSize: 16, lineHeight: 23, marginTop: 9 },
  locked: { padding: 20, borderWidth: 1, borderColor: '#233446', borderRadius: 20, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 17 }, lockTitle: { color: '#859CAB', fontSize: 18, fontWeight: '700' },
  unit: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#243749' }, number: { color: '#6B8B9D', fontSize: 15 }, now: { color: '#69DBD1', fontSize: 10, fontWeight: '700' },
  button: { backgroundColor: '#69DBD1', minHeight: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 18 }, buttonText: { color: '#07131F', fontSize: 16, fontWeight: '700' },
});
