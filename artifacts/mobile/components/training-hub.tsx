import { Feather } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CountUpText, SpotlightCard } from './motion-bits';
import { TaskRow } from './path-ui';
import { getCycleProgress, useProgress } from '@/context/progress';
import { specialChallenges } from '@/lib/training-catalog';
import { dateKey, ROMAN, sessionKey, skillProgress, SKILLS, trainingLevel, type SkillKey } from '@/lib/training-model';
import { nativeTheme } from '@/lib/native-theme';
import { AchievementVault } from './achievement-vault';

export function TrainingHighlights({ compact = false }: { compact?: boolean }) { return compact ? null : <CycleComparison />; }

function CycleComparison() {
  const { training, cycleStartedAt, planDate } = useProgress(); const cycle = getCycleProgress(cycleStartedAt, planDate);
  const baseline = training.results.find((r) => r.sessionKey === `cycle:${cycle.cycle}:baseline:mind-trial-baseline`);
  const retest = training.results.find((r) => r.sessionKey === `cycle:${cycle.cycle}:final:mind-trial-baseline`);
  const baseMetric = baseline?.metrics.find((m) => m.label === 'Words recalled');
  const lastMetric = retest?.metrics.find((m) => m.protocol === baseMetric?.protocol);
  const movementBase = training.results.find((r) => r.sessionKey === `cycle:${cycle.cycle}:baseline:body-trial-baseline`);
  const movementFinal = training.results.find((r) => r.sessionKey === `cycle:${cycle.cycle}:final:body-trial-baseline`);
  const movementMetric = movementBase?.metrics[0];
  const comparableMovement = movementFinal?.metrics.find((m) => m.protocol === movementMetric?.protocol);
  const cycleResults = training.results.filter((r) => r.cycle === cycle.cycle);
  return <SpotlightCard color="#8D7CFF" style={s.panel}><Text style={s.kicker}>BASELINE → EVOLUTION</Text><Text style={s.title}>Compare your recorded practice.</Text><Text style={s.body}>Recall uses the same word count and viewing time. Different words reduce simple memorization of the test.</Text><View style={s.comparison}><View><Text style={s.small}>BASELINE RECALL</Text><Text style={s.big}>{baseMetric ? `${baseMetric.value}/4` : '—'}</Text></View><Feather name="arrow-right" size={24} color="#8D7CFF" /><View><Text style={s.small}>DAY 42 RETEST</Text><Text style={s.big}>{lastMetric ? `${lastMetric.value}/4` : '—'}</Text></View></View><Text style={s.small}>{!baseMetric ? 'Complete your baseline trial to begin. Nothing is estimated from XP.' : !lastMetric ? 'Your baseline is saved. The matching retest opens on Day 42.' : `Baseline recorded ${baseline?.date}; retest recorded ${retest?.date}. This is one practice test, not an assessment of intelligence.`}</Text>
    <Text style={[s.kicker, { marginTop: 20 }]}>CONTROLLED MOVEMENT</Text><Text style={s.body}>{movementMetric ? `${movementMetric.label}: ${movementMetric.value} → ${comparableMovement?.value ?? '—'} ${movementMetric.unit}` : 'Record a suitable movement baseline to begin.'}</Text><Text style={s.small}>{movementFinal && !comparableMovement ? 'The setups differ, so these results are not compared.' : 'Compare only the same movement and setup. These records are self-reported; there is no required increase.'}</Text>
    <Text style={[s.kicker, { marginTop: 20 }]}>THIS CYCLE IN THE REAL WORLD</Text><Text style={s.body}>{cycleResults.filter((r) => r.category === 'mission').length} mission reports · {new Set(cycleResults.filter((r) => r.skill === 'practical').map((r) => r.date)).size} practical practice days · {cycleResults.filter((r) => r.category === 'boss').length} chapter challenges</Text>
  </SpotlightCard>;
}

export function SkillDashboard() {
  const { training, profile, planDate } = useProgress(); const router = useRouter();
  const [selected, setSelected] = useState<SkillKey>('memory');
  const [protocol, setProtocol] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const info = SKILLS[selected];
  const progress = skillProgress(selected, training.results);
  const difficulty = trainingLevel(selected, profile, training.results, dateKey(planDate));
  const relevant = training.results.filter((r) => r.skill === selected);
  const protocols = [...new Map(relevant.flatMap((r) => r.metrics).map((m) => [m.protocol, m])).values()];
  const activeProtocol = protocols.find((m) => m.protocol === protocol) ?? protocols[protocols.length - 1];
  const series = relevant.flatMap((r) => r.metrics.filter((m) => m.protocol === activeProtocol?.protocol).map((m) => ({ result: r, metric: m }))).slice(-10);
  const point = series.find((p) => p.result.sessionKey === selectedPoint) ?? series[series.length - 1];
  const max = Math.max(1, ...series.map((p) => p.metric.value));
  return <View style={s.section}>
    <Text style={s.title}>Your skill tree</Text><Text style={s.body}>Practice ranks grow across distinct days. Challenge difficulty responds separately to how sessions feel.</Text>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips} contentContainerStyle={{ gap: 8 }}>{(Object.keys(SKILLS) as SkillKey[]).map((key) => <Pressable key={key} accessibilityRole="tab" accessibilityState={{ selected: key === selected }} onPress={() => { setSelected(key); setProtocol(null); setSelectedPoint(null); }} style={[s.chip, selected === key && s.selected]}><Text style={s.label}>{SKILLS[key].label}</Text><Text style={s.small}>{ROMAN[skillProgress(key, training.results).level - 1]}</Text></Pressable>)}</ScrollView>
    <SpotlightCard color="#55D6FF" style={s.panel}>
      <View style={s.between}><View><Text style={s.kicker}>{info.track.toUpperCase()} / SKILL</Text><Text style={s.title}>{info.label}</Text></View><View style={s.rank}><Text style={s.big}>{ROMAN[progress.level - 1]}</Text><Text style={s.small}>PRACTICE</Text></View></View>
      <Text style={s.body}>{info.description}</Text>
      <View style={s.between}><Text style={s.small}>{progress.days} successful days · {progress.sessions} sessions</Text><Text style={s.small}>Challenge level {ROMAN[difficulty - 1]}</Text></View>
      <View style={s.levels}>{info.levels.map((label, index) => <View key={label} style={s.levelRow}><View style={[s.node, index < progress.level && s.nodeActive]}><Text style={s.label}>{ROMAN[index]}</Text></View><Text style={[s.body, { flex: 1, marginTop: 0, opacity: index < progress.level ? 1 : .6 }]}>{label}</Text><Feather name={index < progress.level ? 'check' : 'lock'} size={14} color={index < progress.level ? '#55D6FF' : '#61788A'} /></View>)}</View>
      <Text style={s.small}>{progress.level >= 5 ? 'Practice rank V reached. Keep testing your skills in different contexts.' : `${progress.nextIn} more successful practice day${progress.nextIn === 1 ? '' : 's'} to your next rank. Multiple sessions on one day count once.`}</Text>
    </SpotlightCard>
    <SpotlightCard color="#4CD6B0" style={s.panel}>
      <Text style={s.kicker}>PERFORMANCE HISTORY</Text><Text style={s.title}>{activeProtocol?.label ?? 'Your evidence starts here.'}</Text>
      {protocols.length > 1 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>{protocols.map((m, index) => <Pressable key={m.protocol} accessibilityRole="button" accessibilityState={{ selected: m.protocol === activeProtocol?.protocol }} onPress={() => { setProtocol(m.protocol); setSelectedPoint(null); }} style={[s.filter, m.protocol === activeProtocol?.protocol && s.selected]}><Text style={s.small}>{m.label} · {m.unit} · setup {index + 1}</Text></Pressable>)}</ScrollView> : null}
      {series.length ? <>
        <Text accessibilityLiveRegion="polite" style={s.body}>{point?.result.date} · {point?.metric.value} {point?.metric.unit}</Text>
        <View style={s.chart}>{series.map(({ result, metric }, i) => <Pressable key={result.sessionKey} accessibilityRole="button" accessibilityLabel={`${result.date}: ${metric.value} ${metric.unit}`} accessibilityState={{ selected: point?.result.sessionKey === result.sessionKey }} onPress={() => setSelectedPoint(result.sessionKey)} style={s.barHit}><View style={[s.bar, { height: Math.max(4, metric.value / max * 108), backgroundColor: point?.result.sessionKey === result.sessionKey ? '#55D6FF' : '#2E716E' }]} /><Text style={s.chartLabel}>{i + 1}</Text></Pressable>)}</View>
        <Text style={s.small}>Tap a bar to inspect that result. Only the same level, duration, and setup are compared.</Text>
        {point && training.sessions[point.result.sessionKey] ? <Pressable accessibilityRole="button" onPress={() => router.push(`/session?session=${encodeURIComponent(point.result.sessionKey)}` as Href)} style={s.resume}><Text style={s.label}>Open this session</Text><Feather name="arrow-up-right" size={18} color="#55D6FF" /></Pressable> : null}
      </> : <Text style={s.body}>Complete a trial to record a measured score. Reflections, beliefs, humor, and writing quality are not given invented scores.</Text>}
    </SpotlightCard>
    <AchievementVault />
    <View style={s.between}><Text style={s.title}>Recent training</Text><CountUpText value={training.results.length} suffix=" sessions" style={s.small} /></View>
    {!training.results.length ? <Text style={s.body}>Start any challenge. Your result will appear here after its final check-in.</Text> : [...training.results].reverse().slice(0, 8).map((result) => <Pressable key={result.sessionKey} accessibilityRole="button" disabled={!training.sessions[result.sessionKey]} onPress={() => router.push(`/session?session=${encodeURIComponent(result.sessionKey)}` as Href)} style={s.resume}><Feather name={result.category === 'boss' ? 'award' : 'check-circle'} size={19} color="#4CD6B0" /><View style={{ flex: 1 }}><Text style={s.label}>{result.title}</Text><Text style={s.small}>{result.date} · {SKILLS[result.skill].label} · {result.feedback === 'right' ? 'Right level' : result.feedback === 'hard' ? 'Too hard' : 'Too easy'}</Text></View><Text style={s.kicker}>+{result.xp}</Text></Pressable>)}
  </View>;
}

const s = StyleSheet.create({
  section: { marginTop: 28 }, title: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 19, lineHeight: 26, marginTop: 7 }, body: { color: '#B9CFDE', fontSize: 12, lineHeight: 19, marginTop: 9 }, small: { color: '#91A7B8', fontSize: 10, lineHeight: 16, marginTop: 4 }, kicker: { color: '#55D6FF', fontSize: 9, letterSpacing: 1.3, fontFamily: nativeTheme.typography.sans.bold }, label: { color: '#E4F0F8', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 12, lineHeight: 18 }, list: { gap: 10, marginTop: 14 },
  panel: { borderWidth: 1, borderColor: '#29485D', borderRadius: 19, padding: 17, backgroundColor: '#0D2031', marginTop: 15 }, resume: { minHeight: 63, padding: 13, borderRadius: 14, backgroundColor: '#102638', borderWidth: 1, borderColor: '#29485D', flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 9 }, comparison: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 15 }, big: { fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 31, color: '#F6FBFF' },
  chips: { marginTop: 17 }, chip: { padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#29485D', backgroundColor: '#102638', minWidth: 110 }, selected: { borderColor: '#55D6FF', backgroundColor: '#15394B' }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, rank: { alignItems: 'center' }, levels: { marginTop: 16, gap: 10 }, levelRow: { flexDirection: 'row', alignItems: 'center', gap: 13 }, node: { width: 37, height: 37, borderRadius: 12, backgroundColor: '#142A3A', borderWidth: 1, borderColor: '#2A485D', alignItems: 'center', justifyContent: 'center' }, nodeActive: { borderColor: '#55D6FF', backgroundColor: '#164255' },
  filter: { borderRadius: 10, borderWidth: 1, borderColor: '#29485D', paddingHorizontal: 10, paddingVertical: 5 }, chart: { flexDirection: 'row', height: 145, alignItems: 'flex-end', gap: 8, borderBottomWidth: 1, borderColor: '#29485D', marginTop: 10 }, barHit: { flex: 1, height: '100%', minWidth: 15, justifyContent: 'flex-end', alignItems: 'stretch', paddingHorizontal: 2 }, bar: { borderTopLeftRadius: 5, borderTopRightRadius: 5 }, chartLabel: { color: '#91A7B8', textAlign: 'center', fontSize: 9, height: 22, paddingTop: 5 },
});
