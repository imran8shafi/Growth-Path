import React from 'react';
import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useProgress } from '@/context/progress';
import { achievements, valueMap } from '@/lib/training-rewards';
import { SpotlightCard, useReducedMotionPreference } from './motion-bits';

export function AchievementVault() {
  const { training } = useProgress(); const reduced = useReducedMotionPreference();
  const badges = achievements(training.results); const values = valueMap(training.results);
  return <View style={s.section} testID="achievement-vault">
    <Text style={s.kicker}>EARNED THROUGH PRACTICE</Text><Text style={s.title}>Your achievement vault</Text>
    <Text style={s.body}>{badges.filter((b) => b.earned).length} of {badges.length} milestones · Every badge tells you how to earn it.</Text>
    <View style={s.grid}>{badges.map((badge, index) => <Animated.View key={badge.id} entering={reduced ? undefined : FadeInDown.delay(index * 45).duration(400)} style={s.item}><SpotlightCard color={badge.earned ? '#FFCC66' : '#4E5975'} style={s.card}>
      <View style={s.between}><View style={[s.medal, badge.earned && s.gold]}><Feather name={badge.icon} size={23} color={badge.earned ? '#FFCC66' : '#7B8C9E'} /></View><Feather name={badge.earned ? 'check-circle' : 'lock'} size={14} color={badge.earned ? '#FFCC66' : '#7B8C9E'} /></View>
      <Text style={s.name}>{badge.title}</Text><Text style={s.body}>{badge.detail}</Text><View style={s.track}><View style={[s.fill, { width: `${badge.progress / badge.target * 100}%`, backgroundColor: badge.earned ? '#FFCC66' : '#7163AC' }]} /></View><Text style={s.progress}>{badge.earned ? 'UNLOCKED' : `${badge.progress} / ${badge.target}`}</Text>
    </SpotlightCard></Animated.View>)}</View>
    <SpotlightCard color="#FFCC66" style={s.values}><Text style={s.kicker}>YOUR GUIDING VALUES</Text><Text style={s.title}>What you chose to stand for</Text><Text style={s.body}>Values you explicitly selected in completed scenarios. These are reflections of those choices, not a personality score.</Text>{values.length ? values.map(({ value, count }) => <View key={value} style={s.value}><Text style={s.name}>{value}</Text><Text style={s.body}>{count} {count === 1 ? 'reflection' : 'reflections'}</Text></View>) : <Text style={s.body}>Try “Values under pressure” in the practice library to start your map.</Text>}</SpotlightCard>
  </View>;
}
const s = StyleSheet.create({ section: { marginTop: 28 }, kicker: { color: '#C1AFFA', fontSize: 9, letterSpacing: 1.5 }, title: { color: '#F6FBFF', fontSize: 22, fontWeight: '600', marginTop: 9 }, body: { color: '#A3B8C9', fontSize: 12, lineHeight: 19, marginTop: 8 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }, item: { width: '48%', flexGrow: 1, minWidth: 135 }, card: { padding: 16, borderRadius: 20, flex: 1 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, medal: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#212B3E', alignItems: 'center', justifyContent: 'center' }, gold: { backgroundColor: '#423421', borderWidth: 1, borderColor: '#85643C' }, name: { color: '#F0F3F7', fontSize: 15, fontWeight: '600', marginTop: 14 }, track: { height: 3, backgroundColor: '#2A3247', marginTop: 17, borderRadius: 3 }, fill: { height: 3, borderRadius: 3 }, progress: { fontSize: 9, letterSpacing: 1, color: '#C1AFFA', marginTop: 8 }, values: { marginTop: 18, borderRadius: 20, padding: 19 }, value: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#354255', marginTop: 12, paddingBottom: 4 } });
