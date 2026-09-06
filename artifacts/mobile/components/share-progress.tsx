import React, { useRef, useState } from 'react';
import { Modal, Platform, Pressable, Share, Text, View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useProgress } from '@/context/progress';
import { rankName } from './level-journey';

export function ShareProgress({ questTitle }: { questTitle?: string }) {
  const { level, totalCompleted, currentStreak, totalXp } = useProgress();
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const card = useRef<View>(null);
  const text = `Jack of All · ${rankName(level)} · Level ${level}\n${questTitle ?? totalCompleted + ' quests completed'}\n${currentStreak} day streak · ${totalXp} XP`;
  const share = async () => {
    if (busy) return; setBusy(true); setError(''); let uri: string | undefined;
    try {
      if (Platform.OS === 'web' || !await Sharing.isAvailableAsync()) await Share.share({ message: text });
      else { uri = await captureRef(card, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1350 }); await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Share your progress' }); }
    } catch { setError('Sharing did not open. Please try again.'); }
    finally { if (uri) releaseCapture(uri); setBusy(false); }
  };
  return <>
    <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={{ minHeight: 52, justifyContent: 'center', alignItems: 'center', marginTop: 15, backgroundColor: '#163248', borderRadius: 15 }}><Text style={{ color: '#81DDE8', fontWeight: '700' }}>{questTitle ? 'Share this quest' : 'Share my progress'}</Text></Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => { if (!busy) setOpen(false); }}>
      <View style={{ flex: 1, backgroundColor: '#000D', padding: 24, alignItems: 'center', justifyContent: 'center' }}>
        <View accessibilityViewIsModal style={{ maxWidth: 360, width: '100%' }}>
          <View ref={card} collapsable={false} style={{ aspectRatio: 0.8, backgroundColor: '#081A2A' }}>
            <LinearGradient colors={['#133E50', '#1C1740', '#071624']} style={{ flex: 1, padding: 28, justifyContent: 'space-between' }}>
              <Text style={{ color: '#AEEDEB', letterSpacing: 3, fontSize: 13, fontWeight: '700' }}>JACK OF ALL</Text>
              <View><Text style={{ color: '#73E0CF', fontSize: 13, letterSpacing: 2 }}>LEVEL {level}</Text><Text style={{ color: '#FFF', fontSize: 39, fontWeight: '800', marginTop: 9 }}>{rankName(level)}</Text><Text style={{ color: '#D0DEEB', fontSize: 18, lineHeight: 26, marginTop: 20 }}>{questTitle ?? 'One quest at a time.'}</Text></View>
              <View style={{ borderTopWidth: 1, borderTopColor: '#587082', paddingTop: 18 }}><Text style={{ color: '#FFF', fontSize: 19, fontWeight: '700' }}>{totalCompleted} quests · {currentStreak} day streak</Text><Text style={{ color: '#A8C8D8', fontSize: 13, marginTop: 10 }}>{totalXp} XP earned</Text></View>
            </LinearGradient>
          </View>
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void share(); }} style={{ minHeight: 54, backgroundColor: '#73E0CF', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}><Text style={{ fontWeight: '700', color: '#071624' }}>{busy ? 'Preparing…' : 'Share to…'}</Text></Pressable>
          {error ? <Text accessibilityRole="alert" style={{ color: '#FFCE80', marginTop: 12 }}>{error}</Text> : null}
          <Pressable accessibilityRole="button" disabled={busy} onPress={() => setOpen(false)} style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: '#E5F1F7' }}>Close</Text></Pressable>
        </View>
      </View>
    </Modal>
  </>;
}
