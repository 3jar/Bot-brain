# mc-motion handoff — 2026-11-02 late night (step 3 done)

Project: /Volumes/SangHun/dev/notamovie. Design: docs/skeleton.md "관절은 사람 위치로"; docs/research/walking.md 9.1 (turning), 9.2 (short legs), 9.3 (terrain), 9.4 (MC walk = light jog, steps 1-3). Owner checklist: docs/M0.md items 18-28.

## Owner decisions
- Joints at human positions; boxes follow the bone after the middle joint (leg box = shin).
- MC walk is a light jog; sprint a faster run; sneak stays a walk.
- Stairs later; direction change and walking first.

## State (43 core tests pass; built + installed in FO; NOT run in-game)
- Steps 1-2 (knee): hip 2 px above the leg box, knee 4.5 px in (37.5%). The stance leg turns at the hip. The swing knee bends only to keep the foot off the ground, solved after the final drop.
- Step 3 (jog):
  - Gait chosen by Froude (walk below 0.3, jog above 0.5, blended). Walking duty 0.5 with a straight stance knee.
  - The jog: duty 0.38 (sprint 0.30), with the stance knee giving spring·sin(pi·u/duty), 30 deg (sprint 40). New knobs spring, spring_sprint.
  - A bent stance leg is solved as a shorter stick (solveLeg); the heel-to-toe roll follows the shin.
  - Fixes:
    - the landing prediction includes the landing frame's knee give;
    - the matched landing pitch is kept after the other foot pushes off;
    - push-off is decided with a one-frame lookahead (fixed the start-of-walk pelvis spike);
    - world continuity holds in flight over unknown ground.
- Results vs session start:
  - landing 41.6/36.7 -> 29.1/22.3 deg (walk/sprint);
  - bounce 1.58/2.13/1.89 -> 0.99/1.34/1.59 px (straight/curve/diagonal);
  - 30 fps cut float 1.11 -> 0.17 px;
  - seam 1.03 -> 4.20 px;
  - cost 1.40 -> 2.01 us/frame.
- Known limit: the bounce is still walk-shaped (highest at mid-stance). The long MC stance (+/-29 deg) outweighs a 30 deg knee, and a box with no ankle tilts toe-down when the knee bends, so the toe corner lifts the body back. Inverting it needs about 60 deg of knee (seam over 5 px) or duty under 0.3. Owner's call.

## Next
1. Owner in-game check: M0.md 25-28 (knee look/seam, jog feel), 18-21 (direction change).
2. Step 4: sprint as a faster run (tune); step 5: the cut as plant, sink, push (uses the stance knee).
3. Later: stairs (deferred), L1 upper body.

## Blocked on
Owner in-game check.
