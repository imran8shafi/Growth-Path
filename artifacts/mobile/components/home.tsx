import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/native/badge';
import { Card, CardContent, CardHeader } from '@/components/native/card';
import { nativeTheme } from '@/lib/native-theme';
import { useColors } from '@/hooks/use-colors';
import { ScreenShell, TaskRow, TRACKS } from '@/components/path-ui';
import { useProgress } from '@/context/progress';

const HOME_TASKS = [
  { id: 'mind-read', title: 'Read for 20 minutes', detail: 'Sharpen your attention.', meta: 'MIND' },
  { id: 'body-move', title: 'Complete today’s training', detail: 'Earn your energy.', meta: 'BODY' },
  { id: 'soul-prayer', title: 'Practice stillness or prayer', detail: 'Return to what matters.', meta: 'SOUL' },
  { id: 'freedom-build', title: 'Ship one small asset', detail: 'Build more room to choose.', meta: 'FREEDOM' },
];

export function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { completed, isComplete } = useProgress();
  const doneToday = HOME_TASKS.filter((task) => isComplete(task.id)).length;
  const progress = doneToday / HOME_TASKS.length;

  return (
    <ScreenShell>
      <View style={styles.pagePadding}>
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>JACK OF ALL</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>Your path, today.</Text>
          </View>
          <View style={[styles.dayMark, { backgroundColor: colors.primary }]}>
            <Text style={[styles.dayNumber, { color: colors.primaryForeground }]}>08</Text>
            <Text style={[styles.dayLabel, { color: colors.primaryForeground }]}>AUG</Text>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.sidebar }]}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Badge>Day 01 · Foundation</Badge>
              <Text style={[styles.heroTitle, { color: colors.sidebarForeground }]}>
                Become harder to distract.
              </Text>
              <Text style={[styles.heroDetail, { color: colors.sidebarForeground }]}>
                Four small promises. One better direction.
              </Text>
            </View>
            <Feather name="compass" size={48} color={colors.primary} />
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${Math.max(progress * 100, 4)}%` }]} />
          </View>
          <View style={styles.progressFooter}>
            <Text style={[styles.progressLabel, { color: colors.sidebarForeground }]}>
              {doneToday} of {HOME_TASKS.length} practices complete
            </Text>
            <Text style={[styles.progressLabel, { color: colors.primary }]}>
              {completed.length} total
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today’s four</Text>
          <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>ONE STEP EACH</Text>
        </View>
        <Card style={{ backgroundColor: colors.card }}>
          <CardContent style={styles.taskList}>
            {HOME_TASKS.map((task) => <TaskRow key={task.id} {...task} />)}
          </CardContent>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>The four paths</Text>
          <Text style={[styles.sectionMeta, { color: colors.mutedForeground }]}>EXPLORE</Text>
        </View>
        <View style={styles.trackGrid}>
          {(Object.keys(TRACKS) as Array<keyof typeof TRACKS>).map((key) => {
            const track = TRACKS[key];
            const trackColor = colors[track.colorKey];
            return (
              <Pressable
                key={key}
                testID={`track-${key}`}
                onPress={() => router.push(`/${key}`)}
                style={({ pressed }) => [styles.trackCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]}
              >
                <View style={[styles.trackIcon, { backgroundColor: trackColor }]}>
                  <Feather name={track.icon} size={18} color={key === 'body' ? colors.foreground : colors.primaryForeground} />
                </View>
                <Text style={[styles.trackLabel, { color: colors.foreground }]}>{track.label}</Text>
                <Text style={[styles.trackDescription, { color: colors.mutedForeground }]} numberOfLines={2}>{track.description}</Text>
                <View style={styles.trackArrow}>
                  <Feather name="arrow-up-right" size={16} color={colors.mutedForeground} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pagePadding: { paddingHorizontal: nativeTheme.spacing.lg, paddingBottom: 48 },
  topBar: { paddingTop: nativeTheme.spacing.xxl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 11, letterSpacing: 1.8 },
  greeting: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 26, marginTop: nativeTheme.spacing.xs },
  dayMark: { width: 48, height: 48, borderRadius: nativeTheme.radius.md, justifyContent: 'center', alignItems: 'center' },
  dayNumber: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 16, lineHeight: 17 },
  dayLabel: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 9, letterSpacing: 1 },
  hero: { borderRadius: nativeTheme.radius.lg, marginTop: nativeTheme.spacing.xl, padding: nativeTheme.spacing.lg },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: nativeTheme.spacing.md },
  heroCopy: { flex: 1, gap: nativeTheme.spacing.md },
  heroTitle: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 24, lineHeight: 29, maxWidth: 250 },
  heroDetail: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 13, opacity: 0.7 },
  progressTrack: { height: 7, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: nativeTheme.spacing.xl },
  progressFill: { height: '100%', borderRadius: 7 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: nativeTheme.spacing.sm },
  progressLabel: { fontFamily: nativeTheme.typography.sans.medium, fontSize: 11, opacity: 0.82 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: nativeTheme.spacing.xxl, marginBottom: nativeTheme.spacing.sm },
  sectionTitle: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 17 },
  sectionMeta: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 10, letterSpacing: 1.2 },
  taskList: { paddingVertical: 4 },
  trackGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: nativeTheme.spacing.sm },
  trackCard: { width: '48.5%', minHeight: 170, borderRadius: nativeTheme.radius.lg, borderWidth: 1, padding: nativeTheme.spacing.md, position: 'relative' },
  trackIcon: { width: 36, height: 36, borderRadius: nativeTheme.radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: nativeTheme.spacing.md },
  trackLabel: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 16 },
  trackDescription: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 11, lineHeight: 16, marginTop: nativeTheme.spacing.xs, paddingRight: 4 },
  trackArrow: { position: 'absolute', right: 12, top: 13 },
});