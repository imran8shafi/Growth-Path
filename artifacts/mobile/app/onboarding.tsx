import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge } from '@/components/native/badge';
import { Button } from '@/components/native/button';
import { Card, CardContent } from '@/components/native/card';
import { nativeTheme } from '@/lib/native-theme';
import { useColors } from '@/hooks/use-colors';
import {
  type Ability,
  type BeliefStyle,
  type Equipment,
  type Goal,
  type OnboardingProfile,
  type TimeCommitment,
  type TrackKey,
  useProgress,
} from '@/context/progress';

type AnswerKey = keyof OnboardingProfile;
type Option = { value: string; label: string; detail: string; icon: keyof typeof Feather.glyphMap };
type Step = { key: AnswerKey; eyebrow: string; title: string; detail: string; options: Option[] };

const STEPS: Step[] = [
  {
    key: 'goal',
    eyebrow: 'START WITH WHY',
    title: 'What do you want becoming better to unlock?',
    detail: 'There is no wrong answer. Your reason helps shape the first version of your path.',
    options: [
      { value: 'discipline', label: 'Follow through', detail: 'Become steadier and harder to distract.', icon: 'target' },
      { value: 'energy', label: 'Feel more alive', detail: 'Have the energy to do the things that matter.', icon: 'sun' },
      { value: 'meaning', label: 'Live with meaning', detail: 'Return to the values beneath the noise.', icon: 'heart' },
      { value: 'autonomy', label: 'Create more freedom', detail: 'Build skills, systems, and room to choose.', icon: 'key' },
    ],
  },
  {
    key: 'focusTrack',
    eyebrow: 'YOUR STARTING POINT',
    title: 'Which part of your life needs the most support right now?',
    detail: 'All four attributes matter. This only helps us give your first steps the right emphasis.',
    options: [
      { value: 'mind', label: 'Mind', detail: 'Focus, learning, and clear thinking.', icon: 'book-open' },
      { value: 'body', label: 'Body', detail: 'Energy, movement, and recovery.', icon: 'activity' },
      { value: 'soul', label: 'Soul', detail: 'Stillness, values, and connection.', icon: 'sun' },
      { value: 'freedom', label: 'Freedom', detail: 'Skills, systems, and autonomy.', icon: 'key' },
    ],
  },
  {
    key: 'time',
    eyebrow: 'MAKE IT FIT',
    title: 'How much time can you honestly give this most days?',
    detail: 'A small promise you keep is more powerful than a perfect plan you avoid.',
    options: [
      { value: 'ten', label: '10 minutes', detail: 'A focused foothold on busy days.', icon: 'clock' },
      { value: 'twenty', label: '20 minutes', detail: 'A balanced daily practice.', icon: 'clock' },
      { value: 'forty', label: '40+ minutes', detail: 'Room for a deeper session.', icon: 'watch' },
    ],
  },
  {
    key: 'ability',
    eyebrow: 'MEET YOURSELF HERE',
    title: 'Where are you starting from?',
    detail: 'Your plan should challenge you without asking you to pretend you are someone else.',
    options: [
      { value: 'starting', label: 'Starting fresh', detail: 'I want simple wins and a gentle ramp.', icon: 'map-pin' },
      { value: 'building', label: 'Building momentum', detail: 'I have some habits, but want consistency.', icon: 'trending-up' },
      { value: 'advanced', label: 'Ready to deepen', detail: 'I want practices that stretch me.', icon: 'arrow-up-right' },
    ],
  },
  {
    key: 'beliefs',
    eyebrow: 'WHAT GROUNDS YOU',
    title: 'What kind of inner practice feels honest to you?',
    detail: 'The Soul path is about what helps you live from something deeper than impulse.',
    options: [
      { value: 'faith', label: 'Faith or prayer', detail: 'A tradition, God, or practice of devotion.', icon: 'sunrise' },
      { value: 'reflection', label: 'Reflection', detail: 'Stillness, gratitude, and honest attention.', icon: 'moon' },
      { value: 'service', label: 'People and service', detail: 'Love made visible through how I show up.', icon: 'users' },
      { value: 'open', label: 'I am exploring', detail: 'Keep it open, practical, and sincere.', icon: 'compass' },
    ],
  },
  {
    key: 'equipment',
    eyebrow: 'YOUR REAL WORLD',
    title: 'What resources do you have for the Body path?',
    detail: 'We will make the practice work where you actually live, not in an imaginary routine.',
    options: [
      { value: 'none', label: 'Just me', detail: 'Walking, bodyweight, and daily movement.', icon: 'user' },
      { value: 'home', label: 'A little at home', detail: 'A mat, bands, or a few basic tools.', icon: 'home' },
      { value: 'gym', label: 'A gym or full setup', detail: 'Weights and equipment are available.', icon: 'bar-chart-2' },
    ],
  },
];

export default function OnboardingRoute() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setProfile } = useProgress();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<OnboardingProfile>>({});
  const [direction, setDirection] = useState(1);
  const step = STEPS[stepIndex];
  const selected = answers[step.key] as string | undefined;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;
  const progress = (stepIndex + 1) / STEPS.length;

  const selectedCopy = useMemo(() => step.options.find((option) => option.value === selected), [selected, step.options]);

  const animateStepChange = (newDirection: number) => {
    setDirection(newDirection);
    const nextIndex = stepIndex + newDirection;
    setStepIndex(nextIndex);
  };

  const handleNext = () => {
    if (!selected) return;
    if (!isLast) {
      animateStepChange(1);
      return;
    }
    setProfile(answers as OnboardingProfile);
    router.replace('/(tabs)');
  };

  const handleBack = () => {
    if (!isFirst) {
      animateStepChange(-1);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.topBar}>
        <Badge tone="primary" size="sm" style={styles.brandMark}>
          <Feather name="compass" size={14} color={colors.primaryForeground} />
        </Badge>
        <Text style={[styles.brand, { color: colors.foreground }]}>GROWTH PATH</Text>
        <Text style={[styles.stepCount, { color: colors.mutedForeground }]}>{stepIndex + 1} / {STEPS.length}</Text>
      </View>

      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
        <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.content}>
        <Badge tone="primary" size="sm" style={styles.stepBadge}>
          BUILD YOUR PATH
        </Badge>
        <Text style={[styles.eyebrow, { color: colors.primary }]}>{step.eyebrow}</Text>
        <Text style={[styles.title, { color: colors.foreground }]}>{step.title}</Text>
        <Text style={[styles.detail, { color: colors.mutedForeground }]}>{step.detail}</Text>

        <View style={styles.options}>
          {step.options.map((option) => {
            const active = option.value === selected;
            return (
              <Pressable
                key={option.value}
                onPress={() => setAnswers((current) => ({ ...current, [step.key]: option.value }))}
                style={({ pressed }) => [
                  styles.optionCard,
                  { backgroundColor: active ? colors.sidebar : colors.card, borderColor: active ? colors.primary : colors.border, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Card style={{ backgroundColor: 'transparent', borderWidth: 0 }}>
                  <View style={styles.optionRow}>
                    <View style={[styles.optionIcon, { backgroundColor: active ? colors.primary : colors.muted }]}>
                      <Feather name={option.icon} size={18} color={active ? colors.primaryForeground : colors.foreground} />
                    </View>
                    <View style={styles.optionCopy}>
                      <Text style={[styles.optionLabel, { color: active ? colors.sidebarForeground : colors.foreground }]}>{option.label}</Text>
                      <Text style={[styles.optionDetail, { color: active ? colors.sidebarForeground : colors.mutedForeground }]}>{option.detail}</Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? colors.primary : 'transparent' },
                      ]}
                    >
                      {active && <Feather name="check" size={13} color={colors.primaryForeground} />}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.selectedText, { color: colors.mutedForeground }]}>{selectedCopy ? `Selected: ${selectedCopy.label}` : 'Choose what feels true today'}</Text>
        <Button
          testID="onboarding-continue"
          disabled={!selected}
          onPress={() => {
            if (!selected) return;
            if (!isLast) {
              animateStepChange(1);
              return;
            }
            setProfile(answers as OnboardingProfile);
            router.replace('/(tabs)');
          }}
          size="lg"
          fullWidth
          variant={isLast ? 'xp' : 'primary'}
        >
          {isLast ? 'Begin my path' : 'Continue'}
        </Button>
        {!isFirst && (
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => {
              if (!isFirst) {
                animateStepChange(-1);
              }
            }}
            style={styles.backButton}
          >
            Back
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: nativeTheme.spacing.lg },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: nativeTheme.spacing.sm },
  brandMark: { width: 32, height: 32, borderRadius: nativeTheme.radius.md, alignItems: 'center', justifyContent: 'center' },
  brand: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 11, letterSpacing: 1.8, flex: 1 },
  stepCount: { fontFamily: nativeTheme.typography.sans.medium, fontSize: 12 },
  progressTrack: { height: 5, borderRadius: 5, overflow: 'hidden', marginTop: nativeTheme.spacing.md },
  progressFill: { height: '100%', borderRadius: 5 },
  content: { flex: 1, paddingTop: nativeTheme.spacing.xxl },
  stepBadge: { marginBottom: nativeTheme.spacing.md },
  eyebrow: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 11, letterSpacing: 1.8, marginTop: nativeTheme.spacing.xl },
  title: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 28, lineHeight: 34, marginTop: nativeTheme.spacing.sm },
  detail: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 14, lineHeight: 22, marginTop: nativeTheme.spacing.md },
  options: { gap: nativeTheme.spacing.sm, marginTop: nativeTheme.spacing.xl },
  optionCard: { borderWidth: 1, borderRadius: nativeTheme.radius.lg, padding: 0, overflow: 'hidden' },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: nativeTheme.spacing.md, padding: nativeTheme.spacing.md },
  optionIcon: { width: 36, height: 36, borderRadius: nativeTheme.radius.md, alignItems: 'center', justifyContent: 'center' },
  optionCopy: { flex: 1, gap: 3 },
  optionLabel: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 14 },
  optionDetail: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 11, lineHeight: 16 },
  radio: { width: 22, height: 22, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  footer: { gap: nativeTheme.spacing.sm, paddingBottom: nativeTheme.spacing.md },
  selectedText: { fontFamily: nativeTheme.typography.sans.medium, fontSize: 12, textAlign: 'center' },
  backButton: { marginTop: nativeTheme.spacing.xs },
});