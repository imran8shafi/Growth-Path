export type EvidenceLevel = 'Foundation' | 'Promising' | 'Experimental' | 'Clinical guidance';

export type GrowthProtocol = {
  id: string;
  title: string;
  category: string;
  evidence: EvidenceLevel;
  summary: string;
  practice: string;
  caution?: string;
  sourceLabel: string;
  sourceUrl: string;
};

export const EVIDENCE_COLORS: Record<EvidenceLevel, string> = {
  Foundation: '#4CD6B0',
  Promising: '#55D6FF',
  Experimental: '#FFCC66',
  'Clinical guidance': '#FF8A65',
};

export const GROWTH_PROTOCOLS: GrowthProtocol[] = [
  {
    id: 'strength', title: 'Capability training', category: 'BODY', evidence: 'Foundation',
    summary: 'Progressive strength and regular movement build capacity for ordinary life.',
    practice: 'Train the major movement patterns at a level you can repeat with controlled technique.',
    caution: 'Pain, injury, pregnancy, disability, and medical conditions may require qualified adaptation.',
    sourceLabel: 'WHO physical activity guidance', sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
  },
  {
    id: 'sleep', title: 'Sleep runway', category: 'RECOVERY', evidence: 'Foundation',
    summary: 'A consistent sleep opportunity supports attention, mood, recovery, and physical health.',
    practice: 'Protect a realistic sleep window and reduce stimulating input before it begins.',
    sourceLabel: 'CDC sleep guidance', sourceUrl: 'https://www.cdc.gov/sleep/about/index.html',
  },
  {
    id: 'attention', title: 'Attention perimeter', category: 'MIND', evidence: 'Foundation',
    summary: 'Reducing cues and interruptions makes deliberate focus easier to begin and maintain.',
    practice: 'Put the phone out of reach, define one finish line, and work inside a short protected block.',
    sourceLabel: 'APA attention and multitasking', sourceUrl: 'https://www.apa.org/topics/research/multitasking',
  },
  {
    id: 'fasting', title: 'Gentle time-restricted eating', category: 'BODY', evidence: 'Promising',
    summary: 'Some adults find a consistent overnight eating window useful, but it is not a universal advantage.',
    practice: 'If eligible and opted in, begin with 12 hours overnight; experienced users can choose 14 hours.',
    caution: 'Never dry fast. Do not use if excluded by the safety gate. Diabetes, medication, or medical conditions require clinician guidance.',
    sourceLabel: 'Johns Hopkins overview', sourceUrl: 'https://www.hopkinsmedicine.org/health/expert-qa/intermittent-fasting-what-is-it-and-how-does-it-work',
  },
  {
    id: 'fasting-safety', title: 'Fasting safety gate', category: 'SAFETY', evidence: 'Clinical guidance',
    summary: 'Fasting is not appropriate for everyone, and medical conditions or medication can materially change its risks.',
    practice: 'Skip the timer when an exclusion applies. Seek individualized clinical guidance when health or medication creates uncertainty.',
    caution: 'The onboarding gate reduces obvious risk; it does not diagnose, prescribe, or medically clear fasting.',
    sourceLabel: 'Mayo Clinic safety overview', sourceUrl: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/expert-answers/intermittent-fasting/faq-20441303',
  },
  {
    id: 'nature', title: 'Nature reset', category: 'RECOVERY', evidence: 'Promising',
    summary: 'Time outside can be a useful way to interrupt rumination and restore perspective.',
    practice: 'Walk or sit outside without turning the moment into more screen time.',
    sourceLabel: 'APA review of nature and wellbeing', sourceUrl: 'https://www.apa.org/monitor/2020/04/nurtured-nature',
  },
  {
    id: 'grounding', title: 'Barefoot nature time', category: 'EXPERIMENT', evidence: 'Experimental',
    summary: 'Being outside may feel restorative; electrical “grounding” health claims remain uncertain.',
    practice: 'If the surface is safe, notice texture and temperature. Treat it as mindful nature time, not medical treatment.',
    caution: 'Avoid unsafe terrain, extreme temperatures, wounds, and replacing evidence-based care.',
    sourceLabel: 'Evidence overview', sourceUrl: 'https://health.clevelandclinic.org/earthing',
  },
];
