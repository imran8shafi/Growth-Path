import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { nativeTheme } from '../../lib/native-theme';
import { useColors } from '../../hooks/use-colors';

export function Card({
  children,
  style,
  ...props
}: ViewProps & { children: ReactNode }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: ViewProps & { children: ReactNode }) {
  return <View style={[styles.header, style]} {...props}>{children}</View>;
}

export function CardContent({ children, style, ...props }: ViewProps & { children: ReactNode }) {
  return <View style={[styles.content, style]} {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: nativeTheme.radius.lg,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: nativeTheme.spacing.lg,
    paddingTop: nativeTheme.spacing.lg,
    gap: nativeTheme.spacing.xs,
  },
  content: {
    padding: nativeTheme.spacing.lg,
  },
});