# Monster Abilities Overhaul — Chef Milestone

Status: implemented for review on 2026-09-29.

This milestone replaces the Chef's former valve/freezer/breaker/cart task chain with one three-phase arena fight and a short service-elevator ending. It does not implement new abilities for the rest of the monster roster.

## Implemented loop

1. The Chef marks a landing area. The marker follows briefly, then changes color and locks before the leap.
2. The player leaves the landing area.
3. The landing emits one visible floor ring in Phase One, two spaced rings in Phase Two, and the authored leap/wave/pan sequence in Phase Three.
4. If the Chef lands in a marked cooling zone, the matching red valve becomes a counter opportunity during recovery.
5. A valid valve activation removes 34 health exactly once. Three successful counters reduce 100 → 66 → 32 → 0.
6. At zero health the elevator releases. Entering it starts a 3.4-second door closure and ends with `THE CHEF · SURVIVED`.

The old freezer, breaker, and serving-cart constructors remain in source for compatibility with existing work, but normal Chef progression and the updated admin destinations no longer route through them.

## Abilities and counterplay

- Aimed knife: 0.82-second preparation; target position is committed before release; solid colliders stop the physical projectile.
- Fan throw: 1.02-second distinct preparation; five visible hand-held blades become five committed projectile lanes with real gaps.
- Jumping slam: 0.52-second tracking marker, 0.72-second locked warning, and 0.68-second leap. Leaving the 2.05-unit landing area avoids impact.
- Shockwave: visible ring expands at 7.2 units/second. A grounded player is vulnerable; raising the player's feet through the normal jump avoids it. Phase Two's second ring is delayed by 1.18 seconds.
- High pan sweep: 0.76-second windup, 0.30-second active interval, and 0.62-second follow-through. Crouching or leaving its 3.45-unit reach is safe.
- Cooling counter: three marked zones map one-to-one to their nearby valves. Stations recharge in 6.5 seconds, failed attempts do not consume them, and a recovery action can be counted only once.
- Phase Two vents: three visible strips cycle warning → active → inactive. They exist only in Phase Two and do not cover all cooling zones.

All tuning values are centralized in `FLOOR_ONE_CHEF_CONFIG` in `game/18-chef-abilities.js`.

## State, cleanup, and compatibility

- Floor One saves are version 3. Version 2 saves already inside the old Chef chain enter the new fight at Phase One instead of loading into removed normal progression.
- Transient attacks restart in a safe idle state when the arena is rebuilt. Boss health and phase remain coherent across a normal save/load.
- A Chef death clears knives, rings, landing markers, combo state, and pan state, then restarts only the boss attempt at 100 health. Earlier Floor One progress is preserved.
- Phase changes clear obsolete attacks before the next phase begins.
- Leaving for the elevator clears every arena attack. The elevator sequence contains no surprise final knife.
- The Noise meter, accumulation, hunts, and entity updates are disabled for all of Floor One phase 10, including the approach before the reveal.
- Existing pot lids remain optional local distractions. Existing cover remains useful against knives. Neither replaces the cooling counter.

## Validation performed

Passed:

- `node tests/chef-abilities-contract-smoke.mjs`
- `HOTEL_CDP_ENDPOINT=http://127.0.0.1:9244 node tests/chef-abilities-browser-smoke.mjs`
- JavaScript syntax checks for every `game/*.js`, `tests/*.mjs`, and `three-game.js`
- `node tests/monster-animation-upgrade-smoke.mjs`
- `node tests/monster-behavior-contract-smoke.mjs`
- `git diff --check`

The focused browser suite is a debug-assisted runtime diagnostic, not a normal-input end-to-end victory. It verified:

- tracking and locked landing coordinates;
- avoiding landing damage outside the circle;
- grounded ring damage and airborne avoidance;
- standing pan damage and crouched avoidance;
- five distinct committed fan paths;
- exact one-use counter damage and both phase thresholds;
- attack cleanup on the elevator transition;
- local boss-attempt reset.

The existing cross-monster browser suite was attempted after its readiness check was updated for ordered script loading, but repeated headless page reloads became too slow to finish reliably in the available session. Its source-contract counterpart passed. Knife cover and one-hit projectile behavior remain covered by the unchanged projectile implementation and the focused prior browser diagnostic, but this is not presented as a new uninterrupted full-fight result.

An additional `tests/chef-input-sequence-browser-smoke.mjs` harness was added to route Space, C, and E through Chrome's actual keyboard-event path while using debug-assisted arena setup. A clean isolated launch fetched the HTML, bundled Three.js, and every ordered game script successfully. The available headless WebGL process then repeatedly stalled on runtime evaluation with GPU `ReadPixels` stall warnings, so this optional input run was stopped and is **not** recorded as passed. It remains available for rerunning against a responsive local Chrome debugging target. No ordinary-input end-to-end fight or gameplay video was completed in this environment.

## Manual playtest route

1. Start the game with `./run-game.command`, or serve the project and open the printed local URL.
2. Press F2 and choose `Chef Arena · Phase One` for optional debug access. Normal play reaches the encounter through Floor One.
3. Walk from the dining tables into the kitchen to trigger the fight.
4. For an aimed knife, move after the arm raise or use a table/pillar as cover.
5. For a fan, cross through a lane gap or use solid cover.
6. For a slam, leave the circle after it turns gold, then press Space as the ring reaches the player.
7. Bait the landing into a cyan cooling zone. During the recovery prompt, press E at that zone's matching valve.
8. In Phase Two, verify the second ring allows a normal landing and second jump.
9. In Phase Three, avoid both marked landings, jump the ring, then hold C or retreat for the high pan sweep.
10. After the third valid cooling counter, run to the released elevator and wait for the doors to close.

No new third-party assets or dependencies were added.
