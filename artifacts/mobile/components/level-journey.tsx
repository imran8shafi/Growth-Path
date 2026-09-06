import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useProgress } from '@/context/progress';
export const RANKS = [
  { level: 1, name: 'Beginner', detail: 'Start your first quests and build a rhythm.' },
  { level: 3, name: 'Explorer', detail: 'Keep showing up across reading, movement and building.' },
  { level: 5, name: 'Builder', detail: 'Turn regular effort into completed work.' },
  { level: 8, name: 'Pathfinder', detail: 'Acknowledge the practice you have sustained.' },
  { level: 12, name: 'Trailblazer', detail: 'Celebrate a longer history of showing up.' },
];
export const rankName = (level: number) => [...RANKS].reverse().find(r => r.level <= level)?.name ?? 'Beginner';
export function LevelJourney() {
  const { level, totalXp } = useProgress(); const [selected, setSelected] = useState<number | null>(null);
  const rank = RANKS.find(r => r.level === selected);
  return <View style={{ marginTop: 26 }}>
    <Text style={{ color: '#F6FBFF', fontSize: 21, fontWeight: '700' }}>Your next levels</Text>
    <Text style={{ color: '#94ACBD', marginTop: 8 }}>Every completed quest brings you closer.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 16 }}>{RANKS.map(r => <Pressable key={r.level} accessibilityRole="button" accessibilityLabel={r.name + ', level ' + r.level + (level < r.level ? ', locked' : ', unlocked')} accessibilityState={{ expanded: selected === r.level }} onPress={() => setSelected(selected === r.level ? null : r.level)} style={{ width: 118, minHeight: 132, borderRadius: 22, borderWidth: 1, borderColor: level >= r.level ? '#69DBD1' : '#304356', padding: 14, backgroundColor: '#122337', alignItems: 'center', gap: 10 }}>
      <Feather name={level < r.level ? 'lock' : 'award'} size={28} color={level < r.level ? '#738C9E' : '#69DBD1'} />
      <Text style={{ color: '#F6FBFF', fontWeight: '700' }}>{r.name}</Text><Text style={{ color: '#94ACBD', fontSize: 12 }}>LEVEL {r.level}</Text>
    </Pressable>)}</ScrollView>
    {rank ? <View style={{ padding: 17, backgroundColor: '#15273A', borderRadius: 16 }}><Text style={{ color: '#EAF4FC', lineHeight: 23 }}>{rank.detail}</Text><Text style={{ color: '#69DBD1', marginTop: 8 }}>{level >= rank.level ? 'Rank unlocked' : Math.max(0, (rank.level - 1) * 250 - totalXp) + ' XP to unlock'}</Text><Text style={{ color: '#94ACBD', fontSize: 12, marginTop: 8 }}>Ranks celebrate completed practice.</Text></View> : null}
  </View>;
}
