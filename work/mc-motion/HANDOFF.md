# mc-motion handoff — 2026-11-02 late night (running is the base gait)

Project: /Volumes/SangHun/dev/notamovie. Design: docs/skeleton.md "관절은 사람 위치로"; docs/research/walking.md 9.4 (step 3: running is the base). Owner checklist: docs/M0.md items 18-28.

## Owner decisions
- Joints at human positions; boxes follow the bone after the middle joint (leg box = shin).
- Labelled walking, but the gait used is running ("뛰어다니는 것"); sprint runs bigger; sneak stays a walk.
- In-game verdict on the light-jog version: "no running feel, looks like very fast walking, a support always on the ground". That led to the rewrite below.
- Stairs later.

## State (43 core tests pass; built + installed in FO; owner testing in-game)
- Running = spring pillar.
  - Stance: the body targets a line from its landing height to the straight leg's push-off height, minus `spring` px (sin, mid-stance). The planted knee bends exactly for it (bisection, cap 50 deg). The body is never above what the straight leg holds.
  - Flight: lands exactly on the next pillar's predicted ask, rising `air` px on the way (back to 0 on the last frame aloft).
  - Swing: heel kick, foot up `lift` px early (sin(pi s^0.6)), knee cap `fold` 110. The kick fades with acceleration (0 at 20 b/s^2) and with motion askew to facing (0 at 45 deg).
  - Sprint knobs: duty_sprint, spring_sprint, air_sprint, lift_sprint.
  - C2: duty 0.36/0.30, spring 0.3/0.4, air 0.6/0.9, lift 2.5/3.5.
- No-ankle handling:
  - on the toe, the knee is solved only from the length-maximizing bend (atan(2/7.5) = 15 deg) up;
  - the swing knee starts from that push-off bend;
  - the heel-to-toe roll happens once per stance while moving (it used to flip-flop).
- Results vs session start:
  - landing 41.6/36.7 -> 27.4/22.3 deg; both feet up 29%/38%; foot kick 2.5/3.5 px; bounce now running-shaped (lowest on the leg, highest aloft);
  - slide 0, landing float 0, stairs and stops intact;
  - cost 1.40 -> 3.2 us/frame.
- Main risk: the seam reaches 7.9/8.6 px. The ~100 deg heel-kick knee swings the 4.5 px of box above the knee. Cut leg spacing is down to 2.2 px (test threshold lowered 2.4 -> 2.0 with that reason).

## Next
1. Owner in-game verdict on the run feel and the seam (M0.md 27-28). Knobs: lift, fold, spring, air, duty, depth leg.
2. If the seam reads broken: lower the kick, or move the knee up (depth leg), or split the trade into the L1 whole-body objective.
3. Then step 5: the cut as plant, sink, push.

## Blocked on
Owner in-game check.
