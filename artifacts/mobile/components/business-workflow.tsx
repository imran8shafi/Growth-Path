import React, { useEffect, useState } from 'react';
import { Linking, Pressable, Text, TextInput, View } from 'react-native';
import { useProgress } from '@/context/progress';
import { CALL_OUTCOMES, canContact, emptyWorkspace, type Prospect } from '@/lib/business-workspace';
import { CALLING_GUIDANCE, regionReviewed, type CallingRegion } from '@/lib/calling-guidance';
import { sessionKey, type Challenge, type StageAnswer } from '@/lib/training-model';
import { LEAD_MATERIALS } from '@/lib/lead-generation';
import { MaterialCard } from './material-card';

const button = (label: string, onPress: () => void, disabled = false) => <Pressable key={label} accessibilityRole="button" disabled={disabled} onPress={onPress} style={{ minHeight: 48, justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#426078', borderRadius: 12, opacity: disabled ? .4 : 1 }}><Text style={{ color: '#69DBD1', fontSize: 15 }}>{label}</Text></Pressable>;
export function BusinessWorkflow({ challenge, answer, onAnswer, prospectsOnly = false }: { challenge: Challenge; answer: StageAnswer; onAnswer: (a: StageAnswer) => void; prospectsOnly?: boolean }) {
  const { training, dispatchTraining } = useProgress(); const w = training.workspace ?? emptyWorkspace();
  const key = sessionKey(challenge); const calls = w.calls.filter(c => c.sessionKey === key);
  const [selected, setSelected] = useState<string>(w.pending?.[key]?.prospectId ?? ''); const [attempted, setAttempted] = useState(false); const [notice, setNotice] = useState('');
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const [screened, setScreened] = useState(false);
  const [editRegions, setEditRegions] = useState(!w.origin || !w.region);
  const [adding, setAdding] = useState(false);
  const draft = answer.fields ?? {}; const field = (id: string, label: string) => <TextInput accessibilityLabel={label} value={draft[id] ?? ''} onChangeText={text => onAnswer({ ...answer, fields: { ...draft, [id]: text } })} placeholder={label} placeholderTextColor="#93AABE" maxLength={500} style={{ color: '#FFF', borderWidth: 1, borderColor: '#426078', borderRadius: 12, padding: 14, minHeight: 48 }} />;
  const saveProspect = () => {
    const p: Prospect = { id: `prospect-${Date.now()}`, name: draft.name ?? '', phone: draft.phone ?? '', source: draft.source ?? '' };
    if (!p.name.trim() || !/^\+?[\d ()-]{6,24}$/.test(p.phone) || !/^https?:\/\//.test(p.source)) { setNotice('Add a business name, public phone number and its website URL.'); return; }
    if (w.prospects.some(x => x.phone.replace(/\D/g, '') === p.phone.replace(/\D/g, ''))) { setNotice('That number is already saved.'); return; }
    dispatchTraining({ type: 'workspace', action: { kind: 'prospect', prospect: p } }); onAnswer({ ...answer, fields: {} }); setNotice('Business saved on this device');
  };
  const region = (w.region ?? 'Other') as CallingRegion; const guidance = CALLING_GUIDANCE[region] ?? CALLING_GUIDANCE.Other;
  const live = regionReviewed(w.region, w.origin);
  const last = calls[calls.length - 1];
  const max = challenge.stages.some(s => s.workflow === 'call-session') ? 3 : 1;
  const pending = w.pending?.[key];
  const remaining = w.windows?.[key] ? Math.max(0, challenge.minutes * 60 - Math.floor((now - Date.parse(w.windows[key])) / 1000)) : challenge.minutes * 60;
  const expired = remaining === 0;
  return <View style={{ gap: 12, marginTop: 18 }}>
    {prospectsOnly ? <>
      <Text style={{ color: '#E8F3FA' }}>Public business contacts · {w.prospects.length}/3 saved</Text>
      {w.prospects.map(p => <Text key={p.id} style={{ color: '#9BB3C5' }}>{p.name} · {p.phone}</Text>)}
      {field('name', 'Business name')}{field('phone', 'Public business phone')}{field('source', 'Public source URL')}{button('Save business', saveProspect)}
    </> : <>
      {!editRegions ? button(`${w.origin} → ${w.region} · Change regions`, () => { setEditRegions(true); setScreened(false); }) : <><Text style={{ color: '#E8F3FA' }}>Where are you calling from?</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Object.entries(CALLING_GUIDANCE).map(([id, info]) => button(`${w.origin === id ? '✓ ' : ''}${info.label}`, () => { dispatchTraining({ type: 'workspace', action: { kind: 'region', origin: id, region: w.region ?? '' } }); setScreened(false); }))}</View>
      {w.origin ? <><Text style={{ color: '#E8F3FA' }}>Where is the business?</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{Object.entries(CALLING_GUIDANCE).map(([id, info]) => button(`${w.region === id ? '✓ ' : ''}${info.label}`, () => { dispatchTraining({ type: 'workspace', action: { kind: 'region', origin: w.origin!, region: id } }); setScreened(false); setEditRegions(false); }))}</View></> : null}</>}
      {w.region ? <><Text style={{ color: '#BBCFDD', lineHeight: 23 }}>{guidance.text}</Text>{guidance.url ? button('Read official contact guidance', () => { void Linking.openURL(guidance.url); }) : null}
      {!live ? <><Text style={{ color: '#BBCFDD', lineHeight: 23 }}>{w.origin !== w.region ? 'Cross-border calling needs both jurisdictions reviewed. Use the practice version for now.' : 'Use the opener with a fictional business today.'}</Text>{button(answer.variant === 'practice' ? '✓ Practice version selected' : 'Use the practice version', () => onAnswer({ ...answer, variant: 'practice' }))}</> : <>
        {answer.variant === 'practice' ? button('Switch to manual call', () => onAnswer({ ...answer, variant: undefined, checks: [] })) : null}
        {button(screened ? '✓ Contact requirements checked' : 'I have checked the contact requirements', () => setScreened(!screened))}
        <Text style={{ color: '#E8F3FA' }}>{calls.length}/{max} attempts · {challenge.minutes}-minute budget · opening or cancelling earns nothing</Text>
        <Text style={{ color: '#9BB3C5' }}>Time left: {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, '0')}</Text>
        {button('Use a clearly labelled practice version', () => { dispatchTraining({ type: 'workspace', action: { kind: 'cancel-call', key } }); onAnswer({ ...answer, variant: 'practice', checks: [] }); })}
        {calls.length < max && !expired ? w.prospects.filter(p => canContact(w, p.id)).map(p => button(`${selected === p.id ? '✓ ' : ''}${p.name}`, () => { setSelected(p.id); setAttempted(false); })) : null}
        {!w.prospects.length ? <Text style={{ color: '#BBCFDD' }}>Save public business contacts in the prospect quest first.</Text> : null}
        {button(adding ? 'Close new business form' : 'Add another public business contact', () => setAdding(!adding))}
        {adding ? <>{field('name', 'Business name')}{field('phone', 'Public business phone')}{field('source', 'Public source URL')}{button('Save business', saveProspect)}</> : null}
        {selected && screened && (!expired || pending) && calls.length < max ? <>
          {challenge.quest.title.includes('follow-up') && !w.calls.some(c => c.prospectId === selected && c.outcome === 'Follow-up agreed') ? <><Text style={{ color: '#BBCFDD' }}>No follow-up agreement recorded for this business. Use the first-call opener.</Text><MaterialCard material={LEAD_MATERIALS.opener} /></> : null}
          <Text selectable style={{ color: '#FFF', fontSize: 20 }}>{w.prospects.find(p => p.id === selected)?.phone}</Text>
          <Text style={{ color: '#BBCFDD' }}>Call manually using your phone. Keep the opener available above. Return here after the attempt.</Text>
          {!pending ? button('Start manual attempt', () => dispatchTraining({ type: 'workspace', action: { kind: 'begin-call', key, prospectId: selected, at: new Date().toISOString() } })) : button('I made the call attempt', () => setAttempted(true))}
          {button('Cancel — no call made', () => { dispatchTraining({ type: 'workspace', action: { kind: 'cancel-call', key } }); setAttempted(false); setSelected(''); })}
          {attempted && pending ? CALL_OUTCOMES.map(outcome => button(outcome, () => { dispatchTraining({ type: 'workspace', action: { kind: 'call', call: { id: `call-${Date.now()}`, prospectId: pending.prospectId, sessionKey: key, outcome, at: new Date().toISOString() } } }); setAttempted(false); setSelected(''); onAnswer({ ...answer, variant: undefined }); })) : null}
        </> : null}
        {expired ? <Text style={{ color: '#BBCFDD' }}>Time budget reached. Finish with the attempts you have made.</Text> : null}
      </>}</> : null}
      {last ? <><Text accessibilityLiveRegion="polite" style={{ color: '#69DBD1' }}>Saved: {last.outcome}</Text>{button('Undo last outcome', () => { dispatchTraining({ type: 'workspace', action: { kind: 'undo-call', id: last.id } }); onAnswer({ ...answer, checks: [] }); })}</> : null}
    </>}
    {notice ? <Text accessibilityLiveRegion="polite" style={{ color: '#BBCFDD' }}>{notice}</Text> : null}
  </View>;
}
