# Graphics Pass 1 implementation plan

1. **Audit and baseline — complete.** Identify renderer, script order, material helpers, HUD, viewmodels, Molly's builder/rig, and gameplay tests; preserve the dirty worktree; capture the pre-pass reference build.
2. **Shared presentation — complete.** Add deterministic cached surfaces, shared geometry/disposal, Low/Medium/High controls, local Three.js 0.180.0 files, and accessibility settings independent of quality.
3. **HUD and first-person presentation — complete.** Correct story identity, add brief-to-compact field information plus journal access, clear the center view, and refine hands/tools with item-specific poses and motion.
4. **Electrical Section reference art — complete.** Layer cabinet, terminal, intercom, cable, fixture, floor, and signage detail without altering navigation or interactions; retune practical lighting and shadows.
5. **Molly model and animation — complete.** Refine the accepted model, build reusable curved wire bundles, preserve face rules, and synchronize the hand-driven flare with existing behavior states.
6. **Regression and evidence — complete with documented limits.** Run structural/runtime suites, check 1280×720 and 1920×1080 HUD geometry, capture fixed before/after views and animation frames, record renderer counters, and document hardware/visual items that still need human verification.
