import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { nativeTheme } from '../../lib/native-theme';
import { useColors } from '../../hooks/use-colors';

export function Badge({
  children,
  tone = 'muted',
}: {
  children: ReactNode;
  tone?: 'primary' | 'secondary' | 'accent' | 'muted';
}) {
  const colors = useColors();
  const backgroundColor = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    muted: colors.muted,
  }[tone];
  const color = tone === 'primary' ? colors.primaryForeground : colors.foreground;

  return (
    <View style={[styles.badge, { backgroundColor }]}>
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
  label: {
    fontFamily: nativeTheme.typography.sans.semibold,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});