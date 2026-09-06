import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useLocalSearchParams, useRouter, type Href } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ScreenShell } from '@/components/path-ui';
import { AnimatedWords, CountUpText, DecryptedText, SpotlightCard, StarBorder, useReducedMotionPreference } from '@/components/motion-bits';
import { useProgress } from '@/context/progress';
import { ShareProgress } from '@/components/share-progress';
import { GuidedAction } from '@/components/guided-action';
import { ExerciseDemo } from '@/components/exercise-demo';
import { personalBest, recallScore, ROMAN, SKILLS, skillProgress, stageValid, type Challenge, type Stage, type StageAnswer, type TrainingSession } from '@/lib/training-model';
import { nativeTheme } from '@/lib/native-theme';
import { MagicRings } from '@/components/magic-rings';
import { RecordingPlayback, StoryRecorder } from '@/components/story-recorder';
import { newAchievements } from '@/lib/training-rewards';
import { isGuided } from '@/lib/guided-programmes';

function StageResources({ stage }: { stage: Stage }) {
  const [help, setHelp] = useState(false); const [error, setError] = useState('');
  return <View>{stage.source ? <Pressable accessibilityRole="link" onPress={() => { setError(''); void Linking.openURL(stage.source!.url).catch(() => setError('The resource could not open. Your session is saved; try again when connected.')); }} style={s.option}><Text style={s.optionText}>{stage.source.title}</Text><Feather name="external-link" size={18} color="#A998FF" /></Pressable> : null}{stage.help ? <><Pressable accessibilityRole="button" accessibilityState={{ expanded: help }} onPress={() => setHelp(!help)} style={s.share}><Text style={s.optionText}>{help ? 'Hide guidance' : 'I’m stuck — show guidance'}</Text></Pressable>{help ? <Text style={s.body}>{stage.help}</Text> : null}</> : null}{error ? <Text accessibilityRole="alert" style={s.body}>{error}</Text> : null}</View>;
}

function ProjectMaterials({ session }: { session: TrainingSession }) {
  const { training } = useProgress(); const [open, setOpen] = useState(false);
  const saved = Object.values(training.sessions).filter((s) => s.challenge.programme?.title === session.challenge.programme?.title).flatMap((s) => s.challenge.stages.filter((stage) => stage.type === 'artifact' && s.answers[stage.id]?.fields).map((stage) => ({ stage, answer: s.answers[stage.id] })));
  if (!session.challenge.programme || !saved.length) return null;
  return <View><Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen(!open)} style={s.option}><Text style={s.optionText}>Your saved project materials</Text><Feather name={open ? 'chevron-up' : 'chevron-down'} size={20} color="#A998FF" /></Pressable>{open ? saved.map(({ stage, answer }, i) => <View key={`${stage.id}-${i}`} style={s.feedback}><Text style={s.stageTitle}>{stage.title}</Text>{stage.type === 'artifact' ? stage.fields.map((f) => <Text key={f.id} selectable style={s.body}>{f.label}: {answer.fields?.[f.id]}</Text>) : null}</View>) : null}</View>;
}

function Button({ label, onPress, disabled = false, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[s.button, secondary && s.secondaryButton, disabled && s.disabled]}><Text style={[s.buttonText, secondary && { color: '#C8D8E3' }]}>{label}</Text><Feather name={secondary ? 'pause' : 'arrow-right'} size={17} color={secondary ? '#C8D8E3' : '#050A12'} /></Pressable>;
}

function Clock({ elapsed, seconds, running, onToggle, label, orb = false }: { elapsed: number; seconds: number; running: boolean; onToggle: () => void; label: string; orb?: boolean }) {
  const remaining = Math.max(0, Math.ceil(seconds - elapsed));
  const progress = Math.min(1, elapsed / seconds);
  return <View style={s.clockWrap}>
    <View style={s.clockFace}>
      {orb ? <View pointerEvents="none" style={StyleSheet.absoluteFill}><MagicRings variant="orb" size={220} playing={running} /></View> : null}
      <Svg width={220} height={220} viewBox="0 0 220 220"><Circle cx={110} cy={110} r={96} stroke="#183B4E" strokeWidth={3} fill="none" /><Circle cx={110} cy={110} r={96} stroke="#55D6FF" strokeWidth={4} fill="none" strokeDasharray={`${603 * progress} 603`} transform="rotate(-90 110 110)" strokeLinecap="round" /></Svg>
      <View style={s.clockCopy}><Text style={s.clockLabel}>{remaining === 0 ? 'INTERVAL COMPLETE' : label.toUpperCase()}</Text><Text accessibilityLiveRegion="none" style={s.clockNumber}>{String(Math.floor(remaining / 60)).padStart(2, '0')}:{String(remaining % 60).padStart(2, '0')}</Text><Text style={s.muted}>{remaining === 0 ? 'Take your next step' : running ? 'One thing at a time' : 'Ready when you are'}</Text></View>
    </View>
    {remaining > 0 ? <Button label={running ? 'Pause interval' : elapsed > 0 ? 'Resume interval' : 'Start interval'} secondary={running} onPress={onToggle} /> : null}
  </View>;
}

function StageContent({ stage, answer, onAnswer, running, onToggle, challenge, onCaptureBusy, onRecordingSaved }: { stage: Stage; answer: StageAnswer; onAnswer: (answer: StageAnswer) => void; running: boolean; onToggle: () => void; challenge: Challenge; onCaptureBusy: (busy: boolean) => void; onRecordingSaved: (recording: StageAnswer['recording']) => void }) {
  const [idea, setIdea] = useState('');
  const { training } = useProgress();
  const prior = training.results.flatMap((r) => r.metrics).filter((m) => m.protocol === `${challenge.quest.id}:v1:${stage.id}:L${challenge.level}:${answer.variant}`);
  const elapsed = answer.elapsed ?? 0;
  if (stage.type === 'action' && challenge.programme) return <GuidedAction stage={stage} answer={answer} onAnswer={onAnswer} />;
  if (stage.type === 'artifact') return <View style={s.options}>{stage.fields.map((f) => <View key={f.id}><Text style={s.optionText}>{f.label}</Text><Text style={s.small}>Example: {f.example}</Text><TextInput accessibilityLabel={f.label} multiline maxLength={500} value={answer.fields?.[f.id] ?? ''} onChangeText={(text) => onAnswer({ fields: { ...answer.fields, [f.id]: text } })} placeholder="Your project detail" placeholderTextColor="#71899B" style={s.input} /></View>)}<Text style={s.small}>Use at least two characters per field. Your template is saved with this session.</Text></View>;
  if (stage.type === 'action') return <View style={s.options}>{stage.steps.map((step, index) => { const checked = answer.checks?.includes(index) ?? false; return <Pressable key={step} accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => onAnswer({ ...answer, alternative: false, checks: checked ? answer.checks?.filter((n) => n !== index) : [...(answer.checks ?? []), index] })} style={[s.option, checked && s.selected]}><Text style={s.optionText}>{index + 1}. {step}</Text><Feather name={checked ? 'check-square' : 'square'} color="#55D6FF" size={22} /></Pressable>; })}<Text style={s.small}>{answer.checks?.length ?? 0} of {stage.steps.length} actions completed. Mark only what you actually did.</Text><View style={s.feedback}><Text style={s.body}>{stage.alternative}</Text>{!stage.alternative.startsWith('Pause') ? <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(answer.alternative) }} onPress={() => onAnswer({ ...answer, alternative: !answer.alternative })} style={s.option}><Text style={s.optionText}>I used the preparation alternative</Text><Feather name={answer.alternative ? 'check-square' : 'square'} size={22} color="#A998FF" /></Pressable> : null}</View></View>;
  if (stage.type === 'lesson' && stage.reading) return <View style={s.options}><Text selectable style={{ color: '#F6FBFF', fontSize: 23, lineHeight: 36 }}>{stage.reading.passage}</Text><Text style={s.small}>{stage.reading.attribution}</Text><Text style={s.body}>{stage.points.join(' ')}</Text><Text style={s.score}>{Math.floor(elapsed / 60)}:{String(Math.floor(elapsed % 60)).padStart(2, '0')}</Text><Button label={running ? 'Pause reading stopwatch' : 'Start reading stopwatch'} secondary onPress={onToggle} /><Text style={s.small}>Read at your pace. The stopwatch is a helper, not a test. It pauses when you leave the app.</Text><Pressable accessibilityRole='checkbox' accessibilityState={{ checked: Boolean(answer.acknowledged) }} onPress={() => onAnswer({ acknowledged: !answer.acknowledged })} style={s.option}><Text style={s.optionText}>I finished reading</Text><Feather name={answer.acknowledged ? 'check-circle' : 'circle'} size={22} color='#55D6FF' /></Pressable></View>;
  if (stage.type === 'lesson') return <View style={s.options}>{stage.points.map((point, index) => <View key={point} style={s.ideaRow}><Text style={s.kicker}>0{index + 1}</Text><Text style={s.body}>{point}</Text></View>)}<SpotlightCard color="#8D7CFF" style={s.feedback}><Text style={s.kicker}>SEE IT IN PRACTICE</Text><Text style={s.body}>{stage.example}</Text></SpotlightCard><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(answer.acknowledged) }} onPress={() => onAnswer({ acknowledged: !answer.acknowledged })} style={[s.option, answer.acknowledged && s.selected]}><Text style={s.optionText}>I’m ready to try it</Text><Feather name={answer.acknowledged ? 'check-square' : 'square'} size={20} color="#55D6FF" /></Pressable></View>;
  if (stage.type === 'attention') {
    const index = answer.attention?.length ?? 0;
    return <View style={s.options}><Text style={s.kicker}>TARGET: ● CIRCLE · {Math.min(index + 1, stage.cues.length)} / {stage.cues.length}</Text>{index < stage.cues.length ? <><View style={s.attentionCue}><Text accessibilityLabel={`Symbol: ${stage.cues[index] === '●' ? 'circle' : stage.cues[index] === '◆' ? 'diamond' : stage.cues[index] === '■' ? 'square' : 'triangle'}`} style={s.symbol}>{stage.cues[index]}</Text></View><View style={s.between}><Button label="Pass" secondary onPress={() => onAnswer({ attention: [...(answer.attention ?? []), false] })} /><Button label="Target ●" onPress={() => onAnswer({ attention: [...(answer.attention ?? []), true] })} /></View></> : <View style={s.feedback}><Text style={s.stageTitle}>Check complete</Text><Text style={s.body}>Your result will appear after the final check-in.</Text></View>}<Text style={s.small}>This is a practice task, not a clinical attention assessment. Choose at your own pace.</Text></View>;
  }
  if (stage.type === 'values') return <View style={s.options}>{stage.options.map((value) => { const selected = answer.values?.includes(value); const full = !selected && (answer.values?.length ?? 0) >= stage.maximum; return <Pressable key={value} accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(selected), disabled: full }} disabled={full} onPress={() => onAnswer({ values: selected ? answer.values?.filter((v) => v !== value) : [...(answer.values ?? []), value] })} style={[s.option, selected && s.selected, full && s.disabled]}><Text style={s.optionText}>{value}</Text><Feather name={selected ? 'check-square' : 'square'} size={18} color="#FFCC66" /></Pressable>; })}<Text style={s.small}>{answer.values?.length ?? 0}/{stage.maximum} selected · Your values are never ranked as better or worse.</Text></View>;
  const textInput = (placeholder?: string) => <TextInput accessibilityLabel={stage.title} testID={`input-${stage.id}`} multiline value={answer.text ?? ''} onChangeText={(text) => onAnswer({ ...answer, text })} maxLength={2000} placeholder={placeholder ?? 'Write a short, specific answer…'} placeholderTextColor="#71899B" style={s.input} textAlignVertical="top" />;
  if (stage.type === 'write') return <>{textInput(stage.placeholder)}<Text style={s.small}>{Math.min(2000, answer.text?.length ?? 0)}/2000 · At least {stage.minimum} characters</Text></>;
  if (stage.type === 'rating') return <><View style={s.ratingRow}>{[1, 2, 3, 4, 5].map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ selected: answer.rating === value }} accessibilityLabel={`${value} of 5`} onPress={() => onAnswer({ rating: value })} style={[s.rating, answer.rating === value && s.selected]}><Text style={s.ratingNumber}>{value}</Text></Pressable>)}</View><View style={s.between}><Text style={s.muted}>{stage.low}</Text><Text style={s.muted}>{stage.high}</Text></View></>;
  if (stage.type === 'choice') return <View style={s.options}>{stage.options.map((option) => <Pressable key={option.id} accessibilityRole="radio" accessibilityState={{ selected: answer.option === option.id, disabled: Boolean(answer.option) }} disabled={Boolean(answer.option)} onPress={() => onAnswer({ option: option.id })} style={[s.option, answer.option === option.id && s.selected]}><Text style={s.optionText}>{option.label}</Text>{answer.option === option.id ? <Feather name="check-circle" size={18} color="#55D6FF" /> : <Feather name="circle" size={18} color="#476174" />}</Pressable>)}{answer.option ? <SpotlightCard color="#8D7CFF" style={s.feedback}><Text style={s.kicker}>CONSEQUENCE / PERSPECTIVE</Text><Text style={s.body}>{stage.options.find((o) => o.id === answer.option)?.response}</Text></SpotlightCard> : null}</View>;
  if (stage.type === 'timer') return <>
    {stage.mode === 'speak' && (answer.recording?.seconds ?? 0) >= 3 ? <Text style={s.body}>Take saved. Replay it below, then continue to your written review.</Text> : <Clock elapsed={elapsed} seconds={stage.seconds} running={running} onToggle={onToggle} orb={stage.mode === 'composure'} label={stage.mode === 'composure' ? 'Settle at your pace' : stage.mode === 'speak' ? 'Your voice' : 'Focus interval'} />}
    {stage.mode === 'speak' ? <StoryRecorder recording={answer.recording} seconds={stage.seconds} onSaved={onRecordingSaved} onBusy={onCaptureBusy} /> : null}
    <Text style={s.small}>Timers pause when you leave this screen or background the app. Your progress is saved.</Text></>;
  if (stage.type === 'ideas') {
    const finished = elapsed >= stage.seconds;
    const add = () => { if (idea.trim() && running && !finished) { onAnswer({ ...answer, ideas: [...(answer.ideas ?? []), idea] }); setIdea(''); } };
    return <><Clock elapsed={elapsed} seconds={stage.seconds} running={running} onToggle={onToggle} label="Ideas, not perfection" /><View style={s.ideaInputRow}><TextInput accessibilityLabel="New idea" value={idea} onChangeText={setIdea} editable={running && !finished} onSubmitEditing={add} maxLength={160} placeholder="One possible use…" placeholderTextColor="#71899B" style={[s.input, s.ideaInput]} /><Pressable accessibilityRole="button" accessibilityLabel="Add idea" disabled={!running || finished || !idea.trim()} onPress={add} style={[s.add, (!running || finished || !idea.trim()) && s.disabled]}><Feather name="plus" size={22} color="#050A12" /></Pressable></View><Text style={s.muted}>{answer.ideas?.length ?? 0} distinct entries · Exact duplicates count once</Text><View style={s.options}>{answer.ideas?.map((value, i) => <View key={value.toLocaleLowerCase()} style={s.ideaRow}><Text style={s.kicker}>{String(i + 1).padStart(2, '0')}</Text><Text style={s.body}>{value}</Text></View>)}</View><Text style={s.small}>This counts entries; it does not score creativity or originality.</Text></>;
  }
  if (stage.type === 'recall') return <>
    {elapsed < stage.seconds ? <><View style={s.wordGrid}>{stage.words.map((word) => <View key={word} style={s.word}><Text style={s.wordText}>{running ? word : '••••'}</Text></View>)}</View><Clock elapsed={elapsed} seconds={stage.seconds} running={running} onToggle={onToggle} label="Observe the words" /></> : <><Text style={s.kicker}>NOW RETRIEVE WITHOUT LOOKING</Text>{textInput('Enter the words you remember, separated by spaces…')}</>}
  </>;
  if (stage.type === 'performance') return <><View style={s.options}>{stage.variants.map((variant) => <Pressable key={variant} accessibilityRole="radio" accessibilityState={{ selected: answer.variant === variant }} onPress={() => onAnswer({ ...answer, variant })} style={[s.option, answer.variant === variant && s.selected]}><Text style={s.optionText}>{variant}</Text><Feather name={answer.variant === variant ? 'check-circle' : 'circle'} size={17} color="#55D6FF" /></Pressable>)}</View>{answer.variant ? <Text style={s.body}>{prior.length ? `Last record: ${prior[prior.length - 1].value} ${stage.unit} · Best: ${Math.max(...prior.map((m) => m.value))}. This is a comparison, not a required target.` : 'No matching record yet. This will be your starting point for this setup.'}</Text> : null}<TextInput accessibilityLabel={`Result in ${stage.unit}`} keyboardType="numeric" value={answer.value === undefined ? '' : String(answer.value)} onChangeText={(value) => onAnswer({ ...answer, value: value.trim() ? Number(value) : undefined })} maxLength={6} placeholder={`0–${stage.maximum} ${stage.unit}`} placeholderTextColor="#71899B" style={[s.input, s.numeric]} /><Text style={s.small}>Use the same setup for a meaningful comparison. Zero is a valid record. No maximum-effort target is required.</Text></>;
  if (stage.type === 'checklist') return <View style={s.options}>{stage.items.map((item, i) => { const checked = answer.checks?.includes(i); return <Pressable key={item} accessibilityRole="checkbox" accessibilityState={{ checked: Boolean(checked) }} onPress={() => onAnswer({ checks: checked ? answer.checks?.filter((n) => n !== i) : [...(answer.checks ?? []), i] })} style={[s.option, checked && s.selected]}><Text style={s.optionText}>{item}</Text><Feather name={checked ? 'check-square' : 'square'} size={18} color="#55D6FF" /></Pressable>; })}</View>;
  return null;
}

function Result({ session, resultKey }: { session?: TrainingSession; resultKey?: string }) {
  const { training } = useProgress(); const router = useRouter(); const reduced = useReducedMotionPreference();
  const result = training.results.find((r) => r.sessionKey === (session?.key ?? resultKey))!;
  const historyAtResult = training.results.filter((r) => r.completedAt <= result.completedAt);
  const rank = skillProgress(result.skill, historyAtResult);
  const previousRank = skillProgress(result.skill, historyAtResult.filter((r) => r.sessionKey !== result.sessionKey));
  const before = session?.answers.before?.rating; const after = session?.answers.after?.rating;
  const [shareError, setShareError] = useState('');
  const unlocked = newAchievements(training.results, result.sessionKey);
  const recordings = Object.values(session?.answers ?? {}).flatMap((answer) => answer.recording ? [answer.recording] : []);
  const share = async () => {
    try { await Share.share({ message: `Jack of All — ${result.title}\nCompleted a ${result.category} in ${SKILLS[result.skill].label}. ${result.metrics.map((m) => `${m.label}: ${m.value} ${m.unit}`).join(' · ')}\nWhat are you practicing this week?` }); }
    catch { setShareError('Sharing did not open. Your result is still saved here.'); }
  };
  return <View testID="session-result">
    <Animated.View entering={reduced ? undefined : ZoomIn.duration(850).springify()} style={s.resultScene}><MagicRings variant="orb" size={260} /><View style={s.orbMedal}><Feather name={rank.level > previousRank.level ? 'unlock' : 'award'} size={40} color="#F6FBFF" /></View></Animated.View>
    <DecryptedText text={!session?.challenge.programme && rank.level > previousRank.level ? 'NEW PRACTICE RANK' : 'RESULT RECORDED'} style={s.kickerCenter} />
    <AnimatedWords text={result.title} style={s.resultTitle} />
    {session?.challenge.programme ? <View style={s.feedback}><Text style={s.kicker}>{result.successful ? 'ASSIGNMENT RECORDED' : 'PRACTICE RECORDED'}</Text><Text style={s.body}>{result.successful ? session.challenge.programme.outcome : 'Return to this assignment on your next scheduled day. Your recorded attempt is preserved.'}</Text><Text style={s.body}>Next: {result.successful ? session.challenge.programme.next : session.challenge.quest.title}</Text><ProjectMaterials session={session} /><Button label="Return to my plan" onPress={() => router.replace('/')} /></View> : null}
    <CountUpText value={result.xp} prefix="+" suffix=" XP" style={s.xp} />
    {!session?.challenge.programme ? <><Text style={s.centerBody}>{SKILLS[result.skill].label} · Practice rank {ROMAN[rank.level - 1]}{rank.level > previousRank.level ? ' unlocked' : ''}</Text>
    <Text style={s.smallCenter}>{rank.days} successful practice days. Rank reflects practice history, not proven mastery.</Text></> : null}
    {unlocked.map((badge, index) => <Animated.View key={badge.id} entering={reduced ? undefined : FadeInDown.delay(250 + index * 120).springify()}><SpotlightCard color="#FFCC66" style={s.feedback}><View style={s.between}><Feather name={badge.icon} size={26} color="#FFCC66" /><Text style={[s.kicker, { color: '#FFCC66' }]}>ACHIEVEMENT UNLOCKED</Text></View><Text style={s.stageTitle}>{badge.title}</Text><Text style={s.body}>{badge.detail}</Text></SpotlightCard></Animated.View>)}
    {recordings.map((recording) => <RecordingPlayback key={recording.id} recording={recording} />)}
    {before && after ? <SpotlightCard style={s.feedback}><Text style={s.kicker}>YOUR REPORTED STATE</Text><Text style={s.score}>{before} → {after}</Text><Text style={s.body}>{after < before ? 'You reported feeling less scattered.' : after > before ? 'You reported feeling more scattered. A different approach may suit you better.' : 'You reported no change. That is useful feedback too.'}</Text></SpotlightCard> : null}
    {result.metrics.map((metric) => { const best = personalBest(metric, training.results, result.sessionKey); return <SpotlightCard key={metric.protocol} color="#4CD6B0" style={s.metric}><Text style={s.kicker}>{metric.label.toUpperCase()}</Text><View style={s.between}><Text style={s.score}>{metric.value} <Text style={s.muted}>{metric.unit}</Text></Text><Text style={s.record}>{best === null ? 'BASELINE SET' : metric.value > best ? 'PERSONAL BEST' : `BEST: ${best}`}</Text></View><Text style={s.small}>Compared only with the same protocol and level.</Text></SpotlightCard>; })}
    {session?.challenge.stages.filter((stage) => stage.type === 'recall').map((stage) => stage.type === 'recall' ? <View key={stage.id} style={s.feedback}><Text style={s.kicker}>RECALL REVIEW</Text><Text style={s.body}>{stage.words.join(' · ')}</Text><Text style={s.small}>{recallScore(stage.words, session.answers[stage.id]?.text ?? '')} of {stage.words.length} recalled. Review the words, then try a linking story next time.</Text></View> : null)}
    {!session?.challenge.programme ? <SpotlightCard color="#8D7CFF" style={s.feedback}><Text style={s.kicker}>YOUR NEXT SESSION</Text><Text style={s.body}>{result.feedback === 'hard' ? 'We recorded that this felt hard. Two hard sessions on different days can lower cognitive difficulty.' : result.feedback === 'easy' && result.successful ? 'We recorded a successful, easy attempt. Three such days can unlock a deeper cognitive challenge.' : 'Keep this level and practice a new variation. Quality matters more than rushing.'}</Text><Text style={s.small}>Physical workload is never raised automatically.</Text></SpotlightCard> : null}
    <Button label="Review my progress" onPress={() => router.replace('/progress' as Href)} />
    <ShareProgress questTitle={result.title} />
    {shareError ? <Text accessibilityRole="alert" style={s.small}>{shareError}</Text> : null}
  </View>;
}

export default function SessionRoute() {
  const params = useLocalSearchParams<{ session: string }>(); const key = Array.isArray(params.session) ? params.session[0] : params.session;
  const { training, hydrated, dispatchTraining, profile, saveStatus, hapticsEnabled } = useProgress(); const router = useRouter(); const reduced = useReducedMotionPreference();
  const session = key ? training.sessions[key] : undefined;
  const stage = session?.challenge.stages[session.stageIndex];
  const [running, setRunning] = useState(false);
  const [captureBusy, setCaptureBusy] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const dispatch = useRef(dispatchTraining); dispatch.current = dispatchTraining;
  const stageId = stage?.id;
  const previousStatus = useRef(session?.status);
  useEffect(() => {
    if (previousStatus.current === 'active' && session?.status === 'complete' && hapticsEnabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    previousStatus.current = session?.status;
  }, [session?.status, hapticsEnabled]);
  useFocusEffect(useCallback(() => () => setRunning(false), []));
  useEffect(() => { setRunning(false); }, [key, stageId]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => { if (state !== 'active') setRunning(false); });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!running || !key) return;
    let previous = Date.now();
    const interval = setInterval(() => {
      const now = Date.now(); const seconds = Math.max(0, (now - previous) / 1000); previous = now;
      if (AppState.currentState !== 'background' && AppState.currentState !== 'inactive') dispatch.current({ type: 'tick', key, seconds });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, key, stageId]);
  useEffect(() => { if (stage && 'seconds' in stage && (session?.answers[stage.id]?.elapsed ?? 0) >= (stage.seconds ?? 3600)) setRunning(false); }, [stage, session?.answers]);
  if (!hydrated) return null;
  if (!session && training.results.some((result) => result.sessionKey === key)) return <ScreenShell><View style={s.page}><Button label="Return to progress" onPress={() => router.replace('/progress' as Href)} /><Result resultKey={key} /></View></ScreenShell>;
  if (!session) return <ScreenShell><View style={s.page}><Text style={s.title}>This session is unavailable.</Text><Text style={s.body}>Open a challenge from Home or Evolve. Older result summaries are kept in Progress.</Text><Button label="Return home" onPress={() => router.replace('/')} /></View></ScreenShell>;
  if (session.status === 'active' && !isGuided(session.challenge)) return <ScreenShell><View style={s.page}><Text style={s.title}>Your training plan has changed.</Text><Text style={s.body}>This exercise has been retired. Your earlier records remain saved; continue with your guided programme.</Text><Button label="Open my main plan" onPress={() => router.replace('/')} /></View></ScreenShell>;
  if (session.status === 'active' && session.challenge.quest.track === 'body' && session.challenge.movementLimit !== (profile?.movementLimit ?? 'none')) return <ScreenShell><View style={s.page}><Text style={s.title}>Your movement preferences changed.</Text><Text style={s.body}>This draft uses your earlier preferences. Discard it and reopen the challenge for a session that uses your current limits.</Text><Button label="Discard old draft and return home" onPress={() => { dispatchTraining({ type: 'discard', key }); router.replace('/'); }} /></View></ScreenShell>;
  const c = session.challenge; const color = c.quest.trackColor;
  const exit = () => { setRunning(false); if (router.canGoBack()) router.back(); else router.replace('/'); };
  return <ScreenShell><View style={s.page}>
    <View style={s.top}><Pressable accessibilityRole="button" accessibilityLabel="Save session and go back" disabled={captureBusy} onPress={exit} style={[s.back, captureBusy && s.disabled]}><Feather name="arrow-left" size={20} color="#F6FBFF" /><Text style={s.muted}>{captureBusy ? 'SAVE YOUR TAKE FIRST' : session.status === 'complete' ? 'BACK' : 'SAVE & LEAVE'}</Text></Pressable><Text style={[s.kicker, { color }]}>{c.category.toUpperCase()} · {ROMAN[c.level - 1]}</Text></View>
    {saveStatus === 'error' ? <Text accessibilityRole="alert" style={[s.body, { color: '#FFCC66' }]}>Storage is unavailable. Your latest changes may not survive closing the app.</Text> : null}
    {session.status === 'complete' ? <Result session={session} /> : <>
      <View style={s.heading}><Text style={[s.kicker, { color }]}>{c.programme ? (c.quest.track === 'freedom' ? 'FINANCIAL FREEDOM' : c.quest.track.toUpperCase()) : `${SKILLS[c.skill].label.toUpperCase()} / ${c.mechanic.toUpperCase()}`}</Text><AnimatedWords text={c.quest.title} style={s.title} />{!c.programme ? <Text style={s.body}>{c.reason}</Text> : null}</View>
      <ProjectMaterials session={session} />
      <View style={s.steps}>{c.stages.map((item, index) => <View key={item.id} style={[s.step, index <= session.stageIndex && { backgroundColor: color }]} />)}</View>
      <Text style={s.small}>{c.stages.length > 1 && stage ? `STEP ${session.stageIndex + 1} OF ${c.stages.length} · ` : ''}{saveStatus === 'saved' ? 'Saved on this device' : saveStatus === 'error' ? 'Not saved' : 'Saving…'}</Text>
      {stage ? <Animated.View key={stage.id} entering={reduced ? undefined : FadeInDown.duration(260)}>
        <StarBorder color={color} style={s.stageBorder} contentStyle={s.stageInner}>
          {stage.title !== c.quest.title ? <Text style={s.stageTitle}>{stage.title}</Text> : null}{stage.prompt && !c.programme ? <Text style={s.body}>{stage.prompt}</Text> : null}
          {stage.demonstration ? <ExerciseDemo kind={stage.demonstration} /> : null}
          {!stage.reading && !stage.demonstration ? <StageResources key={`resources-${stage.id}`} stage={stage} /> : null}
          <StageContent key={stage.id} stage={stage} challenge={c} answer={session.answers[stage.id] ?? {}} running={running} onToggle={() => setRunning((v) => !v)} onCaptureBusy={setCaptureBusy} onRecordingSaved={(recording) => dispatchTraining({ type: 'recording', key, stageId: stage.id, recording })} onAnswer={(answer) => dispatchTraining({ type: 'answer', key, answer })} />
        </StarBorder>
        {(!c.programme || stageValid(stage, session.answers[stage.id])) ? <Button label={c.programme && session.stageIndex === c.stages.length - 1 ? `Complete quest · +${c.quest.xp} XP` : 'Continue'} disabled={captureBusy || !stageValid(stage, session.answers[stage.id])} onPress={() => {
          setRunning(false); dispatchTraining({ type: 'next', key });
          if (c.programme && session.stageIndex === c.stages.length - 1) { dispatchTraining({ type: 'feedback', key, value: 'right' }); dispatchTraining({ type: 'finish', key, now: new Date().toISOString() }); }
        }} /> : null}
      </Animated.View> : c.programme ? <View style={s.feedback}><Text style={s.stageTitle}>Ready to finish</Text><Button label={`Complete quest · +${c.quest.xp} XP`} onPress={() => { dispatchTraining({ type: 'feedback', key, value: 'right' }); dispatchTraining({ type: 'finish', key, now: new Date().toISOString() }); }} /></View> : <View style={s.feedback}>
        <Text style={s.stageTitle}>How did the assignment feel?</Text><Text style={s.body}>If it was too hard, this assignment stays next for another practice day. Your effort is still recorded.</Text>
        <View style={s.options}>{(['easy', 'right', 'hard'] as const).map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ selected: session.feedback === value }} onPress={() => dispatchTraining({ type: 'feedback', key, value })} style={[s.option, session.feedback === value && s.selected]}><Text style={s.optionText}>{value === 'easy' ? 'Too easy' : value === 'right' ? 'Right level' : 'Too hard'}</Text><Feather name={session.feedback === value ? 'check-circle' : 'circle'} size={18} color="#55D6FF" /></Pressable>)}</View>
        <Button label={`Save result · +${c.quest.xp} XP`} disabled={!session.feedback} onPress={() => dispatchTraining({ type: 'finish', key, now: new Date().toISOString() })} />
      </View>}
      <Pressable accessibilityRole="button" disabled={captureBusy} onPress={() => { setRunning(false); setConfirmDiscard(true); }} style={s.share}><Text style={s.small}>Discard this unfinished attempt</Text></Pressable>
      {confirmDiscard ? <View style={s.feedback}><Text style={s.body}>Discard this draft? Its answers will be removed and no XP will be awarded.</Text><Button label="Keep my draft" onPress={() => setConfirmDiscard(false)} /><Button label="Discard draft" secondary onPress={() => { dispatchTraining({ type: 'discard', key }); exit(); }} /></View> : null}
    </>}
  </View></ScreenShell>;
}

const s = StyleSheet.create({
  attentionCue: { height: 160, alignItems: 'center', justifyContent: 'center', borderRadius: 24, backgroundColor: '#152B40' }, symbol: { color: '#B3F0FF', fontSize: 88 }, resultScene: { alignSelf: 'center', width: 260, height: 250, marginTop: 8 }, orbMedal: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  page: { paddingHorizontal: 20, maxWidth: 620, width: '100%', alignSelf: 'center', paddingBottom: 20 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 }, back: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 9 }, heading: { marginTop: 12, marginBottom: 20 },
  title: { fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -1, color: '#F6FBFF', marginVertical: 10 }, kicker: { color: '#55D6FF', fontSize: 10, fontFamily: nativeTheme.typography.sans.bold, letterSpacing: 1.4 }, body: { color: '#C8D8E3', fontSize: 14, lineHeight: 22, marginTop: 10, flexShrink: 1 }, muted: { color: '#91A7B8', fontSize: 12, lineHeight: 18 }, small: { color: '#91A7B8', fontSize: 11, lineHeight: 17, marginTop: 10 },
  steps: { flexDirection: 'row', gap: 5 }, step: { height: 4, borderRadius: 4, backgroundColor: '#23394B', flex: 1 }, stageBorder: { marginTop: 18 }, stageInner: { padding: 19, backgroundColor: '#0A1928' }, stageTitle: { color: '#F6FBFF', fontSize: 23, fontFamily: nativeTheme.typography.sans.bold, lineHeight: 29 },
  input: { minHeight: 135, borderWidth: 1, borderColor: '#365367', borderRadius: 14, padding: 14, fontSize: 15, lineHeight: 23, color: '#F6FBFF', backgroundColor: '#081522', marginTop: 20 }, numeric: { minHeight: 70, fontSize: 29 }, button: { minHeight: 52, backgroundColor: '#55D6FF', borderRadius: 14, paddingHorizontal: 18, marginTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }, buttonText: { color: '#050A12', fontSize: 14, fontFamily: nativeTheme.typography.sans.bold }, secondaryButton: { backgroundColor: '#173247', borderWidth: 1, borderColor: '#365367' }, disabled: { opacity: .4 },
  options: { gap: 10, marginTop: 20 }, option: { minHeight: 57, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: '#365367', backgroundColor: '#101F30', flexDirection: 'row', alignItems: 'center', gap: 12 }, optionText: { color: '#DCEAF3', fontSize: 14, lineHeight: 21, flex: 1 }, selected: { borderColor: '#55D6FF', backgroundColor: '#15394B' }, ratingRow: { flexDirection: 'row', gap: 8, marginTop: 24, marginBottom: 10 }, rating: { flex: 1, minHeight: 57, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#365367', borderRadius: 12 }, ratingNumber: { color: '#F6FBFF', fontSize: 23 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  clockWrap: { marginTop: 20 }, clockFace: { width: 220, height: 220, alignSelf: 'center' }, clockCopy: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' }, clockLabel: { fontSize: 8, color: '#55D6FF', letterSpacing: 1.2 }, clockNumber: { color: '#F6FBFF', fontSize: 46, fontFamily: nativeTheme.typography.sans.extrabold, fontVariant: ['tabular-nums'], marginVertical: 8 },
  ideaInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 }, ideaInput: { flex: 1, minHeight: 50, marginTop: 0 }, add: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#55D6FF', alignItems: 'center', justifyContent: 'center' }, ideaRow: { flexDirection: 'row', gap: 14, alignItems: 'baseline', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#23394B' }, wordGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 }, word: { borderRadius: 12, padding: 13, backgroundColor: '#15394B' }, wordText: { color: '#F6FBFF', fontSize: 18 },
  feedback: { marginTop: 18, padding: 18, borderWidth: 1, borderColor: '#315063', borderRadius: 17, backgroundColor: '#102235' }, resultEmblem: { width: 100, height: 100, borderWidth: 1, borderColor: '#55D6FF', backgroundColor: '#123248', borderRadius: 34, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: 30, marginBottom: 26 }, kickerCenter: { color: '#55D6FF', fontSize: 10, letterSpacing: 2, textAlign: 'center' }, resultTitle: { color: '#F6FBFF', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 28, lineHeight: 34, textAlign: 'center', marginTop: 14 }, xp: { color: '#4CD6B0', fontFamily: nativeTheme.typography.sans.extrabold, fontSize: 42, textAlign: 'center', marginTop: 12 }, centerBody: { color: '#C8D8E3', fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 10 }, smallCenter: { color: '#91A7B8', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 6 },
  metric: { borderRadius: 17, padding: 17, borderWidth: 1, borderColor: '#27514E', backgroundColor: '#0B262A', marginTop: 12 }, score: { color: '#F6FBFF', fontSize: 31, marginTop: 10, fontFamily: nativeTheme.typography.sans.bold }, record: { color: '#4CD6B0', fontSize: 9, fontFamily: nativeTheme.typography.sans.bold, flexShrink: 1 }, share: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 },
});
