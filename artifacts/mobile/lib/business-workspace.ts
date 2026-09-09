export const CALL_OUTCOMES = ['No answer', 'Not interested', 'Follow-up agreed', 'Meeting booked'] as const;
export type CallOutcome = typeof CALL_OUTCOMES[number];
export type Material = { id: string; title: string; text: string; version: number };
export type Prospect = { id: string; name: string; phone: string; source: string };
export type CallAttempt = { id: string; prospectId: string; sessionKey: string; outcome: CallOutcome; at: string };
export type BusinessWorkspace = { materials: Record<string, Material>; prospects: Prospect[]; calls: CallAttempt[]; region?: string; origin?: string; windows?: Record<string, string>; pending?: Record<string, { prospectId: string; at: string }> };
export const emptyWorkspace = (): BusinessWorkspace => ({ materials: {}, prospects: [], calls: [] });
export type WorkspaceAction =
  | { kind: 'material'; material: Material }
  | { kind: 'prospect'; prospect: Prospect }
  | { kind: 'region'; region: string; origin: string }
  | { kind: 'call'; call: CallAttempt }
  | { kind: 'begin-call'; key: string; prospectId: string; at: string }
  | { kind: 'cancel-call'; key: string }
  | { kind: 'undo-call'; id: string };
export function canContact(w: BusinessWorkspace, id: string) { return !w.calls.some(c => c.prospectId === id && (c.outcome === 'Not interested' || c.outcome === 'Meeting booked')); }
export function reduceWorkspace(w: BusinessWorkspace, a: WorkspaceAction): BusinessWorkspace {
  if (a.kind === 'begin-call') return { ...w, windows: { ...w.windows, [a.key]: w.windows?.[a.key] ?? a.at }, pending: { ...w.pending, [a.key]: { prospectId: a.prospectId, at: a.at } } };
  if (a.kind === 'cancel-call') { const pending = { ...w.pending }; delete pending[a.key]; return { ...w, pending }; }
  if (a.kind === 'material') return { ...w, materials: { ...w.materials, [a.material.id]: { ...a.material, text: a.material.text.slice(0, 12000) } } };
  if (a.kind === 'region') return { ...w, region: a.region, origin: a.origin, pending: {} };
  if (a.kind === 'prospect') {
    const p = a.prospect;
    if (!p.name.trim() || !/^\+?[\d ()-]{6,24}$/.test(p.phone) || !/^https?:\/\//.test(p.source)) return w;
    const samePhone = w.prospects.find(x => x.phone.replace(/\D/g, '') === p.phone.replace(/\D/g, '') && x.id !== p.id);
    if (samePhone) return w;
    return { ...w, prospects: [...w.prospects.filter(x => x.id !== p.id), { ...p, name: p.name.slice(0, 100), source: p.source.slice(0, 500) }] };
  }
  if (a.kind === 'undo-call') return { ...w, calls: w.calls.filter(c => c.id !== a.id) };
  if (!CALL_OUTCOMES.includes(a.call.outcome) || w.calls.some(c => c.id === a.call.id) || !canContact(w, a.call.prospectId) || !w.prospects.some(p => p.id === a.call.prospectId) || w.calls.filter(c => c.sessionKey === a.call.sessionKey).length >= 3) return w;
  const pending = { ...w.pending }; delete pending[a.call.sessionKey];
  return { ...w, pending, calls: [...w.calls, a.call] };
}
