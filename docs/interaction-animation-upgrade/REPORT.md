# First-Person Interaction Animation Upgrade

Date: 2026-09-30

## Scope completed

- Ordinary hotel drawers now move as complete assemblies: front, tray, sides, rear, handle, and attached contents travel together.
- Drawers toggle open and closed along their own local axis, including rotated furniture. Existing loot state remains authoritative, so reopening cannot reroll or duplicate rewards.
- The Floor 1 and Rooms 52–54 slow drawers use their existing hold progress. Their tray motion follows that progress, and interruption still applies the established Noise consequence.
- First-person hands now reach toward interaction contact points. Held items lower for drawer, closet, pickup, door, latch, button, and lever actions, then return to the selected-item pose.
- Closets use one hinged door; wardrobes use two hinged leaves. Both have visible interiors, inside panels, handles, shelves, and viewing slats.
- Hiding now has staged reach, door opening, body movement, closing, and concealment. The player becomes hidden only near the end of entry, and becomes exposed shortly after opening the door to leave.
- Entry requires close range and a clear approach. A blocked exit keeps the player safely in a recoverable hiding state.
- Hidden view motion is limited to the closet opening. Crouch input and selected inventory are preserved when control returns.
- Generated Floor 5 closet placement now checks for a usable entrance so a turning-corridor wall cannot occupy its exit position.
- Room changes clear transient hand and world interaction animations.
- Story furniture with visible lids/doors now uses the same hinge system: the Baggage Room jewelry box, Room 304 suitcase, Room 13 suitcase, Room 16 wardrobe task, and Floor 1 medicine cabinet.
- Existing encounter rules remain in charge: The Purge and The Noise still read `hotelHideState`; Molly and other Noise-disabled encounters were not changed.

## Related interactions

Pickups, ordinary doors, gates, elevators, shutters, cupboards, cabinets, chests, suitcases, levers, switches, and buttons use the shared contact-point hand pose and existing one-shot gameplay handlers. The main existing suitcase/cabinet/wardrobe story interactions listed above also have articulated lids or leaves. This pass does not convert decorative props into interactables or alter lock, key, remote-door, objective, or reward rules.

## Timing and state rules

- Ordinary drawer slide: 0.46 seconds.
- Closet entry: 1.08 seconds; concealment commits at 80%.
- Closet exit: 1.02 seconds; exposure begins at 25%.
- Reduced-motion mode keeps the same gameplay timing while CSS camera-scale motion is suppressed by the existing accessibility rule.
- Saving remains container-authoritative. Mid-animation room changes settle the interaction instead of saving a partial transform.

## Verification performed

Passed:

- `node --check` for all changed game scripts and new tests.
- `node tests/interaction-animation-plan-smoke.mjs`
- `node tests/interaction-furniture-contract-smoke.mjs`
- `HOTEL_CDP_ENDPOINT='http://[::1]:9251' node tests/interaction-furniture-browser-smoke.mjs`

The focused browser test used the real game, bundled Three.js, synthetic E/C keyboard events, and deterministic simulation stepping. It verified:

- ordinary drawer open/close and one-time loot;
- looted state after a room rebuild;
- attached drawer parts;
- rotated local-axis travel;
- slow-drawer interruption, Noise increase, completion, and visual progress;
- single-door closet and double-door wardrobe cycles;
- hinged suitcase and story-wardrobe open/close motion;
- no early concealment;
- blocked-exit recovery;
- E-spam protection;
- held crouch and selected-item restoration;
- cleanup during a room change.

The normal localhost page was blocked by the managed browser environment, so the test used Chrome's local-file mode with `--allow-file-access-from-files`. WebGL/Three.js initialized there. The animation was not video-recorded, and this was not a full campaign playthrough.

## Manual playtest route

1. Start the game normally and press F2.
2. Choose **Floor 5 · Room 501**. Search either desk drawer, close it with E, reopen it, and confirm no second reward. Use the generated closet to test entry, limited looking, and exit while holding C.
3. In later hotel-run rooms, compare the two-door wardrobe with the single-door closet.
4. Press F2 and choose **Floor 1 · Room 10 Sound Sector**. Hold E on the silent desk, release early once, then complete the hold and confirm the visible tray matches progress.
5. For the Rooms 52–54 version, reach Room 52 normally from Room 51 and repeat the hold/release check while watching the Noise meter.

## Known limitations

- No short video was captured in this environment.
- Broad campaign traversal, every legacy furniture story event, and save restoration after a real browser restart were not exhaustively replayed. Existing handlers were preserved and the focused state tests passed.
- The visual hand rig remains procedural rather than a skinned character-hand asset.
