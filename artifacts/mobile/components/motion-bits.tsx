import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => subscription.remove();
  }, []);

  return reduced;
}

export function AnimatedWords({ text, style, stagger = 35 }: { text: string; style?: StyleProp<TextStyle>; stagger?: number }) {
  const reduced = useReducedMotionPreference();
  if (reduced) return <Text style={style}>{text}</Text>;

  return (
    <Text style={style}>
      {text.split(' ').map((word, index) => (
        <Animated.Text key={`${word}-${index}`} entering={FadeInDown.delay(Math.min(index * stagger, 500)).duration(280)}>
          {index ? ' ' : ''}{word}
        </Animated.Text>
      ))}
    </Text>
  );
}

export function DecryptedText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  const reduced = useReducedMotionPreference();
  return <Animated.Text entering={reduced ? undefined : FadeIn.duration(360)} style={style}>{text}</Animated.Text>;
}

export function CountUpText({ value, prefix = '', suffix = '', style }: { value: number; prefix?: string; suffix?: string; style?: StyleProp<TextStyle> }) {
  const reduced = useReducedMotionPreference();
  return <Animated.Text entering={reduced ? undefined : FadeIn.duration(300)} style={style}>{prefix}{Math.round(value)}{suffix}</Animated.Text>;
}

export function SpotlightCard({ children, color = '#55D6FF', style }: { children: React.ReactNode; color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.spotlight, { borderColor: `${color}55` }, style]}>
      <View pointerEvents="none" style={[styles.glow, { backgroundColor: `${color}12` }]} />
      {children}
    </View>
  );
}

export function StarBorder({ children, color = '#55D6FF', style, contentStyle }: {
  children: React.ReactNode;
  color?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.border, { borderColor: `${color}88` }, style]}>
      <View style={[styles.borderContent, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  spotlight: { position: 'relative', overflow: 'hidden', borderWidth: 1, backgroundColor: 'rgba(13,28,42,0.92)' },
  glow: { position: 'absolute', width: 150, height: 150, borderRadius: 75, right: -70, top: -85 },
  border: { borderWidth: 1, borderRadius: 20, padding: 1, overflow: 'hidden' },
  borderContent: { flex: 1, borderRadius: 19, backgroundColor: '#0D1C2A' },
});
