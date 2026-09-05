import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { type Href, router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ScreenHeader, ScreenShell, TRACKS } from '@/components/path-ui';
import { nativeTheme } from '@/lib/native-theme';
import { ARCHETYPE_META, getEvolutionIdentity, useProgress } from '@/context/progress';

function SettingRow({ icon, color, title, detail, trailing, index, onPress }: { icon: keyof typeof Feather.glyphMap; color: string; title: string; detail: string; trailing?: React.ReactNode; index: number; onPress?: () => void }) {
  const scale = useSharedValue(1);
  const motion = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View entering={FadeInDown.delay(index * 70).duration(450)} style={motion}><Pressable onPress={onPress} onPressIn={() => { scale.value = withSpring(0.985); }} onPressOut={() => { scale.value = withSpring(1); }} style={styles.settingRow}>
    <View style={[styles.settingIcon, { backgroundColor: `${color}1C` }]}><Feather name={icon} size={18} color={color} /></View>
    <View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDetail}>{detail}</Text></View>
    {trailing ?? (onPress ? <Feather name="chevron-right" size={17} color="#61788A" /> : null)}
  </Pressable></Animated.View>;
}

export default function SettingsRoute() {
  const { profile, resetOnboarding, hapticsEnabled, setHapticsEnabled } = useProgress();
  const focus = profile?.focusTrack ?? 'mind';
  const focusConfig = TRACKS[focus];
  const secondaryFocus = profile?.priorityTracks?.[1] ? TRACKS[profile.priorityTracks[1]].label : 'Body';
  const freedomLabel = profile?.freedomFocus === 'financial' ? 'financial freedom' : profile?.freedomFocus === 'mobility' ? 'travel freedom' : 'money + mobility';
  const readingLabel = profile?.readingStyle === 'practical' ? 'practical reading' : profile?.readingStyle === 'deep' ? 'deep reading' : profile?.readingStyle === 'exercises' ? 'exercise first' : 'mixed reading';
  const archetype = ARCHETYPE_META[profile?.archetype ?? 'sovereign'];
  const identity = getEvolutionIdentity(profile);
  const coachingLabel = profile?.coachingStyle === 'demanding' ? 'Demanding' : profile?.coachingStyle === 'encouraging' ? 'Encouraging' : profile?.coachingStyle === 'direct' ? 'Direct' : 'Adaptive';
  const fastingLabel = profile?.fastingPreference === 'curious' ? 'Optional 12-hour window' : profile?.fastingPreference === 'experienced' ? 'Optional 14-hour window' : 'Off';
  return (
    <ScreenShell>
      <View style={styles.pagePadding}>
        <ScreenHeader eyebrow="SETTINGS" title="Make it yours." subtitle="Keep the system quiet, useful, and fitted to your real life." icon="sliders" />
        <Animated.View entering={FadeInDown.delay(80).duration(500)} style={[styles.profileCard, { borderColor: `${archetype.color}45` }]}>
          <View style={[styles.profileIcon, { backgroundColor: `${archetype.color}1D` }]}><Feather name="hexagon" size={24} color={archetype.color} /></View>
          <View style={styles.profileCopy}><Text style={[styles.profileEyebrow, { color: archetype.color }]}>{archetype.label.toUpperCase()} ARCHETYPE</Text><Text style={styles.profileTitle}>{identity.current} → {identity.next}</Text><Text style={styles.profileDetail}>{profile ? `${focusConfig.label} + ${secondaryFocus} · ${freedomLabel} · ${readingLabel}` : 'Retake onboarding to build your personal path.'}</Text></View>
        </Animated.View>

        <Text style={styles.sectionTitle}>Experience</Text>
        <View style={styles.settingsCard}>
          <SettingRow index={0} icon="moon" color="#55D6FF" title="Appearance" detail="Midnight · designed for focus" trailing={<View style={styles.valuePill}><Text style={styles.valueText}>ACTIVE</Text></View>} />
          <SettingRow index={1} icon="smartphone" color="#8D7CFF" title="Haptic feedback" detail="Feel selections and completed quests" trailing={<Switch value={hapticsEnabled} onValueChange={(value) => { setHapticsEnabled(value); if (value) void Haptics.selectionAsync(); }} trackColor={{ false: '#203A4F', true: '#315F70' }} thumbColor={hapticsEnabled ? '#55D6FF' : '#61788A'} />} />
          <SettingRow index={2} icon="bell" color="#FFCC66" title="Smart reminders" detail="Coming soon" trailing={<View style={styles.soonPill}><Text style={styles.soonText}>SOON</Text></View>} />
        </View>

        <Text style={styles.sectionTitle}>Your path</Text>
        <View style={styles.settingsCard}>
          <SettingRow index={3} icon="hexagon" color={archetype.color} title="Evolution cycle" detail={`${archetype.label} · 42 days · six chapters`} onPress={() => router.push('/evolve' as Href)} />
          <SettingRow index={4} icon="message-circle" color="#8D7CFF" title="Coaching voice" detail={`${coachingLabel} guidance`} />
          <SettingRow index={5} icon="clock" color="#FFCC66" title="Fasting protocol" detail={fastingLabel} onPress={() => router.push('/evolve' as Href)} />
          <SettingRow index={6} icon="refresh-cw" color="#4CD6B0" title="Retake your starting point" detail="Update your goals, capacity, and focus" onPress={() => { resetOnboarding(); router.replace('/onboarding'); }} />
          <SettingRow index={7} icon="sliders" color="#4CD6B0" title="Learning from your practice" detail="Previous app days shape pace, variety, and focus. See Progress for the reasons." onPress={() => router.push('/progress')} />
          <SettingRow index={7} icon="shield" color="#55D6FF" title="Local-first progress" detail="Your answers, practice history, and XP stay on this device" />
          <SettingRow index={8} icon="info" color="#91A7B8" title="About Growth Path" detail="Mind · Body · Soul · Freedom · Human range" />
        </View>

        <Animated.View entering={FadeInDown.delay(420).duration(500)} style={styles.manifesto}>
          <Text style={styles.manifestoMark}>“</Text><Text style={styles.manifestoText}>The goal is not a perfect streak. The goal is to become someone who knows how to return.</Text><Text style={styles.version}>GROWTH PATH · VERSION 1.0</Text>
        </Animated.View>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  pagePadding: { paddingHorizontal: 18 }, profileCard: { borderRadius: 21, padding: 17, flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(13,28,42,0.92)', borderWidth: 1 },
  profileIcon: { width: 57, height: 57, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, profileCopy: { flex: 1 }, profileEyebrow: { fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1.4 }, profileTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 21, marginTop: 4 },
  profileDetail: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 11, lineHeight: 16, marginTop: 4 }, sectionTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 17, marginTop: 28, marginBottom: 11 },
  settingsCard: { borderRadius: 19, paddingHorizontal: 14, backgroundColor: 'rgba(13,28,42,0.9)', borderWidth: 1, borderColor: '#203A4F', overflow: 'hidden' }, settingRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#203A4F' },
  settingIcon: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, settingCopy: { flex: 1 }, settingTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.semibold, fontSize: 13.5 }, settingDetail: { color: '#91A7B8', fontFamily: nativeTheme.typography.sans.regular, fontSize: 10.5, marginTop: 4 },
  valuePill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: 'rgba(85,214,255,0.12)' }, valueText: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 7.5, letterSpacing: 1 },
  soonPill: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: 'rgba(255,204,102,0.12)' }, soonText: { color: '#FFCC66', fontFamily: nativeTheme.typography.sans.bold, fontSize: 7.5, letterSpacing: 1 },
  manifesto: { marginTop: 23, borderRadius: 19, padding: 18, backgroundColor: 'rgba(85,214,255,0.07)', overflow: 'hidden' }, manifestoMark: { position: 'absolute', right: 14, top: -13, color: 'rgba(85,214,255,0.16)', fontFamily: 'Georgia', fontSize: 86 },
  manifestoText: { color: '#C8D8E3', fontFamily: nativeTheme.typography.sans.medium, fontSize: 13.5, lineHeight: 20, paddingRight: 20 }, version: { color: '#55D6FF', fontFamily: nativeTheme.typography.sans.bold, fontSize: 8.5, letterSpacing: 1.3, marginTop: 15 },
});
