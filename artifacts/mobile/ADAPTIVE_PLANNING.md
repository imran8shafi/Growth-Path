# Adaptive daily practice

The planner runs locally with explicit rules. Onboarding still determines content,
movement limits, baseline difficulty, reading preferences, and freedom goals.
Recorded practice changes daily selection, ordering, and exercise scope.

## Rules

- Start with onboarding until three previous app days are recorded. A visit counts
  even when no exercise is completed. Unopened days are unknown, not missed goals.
- Analyze the last 14 previous recorded app days. Count each of the four paths at
  most once per day; extra exercises and cross-training cannot inflate coverage.
- Below 45% path coverage, use recovery mode and omit the optional anchor exercise.
  Individual paths below 45% get shorter timed tasks and smaller attempts.
- After at least five recorded days, paths practiced on at least 80% of days get
  deeper reflection/application prompts. Body work never increases automatically.
  Overall stretch mode begins at 78% coverage; other cases hold steady.
- Put the least-practiced path first and select cross-training for the
  least-practiced human skill. Ties rotate deterministically by local date.
- Prefer tasks outside the 24 most recently completed distinct exercises. Keep
  existing task IDs so completion storage remains compatible.
- Keep today's completions out of today's selection, so toggles and reloads do
  not replace exercises. Home, path screens, and Evolution share this selection.
  Editing onboarding intentionally rebuilds the plan using the new answers.

## Persistence and boundaries

Completion events include local date, timestamp, task ID, path, optional trait,
and awarded task XP. Retain events for 45 recorded app days. Older installations
keep their existing XP and totals; the app does not fabricate historical events.
The 50 XP four-path milestone is awarded at most once per date, including after
undo/redo. Undo removes the original recorded task XP; milestone XP remains.

The provider advances the day on foreground and checks every minute while active.
A tap racing midnight refreshes the day first; the refreshed exercise can then be
completed. Only prior observed days influence the new plan.

Practice frequency is not an assessment of ability. Physical difficulty stays
within onboarding limits. Fasting is excluded from adaptation. Book shelves still
follow onboarding preferences; this change does not infer reading progress.

## Verification

Run from `artifacts/mobile`:

```sh
pnpm test:adaptive
pnpm typecheck
pnpm exec expo export --platform web
```

The adaptive test loads the actual planner and provider with mocked React/native
dependencies. It covers baseline and recovery, per-path coverage, skill selection,
day stability, task consistency, movement limits, reward undo/redo, and rollover.
It does not replace device testing of storage, app lifecycle, or animations.
