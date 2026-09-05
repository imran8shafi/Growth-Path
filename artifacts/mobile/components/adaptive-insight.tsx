import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ADAPTIVE_PACE_META, TRAIT_META, getTodayCrossTraining, type TrackKey, useProgress } from '@/context/progress';
import { nativeTheme } from '@/lib/native-theme';

export function AdaptiveInsight({ track, detailed = false }: { track?: TrackKey; detailed?: boolean }) {
  const { adaptivePlan: plan, profile, planDate } = useProgress();
  const practiceTrait = getTodayCrossTraining(profile, planDate, plan).trait!;
  const pace = ADAPTIVE_PACE_META[track ? plan.paceByTrack[track] : plan.mode];
  return <Animated.View entering={FadeInDown.duration(460)} style={[styles.card, { borderColor: `${pace.color}55` }]}>
    <View style={styles.heading}>
      <Feather name="sliders" size={18} color={pace.color} />
      <View style={styles.copy}>
        <Text style={[styles.eyebrow, { color: pace.color }]}>{track ? `${track.toUpperCase()} PACE` : 'YOUR PLAN IS LEARNING'}</Text>
        <Text style={styles.title}>{pace.label}</Text>
      </View>
      <Text style={styles.days}>{plan.observedDays}/14{ '\n' }APP DAYS</Text>
    </View>
    <Text style={styles.body}>{track ? pace.detail : plan.reason}</Text>
    {detailed ? <>
      <View style={styles.metrics}>
        <Text style={styles.metric}>{Math.round(plan.completionRate * 100)}% path coverage</Text>
        <Text style={styles.metric}>{TRAIT_META[practiceTrait].label} practice today</Text>
      </View>
      <Text style={styles.note}>Coverage counts each path once per app day. Extra quests do not inflate it. Only previous days shape today’s plan; unopened days are unknown.</Text>
      <Text style={styles.note}>This reflects recorded practice, not a measure of ability. Body difficulty stays within your onboarding level. Fasting does not affect the planner.</Text>
    </> : null}
  </Animated.View>;
}

const styles = StyleSheet.create({
  card: { padding: 15, marginTop: 14, borderRadius: 18, backgroundColor: '#0D1C2A', borderWidth: 1, borderColor: '#264153' },
  heading: { flexDirection: 'row', gap: 11, alignItems: 'center' }, copy: { flex: 1 },
  eyebrow: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 9, letterSpacing: 1.1 },
  title: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 16, marginTop: 4 },
  days: { color: '#91A7B8', fontSize: 9, lineHeight: 14, textAlign: 'right' },
  body: { color: '#C8D8E3', fontSize: 12, lineHeight: 18, marginTop: 11 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 13 },
  metric: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 11 },
  note: { color: '#91A7B8', fontSize: 11, lineHeight: 17, marginTop: 10 },
});
