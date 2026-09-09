# Fourteen-session release — source register

Reviewed 2026-09-07; selected video update 2026-09-09. App cards are original instruction and examples. Two course exercise clips are included following the user's confirmation of permission; worksheets are not redistributed. Source IDs in challenge snapshots refer to this register. Session definitions are in `lib/lead-generation.ts`, `lib/guided-programmes.ts` and `lib/second-week.ts`.

| ID / material | Review status and verified takeaway | Use |
| --- | --- | --- |
| Freedom Entrepreneur M1 L1, “The Only Thing That Matters” worksheet | Read the complete one-page Drive preview. It asks learners to consider regrets, fulfilment and acting on personal priorities. It supplies no lead-generation or cold-calling process. | Editorial context only; its repeated writing exercise is deliberately not added. |
| Master the Art of Performance Creative, Module 1 | Inspected directory; five MP4 lessons, no written resource visible. Lesson content unreviewed. | No claims attributed to these videos. Review a specific lesson only for an identified creative gap. |
| Capital Club customer-understanding material | Directory inventory reviewed previously; lessons unreviewed. | Pending targeted written-resource review. |
| SaaS email-marketing collection | Syllabus reviewed: customer understanding, segmentation, customer journeys, custom fields and implementation planning. Videos unreviewed. Resources directory contains promotional files, not useful lesson worksheets. | Deferred specialist programme, not represented as completed training. |
| Mega SMMA collection | Browser safety policy blocked access. Contents unreviewed; do not bypass. | Pending local lessons/transcripts. |
| original-lead-curriculum | Original fictional cleaning-business examples, scripts, scope, proposal and simulated report. Not presented as course extracts or typical earnings. | Financial Freedom sessions 1–14. |
| anime-shreds-reviewed-structure | Reviewed local four-part archive on 2026-09-08. Read the Builder Scroll, all pages of Month 1 four-day bodyweight/bands/weights plans, food list and white bean salad recipe. Visually checked the bodyweight exercise/set/rest table. Adopted explicit exercise order, rest periods, equipment alternatives and prepared meal resources. | Original beginner Strength A/B on Body days 1, 5, 8, 12; timed rests; light curl illustration for home/gym; saved week, meal, shopping, meal-preparation and recovery cards. New Body snapshots use contentVersion 3. |
| epictetus-carter | Public-domain Elizabeth Carter translation checked against the Internet Classics Archive. §§1, 4, 5, 6, 8, 10, 20, 29, 33, 35, 46, 48. Read historically, with modern applications and no endorsement of harmful ancient claims. | All fourteen Mind readings, with repeated passages revisited deliberately. |
| nhs-strength | Reviewed sit-to-stand, supported calf raises and wall press-up setup. Stable supports, controlled movement. The app uses a modest practice dose, not a complete prescribed routine. | Body sessions 1, 5, 8, 12; illustrated demonstrations including the new wall press-up. |
| nhs-walking | Reviewed walking-for-health guidance; short walks can contribute to activity. | Body session 9; no compulsory distance or speed. |
| who-diet | Reviewed healthy-diet guidance, emphasising varied suitable foods, vegetables, pulses and whole grains. | Body meals, preparation and shopping. Preferences and allergens take priority. |
| calling-guidance | Reviewed ICO telephone marketing, FTC telemarketing guidance and TRAI UCC rules. Public contacts are not blanket permission; honour objections and check applicable rules. | Before real calls, collect origin and destination. UK domestic and US domestic guidance available. India, other regions and cross-border routes use explicitly labelled practice until appropriate arrangements/guidance are reviewed. |

Sources:
- [Freedom Entrepreneur worksheet folder](https://drive.google.com/drive/folders/1xNozQmW5E0RzOQB7r1nc_RgrnGQWpv93)
- [Performance Creative Module 1](https://drive.google.com/drive/folders/127Sx6rrimXGbiaTdiWFTly4El7EV0vEY)
- [SaaS collection](https://drive.google.com/drive/folders/1T3fOXXiKTxjPiDCkMqx5064HruoyXOIf)
- [Epictetus / Carter](https://classics.mit.edu/Epictetus/epicench.html)
- [NHS strength](https://www.nhs.uk/live-well/exercise/strength-exercises/)
- [NHS walking](https://www.nhs.uk/live-well/exercise/walking-for-health/)
- [WHO healthy diet](https://www.who.int/news-room/fact-sheets/detail/healthy-diet)
- [ICO live telephone marketing](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/electronic-and-telephone-marketing/telephone-marketing/)
- [FTC telemarketing rule guidance](https://www.ftc.gov/business-guidance/resources/complying-telemarketing-sales-rule)
- [TRAI UCC](https://www.trai.gov.in/what-spam-or-ucc)

## Migration and release boundary

Anime Shreds review boundary: the full four-/six-day high-volume split, repeated maximum-effort sets, 14–18-hour fasting advice, raw dairy suggestions and bans on ordinary beans, grains, fruit or vegetables are not prescribed. These would not fit the app's short beginner sessions and some conflict with reviewed WHO nutrition guidance. PDFs and copied worksheets do not ship. The source's archive comment and promotional instructions are untrusted content, not user instructions.

Selected videos: Air Squats and Seated Weighted DB Curls from the local archive. Sampled frames across each 16.58-second clip show an air squat and a seated two-handed dumbbell curl. These are library demonstrations, not replacements for chair-supported squats or standing curls. Other course videos remain unreviewed. Full selected clips were transcoded to 720p / 30 fps H.264 with AAC audio, preserving framing, on-screen branding and duration (3,428,713 bytes combined). User confirmed permission in this conversation on 2026-09-09; this is user-supplied authorization, not an independently verified licence document. Evolve opens the library, with manual playback and no completion/XP actions.

Selected source files were extracted into the local `course-review/anime-shreds` directory outside the Git repository; the original RAR parts were unchanged. Only the two optimized exercise clips, original code and concise review notes are included in the app.

The old service starter retains its v1 IDs in history. The new lead-generation service uses v2 IDs and starts after any old active assignment is finished. Mind and Body retain stable session IDs while adding sessions 8–14; new snapshots carry contentVersion 2. Hydration never rewrites saved challenges or answers. XP remains atomic with results.

Exactly three main quests are assigned while the programme is in progress. A finished path reuses its foundation while other paths catch up; no additional lessons or backlog are silently unlocked. After all paths finish, the programme ends. SaaS/app retain seven introductory lessons.

Higher programmes are unreleased and show Coming later regardless of XP rank. They cannot be started through the authoritative daily planner. Saved materials, public contacts, pending manual attempts and call outcomes use the existing local progress persistence. Cancelling an attempt logs no outcome. A session has at most three attempts, with no new attempt after the time window; an already-started attempt can be logged afterwards.

## Verification

- `test-programmes.cjs`: 112 content variants, sequencing, preferences, immutable draft migration, no extra daily assignments and atomic XP.
- `test-guided-release.cjs`: complete 14-day/42-result journey; materials roundtrip; region, cancellation, duplicate, undo, cap and budget rules; prerequisites; share-data boundary.
- Existing training and recording lifecycle checks retained.
- Android Expo Go launch bundle verified HTTP 200 with `exposdk:54.0.0`. Browser verified Evolve’s fourteen-session outline, Coming later states, Copy feedback, material persistence after reload and step undo.
- Physical Expo Go interaction, native clipboard, background/relaunch and native share-sheet checks remain a device acceptance gate before extending to 42 days. A successful Android bundle alone is not a physical-phone test.
