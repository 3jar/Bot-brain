# mc-motion handoff — 2026-11-02 late night (L1 whole-body started)

Project: /Volumes/SangHun/dev/notamovie. Design: docs/research/walking.md 9.4 (running is the base), 9.5 (L1 whole-body); docs/skeleton.md "관절은 사람 위치로". Owner checklist: docs/M0.md items 18-29.

## Owner direction
- In-game verdict on the run: "just looks weird; nothing visibly changes between your edits".
- Get the whole-body optimization in place first; the owner will tune on the finished version.
- Optimize away the legs' velocity/force so the body covers the legs' oddness.

## State (44 core tests pass; built + installed in FO; not yet seen by owner)
- Visual tool: docs/research/bench/Render.java draws the six boxes side/front over one stride to PNG. Use it to check every visual change. It showed:
  - the upper body was inert;
  - the heel-kicking leg box went nearly horizontal (the knee is 4.5 px inside the box).
- L1 = core/WholeBody, called at the end of Gait.advance when style `whole` > 0 (C2: 1).
  - 10 offset DOFs on top of the gait's pose: waist and chest pitch/yaw/roll, clavicle yaw x2, arm swing x2.
  - Damped Gauss-Newton, 2 iterations per frame, numeric Jacobian, warm start.
  - Residuals:
    - vertical-axis angular momentum about the COM, minus its 0.4 s running mean (weight 0.3);
    - lateral-axis momentum, also mean-free (0.05);
    - per-joint stiffness prior (spine 5/5/2.5, clavicles 2, arms 0.4; scale 0.15);
    - smoothness 0.6.
  - Masses from Winter 2009, as boxes with their own rotational inertia.
- Lessons:
  - point masses make torso twist free, so segment spin inertia is needed;
  - equal stiffness lets the chest win, so joints need their own stiffness;
  - full cancellation spins the arms to ±159 deg, so cancel only partly;
  - running legs carry a steady lateral-axis momentum (like a wheel), so cancel only the changing part.
- Results: vertical momentum 11.6 -> 2.4 (-79%); arm swing ±19.7 -> ±50.8 deg; chest yaw ±4 deg; torso within 5 deg of the gait's lean. Cost 3.2 -> 14.9 us/frame.
- Also: lean_speed 1.5 deg/(m/s) for running; lift 1.8/2.6; fold 85.

## Next (L1 extension, walking.md 9.5)
1. Seam budget plus pelvis into L1 (legs re-solved by L0).
2. COM path smoothing (linear momentum from the leg kick).
3. Upper-body inertia on direction changes.
4. Analytic Jacobian for cost.

## Blocked on
Owner's look at the "finished" version (M0.md 29), or continue the L1 extension first per the owner's "finish, then I tune".
