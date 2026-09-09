import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenShell } from '@/components/path-ui';
import { MaterialCard } from '@/components/material-card';
import { useProgress } from '@/context/progress';
import { emptyWorkspace } from '@/lib/business-workspace';

export default function SavedMaterials() {
  const { training } = useProgress(); const w = training.workspace ?? emptyWorkspace(); const router = useRouter();
  return <ScreenShell><View style={{ padding: 22, gap: 18 }}>
    <Pressable accessibilityRole="button" onPress={() => router.back()} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: '#69DBD1' }}>Back</Text></Pressable>
    <Text style={{ color: '#FFF', fontSize: 30, fontWeight: '700' }}>Your saved work</Text>
    <Text style={{ color: '#9BB3C5', lineHeight: 22 }}>Materials and public contacts stay on this device. Contact information is excluded from progress sharing.</Text>
    {Object.values(w.materials).map(material => <MaterialCard key={material.id} material={material} />)}
    {!Object.keys(w.materials).length ? <Text style={{ color: '#9BB3C5' }}>Use Save on a quest material to keep your version here.</Text> : null}
    <Text style={{ color: '#FFF', fontSize: 22 }}>Call history</Text>
    {[...w.calls].reverse().map(call => <View key={call.id} style={{ backgroundColor: '#142B3E', borderRadius: 16, padding: 16, gap: 8 }}><Text style={{ color: '#FFF' }}>{w.prospects.find(p => p.id === call.prospectId)?.name ?? 'Business'}</Text><Text style={{ color: '#69DBD1' }}>{call.outcome}</Text><Text style={{ color: '#9BB3C5' }}>{new Date(call.at).toLocaleString()}</Text></View>)}
    {!w.calls.length ? <Text style={{ color: '#9BB3C5' }}>No real call attempts recorded. Practice never appears as a real call.</Text> : null}
  </View></ScreenShell>;
}
