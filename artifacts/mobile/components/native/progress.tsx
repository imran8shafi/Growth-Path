import type { ReactNode } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { nativeTheme } from '../../lib/native-theme';
import { useColors } from '../../hooks/use-colors';

interface ProgressBarProps {
  value: number;
  maxValue?: number;
  height?: number;
  showLabel?: boolean;
  label?: string;
  variant?: 'default' | 'xp' | 'streak' | 'level' | 'track';
  animated?: boolean;
  style?: any;
  glow?: boolean;
  segments?: number;
}

export function ProgressBar({
  value,
  maxValue = 1,
  height = 8,
  showLabel = false,
  label,
  variant = 'default',
  animated = true,
  style,
  glow = false,
  segments,
}: ProgressBarProps) {
  const colors = useColors();
  const clampedValue = Math.max(0, Math.min(1, value / maxValue));

  const trackColors = {
    default: colors.primary,
    xp: colors.xp || colors.accent,
    streak: colors.streak || colors.primary,
    level: colors.primary,
    track: colors.primary,
  };

  const trackColor = trackColors[variant];

  const trackStyle: any = {
    backgroundColor: colors.muted,
    ...(segments && segments > 1 && {
      flexDirection: 'row' as const,
      gap: 2,
    }),
  };

  const segmentWidth = segments ? 100 / segments : 100;

  return (
    <View style={[styles.container, style]}>
      {(showLabel || label) && (
        <View style={styles.labelRow}>
          <Text style={styles.labelText}>{label ?? `${Math.round(clampedValue * 100)}%`}</Text>
          <Text style={styles.labelValue}>{Math.round(value)}/{maxValue}</Text>
        </View>
      )}
      <View style={[styles.track, trackStyle, { height }]}>
        {segments && segments > 1 ? (
          Array.from({ length: segments }, (_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                { flex: segmentWidth, height: '100%' },
                i < Math.round(clampedValue * segments) && {
                  backgroundColor: trackColor,
                },
              ]}
            />
          ))
        ) : (
          <View style={{ ...styles.fill, height: '100%', backgroundColor: trackColor, width: `${clampedValue * 100}%` }} />
        )}
      </View>
    </View>
  );
}

interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'xp' | 'streak' | 'level' | 'default';
  showValue?: boolean;
  animated?: boolean;
  style?: any;
  glow?: boolean;
}

export function CircularProgress({
  progress,
  size = 60,
  strokeWidth = 6,
  variant = 'default',
  showValue = false,
  animated = true,
  style,
  glow = false,
}: CircularProgressProps) {
  const colors = useColors();
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const trackColors = {
    default: colors.primary,
    xp: colors.xp || colors.accent,
    streak: colors.streak || colors.primary,
    level: colors.primary,
  };

  const trackColor = trackColors[variant];

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clampedProgress);

  return (
    <View style={[styles.circularContainer, { width: size, height: size }, style]}>
      <View style={styles.svgWrapper}>
        <View style={[styles.trackCircle, { width: size, height: size, borderWidth: strokeWidth, borderColor: colors.muted }]} />
        <View
          style={[
            styles.progressCircle,
            { width: size, height: size, borderWidth: strokeWidth, borderColor: trackColor },
            { borderWidth: strokeWidth, borderColor: trackColor },
          ]}
        >
          <View style={{ transform: [{ rotate: '-90deg' }] }} />
        </View>
        {showValue && (
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{Math.round(progress * 100)}%</Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface XPBarProps {
  currentXP: number;
  xpForNextLevel?: number;
  level: number;
  animated?: boolean;
  showLabel?: boolean;
  style?: any;
}

export function XPBar({
  currentXP,
  xpForNextLevel = 250,
  level,
  animated = true,
  showLabel = true,
  style,
}: XPBarProps) {
  const colors = useColors();
  const clampedProgress = Math.max(0, Math.min(1, currentXP / xpForNextLevel));

  return (
    <View style={[styles.xpContainer, style]}>
      {showLabel && (
        <View style={styles.xpLabelRow}>
          <Text style={[styles.xpLevel, { color: colors.foreground }]}>LV {level}</Text>
          <Text style={[styles.xpProgress, { color: colors.mutedForeground }]}>{currentXP} / {xpForNextLevel} XP</Text>
        </View>
      )}
      <View style={styles.xpTrack}>
        <View style={[styles.xpFill, { backgroundColor: colors.xp || colors.accent, width: `${clampedProgress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontFamily: nativeTheme.typography.sans.semibold,
    fontSize: 12,
  },
  labelValue: {
    fontFamily: nativeTheme.typography.sans.bold,
    fontSize: 12,
  },
  track: {
    borderRadius: nativeTheme.radius.full,
    overflow: 'hidden',
    backgroundColor: '#00000010',
  },
  fill: {
    height: '100%',
    borderRadius: nativeTheme.radius.full,
  },
  segment: {
    height: '100%',
    borderRadius: nativeTheme.radius.full,
    backgroundColor: '#00000010',
  },
  circularContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackCircle: {
    position: 'absolute',
    borderRadius: 999,
    borderStyle: 'solid',
  },
  progressCircle: {
    position: 'absolute',
    borderRadius: 999,
    borderStyle: 'solid',
  },
  valueContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontFamily: nativeTheme.typography.sans.bold,
    fontSize: 14,
  },
  xpContainer: {
    gap: 4,
  },
  xpLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLevel: {
    fontFamily: nativeTheme.typography.sans.bold,
    fontSize: 13,
  },
  xpProgress: {
    fontFamily: nativeTheme.typography.sans.medium,
    fontSize: 11,
  },
  xpTrack: {
    height: 8,
    borderRadius: nativeTheme.radius.full,
    backgroundColor: '#00000010',
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: nativeTheme.radius.full,
  },
});