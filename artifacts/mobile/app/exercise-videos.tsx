import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell } from '@/components/path-ui';
import { ExerciseVideo } from '@/components/exercise-video';

const clips = [
  { id: 'air-squat', title: 'Air squat', source: require('../assets/videos/air-squat.mp4'), instruction: 'Stand with feet comfortably apart. Bend hips and knees, then stand with control. Use a comfortable depth; you do not need to match the depth shown.' },
  { id: 'seated-curl', title: 'Seated two-handed curl', source: require('../assets/videos/seated-curl.mp4'), instruction: 'Sit on a stable bench and hold one light dumbbell securely with both hands. Bend your elbows to lift, then lower with control. Avoid swinging.' },
];
export default function ExerciseVideosRoute() {
  const router = useRouter(); const [selected, setSelected] = useState(0); const clip = clips[selected];
  return <ScreenShell><View style={s.page}>
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={s.back}><Text style={s.text}>‹ Back</Text></Pressable>
    <Text style={s.heading}>Exercise library</Text>
    <Text style={s.text}>Watch the movement. Follow the sets in your assigned quest.</Text>
    <View style={s.row}>{clips.map((item, i) => <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected: selected === i }} onPress={() => setSelected(i)} style={[s.tab, selected === i && s.active]}><Text style={s.text}>{item.title}</Text></Pressable>)}</View>
    <ExerciseVideo key={clip.id} source={clip.source} />
    <Text style={s.title}>{clip.title}</Text><Text style={s.text}>{clip.instruction}</Text>
    <Text style={s.note}>Keep your assigned chair or wall alternative when needed. Stop any movement that causes pain. Watching a demonstration does not complete a quest.</Text>
  </View></ScreenShell>;
}
const s = StyleSheet.create({
  page: { padding: 24, gap: 20 }, back: { minHeight: 44, justifyContent: 'center' }, heading: { color: '#F4FAFF', fontSize: 28, fontWeight: '700' },
  title: { color: '#F4FAFF', fontSize: 21, fontWeight: '700' }, text: { color: '#D6E6EF', fontSize: 16, lineHeight: 24 }, note: { color: '#A6BDCD', fontSize: 14, lineHeight: 21 },
  row: { flexDirection: 'row', gap: 10 }, tab: { flex: 1, padding: 12, minHeight: 48, backgroundColor: '#122638', borderRadius: 12, borderWidth: 1, borderColor: '#233446' }, active: { borderColor: '#69DBD1' },
});
