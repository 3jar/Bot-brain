# mc-motion handoff — 2026-11-02 night (overnight autonomous run, owner asleep)

Project: /Volumes/SangHun/dev/notamovie. Design: docs/research/walking.md sec. 9, 9.1 (turning), 9.2 (short legs), 9.3 (terrain). Owner checklist: docs/M0.md items 10-24 plus a slow-motion tip (/tick rate 5).

## State
- Turning (9.1): world-space swing paths, lean atan(a/g_MC) capped 12 deg, orientation warp, DCM cut step, per-foot tracks, no crossing, early release of out-of-reach pillars. Lead accel from live keys (own player) starts the lean before the body turns.
- Short legs (9.2): duty factor with flight (walk 0.46, sprint 0.42), no stretching. Heel-to-toe rocker gives the honest ~20%.
- Terrain (9.3):
  - client/LevelGround reads collision tops (VoxelShape.max(Y, z, x), +/-0.6 block), wired in Walk.solve.
  - Rigid legs change body height only in flight. The flight is driven by a cubic to the next pillar's predicted ask, predicted for the actual landing frame at the current pace and dt.
  - Early push-off keeps height changes <= HOP_RATE 100 px/s.
  - A short walking fall onto ground <= 0.6 below stays a walk.
  - Hand-over continuity is kept in world terms.
  - The heel-to-toe roll only happens onto ground level with the pillar, so a foot tips over a step edge or ledge.
  - bob scales only the leg part of the drop, not the terrain.
  - Fixed stale swingFrom (a foot never landing after a push-off right after a landing).
- Results:
  - Stairs carrying foot off its tread: 5.0 -> 0.002 px at 1000 fps; <= 0.03 px at 30/60/144/240 fps with 20 Hz ticks and render interpolation.
  - Pelvis speed <= 0.19 px/ms (60 fps).
  - Level-ground hand-over float is 0. Game-rate 90/180 cuts: no slide, float <= 0.14 px at 60/144 fps.
  - 39/39 core tests, including the new game-frame-rate stairs and cuts tests.
  - Cost 1.30 -> 1.40 us/frame.
  - Built and installed in FO; NOT run in-game.
- Known gaps:
  - The swinging foot clips steps (up lead 6.2 px, down trail 10 px), like vanilla. The hip-connector fold maxes ~4 px vs 8.5 needed, so this needs an L1 whole-body trade or an owner call.
  - At 30 fps, the 90 deg cut floats the stance foot 1.1 px (swing-clearance rule).

## Next (in order)
1. Owner in-game check of M0.md 18-24.
2. L1: interface split + objective (seam budget measure, angular momentum, clearance trade).
3. Remote-player lead from InterpolationHandler target (needs an accessor for interpolationSteps); out of current scope (own avatar).

## Blocked on
Owner in-game check.
