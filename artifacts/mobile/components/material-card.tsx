import React, { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useProgress } from '@/context/progress';
import type { Material } from '@/lib/business-workspace';

export function MaterialCard({ material }: { material: Material }) {
  const { training, dispatchTraining, saveStatus } = useProgress();
  const saved = training.workspace?.materials[material.id];
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState(false);
  const [text, setText] = useState(saved?.text ?? material.text); const [notice, setNotice] = useState('');
  useEffect(() => { setText(saved?.text ?? material.text); }, [material.id]);
  const save = () => { dispatchTraining({ type: 'workspace', action: { kind: 'material', material: { ...material, text } } }); setNotice('Saved version updated'); };
  return <View style={{ backgroundColor: '#172B40', borderRadius: 18, padding: 18, gap: 12 }}>
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: '#C1B4FF', fontSize: 17, fontWeight: '700' }}>{material.title} {open ? '−' : '+'}</Text><Text style={{ color: '#9BB3C5', marginTop: 5 }}>Ready-made example · tap to open</Text></Pressable>
    {open ? <>
      {editing ? <TextInput accessibilityLabel={`Edit ${material.title}`} multiline maxLength={12000} value={text} onChangeText={value => { setText(value); dispatchTraining({ type: 'workspace', action: { kind: 'material', material: { ...material, text: value } } }); }} style={{ color: '#EFF7FF', fontSize: 16, lineHeight: 25, minHeight: 200, padding: 10, borderColor: '#456079', borderWidth: 1, borderRadius: 10, textAlignVertical: 'top' }} /> : <Text selectable style={{ color: '#EFF7FF', fontSize: 16, lineHeight: 25 }}>{text}</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        <Pressable accessibilityRole="button" onPress={async () => { try { await Clipboard.setStringAsync(text); setNotice('Copied'); } catch { setNotice('Copy unavailable. You can select the text above.'); } }} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: '#69DBD1' }}>Copy</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={save} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: '#69DBD1' }}>Save</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setEditing(!editing)} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: '#69DBD1' }}>{editing ? 'Done editing' : 'Edit my version'}</Text></Pressable>
      </View>
    </> : null}
    {saved ? <Pressable accessibilityRole="button" onPress={() => { setText(saved.text); setOpen(true); setEditing(false); }} style={{ minHeight: 48, justifyContent: 'center' }}><Text style={{ color: '#69DBD1' }}>Open my saved version</Text></Pressable> : null}
    {notice ? <Text accessibilityLiveRegion="polite" style={{ color: '#9BB3C5' }}>{notice}</Text> : null}
    {saveStatus === 'error' ? <Text style={{ color: '#FFB7AA' }}>Saving failed. Keep the app open and try Save again.</Text> : null}
  </View>;
}
