import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { nativeTheme } from '../../lib/native-theme';
import { useColors } from '../../hooks/use-colors';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'xp' | 'streak';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  onPress?: () => void;
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  style,
  leftIcon,
  rightIcon,
  fullWidth = false,
  onPress,
}: ButtonProps) {
  const colors = useColors();
  const isDisabled = disabled || loading;

  const backgroundColor = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    outline: 'transparent',
    ghost: 'transparent',
    xp: colors.xp || colors.accent,
    streak: colors.streak || colors.primary,
  }[variant];

  const foregroundColor = {
    primary: colors.primaryForeground,
    secondary: colors.secondaryForeground,
    accent: colors.accentForeground,
    outline: colors.foreground,
    ghost: colors.primary,
    xp: colors.accentForeground,
    streak: colors.accentForeground,
  }[variant];

  const borderColor = variant === 'outline' ? colors.border : backgroundColor;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[size],
        {
          backgroundColor: isDisabled ? colors.muted : pressed ? backgroundColor : 'transparent',
          borderColor: variant === 'outline' ? colors.border : backgroundColor,
          opacity: isDisabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={foregroundColor} />
      ) : (
        <Text style={[styles.label, { color: foregroundColor }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: nativeTheme.radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: nativeTheme.spacing.lg,
  },
  sm: { minHeight: 36, paddingHorizontal: nativeTheme.spacing.md },
  md: { minHeight: 46 },
  lg: { minHeight: 54, paddingHorizontal: nativeTheme.spacing.xl },
  icon: { width: 46, paddingHorizontal: 0 },
  label: {
    fontFamily: nativeTheme.typography.sans.semibold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
});