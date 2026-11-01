# mc-motion handoff — 2026-11-02 night (overnight autonomous run, owner asleep)

Project: /Volumes/SangHun/dev/notamovie. Design: docs/research/walking.md sec. 9, 9.1 (turning), 9.2 (short legs), 9.3 (terrain). Owner checklist: docs/M0.md items 10-24.

## State
- Turning (9.1): world-space swing paths, lean atan(a/g_MC) capped 12 deg, orientation warp, DCM cut step, per-foot tracks, no crossing, early release of out-of-reach pillars. Lead accel from live keys (own player) so the lean starts before the body turns.
- Short legs (9.2): duty factor with flight (walk 0.46, sprint 0.42), no stretching. Heel-to-toe rocker gives the honest ~20% FA gets by stretching.
- Terrain (9.3, new tonight): client/LevelGround reads block collision tops (VoxelShape.max(Y, z, x), +/-0.6 block search, no allocation), wired in Walk.solve.
  - A rigid leg cannot raise or lower the body on a pillar, so height changes between pillars happen in flight (a small hop).
  - In flight the body is driven by a cubic to the next pillar's predicted ask, so it lands exactly. That ask comes from the leg solved for the landing point from the current pivot.
  - The stance foot pushes off early so a height change runs at <= HOP_RATE 100 px/s.
  - A short walking fall (onGround false, known ground <= 0.6 below, falling) stays a walk.
  - Hand-over continuity is kept in world terms.
  - Fixed a stale swingFrom bug: after a push-off right after landing, the foot never landed next cycle.
- Results: stairs carrying foot off its tread 5.0 -> 0.04 px; pelvis per-ms jump 12 -> 0.16 px. Level-ground hand-over float is 0 in all cases (curve 0.105 -> 0). Tolerances tightened to 0.05. 37/37 core tests pass. Built and installed in FO; NOT run in-game.
- Known gap: the swinging foot passes through steps (up: lead foot up to 6.2 px inside the upper tread; down: trail foot up to 10 px). Vanilla clips too. The real fix needs clearance: a stairs-only knee fold (the owner judged the fold broken on flat ground) or the L1 whole-body trade. Owner decision.

## Next (in order)
1. Owner in-game check of M0.md 18-24.
2. Clearance on stairs (fold only when the alternative is clipping), or L1 interface split + objective (seam budget, angular momentum).
3. 90-deg-to-facing sidestep pattern; remote-player lead via interpolation target.

## Blocked on
Owner in-game check.
