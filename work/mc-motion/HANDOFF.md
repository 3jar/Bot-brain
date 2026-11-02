# mc-motion handoff — 2026-11-02 late night (L1 + visible leg line)

Project: /Volumes/SangHun/dev/notamovie. Design: docs/research/walking.md 9.4 (running base), 9.5 (L1 whole body), 9.6 (visible leg box along the leg line). Owner checklist: docs/M0.md 18-30.

## Owner direction
- Get the whole-body optimization to a finished version first; the owner tunes after looking.
- The body should absorb the legs' momentum so the legs' oddness is covered.

## State (45 core tests pass; built + installed in FO; not yet seen by owner)
- Visual tool: docs/research/bench/Render.java draws side and front views over one stride to PNG; it calls gait.placeLegs. Use it for every visual change.
- L1 (core/WholeBody):
  - per frame, 10 offset DOFs (waist and chest p/y/r, clavicle yaw, arm swing), damped Gauss-Newton, numeric Jacobian;
  - aims: mean-free vertical and lateral angular momentum (weights 0.3 / 0.05), per-joint stiffness prior, smoothness;
  - Winter masses as boxes with spin inertia;
  - results: momentum -79%, arms ±51 deg, chest ±4 deg; lean_speed 1.5. Cost 14.9 us.
- Visible leg box (Gait.placeLegBoxes / placeLegs, style leg_line, C2 = 1):
  - a 12 px stick along the socket (torso box bottom) to foot line, turned from the shin by the least rotation;
  - standing: the sole corner on the pillar, the top hidden in the torso if short;
  - hanging from the socket while swinging (lifted off the ground), blended over the first and last 15% of the swing;
  - the hidden skeleton keeps the human knee for physics.
  - Remaining: a gap of up to 1 px (0.7 running) under the socket around landings (straight leg line slightly > 12). A RUN_KNEE 18 deg landing floor was tried and reverted: it made the backward float worse and weakened the run shape.
- Renders: the legs now read as Minecraft legs (scissor, back kick); upper body answers.

## Next
1. Owner look (M0.md 29-30).
2. COM path smoothing; upper-body inertia on direction changes; analytic Jacobian (cost).
3. Later: stairs (deferred), cut as plant-sink-push.

## Blocked on
Owner in-game look at this version.
