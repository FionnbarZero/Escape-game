# Molly's Electrical Section

This document is the implementation specification for Molly's encounter in Hotel Nocturne. It records the intended rules, the current playable implementation, and the assumptions that should remain easy to tune.

## Encounter objective

The player explores a connected electrical-maintenance wing and permanently engages three main levers to power the protected final exit. Computers, codes, intercoms, cameras, the hammer, and the drone create route choices; unlocking computers is not the main objective and Molly is not fought with weapons.

The first reception room contains the loud `DOOR OVERRIDE CODES` machine and two exits. Corridors form west, east, and central loops with recognizable landmarks, numbered terminals, observation windows, antenna intercoms, and a final switch room. A Molly hack must never remove access to both the code machine and the matching terminal or its valid alternate route.

## Molly

- Molly is blind and reacts to the location of a sound or intercom report, not to the player's continuously updated position.
- Her screen normally shows `00`. Before selecting a terminal it changes to that terminal's two-digit number, and the number stays stable while she physically walks there.
- A linked shutter closes only after Molly reaches the matching computer, lifts her wire hair with her hand, completes the flare, and performs the terminal interaction.
- Her signature animation follows the stages `hand-up`, `grip-wires`, `flick`, `follow-through`, and `settle`. The right hand initiates the movement; the wires follow the grip and flick rather than rising independently.
- Ordinary sounds, the code-machine clatter, broken glass, the drone beep, and intercom transmissions each report their own world location. A later quiet player movement does not rewrite that location.
- `The Noise` is disabled as a system during this encounter: its active encounter and arc are cancelled, its HUD is hidden, and Molly owns the encounter HUD. Other hotel areas re-establish their own Noise state when they are built.

## Hack and code loop

The prototype permits one active Molly-hacked shutter at a time. Once a hack is active, Molly patrols and investigates but does not select another linked computer until the current lock has been overridden.

The reception machine prints only the code for the currently active hack. The code is stored in the compact `OVERRIDE NOTE` panel and remains stable for the attempt. A computer number and its four-digit code are distinct values. Entering a wrong code produces a local terminal alarm but does not remove the recorded code or destroy progress.

After the right code is entered at the matching physical terminal, that computer remains overridden for the rest of the attempt. This permanent prototype rule exceeds the minimum override grace window and guarantees time to use the restored camera/door control.

## Detection rules

- An active antenna intercom reports a player inside its marked zone whenever the player is upright, including while standing still.
- Crouching prevents intercom detection. It does not silence the code machine, breaking glass, a terminal alarm, or a drone beep.
- Security-camera and drone views do not pause the world, remove the player's body, disable its collision, grant invulnerability, or give Molly visual tracking.
- Lowering a controller returns the camera to the stored player position and orientation. A retry clears controller state and restores normal input.

## Tools

### Maintenance hammer

Breaks only designated yellow-black observation windows. The opening and collision change persist for the attempt, and the crash gives Molly that window's location. Reinforced windows and the final exit cannot be broken.

### Camera / door controller

Shows six fixed, labeled live feeds. It remotely opens compatible ordinary doors. A Molly-hacked shutter reports `OVERRIDE REQUIRED`; after the physical terminal/code override, remote opening becomes available again. It never operates the three main levers or skips the final exit requirement.

### Drone controller

Moves a physical inspection drone through the section for scouting. It can press the explicitly marked central service control and emit a cooldown-limited distraction beep from its actual location. It cannot use the main levers, obtain codes, cross solid geometry, or unlock the final exit. Recall returns it to its recovery dock.

## Permanent progress and retry rules

- Each main lever engages once and stays engaged for the attempt.
- When all required levers are engaged, the final exit becomes permanently available and Molly cannot hack it closed.
- A local capture returns the player to reception, preserves collected codes, completed overrides, tool pickups, broken shortcuts, and lever progress, clears transient AI/controller state, and supplies a short catch grace period.
- Completing the protected exit clears the encounter checkpoint without erasing unrelated hotel progression.

## Configurable prototype values

The central `MOLLY_SETTINGS` object in `game/18-molly.js` owns the initial balance values:

- `maxActiveHacks: 1`
- `requiredLevers: 3`
- `overrideRehackable: false`
- `overrideGraceSeconds: 10` (reserved if re-hacking is enabled later; overrides are currently permanent)
- `droneBeepCooldown: 6`
- `droneSpeed: 5.2`
- `droneVerticalSpeed: 3.4`
- `droneServiceRange: 3`

Do not scatter replacements for these numbers through new code.

## Delivery status

Milestone 1's full loop is present inside the expanded section: Molly selects and physically hacks a linked terminal, the noisy reception machine records that terminal's code, the player overrides the lock, a permanent lever powers the objective, and the final exit completes the encounter. The implementation expands this to three linked shutters and three levers without allowing concurrent hacks.

Milestone 2 is also implemented: hammer shortcut, live camera controller with remote door opening, and controllable drone. Milestone 3's connected multi-room section is playable. Milestone 4 remains ongoing visual, audio, balance, accessibility, and device-performance polish; the animation rig is implemented but should still receive human playtest review in motion.

## Manual acceptance route

1. Enter through the Molly admin teleport or campaign route. Confirm the Noise HUD is absent and Molly shows `00`.
2. Wait for `02`, `04`, or `06`; follow at a distance and verify Molly walks to the matching terminal before its shutter closes.
3. Return to reception, use the code machine, and leave through the other doorway. Confirm Molly investigates reception while the matching code stays in the override note.
4. Enter a wrong code once, confirm the code remains recorded, then enter the correct code and remotely open the restored shutter with the camera controller.
5. Stand in an active antenna zone to trigger it, then repeat while crouched to verify the safe rule.
6. Engage all three levers, confirm repeated interaction does not duplicate progress, and walk through the protected final exit.
7. On a separate attempt, allow Molly to catch the player after collecting a code and engaging a lever. Confirm reception restart, working input/HUD, retained local progress, and no Noise spawn.
