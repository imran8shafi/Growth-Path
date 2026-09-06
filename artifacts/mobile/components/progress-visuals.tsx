import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { type WeeklyXpPoint, useProgress } from '@/context/progress';
import { nativeTheme } from '@/lib/native-theme';

const CHART = {
  text: '#F6FBFF', muted: '#91A7B8', subtle: '#61788A', panel: '#0D1C2A',
  border: '#203A4F', cyan: '#55D6FF', blue: '#459BFF', green: '#4CD6B0', track: '#152635',
};

export function DailyRing({ completed, total, size = 122 }: { completed: number; total: number; size?: number }) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = Math.PI * 2 * radius;
  const progress = total > 0 ? Math.min(1, completed / total) : 0;
  return (
    <Animated.View entering={ZoomIn.duration(620)} style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="dailyRing" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={CHART.cyan} /><Stop offset="1" stopColor={CHART.green} />
          </SvgGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={CHART.track} strokeWidth={stroke} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="url(#dailyRing)" strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={`${Math.max(progress * circumference, 2)} ${circumference}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <View style={styles.ringValue}>
        <Text style={styles.ringNumber}>{completed}/{total}</Text><Text style={styles.ringLabel}>QUESTS</Text>
      </View>
    </Animated.View>
  );
}

function pathFor(points: WeeklyXpPoint[], width: number, height: number, max: number) {
  const padX = 8;
  const padY = 16;
  return points.map((point, index) => {
    const x = padX + index * ((width - padX * 2) / Math.max(1, points.length - 1));
    const y = height - padY - (point.xp / max) * (height - padY * 2);
    return { ...point, x, y };
  });
}

export function MomentumChart({ points }: { points: WeeklyXpPoint[] }) {
  const { hapticsEnabled } = useProgress();
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(520, Math.max(280, windowWidth - 72));
  const height = 158;
  const max = Math.max(100, ...points.map((point) => point.xp));
  const plotted = useMemo(() => pathFor(points, width, height, max), [height, max, points, width]);
  const [selected, setSelected] = useState(Math.max(0, points.length - 1));
  const line = plotted.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const area = plotted.length ? `${line} L ${plotted[plotted.length - 1].x} ${height} L ${plotted[0].x} ${height} Z` : '';
  const active = points[selected] ?? { date: '', label: '', xp: 0 };
  const choose = (index: number) => { setSelected(index); if (hapticsEnabled) void Haptics.selectionAsync(); };
  return (
    <Animated.View entering={FadeInDown.duration(560)} style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <View><Text style={styles.chartEyebrow}>7-DAY MOMENTUM</Text><Text style={styles.chartTitle}>Your effort has a shape.</Text></View>
        <View style={styles.chartValue}><Text style={styles.chartXp}>{active.xp}</Text><Text style={styles.chartXpLabel}>XP</Text></View>
      </View>
      <Animated.View entering={FadeIn.delay(220).duration(620)} style={styles.svgWrap}>
        <Svg width={width} height={height}>
          <Defs>
            <SvgGradient id="area" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor={CHART.cyan} stopOpacity="0.28" /><Stop offset="1" stopColor={CHART.cyan} stopOpacity="0" /></SvgGradient>
            <SvgGradient id="line" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={CHART.blue} /><Stop offset="1" stopColor={CHART.green} /></SvgGradient>
          </Defs>
          {[0.25, 0.5, 0.75].map((ratio) => <Path key={ratio} d={`M 8 ${height * ratio} L ${width - 8} ${height * ratio}`} stroke={CHART.border} strokeWidth={1} strokeDasharray="4 7" />)}
          {area ? <Path d={area} fill="url(#area)" /> : null}
          {line ? <Path d={line} fill="none" stroke="url(#line)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /> : null}
          {plotted.map((point, index) => <Circle key={point.date} cx={point.x} cy={point.y} r={index === selected ? 6 : 4} fill={index === selected ? CHART.text : CHART.cyan} stroke={CHART.cyan} strokeWidth={index === selected ? 3 : 1} />)}
        </Svg>
      </Animated.View>
      <View style={styles.dayRow}>
        {points.map((point, index) => <Pressable key={point.date} accessibilityRole="button" accessibilityLabel={`${point.date}, ${point.xp} XP`} onPress={() => choose(index)} style={[styles.dayButton, index === selected && styles.dayButtonActive]}>
          <Text style={[styles.dayText, index === selected && styles.dayTextActive]}>{point.label}</Text>
        </Pressable>)}
      </View>
      <Text style={styles.chartHint}>{points.some((point) => point.xp > 0) ? `Selected ${active.date} · tap another day to inspect it` : 'Complete a quest to draw your first point.'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ringValue: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  ringNumber: { color: CHART.text, fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 25, letterSpacing: -0.8 },
  ringLabel: { color: CHART.muted, fontFamily: nativeTheme.typography.sans.bold, fontSize: 9, letterSpacing: 1.5, marginTop: 2 },
  chartCard: { borderRadius: 20, padding: 16, backgroundColor: 'rgba(13,28,42,0.92)', borderWidth: 1, borderColor: CHART.border, overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  chartEyebrow: { color: CHART.cyan, fontFamily: nativeTheme.typography.sans.bold, fontSize: 9.5, letterSpacing: 1.7 },
  chartTitle: { color: CHART.text, fontFamily: nativeTheme.typography.sans.bold, fontSize: 17, marginTop: 5 },
  chartValue: { minWidth: 58, alignItems: 'flex-end' }, chartXp: { color: CHART.green, fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 25 },
  chartXpLabel: { color: CHART.subtle, fontFamily: nativeTheme.typography.sans.bold, fontSize: 9, letterSpacing: 1.2 },
  svgWrap: { marginTop: 11, marginHorizontal: -4, alignItems: 'center' },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -4 },
  dayButton: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, dayButtonActive: { backgroundColor: CHART.cyan },
  dayText: { color: CHART.subtle, fontFamily: nativeTheme.typography.sans.bold, fontSize: 10 }, dayTextActive: { color: '#050A12' },
  chartHint: { color: CHART.subtle, fontFamily: nativeTheme.typography.sans.regular, fontSize: 10, textAlign: 'center', marginTop: 8 },
});
