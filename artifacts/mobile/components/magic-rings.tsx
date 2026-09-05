import React, { useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { useIsFocused } from '@react-navigation/native';
import { useReducedMotionPreference } from './motion-bits';
import { createRingRenderer } from '@/lib/magic-rings-renderer';

export function MagicRings() {
  const reduced = useReducedMotionPreference(); const focused = useIsFocused();
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [failed, setFailed] = useState(false);
  const renderer = useRef<ReturnType<typeof createRingRenderer> | null>(null);
  const mounted = useRef(true);
  const [ready, setReady] = useState(0);
  useEffect(() => { const sub = AppState.addEventListener('change', (s) => setActive(s === 'active')); return () => sub.remove(); }, []);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; renderer.current?.dispose(); renderer.current = null; }; }, []);
  useEffect(() => {
    if (!renderer.current) return;
    renderer.current.draw(2);
    if (reduced || !active || !focused) return;
    const started = Date.now();
    const interval = setInterval(() => renderer.current?.draw(2 + (Date.now() - started) / 1000), 1000 / 24);
    return () => clearInterval(interval);
  }, [reduced, focused, active, ready]);
  const create = (gl: ExpoWebGLRenderingContext) => {
    if (!mounted.current) return;
    try { renderer.current?.dispose(); renderer.current = createRingRenderer(gl as unknown as WebGLRenderingContext, () => gl.endFrameEXP()); setReady((n) => n + 1); }
    catch { setFailed(true); }
  };
  return <View pointerEvents="none" importantForAccessibility="no-hide-descendants" style={styles.container}>
    {failed ? <StaticRings /> : <GLView style={StyleSheet.absoluteFill} onContextCreate={create} msaaSamples={0} />}
  </View>;
}
export function StaticRings() { return <View style={StyleSheet.absoluteFill}>{[0, 1, 2, 3, 4].map((i) => <View key={i} style={{ position: 'absolute', width: 150 + i * 65, height: 150 + i * 65, borderRadius: 300, borderWidth: 1, borderColor: i % 2 ? '#8D7CFF' : '#55D6FF', opacity: .2, alignSelf: 'center', top: 160 - i * 32.5 }} />)}</View>; }
const styles = StyleSheet.create({ container: { position: 'absolute', top: -70, left: 0, right: 0, height: 600, opacity: .45 } });
