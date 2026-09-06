import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ShareProgress } from '@/components/share-progress';
import { MomentumChart } from '@/components/progress-visuals';
import { ProgrammeDashboard } from '@/components/programme-dashboard';
import { ScreenHeader, ScreenShell, TRACKS } from '@/components/path-ui';
import { nativeTheme } from '@/lib/native-theme';
import { type TrackKey, useProgress } from '@/context/progress';

function AttributeCard({ track, xp, selected, index, hapticsEnabled, onPress }: { track: TrackKey; xp: number; selected: boolean; index: number; hapticsEnabled: boolean; onPress: () => void }) {
  const config = TRACKS[track];
  const fill = useSharedValue(0);
  useEffect(() => { fill.value = withTiming(Math.max(0.025, Math.min(1, xp / 250)), { duration: 700 }); }, [fill, xp]);
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: fill.value }] }));
  return (
    <Animated.View entering={FadeInDown.delay(index * 75).duration(470)} style={styles.attributeWrap}>
      <Pressable onPress={() => { if (hapticsEnabled) void Haptics.selectionAsync(); onPress(); }} style={[styles.attributeCard, selected && { borderColor: config.color, backgroundColor: `${config.color}11` }]}>
        <View style={styles.attributeTop}><View style={[styles.attributeIcon, { backgroundColor: `${config.color}1C` }]}><Feather name={config.icon} size={16} color={config.color} /></View><Text style={[styles.attributeXp, { color: config.color }]}>{xp}</Text></View>
        <Text style={styles.attributeLabel}>{config.label}</Text>
        <View style={styles.attributeTrack}><Animated.View style={[styles.attributeFill, { backgroundColor: config.color }, fillStyle]} /></View>
      </Pressable>
    </Animated.View>
  );
}

export default function ProgressRoute() {
  const { totalCompleted, totalXp, level, levelProgress, currentStreak, achievements, trackCompleted, trackXp, weeklyXp, hapticsEnabled } = useProgress();
  const [selectedTrack, setSelectedTrack] = useState<TrackKey>('mind');
  const selected = TRACKS[selectedTrack];
  const pathScores = (Object.keys(TRACKS) as TrackKey[]).filter((track) => track !== 'soul').map((track) => trackXp(track));
  const strongestPath = Math.max(...pathScores);
  const balanceScore = strongestPath === 0 ? 0 : Math.round((Math.min(...pathScores) / strongestPath) * 100);
  return (
    <ScreenShell>
      <View style={styles.pagePadding}>
        <ScreenHeader eyebrow="YOUR PROGRESS" title="Proof you returned." subtitle="Review completed assignments and recorded effort." icon="trending-up" />

        <Animated.View entering={FadeInDown.delay(80).duration(520)} style={styles.levelCard}>
          <View style={styles.levelGlow} />
          <View><Text style={styles.levelEyebrow}>CURRENT RANK</Text><Text style={styles.levelTitle}>Level {level}</Text><Text style={styles.levelDetail}>{totalXp} lifetime XP · {totalCompleted} sessions recorded</Text></View>
          <View style={styles.levelBadge}><Text style={styles.levelBadgeNumber}>{Math.round(levelProgress * 250)}</Text><Text style={styles.levelBadgeLabel}>/250 XP</Text></View>
          <View style={styles.levelTrack}><View style={[styles.levelFill, { width: `${Math.max(2, levelProgress * 100)}%` }]} /></View>
        </Animated.View>

        <View style={styles.quickStats}>
          <View style={styles.quickCard}><Feather name="zap" size={18} color="#8D7CFF" /><Text style={styles.quickNumber}>{currentStreak}</Text><Text style={styles.quickLabel}>DAY STREAK</Text></View>
          <View style={styles.quickCard}><Feather name="check-circle" size={18} color="#4CD6B0" /><Text style={styles.quickNumber}>{totalCompleted}</Text><Text style={styles.quickLabel}>QUESTS</Text></View>
          <View style={styles.quickCard}><Feather name="award" size={18} color="#FFCC66" /><Text style={styles.quickNumber}>{achievements.length}</Text><Text style={styles.quickLabel}>BADGES</Text></View>
        </View>

        <ShareProgress />
        <ProgrammeDashboard />
        <Text style={styles.sectionTitle}>Momentum</Text>
        <MomentumChart points={weeklyXp} />

        <View style={styles.sectionRow}><Text style={styles.sectionTitleInline}>Recorded XP</Text><Text style={styles.sectionHint}>TAP TO EXPLORE</Text></View>
        <View style={styles.attributeGrid}>{(Object.keys(TRACKS) as TrackKey[]).filter((track) => track !== 'soul').map((track, index) => <AttributeCard key={track} track={track} xp={trackXp(track)} selected={track === selectedTrack} index={index} hapticsEnabled={hapticsEnabled} onPress={() => setSelectedTrack(track)} />)}</View>
        <Animated.View key={selectedTrack} entering={FadeInDown.duration(360)} style={[styles.attributeInsight, { borderColor: `${selected.color}45` }]}>
          <View style={[styles.insightIcon, { backgroundColor: `${selected.color}1C` }]}><Feather name={selected.icon} size={20} color={selected.color} /></View>
          <View style={styles.insightCopy}><Text style={[styles.insightEyebrow, { color: selected.color }]}>{selected.label.toUpperCase()} SIGNAL</Text><Text style={styles.insightTitle}>{trackCompleted(selectedTrack)} sessions today</Text><Text style={styles.insightBody}>{selected.benefit}</Text></View>
        </Animated.View>

        <View style={styles.sectionRow}><Text style={styles.sectionTitleInline}>Achievements</Text><Text style={styles.sectionHint}>{achievements.length} UNLOCKED</Text></View>
        <View style={styles.achievementCard}>
          {achievements.length === 0 ? <View style={styles.emptyAchievement}><View style={styles.lockIcon}><Feather name="lock" size={18} color="#61788A" /></View><View style={styles.emptyCopy}><Text style={styles.emptyTitle}>Your first badge is close.</Text><Text style={styles.emptyBody}>Complete one quest to create the first piece of evidence.</Text></View></View> : achievements.map((achievement, index) => <Animated.View key={achievement} entering={FadeInDown.delay(index * 80).duration(420)} style={styles.achievementRow}><View style={styles.awardIcon}><Feather name="award" size={17} color="#050A12" /></View><Text style={styles.achievementText}>{achievement}</Text><Feather name="check-circle" size={17} color="#4CD6B0" /></Animated.View>)}
        </View>
        <View style={styles.note}><View style={styles.noteLine} /><Text style={styles.noteText}>Progress is evidence that you are becoming someone who returns.</Text></View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pagePadding: { paddingHorizontal: 18 }, levelCard: { minHeight: 154, borderRadius: 21, padding: 17, backgroundColor: 'rgba(13,28,42,0.94)', borderWidth: 1, borderColor: '#294B60', overflow: 'hidden' },
  levelGlow: { position: 'absolute', width: 190, height: 190, borderRadius: 95, right: -85, top: -95, backgroundColor: 'rgba(85,214,255,0.09)' }, levelEyebrow: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 9.5, letterSpacing: 1.6 },
  levelTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 29, letterSpacing: -0.7, marginTop: 6 }, levelDetail: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11.5, marginTop: 5 },
  levelBadge: { position: 'absolute', right: 17, top: 20, alignItems: 'flex-end' }, levelBadgeNumber: { color: '#4CD6B0', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 23 }, levelBadgeLabel: { color: '#61788A', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 0.8 },
  levelTrack: { position: 'absolute', left: 17, right: 17, bottom: 18, height: 7, borderRadius: 7, backgroundColor: '#162B3A', overflow: 'hidden' }, levelFill: { height: '100%', borderRadius: 7, backgroundColor: '#55D6FF' },
  quickStats: { flexDirection: 'row', gap: 9, marginTop: 10 }, quickCard: { flex: 1, minHeight: 81, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,28,42,0.88)', borderWidth: 1, borderColor: '#203A4F' },
  quickNumber: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 18, marginTop: 4 }, quickLabel: { color: '#61788A', fontFamily: nativeTheme.typography.sans.bold, fontSize: 7.5, letterSpacing: 0.9, marginTop: 2 },
  balanceCard: { marginTop: 10, borderRadius: 18, padding: 15, backgroundColor: 'rgba(13,28,42,0.9)', borderWidth: 1, borderColor: '#24465C' }, balanceTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, balanceEyebrow: { color: '#4CD6B0', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1.35 }, balanceTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 20, marginTop: 4 }, balanceBadge: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(76,214,176,0.12)' }, balanceTrack: { height: 6, borderRadius: 6, backgroundColor: '#172C3B', overflow: 'hidden', marginTop: 13 }, balanceFill: { height: '100%', borderRadius: 6, backgroundColor: '#4CD6B0' }, balanceBody: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, lineHeight: 15, marginTop: 9 },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 28, marginBottom: 11 }, sectionTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 18, marginTop: 28, marginBottom: 11 },
  sectionHint: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1.1 }, attributeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, attributeWrap: { width: '48.5%' },
  sectionTitleInline: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 18 },
  attributeCard: { minHeight: 117, borderRadius: 17, padding: 13, backgroundColor: 'rgba(13,28,42,0.88)', borderWidth: 1, borderColor: '#203A4F' }, attributeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attributeIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, attributeXp: { fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 18 }, attributeLabel: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 13, marginTop: 9 },
  attributeTrack: { height: 5, borderRadius: 5, backgroundColor: '#172C3B', overflow: 'hidden', marginTop: 9 }, attributeFill: { width: '100%', height: '100%', borderRadius: 5, transformOrigin: 'left' },
  attributeInsight: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 18, padding: 15, marginTop: 11, backgroundColor: 'rgba(13,28,42,0.92)', borderWidth: 1 }, insightIcon: { width: 45, height: 45, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, insightCopy: { flex: 1 },
  insightEyebrow: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1.3 }, insightTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 14, marginTop: 4 }, insightBody: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, lineHeight: 15, marginTop: 3 },
  achievementCard: { borderRadius: 18, paddingHorizontal: 15, backgroundColor: 'rgba(13,28,42,0.9)', borderWidth: 1, borderColor: '#203A4F' }, emptyAchievement: { minHeight: 82, flexDirection: 'row', alignItems: 'center', gap: 12 }, lockIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: '#152635', alignItems: 'center', justifyContent: 'center' }, emptyCopy: { flex: 1 },
  emptyTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 13 }, emptyBody: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, lineHeight: 15, marginTop: 3 }, achievementRow: { minHeight: 61, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: 1, borderBottomColor: '#203A4F' }, awardIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#FFCC66', alignItems: 'center', justifyContent: 'center' }, achievementText: { flex: 1, color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 12.5 },
  note: { marginTop: 21, borderRadius: 17, backgroundColor: 'rgba(85,214,255,0.07)', padding: 16, overflow: 'hidden' }, noteLine: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: '#55D6FF' }, noteText: { color: '#C8D8E3', fontFamily: nativeTheme.typography.sans.medium, fontSize: 13, lineHeight: 19 },
});
