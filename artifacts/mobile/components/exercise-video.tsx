import React, { useCallback, useEffect } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';

export function ExerciseVideo({ source }: { source: number }) {
  const player = useVideoPlayer(source, p => { p.loop = false; p.muted = true; });
  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state !== 'active') player.pause(); });
    return () => subscription.remove();
  }, [player]);
  useFocusEffect(useCallback(() => () => player.pause(), [player]));
  return <View style={s.card}>
    <VideoView player={player} style={s.video} contentFit="contain" nativeControls allowsFullscreen />
    {status === 'error' ? <Text accessibilityRole="alert" style={s.note}>Video unavailable. Use the movement instructions below.</Text> : <View style={s.row}>
      <Pressable accessibilityRole="button" accessibilityLabel={isPlaying ? 'Pause demonstration' : 'Play demonstration'} style={s.button} onPress={() => isPlaying ? player.pause() : player.play()}><Text style={s.label}>{isPlaying ? 'Pause' : 'Play'}</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Replay demonstration" style={s.button} onPress={() => { player.currentTime = 0; player.play(); }}><Text style={s.label}>Replay</Text></Pressable>
    </View>}
    <Text style={s.note}>Anime Shreds · 17 sec · Sound starts muted</Text>
  </View>;
}
const s = StyleSheet.create({
  card: { gap: 12 }, video: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', borderRadius: 12 },
  row: { flexDirection: 'row', gap: 12 }, button: { flex: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', backgroundColor: '#69DBD1', borderRadius: 12 },
  label: { color: '#07131F', fontWeight: '700', fontSize: 16 }, note: { color: '#A6BDCD', fontSize: 13 },
});
