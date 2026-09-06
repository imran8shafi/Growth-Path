import React from 'react';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getCycleProgress, useProgress, type Quest } from '@/context/progress';
import { dateKey } from '@/lib/training-model';
import { AnimatedWords, CountUpText, useReducedMotionPreference } from './motion-bits';
import { TaskRow } from './path-ui';

export function DailyBrief({ tasks }: { tasks: Quest[] }) {
  const { training, planDate, cycleStartedAt } = useProgress(); const router = useRouter(); const reduced = useReducedMotionPreference();
  const cycle = getCycleProgress(cycleStartedAt, planDate);
  const today = training.results.filter((r) => r.date === dateKey(planDate));
  const descriptions = ['Set a starting point. Learn what a complete attempt feels like.', 'Protect attention. Notice, retrieve, then explain.', 'Build something useful. Leave evidence of your practice.', 'Choose a principle. Take it into a real conversation.', 'Expect a twist. Try another route to the same goal.', 'Bring your skills together. Make, test, and reflect.'];
  return <View style={s.section} testID="daily-brief">
    <View style={s.heading}><View style={{ flex: 1 }}><Text style={s.kicker}>YOUR DAILY BRIEF / CHAPTER {cycle.chapterIndex + 1}</Text><AnimatedWords text={`Day ${cycle.day} — ${cycle.chapter.title}`} style={s.title} /></View><Pressable accessibilityRole="button" onPress={() => router.push('/practice' as Href)} style={s.library}><Feather name="grid" color="#B3A4FF" size={17} /><Text style={s.libraryText}>Library</Text></Pressable></View>
    <Text style={s.detail}>{descriptions[cycle.chapterIndex]}</Text>
    {tasks.map((task, index) => {
      const role = index === 0 ? 'PRIMARY CHALLENGE' : task.kind === 'cross-training' ? 'SIDE QUEST' : task.kind === 'anchor' ? 'EXTRA PRACTICE' : 'SUPPORTING QUEST';
      return <Animated.View key={task.id} entering={reduced ? undefined : FadeInDown.delay(index * 65).duration(400)} style={s.step}>
        <View style={s.rail}><View style={[s.dot, { borderColor: task.trackColor }]}><Text style={[s.number, { color: task.trackColor }]}>{String(index + 1).padStart(2, '0')}</Text></View><View style={s.line} /></View>
        <View style={s.task}><Text style={[s.role, { color: task.trackColor }]}>{role}</Text><TaskRow {...task} index={0} /></View>
      </Animated.View>;
    })}
    <LinearGradient colors={['#25203E', '#111E2C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.recap}>
      <Text style={s.kicker}>TONIGHT / THE EVIDENCE</Text><Text style={s.recapTitle}>{today.length ? 'You have something to build on.' : 'What will you bring back?'}</Text>
      <View style={s.summary}><View><CountUpText value={today.length} style={s.score} /><Text style={s.detail}>sessions</Text></View><View><CountUpText value={new Set(today.map((r) => r.skill)).size} style={s.score} /><Text style={s.detail}>skills practiced</Text></View><View><CountUpText value={today.reduce((sum, r) => sum + r.xp, 0)} style={s.score} /><Text style={s.detail}>training XP</Text></View></View>
      <Pressable accessibilityRole="button" onPress={() => router.push('/progress' as Href)} style={s.review}><Text style={s.libraryText}>Review today’s results</Text><Feather name="arrow-up-right" size={18} color="#B3A4FF" /></Pressable>
    </LinearGradient>
  </View>;
}
const s = StyleSheet.create({ section: { marginTop: 32 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 10 }, kicker: { color: '#B3A4FF', fontSize: 9, letterSpacing: 1.6 }, title: { color: '#F6FBFF', fontWeight: '700', fontSize: 23, marginTop: 8 }, detail: { color: '#91A7B8', fontSize: 12, lineHeight: 20, marginTop: 7 }, library: { minHeight: 44, flexDirection: 'row', gap: 7, alignItems: 'center', paddingHorizontal: 10, borderRadius: 12, backgroundColor: '#23203C' }, libraryText: { color: '#C6BBFF', fontSize: 12, fontWeight: '600' }, step: { flexDirection: 'row', marginTop: 18, gap: 10 }, rail: { width: 26, alignItems: 'center', paddingTop: 24 }, dot: { width: 26, height: 26, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E1F30' }, number: { fontSize: 9, fontWeight: '700' }, line: { flex: 1, width: 1, backgroundColor: '#243A4F', marginTop: 8 }, task: { flex: 1 }, role: { fontSize: 9, letterSpacing: 1.7, marginBottom: 9 }, recap: { padding: 20, borderRadius: 23, marginTop: 22, borderWidth: 1, borderColor: '#494062' }, recapTitle: { fontSize: 21, fontWeight: '600', color: '#F6FBFF', marginTop: 10 }, summary: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 }, score: { color: '#F6FBFF', fontSize: 27, fontWeight: '600' }, review: { minHeight: 46, marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#39334E' } });
