import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/native/badge';
import { Card, CardContent } from '@/components/native/card';
import { nativeTheme } from '@/lib/native-theme';
import { useColors } from '@/hooks/use-colors';
import { ScreenHeader, ScreenShell, TRACKS } from '@/components/path-ui';
import { useProgress } from '@/context/progress';

export default function ProgressRoute() {
  const colors = useColors();
  const { totalCompleted, trackCompleted } = useProgress();
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
              <Text style={[styles.summaryNumber, { color: colors.primary }]}>{totalCompleted}</Text>
              <Text style={[styles.summaryLabel, { color: colors.sidebarForeground }]}>practices completed</Text>
            </CardContent>
          </Card>
          <Card style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <CardContent style={styles.summaryContent}>
              <Text style={[styles.summaryNumber, { color: colors.foreground }]}>
                {trackKeys.filter((key) => trackCompleted(key) > 0).length}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>paths in motion</Text>
            </CardContent>
          </Card>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Across your paths</Text>
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
                    <Text style={[styles.pathTitle, { color: colors.foreground }]}>{track.label}</Text>
                    <View style={[styles.pathTrack, { backgroundColor: colors.muted }]}>
                      <View style={[styles.pathFill, { backgroundColor: color, width: `${(completed / 3) * 100}%` }]} />
                    </View>
                  </View>
                  <Text style={[styles.pathCount, { color: colors.mutedForeground }]}>{completed}/3</Text>
                </View>
              );
            })}
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
  sectionTitle: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 17, marginBottom: nativeTheme.spacing.sm },
  pathList: { paddingVertical: 4 },
  pathRow: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: nativeTheme.spacing.md, borderBottomWidth: 1 },
  pathIcon: { width: 36, height: 36, borderRadius: nativeTheme.radius.md, alignItems: 'center', justifyContent: 'center' },
  pathCopy: { flex: 1, gap: 8 },
  pathTitle: { fontFamily: nativeTheme.typography.sans.semibold, fontSize: 14 },
  pathTrack: { height: 5, borderRadius: 5, overflow: 'hidden' },
  pathFill: { height: '100%', borderRadius: 5 },
  pathCount: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 12 },
  note: { marginTop: nativeTheme.spacing.xl, padding: nativeTheme.spacing.lg, borderRadius: nativeTheme.radius.lg, gap: nativeTheme.spacing.md },
  noteText: { fontFamily: nativeTheme.typography.sans.medium, fontSize: 14, lineHeight: 21 },
});