import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { nativeTheme } from '../../lib/native-theme';
import { useColors } from '../../hooks/use-colors';

type BadgeTone = 'primary' | 'secondary' | 'accent' | 'muted' | 'xp' | 'streak';
type BadgeSize = 'sm' | 'md' | 'lg';

export function Badge({
  children,
  tone = 'muted',
  size = 'md',
  style,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  style?: any;
}) {
  const colors = useColors();
  const backgroundColor = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    muted: colors.muted,
    xp: colors.xp || colors.accent,
    streak: colors.streak || colors.primary,
  }[tone];
  const color = tone === 'primary' ? colors.primaryForeground : colors.foreground;

  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];

  return (
    <View style={[styles.badge, sizeStyles, { backgroundColor }, style]}>
      <Text style={[styles.label, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: nativeTheme.radius.full,
    paddingHorizontal: nativeTheme.spacing.sm,
    paddingVertical: nativeTheme.spacing.xs,
    alignSelf: 'flex-start',
  },
  sizeSm: {
    paddingHorizontal: nativeTheme.spacing.xs,
    paddingVertical: 2,
  },
  sizeMd: {
    paddingHorizontal: nativeTheme.spacing.sm,
    paddingVertical: nativeTheme.spacing.xs,
  },
  sizeLg: {
    paddingHorizontal: nativeTheme.spacing.md,
    paddingVertical: nativeTheme.spacing.sm,
  },
  label: {
    fontFamily: nativeTheme.typography.sans.semibold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});