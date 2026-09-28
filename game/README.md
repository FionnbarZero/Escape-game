# Browser game source

The active Three.js game is split into ordered subsystem scripts. `three-game.js`
loads Three.js, exposes its API to the shared game runtime, and then loads the
files listed in `manifest.js` sequentially.

The numbered prefixes are intentional. The existing game has shared mutable
state and cross-system function calls, so execution order is part of the runtime
contract. Add new systems to `manifest.js` at the point where their top-level
initialization should run.

## Layout

- `00`–`03`: engine setup, shared state, inventory, and presentation helpers
- `04`–`05`: Ransack and developer/admin systems
- `06`–`11`: shared hotel construction, arrival, Floor 5, and Noise encounters
- `12`–`17`: hotel bosses and Floors 1–2
- `18-molly`: Molly's Electrical Section, computer routing, sound investigation,
  wire-hair animation rig, terminal overrides, and exit levers
- `18-noise-runtime`: live Noise encounter runtime
- `19`: procedural hotel run
- `20`–`21`: forest and jailbreak stories
- `22`–`23`: shared story world and lobby UI
- `24`: cabin rooms, puzzles, and root maze
- `25`: input, animation loop, combat, puzzle UI, and startup
