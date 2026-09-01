import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar, XPBar } from '@/components/native/progress';
import { Badge } from '@/components/native/badge';
import { Card, CardContent } from '@/components/native/card';
import { nativeTheme } from '@/lib/native-theme';
import { useColors } from '@/hooks/use-colors';
import { ScreenHeader, ScreenShell, TRACKS } from '@/components/path-ui';
import { useProgress } from '@/context/progress';

export default function ProgressRoute() {
  const colors = useColors();
  const { totalCompleted, totalXp, level, levelProgress, currentStreak, achievements, trackCompleted, trackXp } = useProgress();
  const trackKeys = Object.keys(TRACKS) as Array<keyof typeof TRACKS>;

  return (
    <ScreenShell>
      <View style={styles.pagePadding}>
        <ScreenHeader
          eyebrow="YOUR PROGRESS"
          title="Keep the promise."
          subtitle="A record of the small actions that are making you more capable."
          icon="trending-up"
          color={colors.primary}
        />

        <View style={styles.summaryRow}>
          <Card style={[styles.summaryCard, { backgroundColor: colors.sidebar }]}>
            <CardContent style={styles.summaryContent}>
              <Text style={[styles.summaryNumber, { color: colors.primary }]}>LV {level}</Text>
              <Text style={[styles.summaryLabel, { color: colors.sidebarForeground }]}>{totalXp} total XP</Text>
            </CardContent>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <CardContent style={styles.summaryContent}>
              <Text style={[styles.summaryNumber, { color: colors.foreground }]}>{currentStreak}</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>day momentum</Text>
            </CardContent>
          </Card>
        </View>

        <View style={styles.levelHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Next level</Text>
          <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{Math.round(levelProgress * 250)}/250 XP</Text>
        </View>
        <View style={[styles.levelTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.levelFill, { backgroundColor: colors.primary, width: `${Math.max(levelProgress * 100, 2)}%` }]} />
        </View>

        <XPBar currentXP={totalXp} level={level} />

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: nativeTheme.spacing.xxl }]}>Your four attributes</Text>
        <Card style={{ backgroundColor: colors.card }}>
          <CardContent style={styles.pathList}>
            {trackKeys.map((key) => {
              const track = TRACKS[key];
              const completed = trackCompleted(key);
              const color = colors[track.colorKey];
              return (
                <View key={key} style={[styles.pathRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.pathIcon, { backgroundColor: color }]}>
                    <Feather name={track.icon} size={17} color={key === 'body' ? colors.foreground : colors.primaryForeground} />
                  </View>
                  <View style={styles.pathCopy}>
                    <View style={styles.pathTitleRow}>
                      <Text style={[styles.pathTitle, { color: colors.foreground }]}>{track.label}</Text>
                      <Text style={[styles.pathXp, { color }]}>{trackXp(key)} XP</Text>
                    </View>
                    <View style={[styles.pathTrack, { backgroundColor: colors.muted }]}>
                      <View style={[styles.pathFill, { backgroundColor: color, width: `${Math.min((trackXp(key) % 250) / 2.5, 100)}%` }]} />
                    </View>
                    <Text style={[styles.pathBenefit, { color: colors.mutedForeground }]} numberOfLines={2}>{track.benefit}</Text>
                  </View>
                  <Text style={[styles.pathCount, { color: colors.mutedForeground }]}>{completed}/3</Text>
                </View>
              );
            })}
          </CardContent>
        </Card>

        <Text style={[styles.sectionTitle, { color: colors.foreground, marginTop: nativeTheme.spacing.xxl }]}>Achievements</Text>
        <Card style={{ backgroundColor: colors.card }}>
          <CardContent style={styles.achievementList}>
            {achievements.length === 0 ? (
              <View style={styles.emptyAchievement}>
                <Feather name="award" size={22} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Complete your first quest to unlock your first badge.</Text>
              </View>
            ) : achievements.map((achievement) => (
              <View key={achievement} style={[styles.achievementRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.achievementIcon, { backgroundColor: colors.accent }]}>
                  <Feather name="award" size={16} color={colors.accentForeground} />
                </View>
                <Text style={[styles.achievementText, { color: colors.foreground }]}>{achievement}</Text>
                <Feather name="check-circle" size={17} color={colors.primary} />
              </View>
            ))}
          </CardContent>
        </Card>

        <View style={[styles.note, { backgroundColor: colors.secondary + '20' }]}>
          <Badge>KEEP SHOWING UP</Badge>
          <Text style={[styles.noteText, { color: colors.foreground }]}>
            Progress is not a score. It is evidence that you are becoming the kind of person who follows through.
          </Text>
        </View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pagePadding: { paddingHorizontal: nativeTheme.spacing.lg, paddingBottom: 48 },
  summaryRow: { flexDirection: 'row', gap: nativeTheme.spacing.sm, marginBottom: nativeTheme.spacing.xxl },
  summaryCard: { flex: 1, minHeight: 108 },
  summaryContent: { flex: 1, justifyContent: 'center', gap: 4 },
  summaryNumber: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 30 },
  summaryLabel: { fontFamily: nativeTheme.typography.sans.medium, fontSize: 12 },
  progressText: { fontFamily: nativeTheme.typography.sans.medium, fontSize: 12 },
  sectionTitle: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 17, marginBottom: nativeTheme.spacing.sm },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelTrack: { height: 7, borderRadius: 7, overflow: 'hidden', marginBottom: nativeTheme.spacing.sm },
  levelFill: { height: '100%', borderRadius: 7 },
  pathList: { paddingVertical: 4 },
  pathRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: nativeTheme.spacing.md, borderBottomWidth: 1 },
  pathIcon: { width: 36, height: 36, borderRadius: nativeTheme.radius.md, alignItems: 'center', justifyContent: 'center' },
  pathCopy: { flex: 1, gap: 8 },
  pathTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pathTitle: { fontFamily: nativeTheme.typography.sans.semibold, fontSize: 14 },
  pathXp: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 11 },
  pathTrack: { height: 5, borderRadius: 5, overflow: 'hidden' },
  pathFill: { height: '100%', borderRadius: 5 },
  pathCount: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 12 },
  pathBenefit: { fontFamily: nativeTheme.typography.sans.regular, fontSize: 11, lineHeight: 15 },
  achievementList: { paddingVertical: 4 },
  achievementRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: nativeTheme.spacing.md, borderBottomWidth: 1 },
  achievementIcon: { width: 32, height: 32, borderRadius: nativeTheme.radius.full, alignItems: 'center', justifyContent: 'center' },
  achievementText: { flex: 1, fontFamily: nativeTheme.typography.sans.semibold, fontSize: 13 },
  emptyAchievement: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: nativeTheme.spacing.md },
  emptyText: { flex: 1, fontFamily: nativeTheme.typography.sans.regular, fontSize: 13, lineHeight: 18 },
  note: { marginTop: nativeTheme.spacing.xl, padding: nativeTheme.spacing.lg, borderRadius: nativeTheme.radius.lg, gap: nativeTheme.spacing.md },
  noteText: { fontFamily: nativeTheme.typography.sans.medium, fontSize: 14, lineHeight: 21 },
});