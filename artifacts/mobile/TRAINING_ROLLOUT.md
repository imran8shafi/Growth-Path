# Jack of All: guided main programmes

## Current quest experience

Home leads with Today's quests and an unlock button opening a three-path picker.
Any assigned quest can be taken first; completed quests cannot award XP again.
Mind uses attributed public-domain Enchiridion excerpts, source links, and a saved
foreground reading stopwatch with no time gate. Decision questions become reading
guidance. Body's two foundation workout days include animated sit-to-stand and
supported calf-raise guides, with pause and reduced-motion positions. Movement
restrictions retain the existing suitable-routine alternative.

Onboarding shows a progress bar without question counts and concrete seven-day
milestones instead of invented capability scores or promised percentage gains.
The authored foundation remains seven assignments per active path. Old draft
formats are retired while result history stays saved. The three-path daily mix
uses estimated short, medium, or longer time allocations.

## Current product direction — September 6, 2026

The main-only programme flow supersedes the legacy catalogue described below.
Home assigns one, two, or four sessions for the selected time budget, with one
next action. Library and old path links return to Home. Storytelling, breathing,
optional trials, and extra practice are not assigned. Historical results remain.

Seven foundation assignments are authored per path: sourced thinking lessons and
dilemmas; movement, meals and recovery; preference-aware religious or ethical
practice; and separate service business, SaaS and app business routes. Business
templates are saved with sessions and reused during the programme. These are
introductory foundations, not a complete business launch or clinical diet plan.

Required stages validate input, save unfinished work, and keep difficult work for
another practice day. Only the next assigned session can start. Completing the
main plan earns the daily bonus once, including the ten-minute plan. Progress and
Evolve show programme milestones without promising unimplemented Day 42 tests.
Existing animated borders, transitions and result effects retain reduced-motion
support. The remaining curriculum beyond the foundation is not implemented.

Validation: typecheck; test:programmes (84 content variants, sequencing, preference
changes, missed days, validation, daily rewards and duplicate completion); legacy
training, adaptive and recording suites. Browser checks cover entry and save/resume.

## Historical engine implementation (compatibility reference)

## Product changes

Quests now open a saved session. A card tap never completes the activity or awards
XP. The loop is brief → interaction → result → difficulty feedback → progression.

| Workstream | This implementation |
| --- | --- |
| Quest philosophy and engine | Required stages, validation, saved drafts, reviewable results; seven mechanics: timer, performance, decision, creation, field, skill, boss. |
| Quest reconstruction | Explicit recipes replace the 32 path tasks and all cross-training variants. Storycraft, Comeback Lab, Creativity Trial, Recall Trial, Values Under Pressure, Negotiation Lab, and practical workshops. |
| Competencies | Fifteen skills, five practice ranks, separate challenge difficulty, and concrete level-specific application prompts. |
| Quests / trials / missions | Separate labels and interaction patterns; measurable trials distinguish self-reported reps from scored recall and decision answers. |
| Adaptive difficulty | Three successful/easy prior days raise cognitive difficulty; two hard prior days lower it. Current-day results do not change the other cards. Physical workload is never increased automatically. |
| Weekly bosses | Six chapter challenges combine a lesson, scenario, rehearsal, real-world action, and report. One award per chapter per cycle. |
| Narrative and 42-day cycle | Home names the day/chapter; chapters reorder daily skills. Recall and controlled-movement baselines have matching Day 42 retests. Cycle summaries count actual mission reports and practice days. |
| Rewards | Atomic XP/result updates, completion haptics, animated results, rank reveals, personal bests, and chapter/retest achievements. |
| Animation | Actual React Bits MagicRings fragment shader in onboarding and shared screen backgrounds; Expo GL on native, WebGL on web. Existing React Bits-inspired borders, spotlights, text reveals, and count-ups frame sessions and results. |
| Social starting point | User-initiated result sharing and the existing accountability invitation. No background messages or automatic posting. |
| Story recording | Optional local Storycraft recording with explicit microphone permission, pause-safe capture, replay/delete, and platform-local storage. No upload or transcription. |

## Content and measurement

- Onboarding still controls the starting level, time allowance, movement limits,
  faith/reflection wording, freedom focus, and book recommendations.
- Movement records are comfortable, controlled sets with a self-selected setup.
  There are no maximum-effort tests or automatic rep targets. Changing movement
  limits blocks an incompatible unfinished Body session until it is discarded.
- Creativity counts distinct submitted entries; it does not judge originality.
- Recall matches whole words; scenarios score only explicitly factual questions.
  Values choices, faith, humor, and writing quality do not receive invented scores.
- Composure shows the user's before/after 1–5 ratings, without converting them into
  a percentage improvement or a clinical conclusion. Comfortable normal breathing
  or quiet observation are both valid options.
- Practice rank is earned across separate successful practice days, not by farming
  repeated sessions. It is not a claim of mastery or a validated ability score.
- Personal bests and charts compare matching quest/protocol, difficulty, timer
  settings, and movement variation. Unmatched tests are not compared. A Day 42
  recall result is one small practice measure, not an intelligence assessment.

## Session integrity and persistence

The existing progress storage now contains a versioned `training` object. Legacy
XP and completions are preserved. Result creation, task completion, daily bonuses,
and XP update together in a single state transition. Repeated finish callbacks,
reloads, and returning to an already completed challenge cannot award it again.

Stages and difficulty are frozen when a session starts. Timers count active,
foreground time; leaving the screen or app pauses them. A background delay cannot
instantly finish a timer. Decisions lock after feedback appears. Idea entry stops
at the time limit. Incomplete stages cannot be bypassed via Continue or Finish.

Field missions keep their plan and current stage when the user leaves. Outcomes
are explicitly self-reported; a respectful attempt or safer alternative is valid.
No location, photo, bank detail, contact list, or external account is required.

Result summaries remain available across cycles. Keep only the latest 60 completed
answer transcripts; older summaries still open for review. Unfinished drafts stay
until completed or deliberately discarded. Text is bounded per answer. Everything
is local to this installation; it is not an encrypted cloud journal or a backup.

Storage writes are serialized, and sessions show saving/saved/error state. A failed
initial read never overwrites the existing stored data with an empty profile.

## Magic Rings integration

The supplied shadcn command installs a DOM/Three.js component. This Expo app uses
the actual upstream fragment shader in a small shared GL renderer instead. Both
platforms render the same effect without adding shadcn scaffolding or Three.js.
The native dependency is `expo-gl` for SDK 54. Install updated dependencies before
running; custom native development clients need rebuilding to include Expo GL.

The background renders at 24 FPS, pauses when the screen/app is inactive, and uses
a still frame for reduced motion. It does not capture touches. A static fallback
handles unavailable GL. Web pixel density is capped at one for this decorative
layer. Source attribution and full license are in `THIRD_PARTY_NOTICES.md` and
`licenses/react-bits-LICENSE.md`.

## Deliberately not represented as finished features

- Storycraft supports speaking aloud, saving a written version, and optionally
  recording a take locally. The recording is replayable and deletable on-device;
  it is not uploaded, transcribed, or scored by AI.
- There is no AI evaluation service, cloud account system, friend graph,
  synchronized accountability group, or public leaderboard. Sharing opens the
  device's share UI and leaves the recipient and send action to the user.
- The 42-day comparison currently covers recall and controlled movement, plus
  actual practice/mission counts. Other skills need validated, repeatable tests
  before the app should claim numerical improvements in them.
- Field mission duration depends on the real-world action. Card duration is an
  estimate for the guided steps, not a promise that all daily options fit one
  sitting. Onboarding encourages beginning with one challenge.

## Validation and next release gate

Run from `artifacts/mobile`:

```sh
pnpm install
pnpm test:adaptive
pnpm test:training
pnpm test:recording
pnpm typecheck
pnpm exec expo export --platform all
```

Regression tests use the actual planner, catalogue, and state transitions with
mocked React/native dependencies. They exercise every path recipe and rotating
cross-training, all seven mechanics, required stages, scoring, stable daily
selection, difficulty changes, movement limits, baseline/retest comparability,
draft serialization, and exactly-once awards.

Before release, test on physical iOS and Android devices: keyboard/scroll behavior,
background/resume and reload, GL fallback, reduced motion, shader smoothness,
storage failures, and the share sheet. The implementation preview was checked for the
Library, mobile Composure flow, attention gating, and paused timer persistence.
After the usage reset on September 6, browser checks also covered Storycraft's
writing gate, completed preparation timer, and recorder controls. Recorder startup
now cancels if focus is lost during permission, audio-mode setup, or preparation;
regression tests cover all nine interruption cases. Physical microphone capture
and iOS/Android validation remain required.

## Reference sources

- [React Bits MagicRings source](https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/MagicRings/MagicRings.jsx)
- [ThreeUI EnergyOrb shader source](https://github.com/MengTo/threeui)
- [Componentry Kinetic Text Reveal](https://componentry.dev/docs/components/kinetic-text-reveal)
- [Raylight motion reference](https://raylight.app/)
- [Expo GLView documentation](https://docs.expo.dev/versions/latest/sdk/gl-view/)
- [NHS strength exercise guidance](https://www.nhs.uk/live-well/exercise/strength-exercises/)
- [NHS warm-up and stopping guidance](https://www.nhs.uk/live-well/exercise/how-to-warm-up-before-exercising/)

Latest simplification: one mixed daily quest picker; small category labels only inside sessions. Home now includes locked XP ranks, and Evolve redirects home. Reading is embedded, with foreground stopwatch and saved-draft compatibility. Sit-to-stand and calf-raise demos animate with pause/reduced-motion support. Progress and completed quests offer a previewable 4:5 image through the native share sheet. SDK remains 54. TypeScript, programme variants and Android bundle verified; physical-device share export and stopwatch UI remain to be checked.

Arise concept follow-up: Evolve restored as current-rank programme browsing for Mind, Body and Financial Freedom; future ranks remain locked. Available cards expand to the actual seven-step programme and open only today's assigned quest. Financial Freedom uses supplied starter projects and three short actions, shown one at a time, with no required forms or end-of-quest questionnaire. Legacy unfinished financial drafts refresh without removing their saved answers or changing results. Completion uses the neutral difficulty value internally; no difficulty response is requested. Browser checked current-rank cards, locks, programme expansion and sequential instructions. Onboarding's final start action now works with one tap/keyboard activation.
Browser verification also confirmed saved-step resume after reload and direct completion awarding 40 XP without a questionnaire. These checks used a separate browser-local preview profile; phone progress was not changed.
