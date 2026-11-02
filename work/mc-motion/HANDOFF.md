# mc-motion handoff — 2026-11-02 late night

Project: /Volumes/SangHun/dev/notamovie. Design: docs/skeleton.md "관절은 사람 위치로" (new direction), docs/research/walking.md 9.1 (turning), 9.2 (short legs), 9.3 (terrain), 9.4 (MC walk = light jog). Owner checklist: docs/M0.md items 18-26.

## Owner decisions tonight
- Joints go to human positions; boxes follow the bone after the middle joint (leg box = shin). Vanilla look no longer constrains joint placement.
- MC walk is already running speed for these proportions (Fr 0.83 > the ~0.5 human walk-run switch; vanilla step = 1.44 leg lengths, a running step). So the base walk becomes a light jog and sprint a faster run. Running = bounce on a spring pillar (knee compresses mid-stance).
- Stairs later; direction change and walking first.

## State (all core tests pass: 41; built + installed in FO; NOT run in-game)
- Step 1 done: hip 2 px above the leg box top (HIP_LENGTH 2), knee 4.5 px into the box (LEG_DEPTH 4.5, 37.5%). The stance leg turns at the hip with the knee straight (pendulum 14 px).
  - Old hip-connector carry removed (no anatomical counterpart); carry is pelvis-only (CARRY 0.6, pelvis yaw 18.4 deg). CARRY_PELVIS knob removed (Style reindexed).
- Step 2 done: the swing knee bends only as much as keeps the foot off the ground (LIFT 0, FOLD 60 deg cap).
  - It bends after the final drop is known (no frame lag); the clearance rule lifts the body only past a fully bent knee.
  - Exact two-bone solve in the leg plane, bisection on the bend.
- Results: landing 41.6 -> 36.3 deg walk, 36.7 -> 32.7 sprint. Wave about unchanged (1.60 straight). Knee up to 43 deg in swing.
  - Seam 1.03 -> 3.95 px: the main visual risk (box top above the knee moves with the shin). Owner to judge in-game.
  - 30 fps cut stance-foot float 1.11 -> 0.31 px. Cost 1.40 -> 1.86 us/frame.
- Also fixed tonight:
  - a foot left in the air forever after some stops (5/61 positions), with a new test stopping at 40 points;
  - standing on stairs no longer releases pillars;
  - /nam depth range widened to 0-8.
- Stairs (deferred): standing on stairs still has cases with the closing step not landing (26/61, stairs only).

## Next
1. Owner in-game check of M0.md 25-26 (knee look, seam) and 18-21 (direction change).
2. Step 3: stance knee compression = light jog as the base walk (spring pillar), blended by Froude (walk below ~0.5).
3. Step 4: sprint as a faster run; step 5: cut = plant, sink, push.

## Blocked on
Owner in-game check of the knee look before building step 3 on it.
