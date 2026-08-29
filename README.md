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
- Aim at a puzzle object and press **E** or left-click to interact.
- Press **Escape** to release or recapture the mouse.
- Search the Main Cabin for three brass pieces of the broken door handle.
- Use **Listen to the Cabin** if you get stuck.

All eight cabin areas are accessible and playable. Progress is saved in the browser.

Six additional hidden puzzles are scattered through the Main Cabin, Bedroom, Kitchen, Trophy Room, Cellar, and Workshop.

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
