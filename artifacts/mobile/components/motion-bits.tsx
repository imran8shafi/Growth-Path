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
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    const start = Date.now();
    const interval = setInterval(() => {
      const progress = Math.min(1, (Date.now() - start) / 800);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress === 1) clearInterval(interval);
    }, 32);
    return () => clearInterval(interval);
  }, [value, reduced]);
  return <Animated.Text accessibilityLabel={`${prefix}${Math.round(value)}${suffix}`} entering={reduced ? undefined : FadeIn.duration(300)} style={style}>{prefix}{reduced ? Math.round(value) : display}{suffix}</Animated.Text>;
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
  const reduced = useReducedMotionPreference();
  const sweep = useSharedValue(-1);
  useEffect(() => { sweep.value = reduced ? -1 : withTiming(1, { duration: 1700 }); }, [reduced, sweep]);
  const shine = useAnimatedStyle(() => ({ opacity: 1 - Math.abs(sweep.value), transform: [{ translateX: sweep.value * 400 }, { rotate: '22deg' }] }));
  return (
    <View style={[styles.border, { borderColor: `${color}88` }, style]}>
      {!reduced ? <Animated.View pointerEvents="none" style={[{ position: 'absolute', top: -100, bottom: -100, left: '50%', width: 100 }, shine]}><LinearGradient colors={['transparent', color, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} /></Animated.View> : null}
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
