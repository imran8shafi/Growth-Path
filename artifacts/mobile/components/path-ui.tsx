import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ColorValue,
  type ViewStyle,
} from 'react-native';
import { Badge } from '@/components/native/badge';
import { Button } from '@/components/native/button';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/native/card';
import { nativeTheme } from '@/lib/native-theme';
import { useColors } from '@/hooks/use-colors';
import type { TrackKey } from '@/context/progress';
import { getTrackTasks, useProgress } from '@/context/progress';

export type TrackConfig = {
  key: TrackKey;
  label: string;
  title: string;
  description: string;
  benefit: string;
  icon: keyof typeof Feather.glyphMap;
  colorKey: 'primary' | 'secondary' | 'accent';
  tasks: Array<{ id: string; title: string; detail: string; meta: string; xp: number; trackColor: string; trackIcon: string }>;
  resource?: { eyebrow: string; title: string; detail: string; icon: keyof typeof Feather.glyphMap };
};

export const TRACKS: Record<TrackKey, TrackConfig> = {
  mind: {
    key: 'mind',
    label: 'Mind',
    title: 'Sharpen the instrument.',
    description: 'Read deeply, think clearly, and build the focus to do meaningful work.',
    benefit: 'You become harder to distract and more capable of doing meaningful work.',
    icon: 'book-open',
    colorKey: 'primary',
    tasks: [
      { id: 'mind-read', title: 'Read for 20 minutes', detail: 'Deep work begins with attention.', meta: '20 MIN', xp: 35, trackColor: '#D97745', trackIcon: 'book-open' },
      { id: 'mind-journal', title: 'Write one clear thought', detail: 'Name what you are learning or avoiding.', meta: '5 MIN', xp: 30, trackColor: '#D97745', trackIcon: 'book-open' },
      { id: 'mind-learn', title: 'Study a useful skill', detail: 'Choose something that compounds.', meta: '25 MIN', xp: 45, trackColor: '#D97745', trackIcon: 'book-open' },
    ],
    resource: {
      eyebrow: 'On your shelf',
      title: 'Meditations',
      detail: 'A practical companion for meeting the day with steadiness.',
      icon: 'bookmark',
    },
  },
  body: {
    key: 'body',
    label: 'Body',
    title: 'Earn your energy.',
    description: 'Train, recover, and build a body that gives you more choices.',
    benefit: 'You gain the energy and resilience to meet life on your own terms.',
    icon: 'activity',
    colorKey: 'secondary',
    tasks: [
      { id: 'body-move', title: 'Complete today\'s training', detail: 'Push, pull, squat, hinge, carry, or walk.', meta: '30 MIN', xp: 40, trackColor: '#8FA58A', trackIcon: 'activity' },
      { id: 'body-recover', title: 'Get outside and breathe', detail: 'Light, air, and an unhurried pace.', meta: '10 MIN', xp: 30, trackColor: '#8FA58A', trackIcon: 'activity' },
      { id: 'body-sleep', title: 'Protect your sleep window', detail: 'Set tomorrow up before tonight ends.', meta: 'RITUAL', xp: 35, trackColor: '#8FA58A', trackIcon: 'activity' },
    ],
    resource: {
      eyebrow: 'Today\'s plan',
      title: 'Foundation circuit',
      detail: '3 rounds · Push-ups · Rows · Split squats · Hollow hold',
      icon: 'trending-up',
    },
  },
  soul: {
    key: 'soul',
    label: 'Soul',
    title: 'Return to what matters.',
    description: 'Make space for prayer, gratitude, service, and a life larger than the feed.',
    benefit: 'You become more grounded, generous, and connected to what matters.',
    icon: 'sun',
    colorKey: 'accent',
    tasks: [
      { id: 'soul-prayer', title: 'Practice stillness or prayer', detail: 'Use the language and tradition that grounds you.', meta: '10 MIN', xp: 35, trackColor: '#E8B45B', trackIcon: 'sun' },
      { id: 'soul-gratitude', title: 'Name three gifts', detail: 'Attention changes what becomes visible.', meta: '3 LINES', xp: 30, trackColor: '#E8B45B', trackIcon: 'sun' },
      { id: 'soul-serve', title: 'Make someone\'s day lighter', detail: 'A message, an act, or your full presence.', meta: 'ONE ACT', xp: 40, trackColor: '#E8B45B', trackIcon: 'sun' },
    ],
    resource: {
      eyebrow: 'A daily question',
      title: 'What is worth being faithful to?',
      detail: 'Carry the question into your reading, work, and relationships.',
      icon: 'heart',
    },
  },
  freedom: {
    key: 'freedom',
    label: 'Freedom',
    title: 'Build more room to choose.',
    description: 'Learn the skills, systems, and courage that make your time more your own.',
    benefit: 'You create more options, ownership, and room to choose your direction.',
    icon: 'key',
    colorKey: 'primary',
    tasks: [
      { id: 'freedom-audit', title: 'Audit one recurring expense', detail: 'Keep more of what your effort creates.', meta: '10 MIN', xp: 35, trackColor: '#D97745', trackIcon: 'key' },
      { id: 'freedom-build', title: 'Ship one small asset', detail: 'A useful offer, page, system, or conversation.', meta: '45 MIN', xp: 50, trackColor: '#D97745', trackIcon: 'key' },
      { id: 'freedom-learn', title: 'Study a freedom skill', detail: 'Sales, writing, code, investing, or craft.', meta: '25 MIN', xp: 45, trackColor: '#D97745', trackIcon: 'key' },
    ],
    resource: {
      eyebrow: 'Principle',
      title: 'Own the engine, not just the output.',
      detail: 'Build skills and assets that keep working after the workday ends.',
      icon: 'compass',
    },
  },
};

export function ScreenShell({
  children,
  scroll = true,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}) {
  const colors = useColors();
  const content = (
    <View
      style={[
        styles.shell,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === 'web' ? 67 : 0,
          paddingBottom: Platform.OS === 'web' ? 34 : 0,
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return scroll ? (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      scrollEnabled
    >
      {content}
    </ScrollView>
  ) : (
    content
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  icon,
  color,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon?: keyof typeof Feather.glyphMap;
  color?: string;
}) {
  const colors = useColors();
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: color ?? colors.primary }]}>{eyebrow}</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        </View>
        {icon ? (
          <View style={[styles.headerIcon, { backgroundColor: color ?? colors.primary }]}>
            <Feather name={icon} size={22} color={colors.primaryForeground} />
          </View>
        ) : null}
      </View>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{subtitle}</Text>
    </View>
  );
}

export function TaskRow({
  id,
  track,
  title,
  detail,
  meta,
  xp,
  trackColor,
  trackIcon,
  onPress,
  isComplete: completeProp,
}: {
  id: string;
  track: TrackKey;
  title: string;
  detail: string;
  meta: string;
  xp: number;
  trackColor: string;
  trackIcon: string;
  onPress?: () => void;
  isComplete?: boolean;
}) {
  const colors = useColors();
  const { isComplete, toggle } = useProgress();
  const complete = completeProp ?? isComplete(id);

  return (
    <Pressable
      testID={`task-${id}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: complete }}
      onPress={onPress ?? (() => toggle(id, track, xp))}
      style={({ pressed }) => [
        styles.taskRow,
        { borderBottomColor: colors.border, opacity: pressed ? 0.72 : 1 },
      ]}
    >
      <View
        style={[
          styles.check,
          {
            borderColor: complete ? trackColor : colors.border,
            backgroundColor: complete ? trackColor : 'transparent',
          },
        ]}
      >
        {complete && <Feather name="check" size={15} color={complete ? (trackColor === '#8FA58A' ? colors.foreground : colors.primaryForeground) : 'transparent'} />}
      </View>
      <View style={styles.taskCopy}>
        <Text
          style={[
            styles.taskTitle,
            { color: colors.foreground, textDecorationLine: complete ? 'line-through' : 'none' },
          ]}
        >
          {title}
        </Text>
        <Text style={[styles.taskDetail, { color: colors.mutedForeground }]}>{detail}</Text>
      </View>
      <View style={styles.taskMetaWrap}>
        <Text style={[styles.taskMeta, { color: colors.mutedForeground }]}>{meta}</Text>
        <Badge tone="xp" size="sm">+{xp} XP</Badge>
      </View>
    </Pressable>
  );
}

export function TrackScreen({ track }: { track: TrackKey }) {
  const colors = useColors();
  const config = TRACKS[track];
  const { profile, trackCompleted } = useProgress();
  const trackColor = colors[config.colorKey] as ColorValue;
  const completed = trackCompleted(track);
  const router = useRouter();
  const tasks = getTrackTasks(track, profile);

  return (
    <ScreenShell>
      <View style={styles.pagePadding}>
        <ScreenHeader
          eyebrow={`${config.label} PATH`}
          title={config.title}
          subtitle={config.description}
          icon={config.icon}
          color={String(trackColor)}
        />
        <View style={[styles.benefitCard, { backgroundColor: colors.secondary + '22', borderColor: colors.secondary }]}>
          <Feather name="arrow-up-right" size={17} color={String(trackColor)} />
          <View style={styles.benefitCopy}>
            <Text style={[styles.benefitLabel, { color: String(trackColor) }]}>WHAT THIS BUILDS</Text>
            <Text style={[styles.benefitText, { color: colors.foreground }]}>{config.benefit}</Text>
          </View>
        </View>
        <View style={styles.progressHeader}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Today's practice</Text>
          <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{completed}/3 complete</Text>
        </View>
        <Card style={{ backgroundColor: colors.card }}>
          <CardContent style={styles.taskList}>
            {tasks.map((task) => <TaskRow key={task.id} {...task} />)}
          </CardContent>
        </Card>

        {config.resource ? (
          <Card style={[styles.resourceCard, { backgroundColor: colors.sidebar }]}>
            <CardHeader>
              <Badge>{config.resource.eyebrow}</Badge>
            </CardHeader>
            <CardContent style={styles.resourceContent}>
              <View style={[styles.resourceIcon, { backgroundColor: trackColor }]}>
                <Feather name={config.resource.icon} size={20} color={colors.primaryForeground} />
              </View>
              <View style={styles.resourceCopy}>
                <Text style={[styles.resourceTitle, { color: colors.sidebarForeground }]}>{config.resource.title}</Text>
                <Text style={[styles.resourceDetail, { color: colors.sidebarForeground }]}>{config.resource.detail}</Text>
              </View>
            </CardContent>
          </Card>
        ) : null}

        <View style={styles.nextStep}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Keep going</Text>
          <Text style={[styles.bodyCopy, { color: colors.mutedForeground }]}>
            Small practices become a life when they are repeated. Come back tomorrow and take the next step.
          </Text>
          <Button
            testID={`back-home-${track}`}
            variant="outline"
            onPress={() => router.push('/')}
            style={styles.nextButton}
          >
            Return to today
          </Button>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  pagePadding: { paddingHorizontal: nativeTheme.spacing.lg, paddingBottom: 48 },
  header: { paddingTop: nativeTheme.spacing.xxl, paddingBottom: nativeTheme.spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: nativeTheme.spacing.lg },
  headerCopy: { flex: 1 },
  eyebrow: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 11, letterSpacing: 1.6 },
  title: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 30, lineHeight: 36, marginTop: nativeTheme.spacing.sm },
  subtitle: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 15, lineHeight: 23, marginTop: nativeTheme.spacing.md, maxWidth: 340 },
  headerIcon: { width: 52, height: 52, borderRadius: nativeTheme.radius.md, alignItems: 'center', justifyContent: 'center' },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: nativeTheme.spacing.sm },
  sectionLabel: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 15 },
  progressText: { fontFamily: nativeTheme.typography.sans.medium, fontSize: 12 },
  taskList: { paddingVertical: 4 },
  taskRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: nativeTheme.spacing.md, borderBottomWidth: 1 },
  check: { width: 26, height: 26, borderRadius: nativeTheme.radius.full, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  taskCopy: { flex: 1, gap: 3 },
  taskTitle: { fontFamily: nativeTheme.typography.sans.semibold, fontSize: 14 },
  taskDetail: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 12, lineHeight: 17 },
  taskMeta: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 10, letterSpacing: 0.8 },
  taskMetaWrap: { alignItems: 'flex-end', gap: 4 },
  taskXp: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 10 },
  resourceCard: { marginTop: nativeTheme.spacing.xl, borderWidth: 0 },
  resourceContent: { flexDirection: 'row', alignItems: 'center', gap: nativeTheme.spacing.md, paddingTop: 4 },
  resourceIcon: { width: 42, height: 42, borderRadius: nativeTheme.radius.md, alignItems: 'center', justifyContent: 'center' },
  resourceCopy: { flex: 1, gap: 4 },
  resourceTitle: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 16 },
  resourceDetail: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 12, lineHeight: 18, opacity: 0.74 },
  nextStep: { marginTop: nativeTheme.spacing.xxl, gap: nativeTheme.spacing.sm },
  benefitCard: { flexDirection: 'row', alignItems: 'flex-start', gap: nativeTheme.spacing.md, borderWidth: 1, borderRadius: nativeTheme.radius.lg, padding: nativeTheme.spacing.md, marginBottom: nativeTheme.spacing.xl },
  benefitCopy: { flex: 1, gap: 4 },
  benefitLabel: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 10, letterSpacing: 1.3 },
  benefitText: { fontFamily: nativeTheme.typography.sans.medium, fontSize: 13, lineHeight: 19 },
  bodyCopy: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 14, lineHeight: 21 },
  nextButton: { alignSelf: 'flex-start', marginTop: nativeTheme.spacing.sm },
});