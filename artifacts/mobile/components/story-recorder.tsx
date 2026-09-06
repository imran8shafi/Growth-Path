import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { Feather } from '@expo/vector-icons';
import { loadRecording, releaseRecording, removeRecording, saveRecording } from '@/lib/recording-storage';
import type { StageAnswer } from '@/lib/training-model';

export function RecordingPlayback({ recording }: { recording: NonNullable<StageAnswer['recording']> }) {
  const player = useAudioPlayer(null); const status = useAudioPlayerStatus(player);
  const [error, setError] = useState(''); const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true; let source: string | undefined;
    setReady(false); setError('');
    void loadRecording(recording.id).then((uri) => {
      source = uri;
      if (!active) { releaseRecording(uri); return; }
      player.replace(uri); setReady(true);
    }).catch(() => { if (active) setError('This take is unavailable on this device. Your written review is still saved.'); });
    return () => { active = false; player.pause(); if (source) releaseRecording(source); };
  }, [recording.id, player]);
  useFocusEffect(useCallback(() => () => player.pause(), [player]));
  useEffect(() => { const sub = AppState.addEventListener('change', (state) => { if (state !== 'active') player.pause(); }); return () => sub.remove(); }, [player]);
  const play = async () => {
    try {
      if (status.playing) { player.pause(); return; }
      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
      await player.seekTo(0); player.play();
    } catch { setError('Playback could not start. Try again.'); }
  };
  return <View><Pressable accessibilityRole="button" disabled={!ready} onPress={() => { void play(); }} style={s.button}><Feather name={status.playing ? 'pause' : 'play'} color="#A998FF" size={18} /><Text style={s.label}>{status.playing ? 'Pause take' : `Replay take · ${Math.round(recording.seconds)}s`}</Text></Pressable>{error ? <Text accessibilityRole="alert" style={s.note}>{error}</Text> : null}</View>;
}

export function StoryRecorder({ recording, seconds = 60, onSaved, onBusy }: { recording?: StageAnswer['recording']; seconds?: number; onSaved: (recording: StageAnswer['recording']) => void; onBusy: (busy: boolean) => void }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const state = useAudioRecorderState(recorder, 150);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const mounted = useRef(true); const capturing = useRef(false); const operation = useRef(false);
  const preparation = useRef(0);
  const callbacks = useRef({ onSaved, onBusy, recording }); callbacks.current = { onSaved, onBusy, recording };
  const stop = useCallback(async () => {
    if (!capturing.current || operation.current) return;
    operation.current = true; capturing.current = false;
    if (mounted.current) setBusy(true);
    try {
      const duration = Math.min(seconds, recorder.getStatus().durationMillis / 1000);
      await recorder.stop(); await setAudioModeAsync({ allowsRecording: false });
      if (!recorder.uri || duration <= 0) throw new Error('No recording');
      const id = `take-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      await saveRecording(id, recorder.uri);
      releaseRecording(recorder.uri);
      const previous = callbacks.current.recording;
      callbacks.current.onSaved({ id, seconds: duration });
      if (previous) await removeRecording(previous.id).catch(() => undefined);
    } catch { if (mounted.current) setError('Could not save the take. You can try again or continue with a written story.'); }
    finally { operation.current = false; callbacks.current.onBusy(false); if (mounted.current) setBusy(false); }
  }, [recorder, seconds]);
  const stopRef = useRef(stop); stopRef.current = stop;
  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', (next) => { if (next !== 'active') { preparation.current += 1; void stopRef.current(); } });
    return () => { mounted.current = false; preparation.current += 1; sub.remove(); void stopRef.current(); };
  }, []);
  useFocusEffect(useCallback(() => () => { preparation.current += 1; void stopRef.current(); }, []));
  useEffect(() => { if (state.isRecording && state.durationMillis >= seconds * 1000) void stop(); }, [state.isRecording, state.durationMillis, seconds, stop]);
  const start = async () => {
    if (operation.current || capturing.current) return;
    operation.current = true; setBusy(true); setError(''); callbacks.current.onBusy(true);
    const attempt = ++preparation.current;
    const cancelled = () => !mounted.current || attempt !== preparation.current;
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (cancelled()) { callbacks.current.onBusy(false); return; }
      if (!permission.granted) throw new Error('permission');
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true, shouldPlayInBackground: false });
      if (cancelled()) { await setAudioModeAsync({ allowsRecording: false }); callbacks.current.onBusy(false); return; }
      await recorder.prepareToRecordAsync();
      if (cancelled()) { await recorder.stop(); await setAudioModeAsync({ allowsRecording: false }); callbacks.current.onBusy(false); return; }
      recorder.record(); capturing.current = true;
    } catch { await setAudioModeAsync({ allowsRecording: false }).catch(() => undefined); callbacks.current.onBusy(false); if (mounted.current) setError('Microphone unavailable. Allow microphone access in your device/browser settings, or use the timer and written review.'); }
    finally { operation.current = false; if (mounted.current) setBusy(false); }
  };
  const clear = async () => {
    if (!recording || operation.current || capturing.current) return;
    operation.current = true; setBusy(true); callbacks.current.onBusy(true);
    try { await removeRecording(recording.id); onSaved(undefined); }
    catch { setError('Could not delete the take. Please try again.'); }
    finally { operation.current = false; callbacks.current.onBusy(false); if (mounted.current) setBusy(false); }
  };
  return <View style={s.panel}>
    <Text style={s.kicker}>STORYCRAFT STUDIO</Text>
    <Text style={s.note}>Optional audio stays on this device. Nothing is uploaded. Stop and save your take before continuing.</Text>
    {state.isRecording ? <Text accessibilityLiveRegion="none" style={s.time}>● {Math.floor(state.durationMillis / 1000)} / {seconds}s</Text> : null}
    <Pressable accessibilityRole="button" disabled={busy} onPress={() => { void (capturing.current ? stop() : start()); }} style={[s.button, state.isRecording && s.live, busy && { opacity: .4 }]}><Feather name={state.isRecording ? 'square' : 'mic'} size={18} color="#F6FBFF" /><Text style={s.label}>{busy ? 'Preparing audio…' : state.isRecording ? 'Stop & save take' : recording ? 'Record a new take' : 'Record a take'}</Text></Pressable>
    {recording && !state.isRecording && !busy ? <><RecordingPlayback recording={recording} /><Pressable accessibilityRole="button" onPress={() => { void clear(); }} style={s.button}><Feather name="trash-2" size={16} color="#91A7B8" /><Text style={s.note}>Delete this take</Text></Pressable></> : null}
    {error ? <Text accessibilityRole="alert" style={s.note}>{error}</Text> : null}
  </View>;
}
const s = StyleSheet.create({ panel: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#33405D', paddingTop: 18 }, kicker: { color: '#A998FF', fontSize: 10, letterSpacing: 1.8 }, note: { color: '#A4B9C8', fontSize: 12, lineHeight: 19, marginTop: 8 }, label: { color: '#F6FBFF', fontSize: 14, flexShrink: 1 }, button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14, minHeight: 48, backgroundColor: '#22213E', borderRadius: 14, marginTop: 10 }, live: { backgroundColor: '#542637' }, time: { fontSize: 28, color: '#FF9EAC', textAlign: 'center', marginVertical: 16, fontVariant: ['tabular-nums'] } });
