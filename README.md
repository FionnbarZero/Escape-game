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

Each story is an independent navigation branch. The game now opens directly in the Story Lobby with a full-screen three-card selector for **The Hotel**, **The Cabin**, and **Jailbreak**. Number keys **1–8** are cabin-only room shortcuts; number keys are disabled inside Infinite Hotel and Jailbreak so they cannot switch stories accidentally. Use **Story Lobby** to return to the selector.

The Story Lobby remains rendered behind the selector as a dark 3D lobby with recessed doors, architectural frames, stone thresholds, and floor paths.

The Infinite Hotel is populated by guests, bellhops, housekeepers, reception staff, an elevator operator, and the hotel manager. Aim at a person and press **E** to speak. In the elevator room, aim at the four physical floor buttons and press **E** to enter `13 → -4 → ½ → ∞`.

Hotel characters have distinct faces, skin tones, hair, uniforms, walking animations, wandering routes, and several character-specific dialogue lines that change across repeat conversations.

The hotel has its own horror dressing: bloody footprints, scratched warnings, covered shapes on abandoned luggage carts, watching portraits, and low red lighting. Whenever characters stop walking, they silently turn to stare at the player.

In the Hotel Nocturne lobby, the Floor 5 access key is not initially on the counter. Ring the service bell and watch the bellhop walk over and hand it to you. Floor 5 is the elevator’s only working destination.

The lobby also has an explorable staff storage room filled with shelves, linens, a housekeeping cart, and an unclaimed suitcase. Once the bellhop gives you the Floor 5 access key, the elevator travels directly to Floor 5; the guestbook and staff directory remain optional story details. The adjacent emergency staircase is a continuous five-floor stairway: every flight meets a solid landing, every floor door is physically attached to its landing, and the player can climb or descend without crossing gaps. Floors 1–4 are reachable but locked; only the Floor 5 guest-suite door opens. Press **E** directly in front of that door to enter the furnished suite.

The connected staircase is a safe atmosphere zone: random power failures, whisper overlays, watching-eye flashes, and composure-loss scares are disabled there.

Every stair and landing has solid traversal geometry. The elevator arrives beside the top landing on Floor 5, while the lobby stair entrance begins at Floor 1.

The former floating numbered doors and disconnected high entrances have been removed from the active route. Floor labels now correspond to actual landings, and the only available destination is Floor 5.

The Floor 5 door opens directly into a furnished guest suite instead of transporting you into another hallway. The suite contains a searchable suitcase, an enterable wardrobe, an enterable closet, and an exit into the numbered-room run; its layout, color scheme, and special furnishing are randomized for each new session. Aim at either hiding place and press **E** to enter, then press **E** again to leave. Older saves already inside the repeating hallway are also routed into the Floor 5 suite when the correct door opens.

Leaving the Floor 5 guest suite begins the numbered-room hotel run: three wings with four rooms each. Every room contains a wardrobe and closet that the player can physically hide inside. Search desks, carts, paintings, cupboards, mirrors, guestbooks, closets, and safes to recover room keys, maintenance tools, and elevator passes. Every exit stays locked until the current room gives up its required item; the final safe contains the master hotel key.

The numbered-room run includes **The Eviction / The Cleanse**, a one-time sterile event. Fluorescent-white lights and panicking staff warn of its arrival before a floating cluster of broken porcelain faces, golden eyes, and architectural gears bleaches the room from the ceiling. Normal beds and closets are vaporized in its line of sight. Survive by pressing **E** at the mirror to reflect its light, crouching completely inside a marked deep shadow, or holding **Shift** while running past the Mimic Armchair so the Entity cleanses it first and grants a three-second escape window.

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
