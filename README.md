# The Cabin That Watches — Browser 3D

A first-person supernatural-horror game that runs directly in a browser using JavaScript and Three.js. Godot is not required. After becoming lost in the woods, you discover a strange cabin, are knocked unconscious, and wake trapped inside.

## Play in a browser

```sh
cd /Users/meghanoreillygreen/code/Escape-game
python3 -m http.server 8000
```

Then open `http://localhost:8000`. An internet connection is needed to load the Three.js library.

## Controls

- Select rooms from the navigation bar.
- Move with **WASD** or the arrow keys and look with the mouse.
- Hold **Shift** to sprint, press **Space** to jump, and hold **C** or **Ctrl** to crouch in every room.
- While moving, hold **Shift** and press **C** or **Ctrl** to perform a short slide.
- Aim at a puzzle object and press **E** or left-click to interact.
- Press number keys **1–9** to select an inventory slot, then press **Q** to use the selected item. Inventory slots can also be clicked, or double-clicked to use them.
- Press **F2** or click **ADMIN** to open the admin panel. It can teleport to major areas, spawn every implemented hostile creature and named hotel boss, clear spawned monsters, toggle infinite health, and grant any catalogued item. Spawned creatures use distinct hunt patterns, remain grounded, and collide with level walls; only The Purge, Cable Mass, and Reflection intentionally phase through walls. The monster list is grouped into Hotel Nocturne, Floor 2, Cabin, and Hotel Boss Variants.

Every spawnable monster has its own movement identity and readable tell. The Noise reacts to audible movement, The Chef switches flanks, The Collector guards its starting territory, The Clockmaker advances on mechanical beats, The Pursuer cuts ahead, the Window Creature waits before bursting forward, the False Guest feints away, and the Empty Porter blinks across clear floor. Even the rush monsters differ: Bash commits to one straight lane, The Purge spins through a broad wall-phasing sweep, and Cable Mass whips through a serpentine charge.
- In the Night Lobby, press **H** to hide or restore every menu panel for a clean view of the live 3D lounge.
- Press **Escape** to release or recapture the mouse.
- Search the Main Cabin for three brass pieces of the broken door handle.

## Night Lobby

The game opens on a peripheral lobby overlay that leaves the live 3D Hotel Nocturne lounge visible. First select **Hotel**, **Jailbreak**, or **Cabin**, then configure that game as **Normal**, **Endless**, or **Sandbox** before starting. Normal enters the story campaign, Sandbox starts the selected story with admin tools available, and Endless currently uses the Hotel's procedural numbered-room run. The compact preview updates for both selections. The bottom dock contains local party slots, a share/copy invite action, Badges, and Credits; only one center panel can be open at a time.

The current project has no multiplayer backend. **Invite Friend** shares or copies the lobby URL, while live remote party synchronization remains a future network feature.
- Use **Listen to the Cabin** if you get stuck.

The bottom-screen inventory updates immediately when keys, tools, clues, supplies, and currency are collected or consumed. Quantities are combined into a single slot, selected items are highlighted, and the slot row scrolls when the player carries more items than fit on screen. Flashlights, matches, batteries, vitamins, first-aid kits, bandages, energy drinks, glow sticks, wind-up decoys, lockpicks, weapons, and quest items have functional effects or context-sensitive interactions.

Ordinary discoveries, warnings, dialogue, and item descriptions now appear as compact bottom-screen notifications with readable text and automatically fade while movement remains available. They never require a close button. Full centered panels are reserved for interactions that genuinely require player input, such as puzzles, codes, shops, books, and explicit choices.

The selected inventory item is also rendered in first person with visible hands and sleeves. Equipping, using, and collecting items now has a dedicated hand animation. Hotel drawer fronts physically slide open, while wardrobes and closets swing both doors and move the camera through a full enter/exit animation.

All eight cabin areas are accessible and playable. Progress is saved in the browser.

Six additional hidden puzzles are scattered through the Main Cabin, Bedroom, Kitchen, Trophy Room, Cellar, and Workshop.

The Story Lobby also contains **Jailbreak**, an eight-act escape story set in Blackridge Penitentiary. Search your cell, bypass the cellblock, disable prison security, cross the outer wall, open the storm drain, survive the boiler works, steal a truck, and outrun the final pursuit. Jailbreak progress is saved independently.

The **Infinite Hotel** now keeps a recognizable hotel identity throughout its story: carpet runners, brass borders, molding, numbered guest doors, warm ceiling fixtures, luggage, beds, wardrobes, and nightstands carry from the grand lobby into its impossible corridors and suites.

During the final pursuit, hold **Shift** to sprint and press **Space** to jump over the four striped road hurdles. Side fences prevent bypassing the obstacle course.

In Cell 17, the guard leaves his visible office, completes three eight-second laps of the larger security room, returns to the office for five seconds, and repeats. The cell itself is safe: the guard and searchlight can only catch you while you are outside the cage.

During lap three, inspect the security status display to obtain the tool-lockbox code. Open the box, take the stun baton, then aim at the passing guard and press **E** to knock him unconscious.

After finding the metal spoon, use it to pick the security-vent lock by turning it four times. Opening the vent starts a timed five-junction chase maze; wrong turns restart the route and remove time.

The second Jailbreak area is an explorable broken cellblock. Jump over floor holes, enter open cells, dig through one loose floor for code `2174`, use the keypad to enter the evidence room, collect the brass key, and unlock the north gate at the end of the hall.

Each story is an independent navigation branch. The game now opens directly in the Story Lobby with a full-screen three-card selector for **The Hotel**, **The Cabin**, and **Jailbreak**. Number keys always select inventory slots and never switch rooms or stories. Use **Story Lobby** to return to the selector.

The Story Lobby remains rendered behind the selector as a dark 3D lobby with recessed doors, architectural frames, stone thresholds, and floor paths.

The Infinite Hotel is populated by guests, bellhops, housekeepers, reception staff, an elevator operator, and the hotel manager. Aim at a person and press **E** to speak. In the elevator room, aim at the four physical floor buttons and press **E** to enter `13 → -4 → ½ → ∞`.

Hotel characters have distinct faces, skin tones, hair, uniforms, walking animations, wandering routes, and several character-specific dialogue lines that change across repeat conversations.

The hotel has its own horror dressing: bloody footprints, scratched warnings, covered shapes on abandoned luggage carts, watching portraits, and low red lighting. Whenever characters stop walking, they silently turn to stare at the player.

Selecting Hotel Nocturne begins **Phase I: The Arrival & Check-In** outside the hotel’s oak entrance in a fog-filled courtyard. The doors open into a circular Grand Lobby containing the central reception desk, swaying chandelier, ticking grandfather clock, guestbook, and grand staircase.

The guestbook uses a full-screen page-turning interface, but it is optional and never blocks check-in. Searching the adjoining Baggage & Storage shelf maze reveals the **Room 304** assignment directly. Optional searches award three gold tokens and a five-use box of matches.

The Grand Lobby gift shop spends those Gold Tokens on matches, bandages, energy drinks, glow sticks, wind-up decoys, vitamins, flashlight batteries, first-aid kits, and lockpicks. Additional lower-cost survival kiosks appear in the safe Room 51 executive hall and Room 60 security hub. Purchases are saved and immediately appear as usable inventory items.

Once the storage assignment is known, ringing the brass desk bell summons a rigid, smiling bellhop who greets the player by name and hands over the freezing Room 304 key. His body remains fixed while his head tracks the player up the staircase, including a full backwards turn when viewed from the landing.

The third-floor corridor leads to Room 304. Unlocking it consumes the key. Opening the suite’s suitcase guarantees a flashlight and readable hotel brochure; closing the suitcase interface explodes the bedside lamp into blue sparks and unlocks the corridor, beginning the shifting hotel run.

The connected staircase is a safe atmosphere zone: random power failures, whisper overlays, watching-eye flashes, and composure-loss scares are disabled there.

Every stair and landing has solid traversal geometry, including the Grand Lobby staircase leading to the Room 304 corridor.

Leaving Room 304 after the blackout begins the complete **50-door Floor 5 route**. Rooms 501–524 are generated safe corridors, L-turns, bottomless floor-hole halls, and Portrait Rooms whose faces distort whenever they leave view. Drawer contents are deterministic for the current run and can include Gold Tokens, bandages, energy drinks, glow sticks, flashlight batteries, lockpicks, and wind-up decoys; falling through a broken floor is fatal.

The first wing ends in the multi-level **Giant Library**. A torn note supplies a randomized sequence of Square, Triangle, Circle, and Star symbols. Four protruding books—split between the ground floor and mezzanine—supply the matching spine digits. Entering the four-digit code opens the brass vault and awards the **Elevator Key**.

Beyond Room 525's Library, Rooms 526–548 form a second generated wing, followed by the **Pool Room & Washroom** in Room 549 and the Grand Lift in Room 550. Sprinting across the flooded deck causes a slip for 15 composure damage. The rusted Drain Valve is hidden past the shower partitions; turning it drains the water and releases the pressure door.

The final pressure door opens onto the Grand Lift platform. The Elevator Boss blocks the call button until the Elevator Key is explicitly handed to him. He accepts it, opens the gold lift, and sends the player directly to Room 51.

The numbered-room run includes **The Purge**, the hotel’s one-time automated trash-disposal event. A distant metallic screech begins a three-second warning while the corridor bulbs burst into showers of sparks. Enter any wardrobe or closet with **E** before a wall-slamming mass of rusted gears, blades, iron teeth, and mangled limbs smashes through the room, leaving sparks and black oil behind it. Hiding safely through its single pass completes the encounter—there is no quiet-meter challenge, double-back, or cabinet timer. Being caught outside or climbing out during the rush triggers The Purge’s buzzsaw-and-splinter jumpscare and restarts the room.

The elevator leads into a complete **Room 51–60 Noise arc**. Room 51 is a threat-free executive hallway whose deep velvet carpet cushions footsteps and restores composure. Rooms 52–54 introduce active CRT static, glass and porcelain noise hazards, slow hold-**E** drawers with premium supply rolls, and seven-second hunts when the Noise Meter reaches 100%.

Room 55 is an oval library radio puzzle. Recover the mechanical radio clock, wind it on the far table, and use the ten-second distraction to swipe the magnetic keycard and reach Door 56. Rooms 56–58 are unlit utility corridors: use **F** to control the flashlight, crouch around reflective puddles, and avoid unnecessary clicks or splashes. Reaching 100% noise can trigger another hunt.

Room 59 is a scripted laundry chase. A bursting steam pipe immediately starts The Noise’s hunt; lockers are not safe, so sprint through the washing-machine maze and keep solid machinery or concrete pillars between the player and the entity to disrupt its echolocation. Room 60’s sound-proof vault ends the arc with a full first-aid cabinet, guaranteed battery pack and master lockpick, and a blueprint of the next hotel section.

Room 203 is **The Noise’s Quiet Zone**. Its CRT televisions erupt into gray static and a Noise Meter reacts to sprinting, loose floorboards, and shattered porcelain; crouch-walking keeps sound under control. The listening desk drawer must be opened by continuously holding **E**—releasing early makes it creak and teleports the entity to the desk. At 100% noise, every screen shatters and a seven-second sound-tracking hunt begins; sprinting during the hunt or letting the entity reach you triggers the black-and-white **Signal Loss** jumpscare. Cabinets muffle the signal and remain safe hiding places. After recovering the Room 204 key, the player must report it to the Door Boss and explicitly give him the key. He steps aside, opens the elevator and sends the player down to the complete Floor 1 route.

Floor 1 limits the active equipment hotbar to five item types and adds a Noise Meter, flashlight charge, and eight-second sprint bar with a three-second exhaustion penalty. It has exactly 50 numbered doors: five nine-room generated wings separated by the Sound Sector in Room 10, Elevation Chase in Room 20, Laundry Maze in Room 30, Ballroom in Room 40, and Chef encounter in Room 50. Generated rooms can be straight or L-shaped and retain the sector's scavenging, floor-hole, sagging-ceiling, calm-suite, or portrait-gallery rules. Major boss encounters disable the Noise Meter and replace it with a boss-specific display, keeping each fight independent from The Noise.

Hotel drawers no longer award the same token every time. Standard drawers use a balanced, run-stable loot table; reinforced drawers and silently opened Noise drawers use a stronger premium table. Bandages restore 20 composure, Energy Drinks refill Floor 1 stamina and grant 1.18× movement for ten seconds, Glow Sticks provide 35 seconds of battery-free light, and Wind-Up Decoys redirect active Noise hunts, The Chef, The Collector, The Drowned Guest, or The Pursuer.

**Bash** returns as a straight-line rush monster. Heavy impacts and a screen shake warn the player before it charges through the current lane; moving sideways avoids it, while contact causes an immediate death transition. Bash appears in Floor 1’s calm suite sector and can be spawned in any room from the admin panel.

The Chef cannot be attacked. His six-phase encounter begins with a telegraphed knife volley in the dining room: the raised throwing arm and metallic cue reveal a snapshot of the player's position, allowing a sidestep or solid table, pillar, and counter cover to intercept the knife. The three Gas Valves must then be opened in order. Holding **E** turns a valve over four seconds, and releasing it preserves progress. Valve Two is deliberately exposed, so pot lids can be thrown toward the player's aim point to pull The Chef away for five seconds. Opening Valve Two starts Kitchen Lockdown, activates intermittent steam pipes, accelerates the knife-and-pursuit pattern, and enables a hanging pan rack that collapses into a longer distraction when struck by a thrown knife. Valve Three raises the complete steam gate and starts a red-lit escape through single throws, triple volleys, telegraphed cutting-board slams, and cycling steam.

The elevator shutter then forces the player into the walk-in freezer. Its breakers must be disabled in the labeled **COOLING → SECURITY → MAIN** order; a wrong selection resets the sequence, while each correct breaker changes the room before the main shutdown creates two seconds of darkness. Emergency lighting reveals The Chef and begins Final Service. Three serving-cart wheel locks release heavy carts down the sloped kitchen, progressively destroying the central station without directly harming the boss. After the third impact ruptures the pipes, steam creates the final route to the elevator. The closing-car finale snapshots one last knife throw and requires a lateral dodge before the doors meet. The result is explicitly **THE CHEF — SURVIVED**: the player escapes, but The Chef remains alive in Hotel Nocturne.

The Chef elevator now continues directly into **Floor 2: The Severed Façade**, an exact 50-door route from Room 101 through Room 150. The Noise never appears here. The opening still alternates between damaged interiors and the façade, but everything after the Ballroom that is presented as an outdoor stretch now uses purpose-built exterior rooms rather than disguised guest corridors. Fixed landmarks remain the 150-lb Luggage Scale in Room 105, the `C → E → G → C` Piano Room in Room 112, Ballroom in Room 115, Watcher Balcony in Room 116, Garden Maze in Room 119, Window Walk in Room 120, False Guest Terrace in Room 121, Construction Elevator in Room 122, Spotlight Matrix in Room 130, Crane Cargo Scramble in Room 140, and Safe Vault in Room 150.

Generated interior rooms use a seeded 55% Normal / 15% Water / 20% Hazard / 10% Special distribution. Straight corridors now branch into real left turns, right turns, switchbacks, zigzags, and longer winding routes built from solid collision walls instead of decorative blockers. Storage rooms, flooded suites, readable hazards, Mirror and Clock Rooms now mix with dining rooms, nurseries, mailrooms, service kitchens, conservatories, submerged laundries, endless-door halls, upside-down suites, and other supernatural variants. Every visit guarantees a Guest Suite Foyer whose interior door opens into a connected, walkable bedroom-and-bathroom annex, plus accessible examples of the main social, storage, service, water, hazard, and supernatural room families while leaving their room numbers randomized. Bedrooms and bathrooms are no longer standalone numbered hallway rooms. Sequence rules prevent back-to-back Special Rooms, limit Hazard streaks, prevent immediate duplicate variants, and guarantee an extended multi-turn route in every interior segment. Backtracking and deaths keep the current visit's route stable. Rejoining the game creates a fresh visit seed for all three hotel floors, so a numbered room that was L-shaped may be straight or entirely different next time while collected items and puzzle progress remain saved.

Generated rooms on Floors 5, 1, and 2 also roll delayed one-pass ambushes from **Bash**, **The Purge**, or **Cable Mass**. Every generated room contains an enterable closet placed clear of its main route; press **E** to hide inside until the rush passes. A two-room cooldown prevents consecutive ambushes, dangerous floor-hole and collapse sectors use a lower chance and only select the wall-phasing threats, and a room cannot trigger the same ambush twice during one visit. Bash collides with solid walls and can crash into a turn; The Purge and Cable Mass intentionally phase through them.

Numbered hotel rooms now connect without a room-change screen. An unlocked door swings into a lit physical vestibule, remains open, and waits for the player to walk through a physical connector with a continuous floor, ceiling, and wall opening. The next room streams only after the player crosses the far threshold, preserving their view direction and placing the new entrance directly ahead instead of changing rooms when **E** is pressed. This shared system covers the earlier numbered hotel run, every generated Floor 5, Floor 1, and Floor 2 room, and the Library and Pool landmark exits. Elevators and captured/death resets retain their intentional transitions; ordinary doors do not.

The fixed Ballroom is the transition into the storm. Six masked Guests use different movement behaviors: wandering, approaching, hiding, circling, crossing glass, and evading the player. Aim and press **E** to tag each one before it tags you. Crunching through glass reveals the player's position to nearby Guests, each successful tag removes that Guest, and the last remaining target becomes faster. Being tagged resets only the Ballroom round. The shattered-window exit remains sealed until all six are frozen.

Beyond the Ballroom windows, the **Watcher Balcony** requires three statues to be rotated while a monster advances whenever it leaves the camera's view. Completing the statue puzzle leads across a broken fire escape and suspended window-washing cradles before the player reaches the **Garden Maze**, where moss muffles footsteps while three iron emblem pieces are recovered from the Gardener's patrol route.

The **Window Walk** presents three seeded memory rounds of increasing length across six windows. Switches must be pressed in the shown order while avoiding whichever window currently contains the creature. The sheltered **False Guest Terrace** uses a photograph, luggage tag, and lightning-shadow test to identify four real Guests. Selecting the impostor begins a chase to the Reset Bell instead of causing an arbitrary instant failure.

The thunderstorm drives every outdoor return. World-space rain particles fall through the level, exposed lights drain 1.2× faster, lightning reduces visibility, and occasional gale warnings encourage the player to crouch. Missing the brace no longer causes an instant death: the gust removes 50 health, leaves at least 1 health, and deposits the player at a safe position near the edge. Ten custom outdoor room types now make the exterior substantially longer to cross: fire escapes, window-washing cradles, ventilation roofs, water towers, broken skybridges, billboard catwalks, ledges, jump scaffolds, a swinging neon sign, and sheltered supply balconies. Each has its own wider 36–42-unit traversal layout, façade windows, skyline dressing, hazards, and movement route.

Room 122 requires four copper grounding wires and a `GROUND → BRIDGE → LIFT → MOTOR` fuse path. A seven-room rooftop maintenance run—drawn from ventilation blocks, water towers, skybridges, billboards, fire escapes, cradles, and shelter balconies—leads to Room 130, where a cleaning rag and three spotlight angles activate a prism. The nine-room severe exterior gauntlet then reaches Room 140's three-tier crane scramble: dodge the cargo container, stabilize the cable bridge, crouch under the counterweight cable, and pull the overdrive brake. These traversal rooms add no codes or collection gates; the challenge is simply to keep moving, jump broken spans, read hazards, and brace against the wind. Nine quieter generated rooms numbered 141–149 finally return inside before Room 150's first aid, battery, survival shop, inventory access, checkpoint, and three boss routes: **LOST PROPERTY**, **CLOCK TOWER**, and **FLOODED ATRIUM**. Each exterior run and every major Floor 2 encounter is available from the F2 admin teleport menu.

The Lost Property elevator begins **Boss 1: The Collector**, an eight-phase encounter with its own POSSESSIONS-style boss HUD and no Noise Meter. The player moves a Brass Key and Silver Medallion through a shelf maze by carrying each object a short distance and pressing **X** to drop it; the Collector stops pursuing the player to retrieve dropped property, which allows each item to be advanced shelf by shelf. Three luggage tags reveal the Medallion case code `304`. Ordinary luggage can be placed as an escape-route decoy before three service bells create an opening to take the Pocket Watch directly from the Collector's bag.

Taking the Watch begins Collection Lockdown: it cannot be dropped and must reach the third exit slot in one trip while prepared decoys briefly change the Collector's route. The revealed private chamber has `RETURN`, `STORE`, and `RELEASE` sorting levers; wrong choices let the Collector move closer without killing the player, while `RELEASE` opens every compartment in the department. The player avoids rolling luggage carts during the resulting chaos, then completes a short freight-corridor chase. The boss result is **THE COLLECTOR · ESCAPED**, not killed. Inside the descending elevator, a luggage tag bearing the player's name and **ROOM 304** reveals that the Collector possessed something belonging to them before the encounter began. All major Collector phases and the Collector monster itself are available in the admin panel.

Room 150 also conceals a maintenance door into **The Clockmaker's Clock Tower**. This seven-phase boss replaces the Noise Meter with a large analog clock HUD showing the active beat, attack time, Master Clock time, and phase progress. The opening teaches the four-beat rhythm: three lower mechanisms accept input only while their hand is at twelve, and every fourth `DING` rearranges the tower. The revealed brass face then begins a corridor chase while the Clockmaker advances from behind. At 12, the player must enter an alcove and remain there while the exposed room is smashed; at 3, the floor becomes lethal lava and only raised platforms are safe; at 6, pendulums sweep the route; and at 9, the player must physically retreat backward before the machinery reverses. Failing the alcove, platform, or backward-movement rule resets the chase.

The Four Clocks chamber requires four separate hour/minute controls to be set to `12:00` while the Clockmaker advances on each audible tick and slows when watched. After his face breaks, the player crosses irregular machinery and climbs a wide multi-level maintenance route, pulling three emergency brakes in order. Each brake stops part of the tower but allows the Clockmaker to move faster. At the top, four ordered Master Clock locks slow the minute hand, slow the hour hand, brake the mechanism at exactly midnight, and permanently stop it. The frozen machinery becomes the escape route until the ticking restarts and accelerates into the elevator chase. The result is **THE CLOCKMAKER · OUT OF TIME**; the elevator display changes from `12:00` to `12:01`, revealing that the tower was stopped for only one minute. Seven direct Clockmaker checkpoints and a spawnable Clockmaker model are available from the admin panel.

The third Room 150 route descends into **The Flooded Atrium**, beginning the six-phase Drowned Guest encounter. Four emergency pumps lower the water in visible stages. Pump progress is preserved when **E** is released, and each stage rearranges the safe route: the first uses readable wakes between landings, the second settles floating furniture and adds a drainage-channel distraction, the third exposes a maintenance-room channel diagram with the target `1 → 2 → 0`, and the fourth requires two sluices to isolate the final basin before Pump 4 can drain it.

Once the atrium is dry, the waterlogged Guest stands at full height and follows the player into the access corridor. Its short land bursts are telegraphed before they begin, while three flood barriers create temporary delays without turning the escape into another collection puzzle. The last phase requires holding the bulkhead control until the service lift seals. The result is **THE DROWNED GUEST · LEFT BELOW**; the lift’s drainage display immediately begins rising again. Six direct phase checkpoints and a spawnable Drowned Guest model are available from the admin panel.

**The Pursuer** returns in six separate chase scenes distributed across Hotel Nocturne, with ordinary exploration and landmark gameplay between them. Its ruined hotel suit, ceiling-high silhouette, long arms, pale masklike face, and uneven footsteps remain recognizable, but every appearance has a different route: the Guest Wing teaches illuminated service signs and closing heavy doors; Spin Cycle winds through sheets, laundry rails, warned steam, and release handles; The Wrong Reflection keeps its false images cosmetic while bright arrows mark the real route; Outside the Windows crosses balconies and scaffolds while gusts slow both hunter and player; Priority Delivery uses readable conveyor directions and optional baggage diverters; and No Further Appointments combines those skills in the executive service wing.

Every Pursuer encounter suppresses the Noise Meter and prevents The Noise from spawning. These are direct running sequences rather than puzzles: sprint along the illuminated route, press **Space** over low hurdles, hold **C** beneath beams, and tap a few large red **E** switches without stopping. The switches activate immediate delaying barriers and never require a code, order, inventory item, or hold meter. Each chase begins at its own checkpoint with a fair head start and a guaranteed sprint reserve. Capture produces a brief blackout and restarts only that chase from its reveal. Once an elevator, shutter, mirror latch, maintenance entrance, freight platform, or security bulkhead confirms escape, the barrier remains trustworthy and the game restores the exact hotel room that launched the encounter. Room 140 and the Night Lobby never launch a Pursuer chase. Six direct scene teleports and a standalone Pursuer spawn are available from the admin panel.

Hotel Nocturne is also watched by three angels. The first revealed angel is **Ransack**, the cruel one: he speaks as if he wants the player dead, but actually appears to impose challenges. During ordinary generated hotel rooms, his winged figure and STOP sign may appear with a three-second countdown. Releasing all movement in time passes immediately. Continuing to move does not cause death; Ransack instead seals the current route and scatters three glowing red marks through the room. Collecting all three releases the route and makes him admit that he wanted a challenge, not the player’s life. Ransack never interrupts bosses, Pursuer chases, Noise encounters, safe rooms, or the Night Lobby, and the admin panel can trigger his test directly.

The hotel flashlight now uses one persistent battery charge across every hotel floor and special encounter. Its beam has ten times the previous intensity, a 100-unit throw, a wider cone, and improved shadow detail. Charge drains only while the flashlight is switched on, drains 1.2× faster in Floor 2’s exposed storm, begins flickering below 15%, and shuts off at 0%. The inventory slot always displays the remaining percentage. A **Flashlight Battery** is selected with its number key and consumed with **Q** to restore 100%; a full flashlight refuses the battery so it cannot be wasted.

Each new browser game session randomizes the puzzle clues, hotel search locations, boss variant, and boss response sequence. The hotel staff turn in the direction they are walking, and the game spawns directly in the Story Lobby.

Selecting **The Cabin** places you directly inside the Main Cabin. The renderer automatically uses a lighter performance mode on lower-power devices to reduce stutter.

Every playable room contains an optional glowing Courage Shard. Aim at it and press **E** to collect it, restore composure, and increase the persistent shard counter.

Unpredictable horror events occur during active exploration: power failures, watching eyes, whispered warnings, camera jolts, and low-frequency audio stingers. They pause automatically during dialogs and in the Story Lobby.

- **Main Cabin:** recover three pieces of a broken door handle.
- **Bedroom:** recover a warning from a black mirror that shows no reflection.
- **Kitchen:** reconstruct the cabin owner’s ritual.
- **Trophy Room:** identify the pattern behind earlier disappearances.
- **Cellar:** confront the thing sleeping beneath the forest.
- **Workshop:** collect a scarred baseball bat.
- **Playroom:** deflect a creature’s thrown ball and strike it three times.
- **Root Maze:** escape the revived Playroom creature through a labyrinth made entirely from thousands of intertwined roots, then destroy the glowing heart at the far end.

## Older project files

The previous Godot files remain in the repository for reference, but the browser game does not use them.
