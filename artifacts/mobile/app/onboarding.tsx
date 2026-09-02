import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp,
  cancelAnimation, useAnimatedStyle, useSharedValue,
  withDelay, withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type OnboardingProfile, type TrackKey, useProgress } from '@/context/progress';
import { nativeTheme } from '@/lib/native-theme';

const C = {
  bg: '#050A12', deep: '#071B2A', panel: '#0D1C2A', panelBright: '#11283B',
  border: '#203A4F', text: '#F6FBFF', muted: '#91A7B8', subtle: '#61788A',
  cyan: '#55D6FF', blue: '#459BFF', green: '#4CD6B0', gold: '#FFCC66',
};

type Stage = 'intro' | 'questions' | 'analysis' | 'result' | 'commit' | 'ready';
type AnswerKey = keyof OnboardingProfile;
type IconName = keyof typeof Feather.glyphMap;
type Option = { value: string; label: string; detail: string; icon: IconName };
type Question = { key: AnswerKey; pillar: string; title: string; subtitle: string; options: Option[] };

// Concrete, non-judgmental prompts informed by identity habits, attention training,
// recovery, implementation intentions, and values reflection.
const QUESTIONS: Question[] = [
  {
    key: 'goal', pillar: 'YOUR WHY',
    title: 'What would make this journey feel worth it?',
    subtitle: 'Choose the change you want to feel first.',
    options: [
      { value: 'discipline', label: 'Trust myself again', detail: 'Do what I say I will do.', icon: 'target' },
      { value: 'energy', label: 'Feel alive again', detail: 'Have energy for what matters.', icon: 'zap' },
      { value: 'meaning', label: 'Feel more grounded', detail: 'Live with clarity and purpose.', icon: 'heart' },
      { value: 'autonomy', label: 'Create more freedom', detail: 'Build options for my future.', icon: 'key' },
    ],
  },
  {
    key: 'focusTrack', pillar: 'STARTING POINT',
    title: 'What feels most out of balance right now?',
    subtitle: 'Your path will include all four. We just need a place to begin.',
    options: [
      { value: 'mind', label: 'Mind', detail: 'Focus, learning, and clear thinking.', icon: 'book-open' },
      { value: 'body', label: 'Body', detail: 'Energy, strength, and recovery.', icon: 'activity' },
      { value: 'soul', label: 'Soul', detail: 'Meaning, stillness, and connection.', icon: 'sun' },
      { value: 'freedom', label: 'Freedom', detail: 'Skills, systems, and autonomy.', icon: 'compass' },
    ],
  },
  {
    key: 'consistency', pillar: 'YOUR PATTERN',
    title: 'When you decide to change, what usually happens?',
    subtitle: 'Be honest. The right plan starts with real life.',
    options: [
      { value: 'fresh', label: 'I do not know where to start', detail: 'I need a clear first step.', icon: 'map-pin' },
      { value: 'inconsistent', label: 'I start, then lose momentum', detail: 'Consistency is the hard part.', icon: 'refresh-cw' },
      { value: 'steady', label: 'I already show up often', detail: 'I want to go deeper.', icon: 'trending-up' },
    ],
  },
  {
    key: 'mindState', pillar: 'MIND',
    title: 'How does your mind feel most days?',
    subtitle: 'There is no ideal answer—only a useful starting point.',
    options: [
      { value: 'scattered', label: 'Scattered', detail: 'Too many tabs open in my head.', icon: 'shuffle' },
      { value: 'stressed', label: 'Heavy or tense', detail: 'My thoughts rarely slow down.', icon: 'cloud' },
      { value: 'clear', label: 'Mostly clear', detail: 'I want to sharpen my focus.', icon: 'crosshair' },
    ],
  },
  {
    key: 'energyLevel', pillar: 'BODY',
    title: 'How is your energy through the day?',
    subtitle: 'Think about an ordinary day, not your best one.',
    options: [
      { value: 'low', label: 'Usually low', detail: 'I often run on empty.', icon: 'battery' },
      { value: 'uneven', label: 'Up and down', detail: 'Good bursts, then a crash.', icon: 'bar-chart-2' },
      { value: 'strong', label: 'Mostly steady', detail: 'I want to protect and build it.', icon: 'battery-charging' },
    ],
  },
  {
    key: 'sleepQuality', pillar: 'RECOVERY',
    title: 'How do you usually wake up?',
    subtitle: 'Recovery is part of growth, not time away from it.',
    options: [
      { value: 'poor', label: 'Still exhausted', detail: 'Sleep rarely feels restorative.', icon: 'moon' },
      { value: 'okay', label: 'It depends on the day', detail: 'My sleep is inconsistent.', icon: 'sunrise' },
      { value: 'good', label: 'Mostly refreshed', detail: 'My recovery has a solid base.', icon: 'sun' },
    ],
  },
  {
    key: 'ability', pillar: 'RIGHT CHALLENGE',
    title: 'What pace feels right for you now?',
    subtitle: 'A plan works when challenge and capacity match.',
    options: [
      { value: 'starting', label: 'Gentle start', detail: 'Small wins. No overwhelm.', icon: 'feather' },
      { value: 'building', label: 'Steady build', detail: 'Enough challenge to grow.', icon: 'trending-up' },
      { value: 'advanced', label: 'Push me', detail: 'I am ready for deeper work.', icon: 'arrow-up-right' },
    ],
  },
  {
    key: 'beliefs', pillar: 'SOUL',
    title: 'What helps you feel grounded?',
    subtitle: 'Your inner path should feel sincere, not forced.',
    options: [
      { value: 'faith', label: 'Faith or prayer', detail: 'A tradition or devotion guides me.', icon: 'sunrise' },
      { value: 'reflection', label: 'Quiet reflection', detail: 'Stillness helps me return to myself.', icon: 'moon' },
      { value: 'service', label: 'People and service', detail: 'I find meaning in showing up for others.', icon: 'users' },
      { value: 'open', label: 'I am still exploring', detail: 'Keep it open, practical, and honest.', icon: 'compass' },
    ],
  },
  {
    key: 'time', pillar: 'DAILY PROMISE',
    title: 'On a hard day, how much can you still give?',
    subtitle: 'Choose the promise you can keep—not the perfect-day version.',
    options: [
      { value: 'ten', label: '10 minutes', detail: 'A small daily foothold.', icon: 'clock' },
      { value: 'twenty', label: '20 minutes', detail: 'A balanced daily practice.', icon: 'clock' },
      { value: 'forty', label: '40+ minutes', detail: 'Room for focused depth.', icon: 'watch' },
    ],
  },
  {
    key: 'equipment', pillar: 'YOUR REAL WORLD',
    title: 'Where will you move most often?',
    subtitle: 'We will fit the Body path to the life you already have.',
    options: [
      { value: 'none', label: 'Anywhere', detail: 'Walking and bodyweight movement.', icon: 'navigation' },
      { value: 'home', label: 'At home', detail: 'A mat, bands, or a few weights.', icon: 'home' },
      { value: 'gym', label: 'At a gym', detail: 'A full setup is available.', icon: 'bar-chart' },
    ],
  },
];

function Background({ children }: { children: React.ReactNode }) {
  const drift = useSharedValue(0);
  useEffect(() => {
    drift.value = withRepeat(withSequence(withTiming(1, { duration: 5000 }), withTiming(0, { duration: 5000 })), -1);
  }, [drift]);
  const orbOne = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value * 22 }, { scale: 0.96 + drift.value * 0.08 }], opacity: 0.28 + drift.value * 0.14,
  }));
  const orbTwo = useAnimatedStyle(() => ({
    transform: [{ translateY: -drift.value * 18 }, { scale: 1.04 - drift.value * 0.06 }], opacity: 0.18 + drift.value * 0.1,
  }));
  return (
    <LinearGradient colors={[C.bg, '#07131F', C.deep]} style={styles.background}>
      <StatusBar style="light" />
      <Animated.View pointerEvents="none" style={[styles.orb, styles.orbOne, orbOne]} />
      <Animated.View pointerEvents="none" style={[styles.orb, styles.orbTwo, orbTwo]} />
      {children}
    </LinearGradient>
  );
}

function BrandMark({ size = 76 }: { size?: number }) {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1.08, { duration: 1300 }), withTiming(1, { duration: 1300 })), -1);
  }, [pulse]);
  const motion = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <Animated.View style={[styles.brandGlow, { width: size + 36, height: size + 36, borderRadius: size }, motion]}>
      <LinearGradient colors={[C.cyan, C.blue, C.green]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.brandMark, { width: size, height: size, borderRadius: size / 2 }]}>
        <Feather name="compass" size={size * 0.46} color={C.bg} />
      </LinearGradient>
    </Animated.View>
  );
}

function PrimaryButton({ label, onPress, disabled = false, icon }: { label: string; onPress: () => void; disabled?: boolean; icon?: IconName }) {
  const scale = useSharedValue(1);
  const motion = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[styles.primaryButtonWrap, motion]}>
      <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.975); }} onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}>
        <Text style={[styles.primaryButtonText, disabled && styles.primaryButtonTextDisabled]}>{label}</Text>
        {icon ? <Feather name={icon} size={18} color={disabled ? C.subtle : C.bg} /> : null}
      </Pressable>
    </Animated.View>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  const satelliteStyles = [styles.constellation0, styles.constellation1, styles.constellation2, styles.constellation3];
  return (
    <View style={styles.introScreen}>
      <Animated.View entering={FadeIn.duration(650)} style={styles.introVisual}>
        <BrandMark />
        <View style={styles.constellation}>
          {(['book-open', 'activity', 'sun', 'key'] as IconName[]).map((icon, index) => (
            <Animated.View key={icon} entering={FadeIn.delay(450 + index * 120).duration(500)} style={[styles.constellationDot, satelliteStyles[index]]}>
              <Feather name={icon} size={14} color={index === 2 ? C.gold : C.cyan} />
            </Animated.View>
          ))}
        </View>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(250).duration(650)} style={styles.introCopy}>
        <Text style={styles.brandKicker}>GROWTH PATH</Text>
        <Text style={styles.introTitle}>Become who your{`\n`}life is asking for.</Text>
        <Text style={styles.introSubtitle}>A daily path for your mind, body, soul, and freedom.</Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(650).duration(600)} style={styles.introFooter}>
        <PrimaryButton label="Build my path" onPress={onStart} icon="arrow-right" />
        <Text style={styles.microCopy}>About 2 minutes • No perfect answers</Text>
      </Animated.View>
    </View>
  );
}

function ProgressHeader({ index, onBack }: { index: number; onBack: () => void }) {
  const progress = useSharedValue((index + 1) / QUESTIONS.length);
  useEffect(() => { progress.value = withTiming((index + 1) / QUESTIONS.length, { duration: 420 }); }, [index, progress]);
  const fill = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  return (
    <View style={styles.progressHeader}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} hitSlop={12} style={styles.backIcon}>
        <Feather name="arrow-left" size={21} color={C.text} />
      </Pressable>
      <View style={styles.progressTrack}><Animated.View style={[styles.progressFill, fill]} /></View>
      <Text style={styles.progressCount}>{index + 1}/{QUESTIONS.length}</Text>
    </View>
  );
}

function OptionCard({ option, selected, index, onPress }: { option: Option; selected: boolean; index: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const motion = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View entering={FadeInDown.delay(90 + index * 65).duration(360)} style={motion}>
      <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }}
        onPress={() => { void Haptics.selectionAsync(); onPress(); }}
        onPressIn={() => { scale.value = withSpring(0.985); }} onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.optionCard, selected && styles.optionCardSelected]}>
        <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
          <Feather name={option.icon} size={19} color={selected ? C.bg : C.cyan} />
        </View>
        <View style={styles.optionCopy}>
          <Text style={styles.optionLabel}>{option.label}</Text><Text style={styles.optionDetail}>{option.detail}</Text>
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <Feather name="check" size={13} color={C.bg} /> : null}</View>
      </Pressable>
    </Animated.View>
  );
}

function QuestionScreen({ question, index, selected, direction, onSelect, onBack, onContinue }: {
  question: Question; index: number; selected?: string; direction: number;
  onSelect: (value: string) => void; onBack: () => void; onContinue: () => void;
}) {
  return (
    <View style={styles.questionScreen}>
      <ProgressHeader index={index} onBack={onBack} />
      <Animated.View key={question.key} entering={direction > 0 ? FadeInRight.duration(420) : FadeInLeft.duration(420)} style={styles.questionBody}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.questionScroll}>
          <Text style={styles.pillar}>{question.pillar}</Text><Text style={styles.questionTitle}>{question.title}</Text>
          <Text style={styles.questionSubtitle}>{question.subtitle}</Text>
          <View accessibilityRole="radiogroup" style={styles.options}>
            {question.options.map((option, optionIndex) => <OptionCard key={option.value} option={option} index={optionIndex} selected={selected === option.value} onPress={() => onSelect(option.value)} />)}
          </View>
        </ScrollView>
        <View style={styles.questionFooter}>
          <PrimaryButton label={index === QUESTIONS.length - 1 ? 'Create my path' : 'Continue'} onPress={onContinue} disabled={!selected} icon="arrow-right" />
        </View>
      </Animated.View>
    </View>
  );
}

const ANALYSIS_STEPS = [
  { label: 'Reading your mind pattern', threshold: 12, icon: 'book-open' as IconName },
  { label: 'Mapping energy and recovery', threshold: 32, icon: 'activity' as IconName },
  { label: 'Finding your inner anchors', threshold: 52, icon: 'sun' as IconName },
  { label: 'Matching your daily capacity', threshold: 72, icon: 'clock' as IconName },
  { label: 'Choosing your first quests', threshold: 94, icon: 'compass' as IconName },
];

function AnalysisScreen({ onDone }: { onDone: () => void }) {
  const [percent, setPercent] = useState(1);
  useEffect(() => {
    const interval = setInterval(() => setPercent((current) => Math.min(100, current + (current < 70 ? 3 : 2))), 90);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (percent !== 100) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const timeout = setTimeout(onDone, 750); return () => clearTimeout(timeout);
  }, [onDone, percent]);
  const status = percent < 30 ? 'Understanding your starting point' : percent < 62 ? 'Balancing the four paths' : percent < 92 ? 'Shaping your daily rhythm' : 'Your path is almost ready';
  return (
    <View style={styles.analysisScreen}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <Text style={styles.analysisKicker}>BUILDING YOUR PATH</Text><Text style={styles.analysisPercent}>{percent}%</Text><Text style={styles.analysisTitle}>{status}</Text>
      </Animated.View>
      <View style={styles.analysisTrack}><View style={[styles.analysisFill, { width: `${percent}%` }]} /></View>
      <Animated.View entering={FadeInUp.delay(180).duration(500)} style={styles.statusPanel}>
        <Text style={styles.statusTitle}>Personalizing</Text>
        {ANALYSIS_STEPS.map((item) => {
          const complete = percent >= item.threshold;
          return <View key={item.label} style={styles.statusRow}>
            <View style={[styles.statusIcon, complete && styles.statusIconComplete]}><Feather name={complete ? 'check' : item.icon} size={14} color={complete ? C.bg : C.subtle} /></View>
            <Text style={[styles.statusLabel, complete && styles.statusLabelComplete]}>{item.label}</Text>
          </View>;
        })}
      </Animated.View>
      <Text style={styles.analysisNote}>Your answers stay on this device.</Text>
    </View>
  );
}

type Scores = Record<TrackKey, { now: number; potential: number }>;
function calculateScores(a: Partial<OnboardingProfile>): Scores {
  const consistency = a.consistency === 'steady' ? 18 : a.consistency === 'inconsistent' ? 8 : 3;
  const time = a.time === 'forty' ? 14 : a.time === 'twenty' ? 9 : 5;
  const raw = {
    mind: 34 + consistency + (a.mindState === 'clear' ? 20 : a.mindState === 'stressed' ? 5 : 9),
    body: 28 + time + (a.energyLevel === 'strong' ? 18 : a.energyLevel === 'uneven' ? 9 : 3) + (a.sleepQuality === 'good' ? 10 : a.sleepQuality === 'okay' ? 5 : 0),
    soul: 37 + consistency + (a.beliefs === 'open' ? 4 : 13), freedom: 34 + time + (a.goal === 'autonomy' ? 18 : 8),
  };
  const score = (track: TrackKey) => Math.min(82, raw[track] + (a.focusTrack === track ? 4 : 0));
  const make = (track: TrackKey) => { const now = score(track); return { now, potential: Math.min(94, now + 27) }; };
  return { mind: make('mind'), body: make('body'), soul: make('soul'), freedom: make('freedom') };
}

const SCORE_META: Record<TrackKey, { label: string; icon: IconName; color: string }> = {
  mind: { label: 'Mind', icon: 'book-open', color: C.cyan }, body: { label: 'Body', icon: 'activity', color: C.green },
  soul: { label: 'Soul', icon: 'sun', color: C.gold }, freedom: { label: 'Freedom', icon: 'key', color: C.blue },
};

function ScoreRow({ track, score, index }: { track: TrackKey; score: { now: number; potential: number }; index: number }) {
  const meta = SCORE_META[track]; const value = useSharedValue(0);
  useEffect(() => { value.value = withDelay(260 + index * 120, withTiming(score.now / 100, { duration: 850 })); }, [index, score.now, value]);
  const bar = useAnimatedStyle(() => ({ transform: [{ scaleX: value.value }] }));
  return (
    <Animated.View entering={FadeInDown.delay(120 + index * 90).duration(450)} style={styles.scoreCard}>
      <View style={styles.scoreTopRow}><View style={[styles.scoreIcon, { backgroundColor: `${meta.color}20` }]}><Feather name={meta.icon} size={16} color={meta.color} /></View>
        <Text style={styles.scoreLabel}>{meta.label}</Text><Text style={[styles.scoreValue, { color: meta.color }]}>{score.now}</Text></View>
      <View style={styles.scoreTrack}><View style={[styles.potentialMarker, { left: `${score.potential}%`, borderColor: meta.color }]} /><Animated.View style={[styles.scoreFill, { backgroundColor: meta.color }, bar]} /></View>
      <Text style={styles.potentialText}>90-day potential {score.potential}</Text>
    </Animated.View>
  );
}

function ResultScreen({ answers, onContinue }: { answers: Partial<OnboardingProfile>; onContinue: () => void }) {
  const scores = useMemo(() => calculateScores(answers), [answers]); const focus = (answers.focusTrack ?? 'mind') as TrackKey;
  return (
    <View style={styles.resultScreen}>
      <Animated.View entering={FadeInDown.duration(520)}>
        <View style={styles.completePill}><Feather name="check-circle" size={14} color={C.green} /><Text style={styles.completePillText}>PATH ANALYSIS COMPLETE</Text></View>
        <Text style={styles.resultTitle}>You do not need a new life.{`\n`}You need a clear next step.</Text>
        <Text style={styles.resultSubtitle}>This is a starting snapshot, not a score of your worth. Your strongest growth opportunity begins with {SCORE_META[focus].label.toLowerCase()}.</Text>
      </Animated.View>
      <View style={styles.scoreList}>{(Object.keys(scores) as TrackKey[]).map((track, index) => <ScoreRow key={track} track={track} score={scores[track]} index={index} />)}</View>
      <View style={styles.resultLegend}><View style={styles.legendDot} /><Text style={styles.resultLegendText}>Marker = what consistent practice can unlock in 90 days</Text></View>
      <PrimaryButton label="See my first commitment" onPress={onContinue} icon="arrow-right" />
    </View>
  );
}

function CommitmentScreen({ answers, onUnlock }: { answers: Partial<OnboardingProfile>; onUnlock: () => void }) {
  const focus = (answers.focusTrack ?? 'mind') as TrackKey;
  const time = answers.time === 'forty' ? '40 minutes' : answers.time === 'twenty' ? '20 minutes' : '10 minutes';
  const hold = useSharedValue(0); const ring = useAnimatedStyle(() => ({ transform: [{ scale: 0.7 + hold.value * 0.3 }], opacity: 0.18 + hold.value * 0.65 }));
  return (
    <View style={styles.commitScreen}>
      <Animated.View entering={FadeInDown.duration(520)} style={styles.commitCopy}>
        <Text style={styles.commitKicker}>YOUR FIRST PROMISE</Text><Text style={styles.commitTitle}>For the next 7 days,{`\n`}just keep the path alive.</Text>
        <Text style={styles.commitSubtitle}>On hard days, {time} is enough. Small actions are how a new identity becomes believable.</Text>
      </Animated.View>
      <Animated.View entering={FadeIn.delay(280).duration(600)} style={styles.promiseCard}>
        <View style={[styles.promiseIcon, { backgroundColor: `${SCORE_META[focus].color}20` }]}><Feather name={SCORE_META[focus].icon} size={22} color={SCORE_META[focus].color} /></View>
        <View style={styles.promiseCopy}><Text style={styles.promiseLabel}>BEGIN WITH {SCORE_META[focus].label.toUpperCase()}</Text><Text style={styles.promiseText}>One clear quest each day. You can always do more—but you never need to do everything.</Text></View>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(420).duration(520)} style={styles.holdArea}>
        <Pressable accessibilityRole="button" accessibilityLabel="Hold to begin your path" delayLongPress={900}
          onPressIn={() => { hold.value = withTiming(1, { duration: 950 }); }}
          onPressOut={() => { cancelAnimation(hold); hold.value = withTiming(0, { duration: 180 }); }}
          onLongPress={() => { hold.value = withSpring(1.08); void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onUnlock(); }} style={styles.holdButton}>
          <Animated.View style={[styles.holdRing, ring]} /><LinearGradient colors={[C.cyan, C.blue]} style={styles.holdCore}><Feather name="shield" size={35} color={C.bg} /></LinearGradient>
        </Pressable>
        <Text style={styles.holdLabel}>PRESS AND HOLD TO BEGIN</Text><Text style={styles.holdHint}>Choose to return, even when the day is imperfect.</Text>
      </Animated.View>
    </View>
  );
}

function ReadyScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => { const timeout = setTimeout(onDone, 1500); return () => clearTimeout(timeout); }, [onDone]);
  return <View style={styles.readyScreen}><Animated.View entering={FadeIn.duration(450)}><BrandMark size={68} /></Animated.View>
    <Animated.Text entering={FadeInUp.delay(250).duration(520)} style={styles.readyKicker}>PATH UNLOCKED</Animated.Text>
    <Animated.Text entering={FadeInUp.delay(420).duration(520)} style={styles.readyTitle}>Start where you are.{`\n`}Return tomorrow.</Animated.Text>
    <Animated.View entering={FadeIn.delay(650).duration(500)} style={styles.readyLine} /></View>;
}

export default function OnboardingRoute() {
  const insets = useSafeAreaInsets(); const { setProfile } = useProgress();
  const [stage, setStage] = useState<Stage>('intro'); const [questionIndex, setQuestionIndex] = useState(0); const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Partial<OnboardingProfile>>({}); const question = QUESTIONS[questionIndex]; const selected = answers[question?.key] as string | undefined;
  const next = () => { if (!selected) return; if (questionIndex === QUESTIONS.length - 1) { setStage('analysis'); return; } setDirection(1); setQuestionIndex((i) => i + 1); };
  const back = () => { if (questionIndex === 0) { setStage('intro'); return; } setDirection(-1); setQuestionIndex((i) => i - 1); };
  const finish = () => { setProfile(answers as OnboardingProfile); setStage('ready'); };
  return (
    <Background><View style={[styles.safeFrame, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 12 }]}>
      {stage === 'intro' ? <IntroScreen onStart={() => setStage('questions')} /> : null}
      {stage === 'questions' ? <QuestionScreen question={question} index={questionIndex} selected={selected} direction={direction} onSelect={(value) => setAnswers((a) => ({ ...a, [question.key]: value }))} onBack={back} onContinue={next} /> : null}
      {stage === 'analysis' ? <AnalysisScreen onDone={() => setStage('result')} /> : null}
      {stage === 'result' ? <ResultScreen answers={answers} onContinue={() => setStage('commit')} /> : null}
      {stage === 'commit' ? <CommitmentScreen answers={answers} onUnlock={finish} /> : null}
      {stage === 'ready' ? <ReadyScreen onDone={() => router.replace('/(tabs)')} /> : null}
    </View></Background>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 }, safeFrame: { flex: 1, paddingHorizontal: 20 },
  orb: { position: 'absolute', width: 290, height: 290, borderRadius: 145 }, orbOne: { top: -100, right: -120, backgroundColor: '#168BB0' }, orbTwo: { bottom: -120, left: -130, backgroundColor: '#0A5578' },
  brandGlow: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(85,214,255,0.09)', borderWidth: 1, borderColor: 'rgba(85,214,255,0.13)' },
  brandMark: { alignItems: 'center', justifyContent: 'center', shadowColor: C.cyan, shadowOpacity: 0.42, shadowRadius: 24, shadowOffset: { width: 0, height: 0 } },
  primaryButtonWrap: { width: '100%' }, primaryButton: { minHeight: 56, width: '100%', borderRadius: 16, backgroundColor: C.text, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  primaryButtonDisabled: { backgroundColor: '#233443' }, primaryButtonText: { color: C.bg, fontFamily: nativeTheme.typography.sans.bold, fontSize: 15 }, primaryButtonTextDisabled: { color: C.subtle },
  introScreen: { flex: 1, justifyContent: 'space-between', paddingTop: 56, paddingBottom: 10 }, introVisual: { flex: 1, minHeight: 220, alignItems: 'center', justifyContent: 'center' },
  constellation: { position: 'absolute', width: 250, height: 230 }, constellationDot: { position: 'absolute', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(13,28,42,0.92)', borderWidth: 1, borderColor: C.border },
  constellation0: { left: 8, top: 40 }, constellation1: { right: 0, top: 52 }, constellation2: { left: 28, bottom: 10 }, constellation3: { right: 22, bottom: 4 },
  introCopy: { alignItems: 'center', marginBottom: 40 }, brandKicker: { color: C.cyan, fontFamily: nativeTheme.typography.sans.bold, fontSize: 12, letterSpacing: 3.4, marginBottom: 15 },
  introTitle: { color: C.text, fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 36, lineHeight: 42, letterSpacing: -1.2, textAlign: 'center' },
  introSubtitle: { color: C.muted, fontFamily: nativeTheme.typography.sans.regular, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 310, marginTop: 16 }, introFooter: { gap: 13 }, microCopy: { color: C.subtle, textAlign: 'center', fontFamily: nativeTheme.typography.sans.medium, fontSize: 11 },
  questionScreen: { flex: 1 }, progressHeader: { height: 45, flexDirection: 'row', alignItems: 'center', gap: 13 }, backIcon: { width: 28, height: 36, justifyContent: 'center' },
  progressTrack: { flex: 1, height: 4, borderRadius: 4, backgroundColor: '#152635', overflow: 'hidden' }, progressFill: { width: '100%', height: '100%', borderRadius: 4, backgroundColor: C.cyan, transformOrigin: 'left' },
  progressCount: { color: C.subtle, width: 34, textAlign: 'right', fontFamily: nativeTheme.typography.sans.medium, fontSize: 11 }, questionBody: { flex: 1 }, questionScroll: { paddingTop: 23, paddingBottom: 94 },
  pillar: { color: C.cyan, fontFamily: nativeTheme.typography.sans.bold, fontSize: 11, letterSpacing: 2.2, marginBottom: 10 }, questionTitle: { color: C.text, fontFamily: nativeTheme.typography.sans.bold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  questionSubtitle: { color: C.muted, fontFamily: nativeTheme.typography.sans.regular, fontSize: 14, lineHeight: 21, marginTop: 11, maxWidth: 335 }, options: { gap: 10, marginTop: 24 },
  optionCard: { minHeight: 70, borderRadius: 15, padding: 13, backgroundColor: 'rgba(17,40,59,0.82)', borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionCardSelected: { backgroundColor: '#123445', borderColor: C.cyan, shadowColor: C.cyan, shadowOpacity: 0.16, shadowRadius: 12 }, optionIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: '#142D40', alignItems: 'center', justifyContent: 'center' },
  optionIconSelected: { backgroundColor: C.cyan }, optionCopy: { flex: 1, gap: 3 }, optionLabel: { color: C.text, fontFamily: nativeTheme.typography.sans.semibold, fontSize: 14 }, optionDetail: { color: C.muted, fontFamily: nativeTheme.typography.sans.regular, fontSize: 11.5, lineHeight: 16 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#486276', alignItems: 'center', justifyContent: 'center' }, radioSelected: { backgroundColor: C.cyan, borderColor: C.cyan },
  questionFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 15, backgroundColor: 'rgba(5,10,18,0.94)' },
  analysisScreen: { flex: 1, justifyContent: 'center' }, analysisKicker: { color: C.green, textAlign: 'center', fontFamily: nativeTheme.typography.sans.bold, fontSize: 11, letterSpacing: 2.4 },
  analysisPercent: { color: C.text, textAlign: 'center', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 58, letterSpacing: -2, marginTop: 18 }, analysisTitle: { color: C.text, textAlign: 'center', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 19, marginTop: 4 },
  analysisTrack: { height: 6, borderRadius: 6, backgroundColor: '#142534', overflow: 'hidden', marginTop: 26 }, analysisFill: { height: '100%', borderRadius: 6, backgroundColor: C.cyan },
  statusPanel: { marginTop: 30, padding: 18, borderRadius: 18, backgroundColor: 'rgba(13,28,42,0.9)', borderWidth: 1, borderColor: C.border }, statusTitle: { color: C.text, fontFamily: nativeTheme.typography.sans.bold, fontSize: 15, marginBottom: 13 },
  statusRow: { minHeight: 39, flexDirection: 'row', alignItems: 'center', gap: 11 }, statusIcon: { width: 25, height: 25, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#142635' }, statusIconComplete: { backgroundColor: C.green },
  statusLabel: { color: C.subtle, fontFamily: nativeTheme.typography.sans.medium, fontSize: 13 }, statusLabelComplete: { color: C.text }, analysisNote: { color: C.subtle, fontFamily: nativeTheme.typography.sans.regular, textAlign: 'center', fontSize: 11, marginTop: 22 },
  resultScreen: { flex: 1, paddingTop: 22, paddingBottom: 2 }, completePill: { alignSelf: 'flex-start', borderRadius: 99, backgroundColor: 'rgba(76,214,176,0.1)', borderWidth: 1, borderColor: 'rgba(76,214,176,0.24)', paddingHorizontal: 11, paddingVertical: 7, flexDirection: 'row', gap: 7, alignItems: 'center' },
  completePillText: { color: C.green, fontFamily: nativeTheme.typography.sans.bold, fontSize: 10, letterSpacing: 1.2 }, resultTitle: { color: C.text, fontFamily: nativeTheme.typography.sans.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.6, marginTop: 18 },
  resultSubtitle: { color: C.muted, fontFamily: nativeTheme.typography.sans.regular, fontSize: 12.5, lineHeight: 19, marginTop: 10 }, scoreList: { flex: 1, justifyContent: 'center', gap: 9, marginVertical: 14 },
  scoreCard: { borderRadius: 13, padding: 11, backgroundColor: 'rgba(13,28,42,0.86)', borderWidth: 1, borderColor: C.border }, scoreTopRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, scoreIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  scoreLabel: { color: C.text, flex: 1, fontFamily: nativeTheme.typography.sans.semibold, fontSize: 13 }, scoreValue: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 14 }, scoreTrack: { height: 6, borderRadius: 6, backgroundColor: '#1B3040', overflow: 'visible', marginTop: 9 },
  scoreFill: { width: '100%', height: 6, borderRadius: 6, transformOrigin: 'left' }, potentialMarker: { position: 'absolute', zIndex: 2, top: -3, width: 2, height: 12, borderLeftWidth: 2 }, potentialText: { color: C.subtle, fontFamily: nativeTheme.typography.sans.medium, fontSize: 9.5, marginTop: 6, textAlign: 'right' },
  resultLegend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 11 }, legendDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.cyan }, resultLegendText: { color: C.subtle, fontFamily: nativeTheme.typography.sans.regular, fontSize: 9.5 },
  commitScreen: { flex: 1, paddingTop: 36, paddingBottom: 12 }, commitCopy: { alignItems: 'center' }, commitKicker: { color: C.cyan, fontFamily: nativeTheme.typography.sans.bold, fontSize: 11, letterSpacing: 2.4 }, commitTitle: { color: C.text, textAlign: 'center', fontFamily: nativeTheme.typography.sans.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.8, marginTop: 14 },
  commitSubtitle: { color: C.muted, textAlign: 'center', fontFamily: nativeTheme.typography.sans.regular, fontSize: 14, lineHeight: 21, maxWidth: 330, marginTop: 13 }, promiseCard: { flexDirection: 'row', alignItems: 'center', gap: 13, borderRadius: 17, padding: 16, backgroundColor: 'rgba(13,28,42,0.9)', borderWidth: 1, borderColor: C.border, marginTop: 28 },
  promiseIcon: { width: 47, height: 47, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, promiseCopy: { flex: 1 }, promiseLabel: { color: C.cyan, fontFamily: nativeTheme.typography.sans.bold, fontSize: 10, letterSpacing: 1.3 }, promiseText: { color: C.text, fontFamily: nativeTheme.typography.sans.regular, fontSize: 12, lineHeight: 18, marginTop: 5 },
  holdArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 18 }, holdButton: { width: 138, height: 138, alignItems: 'center', justifyContent: 'center' }, holdRing: { position: 'absolute', width: 138, height: 138, borderRadius: 69, backgroundColor: C.cyan, borderWidth: 1, borderColor: C.cyan },
  holdCore: { width: 82, height: 82, borderRadius: 41, alignItems: 'center', justifyContent: 'center' }, holdLabel: { color: C.text, fontFamily: nativeTheme.typography.sans.bold, fontSize: 11, letterSpacing: 1.6, marginTop: 8 }, holdHint: { color: C.subtle, fontFamily: nativeTheme.typography.sans.regular, textAlign: 'center', fontSize: 11, marginTop: 8 },
  readyScreen: { flex: 1, alignItems: 'center', justifyContent: 'center' }, readyKicker: { color: C.green, fontFamily: nativeTheme.typography.sans.bold, fontSize: 11, letterSpacing: 2.8, marginTop: 30 }, readyTitle: { color: C.text, textAlign: 'center', fontFamily: nativeTheme.typography.sans.bold, fontSize: 29, lineHeight: 36, letterSpacing: -0.6, marginTop: 14 }, readyLine: { width: 42, height: 3, borderRadius: 3, backgroundColor: C.cyan, marginTop: 25 },
});
