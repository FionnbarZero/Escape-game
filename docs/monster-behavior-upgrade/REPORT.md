# Hotel Nocturne monster behavior and animation upgrade

Date: 2026-09-29
Base revision: `e401d10` plus the preserved working tree
Engine: existing browser Three.js runtime and ordered classic gameplay scripts

## Result

This pass keeps one authoritative simulation loop and gives the implemented campaign monsters more readable, encounter-specific actions. It does not add a generic roster-wide chase controller, a second renderer, new boss phases, or replacement encounters.

### Molly reference milestone

- Patrol, alert, fixed-location investigation, local search, computer selection, approach, hand-driven wire flare, terminal operation, and finish now expose explicit action intent.
- A real sound can interrupt selection, travel, or hacking. Molly records the unfinished computer, returns to `00`, investigates only the reported location, then restores the correct number and physically travels back before a hack can complete.
- The existing hand-up, gather, flick, release, and delayed cable-settle animation remains tied to the terminal action. A render alone cannot complete a hack.
- Existing body capture, wall/floor rejection, retry grace, intercom crouching, controller-body separation, stable codes, tools, levers, doors, and protected exit remain intact.
- Deliberate modal policy retained: while `#puzzle` is open, Molly and other encounter updates pause. A wrong-code alarm records its terminal location immediately, but Molly cannot advance until the dialog closes.

### Chef and Pursuer milestone

- The Chef now has an articulated throwing hand and a visible prepare/aim/release/follow-through/recovery sequence.
- A knife is created at the hand's world position on release, commits to its release target, uses swept collision against the player's body and solid cover, and can apply at most one hit.
- Single and triple patterns have distinct action labels and poses. Obsolete knives are cleared on valve transitions, phase rebuilds, failure, completion, and exit.
- The Pursuer reveal now progresses from announced stillness through turn and shoulder drop into acceleration.
- Its uneven gait is driven by actual distance moved, so blocked/delayed movement stops the running cycle. Authored switches create a visible brace/delay reaction.
- Capture uses body-height overlap and a solid-obstacle line check. The chase still uses the authored routes, top speeds, barriers, local retry, safe exits, and six separate scenes; it does not teleport forward to erase a lead.

### Other implemented monsters

- Collector: dropped encounter possessions now use `fetch -> pickup -> return -> place`, with a reach pose and visible carried object. Detached pickup triggers are removed so recovered objects cannot be interacted with twice. Completed exit slots are untouched.
- Clockmaker: clock ticks drive a short mechanical step/impact cue and developer-visible action stage without smoothing away phase-three segmented movement or changing attack windows.
- Drowned Guest: water motion turns toward its real target, the wake shows travel direction, and land pursuit visibly braces before its existing burst. Pump, platform, sluice, barrier, and bulkhead rules are unchanged.
- Ballroom Guests: a 0.32-second visible reach precedes capture. Guests already tagged by the player are excluded from pursuit and capture.
- Watcher: the authoritative transform and action pose remain still during valid main-camera observation.
- Gardener: footsteps create discrete remembered locations on a cooldown. It travels to and searches that point instead of receiving continuous hidden-player updates. Moss still affects footsteps only.
- Window Creature and False Guests already used occupied-window state and a fixed answer per attempt; their rules were preserved rather than rewritten.
- The Noise, Purge, Ransack, Cabin monsters, random-room variants, and area exclusion rules were preserved.

The requested Fake Manager deduction boss is not present as a dedicated encounter. The inspected build has a Manager's Office puzzle and an admin-only Hotel Manager spawn. They remain separate; this pass does not invent a boss by combining them.

## Developer overlay

Press `F4` to toggle the off-by-default AI trace. It reports the primary active monster, state, target reason, action stage, last detection position, body dimensions, and route/target. Reusable wire geometry shows the active body and route without constructing meshes every frame. The overlay is updated from the existing render loop and never advances AI or damage.

## Files touched for this pass

- `game/18-molly.js`
- `game/16-floor-one.js`
- `game/15-pursuer.js`
- `game/12-collector.js`
- `game/13-clockmaker.js`
- `game/14-drowned-guest.js`
- `game/17-floor-two.js`
- `game/05-admin.js`
- `game/06-hotel-world.js`
- `game/01-state.js`
- `game/18-monster-behavior.js` (new shared collision/turn/debug helpers)
- `game/25-runtime.js`, `game/manifest.js`
- `index.html`, `escape-ui.css`
- `tests/monster-animation-upgrade-smoke.mjs` (new)
- `tests/monster-animation-browser-smoke.mjs` (new)
- `tests/chef-boss-smoke.mjs`
- `docs/monster-behavior-upgrade/IMPLEMENTATION-PLAN.md`
- `docs/monster-behavior-upgrade/REPORT.md`

These files already contained unrelated uncommitted graphics, presentation, campaign, and test work. That work was preserved.

## Validation actually run

### Browser runtime diagnostics

Passed against the local exported game in headless Chrome at the Low preset:

- `molly-browser-smoke.mjs`: hand-driven flare, sound routing, one active hack, code/wrong-code recovery, intentional modal pause, camera doors, intercoms, standing/crouching/jumping body capture, wall/floor rejection, controller body position, held/released crouch state, hammer, drone, retry persistence, all three levers, and protected final exit.
- `monster-animation-browser-smoke.mjs`: interrupted Molly task resumes without remote hacking; F4 overlay reports Molly; Chef release origin equals the visible hand (`0` measured separation), projectile target remains committed, cover stops it, one projectile produces one hit; Pursuer accelerates and advances its gait by measured travel, then moves `0` while braced at a gate; Watcher stays frozen; a tagged Ballroom Guest produces zero captures.
- `chef-boss-smoke.mjs`: opening plus freezer, final-service, and elevator-finale setup; all 25 admin entries retain distinct behaviors; only Purge, Cable Mass, and Reflection retain intentional wall phasing; Noise HUD remains disabled.
- `pursuer-smoke.mjs`: all six authored scenes, six debug entrances, protected Safe Vault, and Noise exclusion.
- `collector-boss-smoke.mjs`: phases 1, 3, 4, 6, 7, and 8 initialize with the Collector boss and Noise exclusion.
- `clockmaker-boss-smoke.mjs`: all seven phases and tick HUD initialize with Noise exclusion.
- `drowned-guest-smoke.mjs`: all six phases initialize with Noise exclusion.

The focused browser test is explicitly a direct-state diagnostic, not a normal campaign playthrough. The boss suites use admin entrances. The Molly suite exercises runtime interaction functions and timed retry/exit behavior but is not an uninterrupted campaign run.

### Static and deterministic regression checks

Passed:

- Syntax checks for every `game/*.js` and `tests/*.mjs` file.
- `git diff --check`.
- All non-CDP smoke tests except the unrelated Floor 2 README wording check.
- `floor2-generator-multiseed-smoke.mjs`: 5,000 seeds satisfy required variants and spacing.
- `monster-animation-upgrade-smoke.mjs`, `monster-behavior-contract-smoke.mjs`, `monster-jumpscare-smoke.mjs`, `molly-plan-smoke.mjs`, `pursuer-scenes-plan-smoke.mjs`, Ransack/random-room/seamless-transition/presentation/interaction/journal plan checks.

Known unrelated failure:

- `floor2-exterior-rooms-plan-smoke.mjs` expects the exact README phrases `Ten custom outdoor room types` and `seven-room rooftop maintenance run`; the current README does not contain them. This pass did not rewrite unrelated documentation to hide that baseline mismatch.

Test-environment notes:

- The first medium-quality full Molly attempt exceeded its 30-second initialization allowance in the software-rendered headless tab. A fresh Low-preset tab completed the full suite.
- Headless admin sweeps produce browser `requestPointerLock` denials because automation lacks a user gesture. The Chef test now filters only that known automation exception; gameplay exceptions still fail the suite.
- A pre-existing random-scare initialization race referenced late-bound `dlg` before `game/25-runtime.js` loaded. The scare now queries the existing `#puzzle` element directly. Timing and scare behavior were not changed.

## Balance and behavior changes

- Ballroom Guest capture now has a 0.32-second visible reach windup.
- Pursuer acceleration blends to the existing configured speed over 0.95 seconds after the authored head start/delay.
- Collector pickup and placement use 0.62-second and 0.58-second readable actions.
- Molly resumes a valid interrupted computer task after a failed investigation instead of discarding it and selecting an unrelated task.

No Chef projectile speeds, Pursuer configured top speeds, Molly perception distances, Clockmaker attack windows, Drowned burst speeds, objective counts, rewards, or permanent progress rules were intentionally changed.

## Not verified

- No uninterrupted normal campaign playthrough was completed.
- No video recording was available, so the hand-driven flare and moving projectile are supported by sampled transform/collision diagnostics rather than a review clip.
- Visual quality, foot contact, and animation appeal still require a human playtest on the target Mac with hardware WebGL.
- Timing was implemented with `dt` and tested in the Low-preset simulation, but comparable 30/60/120 FPS hardware runs were not recorded. The software-rendered headless tab is not a performance benchmark.
- The Fake Manager encounter is missing, as described above.

## Local preview

From the repository root:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765/`. `F2` opens developer destinations; `F4` toggles the AI trace.

Suggested review route:

1. Use `F2 -> Molly · Electrical Section`. Wait for a number, make a code-machine or window sound during her terminal trip, and watch her investigate that location before restoring the same numbered task. Observe the flare at the terminal. Test camera/drone crouch return and finish three levers.
2. Use `F2 -> Floor 1 · Room 50 Chef Opening`. Watch the throwing hand, move after release, and put a solid prep station between the knife and the player. Continue through a triple volley and a phase transition to confirm old knives disappear.
3. Use each `F2 -> Pursuer` scene. Watch reveal, acceleration, cornering, a red-switch barrier reaction, and the protected end boundary.
4. Use Collector entry, Clockmaker Four Clocks, Drowned chase, Floor 2 Watcher, Ballroom, and Garden destinations. Toggle `F4` to compare state, target reason, detection location, and action stage with what the model is showing.
