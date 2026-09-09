import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { ScreenShell } from '@/components/path-ui';
import { normalizeProfile, useProgress, type OnboardingProfile } from '@/context/progress';

export default function ProgrammeSettings() {
  const { profile, setProfile } = useProgress(); const router = useRouter();
  const [draft, setDraft] = useState(() => ({ ...normalizeProfile(profile), businessRoute: profile?.businessRoute ?? 'service', dietStyle: profile?.dietStyle ?? 'mixed' }));
  const [expanded, setExpanded] = useState<keyof OnboardingProfile | null>(null);
  const baseline = { ...normalizeProfile(profile), businessRoute: profile?.businessRoute ?? 'service', dietStyle: profile?.dietStyle ?? 'mixed' };
  const changed = (['focusTrack', 'time', 'businessRoute', 'dietStyle', 'businessNiche'] as const).some(key => draft[key] !== baseline[key]);
  const options = <K extends keyof OnboardingProfile>(key: K, title: string, values: [OnboardingProfile[K], string, string][]) => <View style={s.group}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: expanded === key }} onPress={() => setExpanded(expanded === key ? null : key)} style={[s.option, { marginTop: 0 }]}>
      <View style={{ flex: 1 }}><Text style={s.label}>{title}</Text><Text style={s.body}>{values.find(([value]) => value === draft[key])?.[1]}</Text></View><Feather name={expanded === key ? 'chevron-up' : 'chevron-down'} size={22} color="#A998FF" />
    </Pressable>
    {expanded === key ? <View accessibilityRole="radiogroup" accessibilityLabel={title}>{values.map(([value, label, detail]) => <Pressable key={String(value)} accessibilityRole="radio" accessibilityState={{ checked: draft[key] === value }} onPress={() => { setDraft({ ...draft, [key]: value }); setExpanded(null); }} style={[s.option, draft[key] === value && s.selected]}><View style={{ flex: 1 }}><Text style={s.label}>{label}</Text><Text style={s.body}>{detail}</Text></View><Feather name={draft[key] === value ? 'check-circle' : 'circle'} size={20} color="#A998FF" /></Pressable>)}</View> : null}
  </View>;
  return <ScreenShell><View style={s.page}><Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={s.back}><Feather name="arrow-left" size={20} color="#F6FBFF" /><Text style={s.label}>Cancel</Text></Pressable><Text style={s.heading}>Your programme</Text><Text style={s.body}>Tap a setting to change it. Your current quest stays saved.</Text>
    {options('focusTrack', 'Your main goal', [['freedom', 'Financial Freedom', 'A business project with concrete milestones.'], ['mind', 'Think more clearly', 'Ideas applied to everyday decisions.'], ['body', 'Build physical foundations', 'Movement and practical nutrition.']])}
    {options('time', 'Your daily time', [['ten', 'About 10 minutes', 'Three short quests: read, move, build.'], ['twenty', 'About 20 minutes', 'A balanced mix across all three paths.'], ['forty', 'Up to 40 minutes', 'Three main sessions, about 30 minutes total.']])}
    <View style={s.group}><Text style={s.label}>Your business niche</Text><TextInput accessibilityLabel="Business niche" value={draft.businessNiche ?? 'Local cleaning businesses'} maxLength={80} onChangeText={businessNiche => setDraft({ ...draft, businessNiche })} style={{ color: '#FFF', minHeight: 48, borderBottomWidth: 1, borderColor: '#456079' }} /><Text style={s.body}>Cleaning examples are supplied. Replace the niche in your saved templates.</Text></View>
    {options('businessRoute', 'Your Financial Freedom programme', [['service', 'Service business / SMMA', 'Recommended starting route: make a sample before buying tools.'], ['saas', 'SaaS', 'Validate a recurring problem, then specify one feature.'], ['app', 'Your own app', 'Test a workflow before building a full app.']])}
    {options('dietStyle', 'Your Body meal examples', [['mixed', 'Mixed diet', 'Plant and animal protein alternatives.'], ['vegetarian', 'Vegetarian', 'Plant foods and suitable dairy.'], ['plant', 'Plant-based', 'Beans and lentils as the example proteins.']])}
    <Text style={s.body}>Use suitable ingredients for your allergies and dietary needs.</Text>
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !changed }} disabled={!changed} onPress={() => { setProfile(draft); router.replace('/'); }} style={[s.save, !changed && { opacity: .45 }]}><Text style={s.saveText}>{changed ? 'Save changes' : 'No changes to save'}</Text><Feather name="arrow-right" size={20} color="#08121D" /></Pressable>
  </View></ScreenShell>;
}
const s = StyleSheet.create({ page: { maxWidth: 640, width: '100%', alignSelf: 'center', paddingHorizontal: 22 }, back: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 }, heading: { color: '#F6FBFF', fontSize: 31, fontWeight: '700', marginTop: 20 }, title: { color: '#F6FBFF', fontSize: 18, fontWeight: '600', marginBottom: 8 }, body: { color: '#A7BBC9', fontSize: 13, lineHeight: 21, marginTop: 6 }, label: { color: '#F6FBFF', fontSize: 15 }, group: { marginTop: 14 }, option: { minHeight: 64, padding: 16, borderRadius: 15, backgroundColor: '#112536', borderWidth: 1, borderColor: '#284255', flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 9 }, selected: { borderColor: '#A998FF', backgroundColor: '#25243F' }, save: { minHeight: 56, padding: 18, borderRadius: 16, backgroundColor: '#A998FF', marginTop: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, saveText: { color: '#08121D', fontSize: 16, fontWeight: '700' } });
