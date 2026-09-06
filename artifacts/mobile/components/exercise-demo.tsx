import React, { useEffect, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { cancelAnimation, useAnimatedProps, useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useReducedMotionPreference } from './motion-bits';
const MovingPath = Animated.createAnimatedComponent(Path);
const MovingHead = Animated.createAnimatedComponent(Circle);
export function ExerciseDemo({ kind }: { kind: 'sit-stand' | 'calf-raise' }) {
  const reduced = useReducedMotionPreference(); const [playing, setPlaying] = useState(true); const [foreground, setForeground] = useState(AppState.currentState === 'active'); const phase = useSharedValue(0);
  useEffect(() => { const sub = AppState.addEventListener('change', s => setForeground(s === 'active')); return () => sub.remove(); }, []);
  useEffect(() => { if (playing && !reduced && foreground) phase.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }), -1, true); else cancelAnimation(phase); return () => cancelAnimation(phase); }, [playing, reduced, foreground, phase]);
  const body = useAnimatedProps(() => {
    const p = phase.value;
    if (kind === 'sit-stand') { const x = 90 + 45*p, y = 135 - 27*p; return { d: `M ${x+7} ${y-58} L ${x} ${y} L 142 145 L 148 190 L 169 190 M ${x+4} ${y-42} L ${x+35} ${y-10}` }; }
    return { d: `M 128 ${57-12*p} L 135 ${119-12*p} L 137 ${175-12*p} L 155 190 M 130 ${79-12*p} L 94 101 L 79 101` };
  });
  const head = useAnimatedProps(() => ({ cx: kind === 'sit-stand' ? 97 + 45*phase.value : 128, cy: kind === 'sit-stand' ? 63 - 27*phase.value : 43 - 12*phase.value }));
  return <View style={{ backgroundColor: '#0D2833', borderRadius: 20, padding: 16, marginTop: 16 }}>
    <Text style={{ color: '#4CD6B0', fontWeight: '700' }}>MOVEMENT GUIDE · {kind === 'sit-stand' ? 'Sit → stand → sit' : 'Lift heels → lower slowly'}</Text>
    <Svg accessibilityLabel={kind === 'sit-stand' ? 'Side view of sitting then standing slowly from a chair' : 'Side view of supported heel raises'} width="100%" height={220} viewBox="0 0 260 210">
      <Path d={kind === 'sit-stand' ? 'M 60 82 L 60 140 L 115 140 M 65 140 L 65 191 M 108 140 L 108 191' : 'M 75 98 L 75 191 M 75 143 L 38 143 L 38 191'} stroke="#809AA8" strokeWidth={6} fill="none" />
      <Path d="M 25 195 L 230 195" stroke="#365463" strokeWidth={2} />
      <MovingPath animatedProps={body} stroke="#4CD6B0" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <MovingHead animatedProps={head} r={14} fill="#DFFBF2" />
    </Svg>
    <Text style={{ color: '#B9CFD8', lineHeight: 21 }}>Illustrated movement guide. Move at your own comfortable pace; stop if you feel pain or dizziness.</Text>
    <Pressable accessibilityRole="button" onPress={() => { if (reduced) phase.value = phase.value < 0.5 ? 1 : 0; else setPlaying(!playing); }} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: '#4CD6B0' }}>{reduced ? 'Show next position' : playing ? 'Pause demonstration' : 'Play demonstration'}</Text></Pressable>
  </View>;
}
