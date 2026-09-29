# Hotel Nocturne monster behavior upgrade

## Scope and implementation order

This pass keeps the current shared Three.js runtime and the existing encounter update functions. It does not add a second simulation loop. The implementation order is:

1. Molly as the reference state/action loop.
2. The Chef and the six authored Pursuer chases.
3. Focused refinements for the other campaign monsters that already exist.
4. A developer-only AI overlay and regression coverage.

The game follows the existing blocking-dialog policy: `#puzzle.open` pauses encounter updates, including Molly's code-entry screen. A wrong-code alarm is recorded while the panel is open, but Molly cannot advance toward it until the panel closes. This pass documents that behavior and does not silently change the pause policy used by other puzzles.

## Implemented roster audit

| Monster | Real implementation | Current actions / rules | Pass status |
| --- | --- | --- | --- |
| Molly | Full Electrical Section reached from Room 140 | Patrol, listen, investigate recorded sounds, select/approach/hack numbered terminals, hand-driven wire flare, body capture, controllers, intercoms, tools, levers, final exit | Completed and browser-validated |
| The Chef | Full Floor 1 kitchen sequence | Telegraph and throw knives, pursue/distraction, valves, steam, freezer breakers, cart route, elevator finale | Completed; projectile diagnostics passed |
| The Pursuer | Six separate authored chase scenes, also triggered from compatible generated rooms | Reveal, head start, continuous run, jump/crouch hazards, optional instant switches, escape control, protected aftermath | Completed; six-scene suite passed |
| The Collector | Full Lost Property boss route from Room 140 | Guard selected possessions, recover dropped encounter objects, bell/decoy distractions, collection-room choice, escape | Completed; phase suite passed |
| The Clockmaker | Full seven-part Clock Tower boss route from Room 140 | Clock-synchronized hazards, discrete tick movement, watched slowdown, brakes, master clock, timed escape | Completed; phase suite passed |
| The Drowned Guest | Full six-part Flooded Atrium boss route from Room 140 | Water wake, platform safety, pumps, drainage distraction, sluices, signaled land bursts, bulkhead | Completed; phase suite passed |
| Ballroom Guests | Campaign encounter on Floor 2 | Distinct pursuit/evasion paths, player tag interaction, permanent freeze, local glass alert | Completed; tagged exclusion diagnosed |
| The Watcher | Campaign encounter on Floor 2 | Valid main-camera observation freezes movement; statue objective | Completed; freeze diagnosed |
| The Gardener | Campaign encounter on Floor 2 | Patrol, hears local footsteps, moss muffles footsteps, gate pieces | Completed; fixed sound memory covered |
| Window Creature | Campaign encounter on Floor 2 | Occupies one visible window, warning light, pattern switches | Inspected; existing synchronized rule preserved |
| False Guests | Campaign encounter on Floor 2 | Fixed answer per attempt, clue checks, wrong-choice reveal/chase and local reset | Inspected; existing fixed-answer rule preserved |
| The Noise | Full Noise sections plus Floor 1 sound sectors | Sound-location hunting and encounter-specific noise rules | Preserve; excluded from Molly, Chef, Pursuer, and Floor 2 |
| The Purge | Full eviction encounter; compatible random-room rush | Authored hiding/sweep rules, plus warned linear rush variant | Preserve |
| Ransack | Recurring hotel rule event | STOP deadline, pass/fail/collection consequence | Preserve |
| Cable Mass / Staircase Monster | Campaign hazards in elevation/stair routes; also spawn variants | Climbing/charge or zig-zag traversal rules | Preserve |
| Giant Spider / Root Stalker | Full Cabin encounters | Reflected-ball fight; watched root chase | Preserve |
| Water Creature | Smaller Floor 2/courtyard-style spawn behavior | Water slither only; no Drowned Guest land behavior | Preserve distinction |
| Bash | Spawn/random-room variant | Warned, committed lane charge | Spawn variant, not a full boss |
| Luggage Warden, Empty Porter, Black Bellhop, Reflection, Hotel Manager, Night Auditor | Admin spawn catalog only | Distinct sandbox behaviors | Admin-only; not evidence of campaign bosses |

The requested **Fake Manager** deduction boss is not implemented as a dedicated campaign encounter in the inspected build. There is a Manager's Office puzzle and an admin-only Hotel Manager spawn, but combining those would invent a boss, so this pass leaves them separate and reports the missing encounter.

## Action and interruption contracts

- Gameplay events remain simulation-authoritative. Rendering a security feed or drone view does not run an extra enemy update.
- Molly stores a computer task interrupted by a real sound. She aborts the terminal animation without applying the hack, investigates the recorded location, then re-selects and physically returns to the same computer. Her face is `00` during sound investigation and returns to the preserved computer number before travel resumes.
- Chef knives snapshot their target at aim time, spawn from the visible throwing hand on release, use swept player/cover collision, and are removed or made inert after one impact.
- Pursuer barriers affect only their authored gate and delay state. The chase does not teleport the monster forward to erase an earned lead.
- The Watcher's gameplay transform and animation pose both remain frozen during valid observation.
- Tagged Ballroom Guests are removed from both capture behavior and tag interaction immediately.

## Baseline on 2026-09-29

Passed source/logic checks:

- `monster-behavior-contract-smoke.mjs`
- `monster-jumpscare-smoke.mjs`
- `molly-plan-smoke.mjs`
- `pursuer-scenes-plan-smoke.mjs`
- `floor2-generator-multiseed-smoke.mjs` (5,000 seeds)

The Collector, Clockmaker, Drowned Guest, Pursuer runtime, Chef runtime, and Noise progression scripts could not connect to their configured local CDP ports (`EPERM`/no debugging endpoint). They are recorded as blocked baseline runtime checks, not failures of the encounters.
