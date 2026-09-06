import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Stage, StageAnswer } from '@/lib/training-model';

export function GuidedAction({ stage, answer, onAnswer }: { stage: Extract<Stage, { type: 'action' }>; answer: StageAnswer; onAnswer: (value: StageAnswer) => void }) {
  const index = stage.steps.findIndex((_, i) => !answer.checks?.includes(i));
  const done = index < 0;
  return <View style={{ gap: 22, marginTop: 20 }}>
    <Text style={{ color: '#8DB1C4', fontSize: 12 }}>{done ? 'All steps done' : `STEP ${index + 1} / ${stage.steps.length}`}</Text>
    <Text selectable style={{ color: '#F5FAFF', fontSize: 22, lineHeight: 32 }}>{done ? 'Nice work. Your next step is ready.' : stage.steps[index]}</Text>
    {!done ? <Pressable accessibilityRole="button" onPress={() => onAnswer({ ...answer, alternative: false, checks: [...(answer.checks ?? []), index] })} style={{ backgroundColor: '#69DBD1', borderRadius: 16, minHeight: 56, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }}>
      <Feather name="check" size={20} color="#081522" /><Text style={{ color: '#081522', fontWeight: '700', fontSize: 16 }}>{index === stage.steps.length - 1 ? 'Done' : 'Done, next step'}</Text>
    </Pressable> : null}
    {(answer.checks?.length ?? 0) > 0 ? <Pressable accessibilityRole="button" onPress={() => onAnswer({ ...answer, checks: answer.checks?.slice(0, -1) })} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: '#9DB7C8' }}>Back one step</Text></Pressable> : null}
  </View>;
}
