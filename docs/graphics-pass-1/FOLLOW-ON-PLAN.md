# Hotel Nocturne graphics follow-on plan

Pass 1 establishes the reusable language: deterministic cached surfaces, selective geometry detail, visible fixtures, restrained lighting, compact HUD states, local quality controls, and safe room-resource cleanup. Extend it area by area rather than increasing every scene's density at once.

## 1. Courtyard and lobby

- Refine the hotel facade, entry canopy, stone/metal/wood material separation, reception desk, luggage, elevator surround, and practical fixtures.
- Preserve the courtyard-to-lobby route, readable reception objectives, safe-room behavior, and Night Lobby identity.
- Rain belongs outside and must not continue through the lobby ceiling or obscure the entrance route.
- Establish a GPU baseline here because it is the first normal campaign impression.

## 2. Generated guest rooms

- Build a small reusable kit for doorframes, skirting, damaged wallpaper, carpets, wardrobes, beds, lamps, and readable room plaques.
- Instance repeated trim and furniture where practical; keep decorative variation on the visual RNG.
- Audit every variant for spawn clearance, traversal width, interaction rays, and controlled-generator guarantees.

## 3. Laundry and Noise spaces

- Separate damp tile, galvanized machines, cloth, steam pipes, carts, drains, and water films.
- Give steam readable fixtures and warnings; keep required waiting pockets and chase timing unchanged.
- Keep Room 59's Noise identity distinct from the separate Pursuer laundry chase.

## 4. Chef kitchen

- Add durable kitchen materials, range hoods, shelving, prep surfaces, freezer seals, carts, burners, and restrained grease/steam wear.
- Protect valve, breaker, projectile, freezer, and elevator-finale sightlines. Visual effects cannot obscure telegraphs.

## 5. Ballroom

- Restore faded luxury through ceiling coffers, sconces, stage trim, curtains, parquet variation, tables, and controlled glass damage.
- Preserve the Ballroom tag encounter and its first broken-window exterior reveal. Do not import Electrical Section signage or lighting language.

## 6. Exterior storm areas

- Create dedicated balcony, fire-escape, scaffold, roof, maintenance-landing, and broken-facade kits rather than reusing indoor room shells.
- Use exterior-only rain, gust particles, wet roughness, lightning, and low maintenance landing lights.
- Keep wind warnings, brace/crouch timing, safe platforms, Pursuer alternate routes, and Room 140 protection fully readable.

## Validation for every rollout

For each area, capture a fixed before/after view, record drawing buffer and renderer counters, run its existing gameplay suite, test at Low/Medium/High, and check 1280×720 plus 1920×1080 HUD layout. A room is not complete until its normal entrance, objective, exit, retry, and return path remain playable without debug state.
