# Hotel Nocturne graphics upgrade — Pass 1

Date: 2026-09-28 (America/Los_Angeles)

## Result

Pass 1 upgrades the shared renderer/presentation layer and uses Molly's Electrical Section as the finished reference area. It does not redesign Molly's rules or roll the art treatment across every floor.

The section now has a stable material language, visible fixtures with a controlled shadow budget, layered electrical equipment, curved supported cable runs, a clearer Molly silhouette, a hand-driven cable-hair rig, lower first-person tools, a compact encounter HUD, and Low/Medium/High graphics controls. The upgrade remains visible with optional effects disabled.

## Implementation

- `game/00-core.js`: quality presets, explicit resolution scale, shadow/particle budgets, renderer snapshot, and separate reduced-motion/reduced-flashing preferences.
- `game/03-world-presentation.js`: cached deterministic surface textures, material profiles, shared geometry, room-resource disposal, detailed hands and tools, visible light fixtures, and restrained item motion.
- `game/05-admin.js` and `index.html`: graphics controls and live drawing-buffer readout.
- `game/06-hotel-world.js` and `game/17-floor-two.js`: preset-aware decorative particle density without changing gameplay generation.
- `game/18-molly.js`: Electrical Section construction detail, lighting, readable equipment, floor wear, Molly model/rig refinement, curved cable hair, contact shadow, and compact encounter status.
- `game/19-hotel-run.js`, `game/23-lobby.js`, and `game/25-runtime.js`: stable special-area HUD identity, journal access, cleanup, and resize integration.
- `escape-ui.css`: story-aware branding, compact/expanded journal states, Molly HUD layout, accessibility states, optional film grain, and 1280/1920 responsive rules.
- `vendor/three/`: the already-used Three.js 0.180.0 runtime is now local. The exact files came from the project's prior self-contained playtest export; SHA-256 values match that export. The upstream MIT license is preserved in `vendor/three/LICENSE`.
- `tests/graphics-pass-browser-smoke.mjs`, `tests/graphics-pass-evidence.mjs`, and `tests/molly-hair-flip-evidence.mjs`: quality/layout/resource regression coverage and repeatable visual evidence.

No purchased, ripped, or remotely hotlinked art was added. New visual detail is procedural or code-native. No suitable user reference images were found in the project, so this pass followed the written target style.

## Art and interaction changes

### Shared presentation

- Hotel play now identifies itself as **HOTEL NOCTURNE**; Jailbreak and Cabin retain their own themes.
- Full room copy appears as an entry introduction, then collapses after 5.2 seconds. `J` opens the existing description/objective as a field journal instead of deleting it.
- Low, Medium, and High presets control render scale, shadow maps, particles, and optional effects. Resolution remains independently adjustable from 50–100%.
- Reduced motion and reduced flashing are independent accessibility choices, not hardware-quality assumptions.
- Painted metal, bare metal, rubber, fabric, concrete, glass, and wood use distinct cached material profiles. Color detail is sRGB; roughness data remains non-color.
- Surface variation uses a dedicated deterministic visual generator and does not consume gameplay random values.

### Molly reference area

- Cabinets have feet, hinges, seams, grilles, indicator clusters, and recessed doors; terminals have bezels, controls, keys, and stable numeric labels.
- Intercoms retain readable antenna detection cues and now have a distinct speaker grille and floor marker.
- Cable trays have supports and prominent drops use curves instead of close-up rigid sticks.
- Cool equipment light and warm maintenance fixtures create readable pools without making indicator lights cast shadows. One prioritized local light casts a shadow; the remaining local fills are cheaper.
- Molly retains her accepted screen-faced maintenance identity and gameplay dimensions. Added casing vents, shoulder/garment seams, joint definition, soles, and a following contact shadow improve grounding.
- Her 18 prebuilt hair bundles use reusable tube geometry and thickness variation. The existing behavior event now drives a staged hand-up, gather, lift, flare, release, and delayed settle sequence; geometry is not rebuilt per frame.
- Display `00` remains idle/listening. A selected target shows `ROUTING Cxx`; decorative text never invents a false target.
- The security controller, drone controller, hammer, drone, sleeves, cuffs, wrists, palms, and thumbs have distinct silhouettes and materials. Idle controllers are smaller and lower; only an active feed raises them.

## Evidence

The screenshots use the same five camera coordinates and a 1280×720 viewport. The before images come from `Hotel-Nocturne-Full-Game-Playtest.zip`, the preserved pre-pass build created earlier on 2026-09-28. That build still shows its old full Molly overlay and incorrect Cabin branding; the after set shows the normal compact field HUD. The after images use High, 100% render scale, and a 1280×720 drawing buffer. Molly's layout is fixed; gameplay seeds differ, but the new decorative variation is stable and does not affect layout.

| View | Before | After |
| --- | --- | --- |
| Entrance / HUD | [before](evidence/before/01-molly-entrance-hud.png) | [after](evidence/after/01-molly-entrance-hud.png) |
| Terminal and intercom | [before](evidence/before/02-terminal-intercom-hud.png) | [after](evidence/after/02-terminal-intercom-hud.png) |
| Lever approach | [before](evidence/before/03-lever-approach-hud.png) | [after](evidence/after/03-lever-approach-hud.png) |
| Molly / HUD | [before](evidence/before/04-molly-model-hud.png) | [after](evidence/after/04-molly-model-hud.png) |
| Molly / diagnostic clean view | [before](evidence/before/04-molly-model-clean.png) | [after](evidence/after/04-molly-model-clean.png) |
| Held camera controller | [before](evidence/before/05-held-camera-controller-hud.png) | [after](evidence/after/05-held-camera-controller-hud.png) |

The eight-frame [hair-flip sequence](evidence/after/hair-flip-frames/) is rendered from the real Molly rig at fixed animation progress values. It shows the hand and cable transforms across the gesture. No video encoder was available (`ffmpeg`, ImageMagick, and `gifsicle` were absent), so these frames are the animation evidence; they are not concept art.

## Measured renderer data

Both samples used the same Chrome build and **SwiftShader software rendering**, not the Mac GPU. These values are diagnostic comparisons, not playable FPS claims. The baseline metric window was 1280×633 due the older headless setup; final screenshots and the after metric are 1280×720. The complete raw records are [before metrics](evidence/before/metrics.json) and [after metrics](evidence/after/metrics.json).

| Metric | Before | After |
| --- | ---: | ---: |
| Drawing buffer | 1280×633 | 1280×720 |
| Tone-map exposure | 1.05 | 0.94 |
| Fog density | 0.012 | 0.0095 |
| Scene meshes | 488 | 908 |
| Renderer calls | 419 | 754 |
| Triangles | 32,706 | 57,004 |
| Resident geometries | 510 | 440 |
| Resident textures | 63 | 57 |
| Mean sampled frame time | 7,916 ms | 7,137 ms |

The art pass intentionally increases visible meshes/calls/triangles. Cached materials/geometries and disposal reduce the reported resident geometry and texture counters. The software-renderer samples are too slow and not sufficiently resolution-matched to establish a hardware performance win. Real 1080p GPU timing remains required.

Repeated Molly rebuilds held the procedural texture cache at 8 and shared box-geometry cache at 114, removed each prior room group, and left exactly one active group. Low/Medium/High produced 921×518, 1126×633, and 1280×720 buffers at the 1280×720 test viewport.

## Verification completed

Passed:

- syntax checks for all changed runtime scripts;
- graphics reference smoke: material detail, deterministic visual RNG, shadow budget, TubeGeometry cables, contact shadow, compact Molly HUD, local Noise exclusion, 1280×720 and 1920×1080 non-overlap, journal access, item size, and repeated rebuild caches;
- Molly runtime suite: face target/physical computer travel, code flow and wrong-code recovery, camera doors, intercom crouch rules, standing/crouching/jumping capture, wall/floor rejection, camera/drone crouch return, hammer, drone, retry state, three levers, final exit, and Noise exclusion;
- presentation/branding, interaction animation, flashlight, seamless Hotel transitions, Floor 2 exterior setup, 5,000-seed required-room generation, random-room runtime, Room 55/60 progression, inventory/drawers, nonblocking notices, and Ransack state tests.

The three dedicated-URL browser tests initially reported “test page not found” because they require their own `verify=` tab. They passed after being rerun against those exact local tabs; this was harness setup, not a game failure.

A later attempt to launch three CDP suites together also caused two `ReferenceError` failures when the suites navigated the same page underneath each other. Graphics and Molly were rerun alone and passed; the concurrent results are not counted as game failures.

Local dependency requests for `index.html`, `three.module.js`, `three.core.js`, `PointerLockControls.js`, and the Three.js license each returned HTTP 200. The current entry point contains no jsDelivr/remote Three.js path.

The terminal code modal still deliberately pauses Molly. A wrong-code alarm records the terminal location immediately, but Molly cannot physically advance until the modal closes. This pass reports that consequence and does not change the global puzzle pause model.

## Unverified or limited

- No uninterrupted full campaign playthrough was claimed.
- Visual and audio approval still needs a human playtest on the actual Mac display/audio path.
- Native-GPU 1080p frame pacing, VRAM, and browser-process memory are unverified; SwiftShader does not provide a credible FPS result.
- A true continuous video of the hair flip was not produced because no local encoder was available.
- This pass checks the Hotel courtyard/lobby and other-story branding for regressions, but it does not apply Molly's full art density to those areas.

## Local preview

From the project directory:

```sh
cd /Users/fionnbar.zero/code/Escape-game
python3 -m http.server 8765
```

Open `http://127.0.0.1:8765/`. Three.js 0.180.0 and PointerLockControls now load from `vendor/three/`; the preview does not need the CDN. Press `F2`, choose **Molly · Electrical Section**, and activate the teleport. Use the Graphics section in the same panel for preset, resolution, effects, reduced motion, and reduced flashing. Press `J` to expand/collapse the field journal and `H` to toggle the gameplay HUD.
