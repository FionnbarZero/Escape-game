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
- Aim at a puzzle object and press **E** or left-click to interact.
- Press **Escape** to release or recapture the mouse.
- Search the Main Cabin for three brass pieces of the broken door handle.
- Use **Listen to the Cabin** if you get stuck.

All eight cabin areas are accessible and playable. Progress is saved in the browser.

Six additional hidden puzzles are scattered through the Main Cabin, Bedroom, Kitchen, Trophy Room, Cellar, and Workshop.

The Story Lobby also contains **Jailbreak**, an eight-act escape story set in Blackridge Penitentiary. Search your cell, bypass the cellblock, disable prison security, cross the outer wall, open the storm drain, survive the boiler works, steal a truck, and outrun the final pursuit. Jailbreak progress is saved independently.

The **Infinite Hotel** now keeps a recognizable hotel identity throughout its story: carpet runners, brass borders, molding, numbered guest doors, warm ceiling fixtures, luggage, beds, wardrobes, and nightstands carry from the grand lobby into its impossible corridors and suites.

During the final pursuit, hold **Shift** to sprint and press **Space** to jump over the four striped road hurdles. Side fences prevent bypassing the obstacle course.

In Cell 17, the guard leaves his visible office, completes three eight-second laps of the larger security room, returns to the office for five seconds, and repeats. The cell itself is safe: the guard and searchlight can only catch you while you are outside the cage.

During lap three, inspect the security status display to obtain the tool-lockbox code. Open the box, take the stun baton, then aim at the passing guard and press **E** to knock him unconscious.

After finding the metal spoon, use it to pick the security-vent lock by turning it four times. Opening the vent starts a timed five-junction chase maze; wrong turns restart the route and remove time.

The second Jailbreak area is an explorable broken cellblock. Jump over floor holes, enter open cells, dig through one loose floor for code `2174`, use the keypad to enter the evidence room, collect the brass key, and unlock the north gate at the end of the hall.

Each story is an independent navigation branch. Number keys **1–8** are cabin-only room shortcuts; number keys are disabled inside Infinite Hotel and Jailbreak so they cannot switch stories accidentally. Use **Story Lobby** to change branches.

The opening Story Lobby doors are recessed into the back wall with thick architectural frames, headers, stone thresholds, and floor paths, so none of the three story entrances appear to float.

The Infinite Hotel is populated by guests, bellhops, housekeepers, reception staff, an elevator operator, and the hotel manager. Aim at a person and press **E** to speak. In the elevator room, aim at the four physical floor buttons and press **E** to enter `13 → -4 → ½ → ∞`.

Hotel characters have distinct faces, skin tones, hair, uniforms, walking animations, wandering routes, and several character-specific dialogue lines that change across repeat conversations.

The hotel has its own horror dressing: bloody footprints, scratched warnings, covered shapes on abandoned luggage carts, watching portraits, and low red lighting. Whenever characters stop walking, they silently turn to stare at the player.

In the Hotel Nocturne lobby, the Room 13 key is not initially on the counter. Ring the service bell and watch the bellhop walk over and hand the key to you.

The lobby also has an explorable staff storage room filled with shelves, linens, a housekeeping cart, and an unclaimed suitcase. In the first hotel area, the old Room 13 doorway is now a door labeled **Entrance to the Staircase**. The first staircase visit is a smaller, clean, normally lit hotel stairwell with close-set carpeted steps, brass rails, wall molding, lamps, and Rooms 13–16. It contains no bloody horror dressing. A return door leads back to the lobby.

The first staircase visit is also a safe atmosphere zone: random power failures, whisper overlays, watching-eye flashes, and composure-loss scares are disabled until the player enters the later Room 16 sequence.

Every square-stairwell step and landing has solid traversal geometry. Players rise onto each step, can stand on the landings, jump, and descend without passing through the staircase.

The endless stairwell walls contain hotel doors numbered 13 through 104 at different heights. Each has a brass frame and handle and can be examined for an unsettling response.

Room 16 begins as an ordinary guest room with three tasks involving its bed, wardrobe, and telephone. Completing them powers its elevator, which descends to a blocked staircase where a monster emerges. Escaping through the stair door unfolds a much larger vertical parkour area; falling to the bottom wakes the monster and forces the player to run before climbing again.

The repeating hotel hallway is now nearly twice as long, with many more numbered doors and three clearly marked jump-or-crouch obstacles. Room 13 is fully enterable from the stairwell after receiving its key and contains a furnished guest room, a searchable suitcase, and a return door.

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
