import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInLeft, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { DailyRing } from '@/components/progress-visuals';
import { ScreenShell, TaskRow, TRACKS, type TrackConfig } from '@/components/path-ui';
import { nativeTheme } from '@/lib/native-theme';
import { ARCHETYPE_META, getCycleProgress, getDailyQuests, getEvolutionIdentity, type TrackKey, useProgress } from '@/context/progress';

function PathCard({ track, completed, index, onPress }: { track: TrackConfig; completed: number; index: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const motion = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View entering={FadeInDown.delay(index * 80).duration(480)} style={[styles.pathCardWrap, motion]}>
      <Pressable testID={`track-${track.key}`} onPress={onPress} onPressIn={() => { scale.value = withSpring(0.97); }} onPressOut={() => { scale.value = withSpring(1); }} style={[styles.pathCard, { borderColor: `${track.color}3D` }]}>
        <View style={[styles.pathGlow, { backgroundColor: track.glow }]} />
        <View style={[styles.pathIcon, { backgroundColor: `${track.color}1D` }]}><Feather name={track.icon} size={19} color={track.color} /></View>
        <View style={styles.pathTitleRow}><Text style={styles.pathLabel}>{track.label}</Text><Feather name="arrow-up-right" size={16} color={track.color} /></View>
        <Text style={styles.pathDescription} numberOfLines={2}>{track.benefit}</Text>
        <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${Math.max(4, (completed / 3) * 100)}%`, backgroundColor: track.color }]} /></View>
        <Text style={[styles.pathMeta, { color: track.color }]}>{completed}/3 TODAY</Text>
      </Pressable>
    </Animated.View>
  );
}

export function HomeScreen() {
  const router = useRouter();
  const { profile, totalXp, level, levelProgress, currentStreak, isComplete, trackCompleted, cycleStartedAt } = useProgress();
  const homeTasks = getDailyQuests(profile);
  const doneToday = homeTasks.filter((task) => isComplete(task.id)).length;
  const allComplete = doneToday === homeTasks.length;
  const focus = profile?.focusTrack ?? 'mind';
  const cycle = getCycleProgress(cycleStartedAt);
  const identity = getEvolutionIdentity(profile);
  const archetype = ARCHETYPE_META[profile?.archetype ?? 'sovereign'];

  return (
    <ScreenShell>
      <View style={styles.pagePadding}>
        <View style={styles.topBar}>
          <Animated.View entering={FadeInLeft.duration(500)}><Text style={styles.eyebrow}>GROWTH PATH</Text><Text style={styles.greeting}>Your path, today.</Text></Animated.View>
          <Animated.View entering={FadeInRight.duration(500)} style={styles.levelMark}><Text style={styles.levelNumber}>LV {level}</Text><Text style={styles.levelXp}>{totalXp} XP</Text></Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(80).duration(560)}>
          <LinearGradient colors={allComplete ? ['#0D342F', '#0B2230'] : ['#0D2232', '#0B1725']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={styles.heroCopy}>
              <View style={styles.signalPill}><View style={[styles.signalDot, { backgroundColor: allComplete ? '#4CD6B0' : '#55D6FF' }]} /><Text style={styles.signalText}>{allComplete ? 'DAILY SIGNAL COMPLETE' : `${TRACKS[focus].label.toUpperCase()} IS YOUR FOCUS`}</Text></View>
              <Text style={styles.heroTitle}>{allComplete ? 'You kept all four promises.' : 'Become better in every direction.'}</Text>
              <Text style={styles.heroDetail}>{allComplete ? 'The reward is not only XP. It is evidence that you follow through.' : 'Four paths. One life. Take the next clear step.'}</Text>
            </View>
            <DailyRing completed={doneToday} total={homeTasks.length} />
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(520)}>
          <Pressable onPress={() => router.push('/evolve' as Href)} style={[styles.evolutionStrip, { borderColor: `${archetype.color}45` }]}>
            <View style={[styles.evolutionIcon, { backgroundColor: `${archetype.color}1A` }]}><Feather name="hexagon" size={18} color={archetype.color} /></View>
            <View style={styles.evolutionCopy}><Text style={[styles.evolutionKicker, { color: archetype.color }]}>DAY {cycle.day} · {cycle.chapter.title.toUpperCase()}</Text><Text style={styles.evolutionTitle}>{identity.current} <Text style={{ color: archetype.color }}>→ {identity.next}</Text></Text><View style={styles.evolutionTrack}><View style={[styles.evolutionFill, { width: `${cycle.progress * 100}%`, backgroundColor: archetype.color }]} /></View></View>
            <Feather name="chevron-right" size={18} color="#61788A" />
          </Pressable>
        </Animated.View>

        <View style={styles.statsRow}>
          <Animated.View entering={FadeInDown.delay(150).duration(470)} style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: 'rgba(141,124,255,0.16)' }]}><Feather name="zap" size={17} color="#8D7CFF" /></View><View><Text style={styles.statValue}>{currentStreak}</Text><Text style={styles.statLabel}>DAY MOMENTUM</Text></View></Animated.View>
          <Animated.View entering={FadeInDown.delay(210).duration(470)} style={styles.statCard}><View style={[styles.statIcon, { backgroundColor: 'rgba(255,204,102,0.16)' }]}><Feather name="award" size={17} color="#FFCC66" /></View><View><Text style={styles.statValue}>{Math.round(levelProgress * 250)}</Text><Text style={styles.statLabel}>XP TO NEXT LEVEL</Text></View></Animated.View>
        </View>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Today’s ritual</Text><Text style={styles.sectionSubtext}>Four paths + one rotating human skill</Text></View><Text style={styles.sectionMeta}>{doneToday}/{homeTasks.length} COMPLETE</Text></View>
        <View style={styles.taskList}>{homeTasks.map((task, index) => <TaskRow key={task.id} {...task} trackColor={task.trackColor} index={index} />)}</View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>The four paths</Text><Text style={styles.sectionMeta}>EXPLORE</Text></View>
        <View style={styles.pathGrid}>{(Object.keys(TRACKS) as TrackKey[]).map((key, index) => <PathCard key={key} track={TRACKS[key]} completed={trackCompleted(key)} index={index} onPress={() => router.push(`/${key}`)} />)}</View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pagePadding: { paddingHorizontal: 18 }, topBar: { paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 10.5, letterSpacing: 2.2 }, greeting: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 27, letterSpacing: -0.7, marginTop: 5 },
  levelMark: { width: 57, height: 57, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#10283A', borderWidth: 1, borderColor: '#2E5C75', shadowColor: '#55D6FF', shadowOpacity: 0.18, shadowRadius: 14 },
  levelNumber: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 15 }, levelXp: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 0.7, marginTop: 2 },
  hero: { minHeight: 190, borderRadius: 23, marginTop: 23, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#24465C', overflow: 'hidden' },
  heroGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, right: -65, top: -60, backgroundColor: 'rgba(85,214,255,0.08)' }, heroCopy: { flex: 1 },
  signalPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, backgroundColor: 'rgba(85,214,255,0.08)' }, signalDot: { width: 6, height: 6, borderRadius: 3 },
  signalText: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1 }, heroTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 23, lineHeight: 28, letterSpacing: -0.5, marginTop: 14 },
  heroDetail: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11.5, lineHeight: 17, marginTop: 8 }, statsRow: { flexDirection: 'row', gap: 10, marginTop: 11 },
  evolutionStrip: { minHeight: 82, marginTop: 11, borderRadius: 18, borderWidth: 1, padding: 12, backgroundColor: 'rgba(13,28,42,0.9)', flexDirection: 'row', alignItems: 'center', gap: 11 }, evolutionIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, evolutionCopy: { flex: 1 }, evolutionKicker: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 8, letterSpacing: 1 }, evolutionTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 10.5, marginTop: 4 }, evolutionTrack: { height: 3, borderRadius: 3, backgroundColor: '#1A3040', overflow: 'hidden', marginTop: 7 }, evolutionFill: { height: '100%', borderRadius: 3 },
  statCard: { flex: 1, minHeight: 66, borderRadius: 17, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(13,28,42,0.9)', borderWidth: 1, borderColor: '#203A4F' },
  statIcon: { width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, statValue: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 17 }, statLabel: { color: '#61788A', fontFamily: nativeTheme.typography.sans.bold, fontSize: 7.5, letterSpacing: 0.75, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 29, marginBottom: 11 }, sectionTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 18 }, sectionSubtext: { color: '#61788A', fontFamily: nativeTheme.typography.sans.regular, fontSize: 9.5, marginTop: 3 },
  sectionMeta: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 9, letterSpacing: 1.2 }, taskList: { gap: 10 }, pathGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pathCardWrap: { width: '48.5%' }, pathCard: { minHeight: 182, borderRadius: 19, borderWidth: 1, padding: 14, backgroundColor: 'rgba(13,28,42,0.9)', overflow: 'hidden' }, pathGlow: { position: 'absolute', width: 105, height: 105, borderRadius: 55, right: -45, top: -40 },
  pathIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 13 }, pathTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, pathLabel: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 16 },
  pathDescription: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, lineHeight: 15, marginTop: 6 }, miniTrack: { height: 4, borderRadius: 4, backgroundColor: '#1A3040', overflow: 'hidden', marginTop: 'auto' }, miniFill: { height: '100%', borderRadius: 4 }, pathMeta: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1, marginTop: 7 },
});
