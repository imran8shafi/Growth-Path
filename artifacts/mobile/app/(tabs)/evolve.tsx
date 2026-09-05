import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ScreenHeader, ScreenShell, TaskRow } from '@/components/path-ui';
import {
  ARCHETYPE_META, CYCLE_CHAPTERS, TRAIT_META, getCycleProgress, getEvolutionIdentity,
  getFastingTargetHours, getTodayCrossTraining, type TraitKey, useProgress,
} from '@/context/progress';
import { EVIDENCE_COLORS, GROWTH_PROTOCOLS, type GrowthProtocol } from '@/lib/evolution';
import { nativeTheme } from '@/lib/native-theme';
import { AdaptiveInsight } from '@/components/adaptive-insight';
import { TrainingHighlights } from '@/components/training-hub';

type IconName = keyof typeof Feather.glyphMap;

function IdentityCard() {
  const { profile } = useProgress();
  const identity = getEvolutionIdentity(profile);
  const archetype = ARCHETYPE_META[profile?.archetype ?? 'sovereign'];
  return (
    <Animated.View entering={FadeInDown.delay(70).duration(520)} style={[styles.identityCard, { borderColor: `${archetype.color}52` }]}>
      <View style={[styles.identityIcon, { backgroundColor: `${archetype.color}1D` }]}><Feather name={archetype.icon as IconName} size={24} color={archetype.color} /></View>
      <View style={styles.identityCopy}>
        <Text style={styles.identityKicker}>CURRENT FORM</Text><Text style={styles.identityCurrent}>{identity.current}</Text>
        <View style={styles.identityRoute}><View style={[styles.identityLine, { backgroundColor: archetype.color }]} /><Feather name="arrow-right" size={12} color={archetype.color} /><Text style={[styles.identityNext, { color: archetype.color }]}>{identity.next}</Text></View>
      </View>
    </Animated.View>
  );
}

function CycleCard() {
  const { cycleStartedAt } = useProgress();
  const cycle = getCycleProgress(cycleStartedAt);
  return (
    <Animated.View entering={FadeInDown.delay(130).duration(520)}>
      <LinearGradient colors={['#11283B', '#0A1B2A']} style={styles.cycleCard}>
        <View style={styles.cycleTop}><View><Text style={styles.cycleKicker}>EVOLUTION CYCLE {cycle.cycle}</Text><Text style={styles.cycleTitle}>Chapter {cycle.chapterIndex + 1}: {cycle.chapter.title}</Text></View><View style={styles.dayBadge}><Text style={styles.dayNumber}>{cycle.day}</Text><Text style={styles.dayLabel}>/42 DAYS</Text></View></View>
        <Text style={styles.cycleDetail}>{cycle.chapter.detail}</Text>
        <View style={styles.cycleTrack}><View style={[styles.cycleFill, { width: `${cycle.progress * 100}%` }]} /></View>
        <View style={styles.chapterDots}>{CYCLE_CHAPTERS.map((chapter, index) => <View key={chapter.title} style={[styles.chapterDot, index <= cycle.chapterIndex && styles.chapterDotActive]} />)}</View>
      </LinearGradient>
    </Animated.View>
  );
}

function TraitGrid() {
  const { traitXp } = useProgress();
  return <View style={styles.traitGrid}>{(Object.keys(TRAIT_META) as TraitKey[]).map((key, index) => {
    const trait = TRAIT_META[key]; const xp = traitXp(key); const progress = Math.min(100, (xp / 180) * 100);
    return <Animated.View key={key} entering={FadeInDown.delay(260 + index * 55).duration(420)} style={styles.traitCard}>
      <View style={[styles.traitIcon, { backgroundColor: `${trait.color}1A` }]}><Feather name={trait.icon as IconName} size={16} color={trait.color} /></View>
      <Text style={styles.traitLabel}>{trait.label}</Text><Text style={[styles.traitXp, { color: trait.color }]}>{xp} XP</Text>
      <View style={styles.traitTrack}><View style={[styles.traitFill, { width: `${Math.max(3, progress)}%`, backgroundColor: trait.color }]} /></View>
    </Animated.View>;
  })}</View>;
}

function ProtocolCard({ protocol, expanded, onPress, index }: { protocol: GrowthProtocol; expanded: boolean; onPress: () => void; index: number }) {
  const color = EVIDENCE_COLORS[protocol.evidence];
  return <Animated.View entering={FadeInDown.delay(360 + index * 60).duration(430)} style={[styles.protocolCard, expanded && { borderColor: `${color}65` }]}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={onPress} style={styles.protocolTop}>
      <View style={[styles.protocolIcon, { backgroundColor: `${color}1A` }]}><Feather name="cpu" size={16} color={color} /></View>
      <View style={styles.protocolHeading}><Text style={styles.protocolTitle}>{protocol.title}</Text><Text style={styles.protocolCategory}>{protocol.category}</Text></View>
      <View style={[styles.evidencePill, { backgroundColor: `${color}18` }]}><Text style={[styles.evidenceText, { color }]}>{protocol.evidence.toUpperCase()}</Text></View>
      <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#61788A" />
    </Pressable>
    {expanded ? <Animated.View entering={FadeIn.duration(280)} style={styles.protocolBody}>
      <Text style={styles.protocolSummary}>{protocol.summary}</Text>
      <View style={[styles.protocolPractice, { borderLeftColor: color }]}><Text style={[styles.protocolPracticeLabel, { color }]}>TRY THIS</Text><Text style={styles.protocolPracticeText}>{protocol.practice}</Text></View>
      {protocol.caution ? <View style={styles.cautionRow}><Feather name="alert-circle" size={13} color="#FFCC66" /><Text style={styles.cautionText}>{protocol.caution}</Text></View> : null}
      <Pressable onPress={() => { void Linking.openURL(protocol.sourceUrl); }} style={styles.sourceButton}><Text style={styles.sourceText}>{protocol.sourceLabel}</Text><Feather name="external-link" size={12} color="#55D6FF" /></Pressable>
    </Animated.View> : null}
  </Animated.View>;
}

function formatElapsed(minutes: number) {
  const hours = Math.floor(minutes / 60); const remaining = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}

function FastingCard() {
  const { profile, fastingStartedAt, fastingSessions, startFast, finishFast, cancelFast } = useProgress();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { if (!fastingStartedAt) return; const timer = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(timer); }, [fastingStartedAt]);
  const targetHours = getFastingTargetHours(profile);
  const elapsedMinutes = fastingStartedAt ? Math.max(0, Math.floor((now - new Date(fastingStartedAt).getTime()) / 60_000)) : 0;
  const targetMinutes = targetHours * 60; const progress = Math.min(100, (elapsedMinutes / targetMinutes) * 100);
  const preference = profile?.fastingPreference ?? 'off'; const safety = profile?.fastingSafety ?? 'blocked';
  const available = preference !== 'off' && safety === 'clear';
  const status = preference === 'off' ? 'Not enabled in your plan' : safety === 'clinician' ? 'Clinician guidance required' : safety === 'blocked' ? 'Unavailable from your safety answers' : `${targetHours}-hour hydration-first window`;
  const startWithConfirmation = () => Alert.alert('Begin overnight fast?', `Your target is ${targetHours} hours. Water is allowed. Stop if you feel unwell; longer is not better.`, [{ text: 'Not now', style: 'cancel' }, { text: 'Begin', onPress: startFast }]);
  return <Animated.View entering={FadeInDown.delay(220).duration(520)} style={styles.fastingCard}>
    <View style={styles.fastingTop}><View style={styles.fastingIcon}><Feather name="clock" size={19} color="#4CD6B0" /></View><View style={styles.fastingHeading}><Text style={styles.fastingKicker}>OPTIONAL BODY PROTOCOL</Text><Text style={styles.fastingTitle}>Gentle fasting</Text></View><View style={styles.noCompetition}><Text style={styles.noCompetitionText}>NO STREAKS</Text></View></View>
    <Text style={styles.fastingStatus}>{status}</Text>
    {fastingStartedAt ? <>
      <View style={styles.timerRow}><Text style={styles.timerValue}>{formatElapsed(elapsedMinutes)}</Text><View><Text style={styles.timerLabel}>ELAPSED</Text><Text style={styles.timerTarget}>{elapsedMinutes >= targetMinutes ? 'Target reached—end when comfortable' : `${formatElapsed(targetMinutes - elapsedMinutes)} remaining`}</Text></View></View>
      <View style={styles.fastTrack}><View style={[styles.fastFill, { width: `${Math.max(2, progress)}%` }]} /></View>
      <View style={styles.fastActions}><Pressable onPress={finishFast} style={styles.finishFast}><Text style={styles.finishFastText}>End fast</Text></Pressable><Pressable onPress={cancelFast} style={styles.cancelFast}><Text style={styles.cancelFastText}>Cancel timer</Text></Pressable></View>
    </> : available ? <Pressable onPress={startWithConfirmation} style={styles.startFast}><Feather name="play" size={15} color="#050A12" /><Text style={styles.startFastText}>Start {targetHours}-hour timer</Text></Pressable> : <Text style={styles.fastingUnavailable}>Retake onboarding to change this. A clinician—not the app—should clear medical uncertainty.</Text>}
    <View style={styles.safetyNote}><Feather name="shield" size={14} color="#FFCC66" /><Text style={styles.safetyText}>Never dry fast. Stop for dizziness, confusion, faintness, unusual weakness, or other concerning symptoms. This is not medical care.</Text></View>
    <Text style={styles.sessionCount}>{fastingSessions.length} session{fastingSessions.length === 1 ? '' : 's'} recorded · no XP for duration</Text>
  </Animated.View>;
}

function PathCircle() {
  const { profile } = useProgress(); const archetype = ARCHETYPE_META[profile?.archetype ?? 'sovereign'];
  const invite = () => { void Share.share({ message: `I’m starting a 42-day Growth Path cycle to become a more rounded person—mind, body, soul, freedom, and practical human skills. Will you be my weekly accountability partner? My next form: ${archetype.evolved}.` }); };
  return <View style={styles.circleCard}><View style={styles.circleIcon}><Feather name="users" size={20} color="#8D7CFF" /></View><View style={styles.circleCopy}><Text style={styles.circleKicker}>PATH CIRCLE</Text><Text style={styles.circleTitle}>Do not evolve entirely alone.</Text><Text style={styles.circleDetail}>Invite one trusted person to ask what you practiced—not whether you were perfect.</Text></View><Pressable onPress={invite} style={styles.inviteButton}><Feather name="send" size={15} color="#F6FBFF" /></Pressable></View>;
}

export default function EvolveRoute() {
  const { profile, adaptivePlan, planDate } = useProgress();
  const crossTraining = getTodayCrossTraining(profile, planDate, adaptivePlan);
  const [expanded, setExpanded] = useState<string | null>('fasting');
  return <ScreenShell><View style={styles.pagePadding}>
    <ScreenHeader eyebrow="WHOLE-PERSON TRAINING" title="Become useful in every direction." subtitle="Build depth without becoming narrow: judgment, capability, conviction, freedom, humor, adaptability, courage, creativity, and human skill." icon="hexagon" color="#6DE3FF" />
    <IdentityCard /><CycleCard /><AdaptiveInsight /><TrainingHighlights />
    <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Today’s cross-training</Text><Text style={styles.sectionSubtitle}>One rotating human skill beyond the four paths</Text></View><Text style={styles.sectionMeta}>+30 XP</Text></View>
    <TaskRow {...crossTraining} trackColor={crossTraining.trackColor} />
    <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Human range</Text><Text style={styles.sectionSubtitle}>Train breadth without pretending to master everything</Text></View></View>
    <TraitGrid />
    <FastingCard />
    <View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Field protocols</Text><Text style={styles.sectionSubtitle}>Every claim shows how certain it is</Text></View><Text style={styles.sectionMeta}>EVIDENCE</Text></View>
    <View style={styles.protocolList}>{GROWTH_PROTOCOLS.map((protocol, index) => <ProtocolCard key={protocol.id} protocol={protocol} expanded={expanded === protocol.id} index={index} onPress={() => setExpanded((current) => current === protocol.id ? null : protocol.id)} />)}</View>
    <PathCircle />
  </View></ScreenShell>;
}

const styles = StyleSheet.create({
  pagePadding: { paddingHorizontal: 18 }, identityCard: { minHeight: 94, borderRadius: 20, padding: 15, borderWidth: 1, backgroundColor: 'rgba(13,28,42,0.92)', flexDirection: 'row', alignItems: 'center', gap: 13 }, identityIcon: { width: 51, height: 51, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, identityCopy: { flex: 1 }, identityKicker: { color: '#61788A', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1.3 }, identityCurrent: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 16, marginTop: 4 }, identityRoute: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 }, identityLine: { width: 21, height: 2, borderRadius: 2 }, identityNext: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 10.5 },
  cycleCard: { minHeight: 153, borderRadius: 21, padding: 16, borderWidth: 1, borderColor: '#284C63', marginTop: 11 }, cycleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }, cycleKicker: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1.5 }, cycleTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 19, marginTop: 6 }, cycleDetail: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11.5, lineHeight: 17, marginTop: 8 }, dayBadge: { alignItems: 'flex-end' }, dayNumber: { color: '#4CD6B0', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 24 }, dayLabel: { color: '#61788A', fontFamily: nativeTheme.typography.sans.bold, fontSize: 7.5, letterSpacing: 0.7 }, cycleTrack: { height: 6, borderRadius: 6, backgroundColor: '#193243', overflow: 'hidden', marginTop: 14 }, cycleFill: { height: '100%', borderRadius: 6, backgroundColor: '#55D6FF' }, chapterDots: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }, chapterDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#264052' }, chapterDotActive: { backgroundColor: '#4CD6B0' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, marginBottom: 11, gap: 10 }, sectionTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 18 }, sectionSubtitle: { color: '#61788A', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, marginTop: 4, maxWidth: 270 }, sectionMeta: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1 },
  traitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, traitCard: { width: '48.6%', minHeight: 112, borderRadius: 17, padding: 12, backgroundColor: 'rgba(13,28,42,0.9)', borderWidth: 1, borderColor: '#203A4F' }, traitIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, traitLabel: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 11.5, marginTop: 8 }, traitXp: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, marginTop: 3 }, traitTrack: { height: 4, borderRadius: 4, backgroundColor: '#172C3B', overflow: 'hidden', marginTop: 'auto' }, traitFill: { height: '100%', borderRadius: 4 },
  fastingCard: { borderRadius: 21, padding: 16, marginTop: 26, backgroundColor: 'rgba(13,35,42,0.94)', borderWidth: 1, borderColor: '#2D5A57' }, fastingTop: { flexDirection: 'row', alignItems: 'center', gap: 11 }, fastingIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(76,214,176,0.14)' }, fastingHeading: { flex: 1 }, fastingKicker: { color: '#4CD6B0', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8, letterSpacing: 1.2 }, fastingTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 16, marginTop: 3 }, noCompetition: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 10, backgroundColor: 'rgba(255,204,102,0.11)' }, noCompetitionText: { color: '#FFCC66', fontFamily: nativeTheme.typography.sans.bold, fontSize: 7, letterSpacing: 0.8 }, fastingStatus: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11.5, marginTop: 13 }, startFast: { minHeight: 46, borderRadius: 14, marginTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#4CD6B0' }, startFastText: { color: '#050A12', fontFamily: nativeTheme.typography.sans.bold, fontSize: 12.5 }, fastingUnavailable: { color: '#C8D8E3', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, lineHeight: 16, padding: 11, backgroundColor: 'rgba(255,255,255,0.025)', borderRadius: 12, marginTop: 12 }, timerRow: { flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 12 }, timerValue: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 31, letterSpacing: -1 }, timerLabel: { color: '#4CD6B0', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8, letterSpacing: 1.1 }, timerTarget: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10, marginTop: 3 }, fastTrack: { height: 6, borderRadius: 6, backgroundColor: '#183437', overflow: 'hidden', marginTop: 11 }, fastFill: { height: '100%', borderRadius: 6, backgroundColor: '#4CD6B0' }, fastActions: { flexDirection: 'row', gap: 8, marginTop: 12 }, finishFast: { flex: 1, minHeight: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4CD6B0' }, finishFastText: { color: '#050A12', fontFamily: nativeTheme.typography.sans.bold, fontSize: 12 }, cancelFast: { minWidth: 103, minHeight: 43, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#31525B' }, cancelFastText: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 10.5 }, safetyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 13, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#26454A' }, safetyText: { flex: 1, color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 9.5, lineHeight: 14 }, sessionCount: { color: '#61788A', fontFamily: nativeTheme.typography.sans.medium, fontSize: 8.5, marginTop: 9, textAlign: 'center' },
  protocolList: { gap: 9 }, protocolCard: { borderRadius: 17, padding: 13, backgroundColor: 'rgba(13,28,42,0.9)', borderWidth: 1, borderColor: '#203A4F' }, protocolTop: { flexDirection: 'row', alignItems: 'center', gap: 9 }, protocolIcon: { width: 35, height: 35, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, protocolHeading: { flex: 1 }, protocolTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 12.5 }, protocolCategory: { color: '#61788A', fontFamily: nativeTheme.typography.sans.bold, fontSize: 7.5, letterSpacing: 0.9, marginTop: 3 }, evidencePill: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 10 }, evidenceText: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 6.8, letterSpacing: 0.5 }, protocolBody: { borderTopWidth: 1, borderTopColor: '#203A4F', paddingTop: 12, marginTop: 12 }, protocolSummary: { color: '#C8D8E3', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11, lineHeight: 16 }, protocolPractice: { borderLeftWidth: 2, paddingLeft: 10, marginTop: 11 }, protocolPracticeLabel: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 8, letterSpacing: 1 }, protocolPracticeText: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.medium, fontSize: 10.5, lineHeight: 16, marginTop: 4 }, cautionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, padding: 9, borderRadius: 11, backgroundColor: 'rgba(255,204,102,0.07)', marginTop: 11 }, cautionText: { flex: 1, color: '#B9AA83', fontFamily: nativeTheme.typography.sans.regular, fontSize: 9.5, lineHeight: 14 }, sourceButton: { alignSelf: 'flex-start', flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 11 }, sourceText: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 9.5 },
  circleCard: { minHeight: 112, borderRadius: 20, padding: 15, marginTop: 25, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(141,124,255,0.09)', borderWidth: 1, borderColor: 'rgba(141,124,255,0.33)' }, circleIcon: { width: 43, height: 43, borderRadius: 14, backgroundColor: 'rgba(141,124,255,0.16)', alignItems: 'center', justifyContent: 'center' }, circleCopy: { flex: 1 }, circleKicker: { color: '#8D7CFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8, letterSpacing: 1.2 }, circleTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 13, marginTop: 4 }, circleDetail: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 9.5, lineHeight: 14, marginTop: 4 }, inviteButton: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#8D7CFF', alignItems: 'center', justifyContent: 'center' },
});
