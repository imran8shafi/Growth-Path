import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, type Href } from 'expo-router';
import { useProgress } from '@/context/progress';
import { guidedPlan, suggestedGuided } from '@/lib/guided-programmes';
import { sessionKey, type Challenge } from '@/lib/training-model';
import { ScreenShell, TRACKS } from './path-ui';
import { AnimatedWords, StarBorder } from './motion-bits';
import { LevelJourney } from './level-journey';

export function ProgrammeHome() {
  const [open, setOpen] = useState(false); const router = useRouter();
  const { profile, training, planDate, dispatchTraining, level, saveStatus, currentStreak } = useProgress();
  const plan = guidedPlan(profile, training, planDate);
  const done = (c: Challenge) => training.results.some(r => r.sessionKey === sessionKey(c));
  const complete = plan.filter(done).length;
  const suggested = suggestedGuided(plan, training);
  const remaining = plan.filter(c => !done(c));
  const start = (c: Challenge) => { if (done(c)) { setOpen(false); router.push(`/session?session=${encodeURIComponent(sessionKey(c))}` as Href); return; } dispatchTraining({ type: 'start', challenge: c, now: new Date().toISOString() }); setOpen(false); router.push(`/session?session=${encodeURIComponent(sessionKey(c))}` as Href); };
  return <ScreenShell><View style={s.page}>
    <View style={s.row}><Text style={s.small}>{planDate.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</Text><Text style={s.accent}>LEVEL {level}</Text></View>
    <AnimatedWords text="Today’s quests" style={s.heading} />
    <Text style={s.body}>Read something worthwhile. Move your body. Build your financial future.</Text>
    <StarBorder color="#55D6FF" style={{ marginTop: 22, borderRadius: 24 }}><LinearGradient colors={['#153449', '#161E35']} style={s.hero}>
      <Text style={s.title}>{plan.length === 0 ? 'Foundation complete' : complete === plan.length ? 'Today’s quests complete' : 'A little stronger, every day.'}</Text>
      <Text style={s.body}>{complete} / {plan.length} complete{remaining.length ? ` · ${remaining.length} left today` : ''}</Text>
      <View accessibilityRole="progressbar" accessibilityLabel="Today’s quest progress" accessibilityValue={{ min: 0, max: plan.length || 1, now: complete }} style={s.track}><View style={{ height: '100%', backgroundColor: '#4CD6B0', width: `${plan.length ? complete / plan.length * 100 : 100}%` }} /></View>
      <Pressable accessibilityRole="button" onPress={() => plan.length ? setOpen(true) : router.push('/progress' as Href)} style={s.primary}><Text style={s.primaryText}>{!plan.length ? 'See my progress' : complete === plan.length ? 'View today’s results' : 'Unlock today’s quests'}</Text><Feather name="arrow-right" size={20} color="#07131F" /></Pressable>
    </LinearGradient></StarBorder>
    <LevelJourney />
    {saveStatus === 'error' ? <Text accessibilityRole="alert" style={s.body}>Storage is unavailable. Keep the app open until your progress saves.</Text> : null}
    <View style={[s.hero, { marginTop: 24 }]}><Text style={s.accent}>YOUR MOMENTUM</Text><Text style={s.title}>{currentStreak} day{currentStreak === 1 ? '' : 's'} of showing up</Text><Text style={s.body}>Unfinished quests stay saved. Pick up where you left off without a backlog.</Text><Pressable accessibilityRole="button" onPress={() => router.push('/progress' as Href)} style={s.link}><Text style={s.accent}>See my progress →</Text></Pressable></View>
    <Pressable accessibilityRole="button" onPress={() => router.push('/programme-settings' as Href)} style={s.link}><Text style={s.accent}>Adjust my programme</Text></Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
      <View style={s.overlay}><View accessibilityViewIsModal style={s.sheet}>
        <View style={s.row}><Text accessibilityRole="header" style={s.title}>Today’s quests</Text><Pressable accessibilityRole="button" accessibilityLabel="Close quests" onPress={() => setOpen(false)} style={s.close}><Feather name="x" size={24} color="#EAF5FC" /></Pressable></View>
        <Text style={s.body}>{remaining.length ? `${remaining.length} quests left. Start with the highlighted quest, or choose another.` : 'All done for today. Tap a quest to see your result.'}</Text>
        <ScrollView>{plan.map(c => <Pressable key={sessionKey(c)} accessibilityRole="button" accessibilityLabel={c.quest.title + (done(c) ? ", completed, view result" : suggested === c ? ", recommended next" : ", start quest")} onPress={() => start(c)} style={[s.quest, { borderColor: suggested === c ? '#65D9EE' : '#365365', backgroundColor: suggested === c ? '#193C4C' : '#142638' }]}>
          <Text style={s.accent}>{done(c) ? 'COMPLETED' : suggested === c ? (training.sessions[sessionKey(c)] ? 'PICK UP WHERE YOU LEFT OFF' : 'SUGGESTED FIRST') : 'READY WHEN YOU ARE'}</Text><Text style={s.questTitle}>{c.quest.title}</Text>
          <View style={[s.row, { marginTop: 14 }]}><Text style={s.small}>About {c.minutes} min</Text><Text style={s.accent}>{done(c) ? 'View result →' : training.sessions[sessionKey(c)] ? 'Continue →' : 'Start quest →'}</Text></View>
        </Pressable>)}</ScrollView>
      </View></View>
    </Modal>
  </View></ScreenShell>;
}
const s = StyleSheet.create({
  page: { paddingHorizontal: 22, paddingTop: 12, maxWidth: 680, width: '100%', alignSelf: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  heading: { color: '#F6FBFF', fontSize: 36, fontWeight: '700', marginTop: 28 },
  title: { color: '#F6FBFF', fontSize: 23, lineHeight: 30, fontWeight: '700', marginTop: 14, flexShrink: 1 },
  body: { color: '#AAC0CF', fontSize: 14, lineHeight: 22, marginTop: 10 },
  small: { color: '#AAC0CF', fontSize: 12, lineHeight: 18 }, accent: { color: '#79DBEE', fontSize: 12, fontWeight: '700' },
  hero: { padding: 22, borderRadius: 23, backgroundColor: '#102334' },
  track: { height: 5, borderRadius: 5, backgroundColor: '#2D4053', overflow: 'hidden', marginTop: 18 },
  primary: { backgroundColor: '#65D9EE', minHeight: 56, borderRadius: 16, paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22 },
  primaryText: { fontSize: 16, fontWeight: '700', color: '#07131F' }, link: { minHeight: 54, justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: '#000A', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: { maxHeight: '90%', backgroundColor: '#0C1A2A', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 36, maxWidth: 680, width: '100%' },
  close: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  quest: { borderWidth: 1, borderRadius: 18, backgroundColor: '#142638', padding: 18, marginTop: 16 },
  questTitle: { color: '#F6FBFF', fontSize: 19, fontWeight: '600', marginTop: 12 },
});
