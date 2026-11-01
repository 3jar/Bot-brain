# mc-motion handoff — 2026-11-01 (late)

Project: /Volumes/SangHun/dev/notamovie. Main design doc: docs/skeleton.md (sec. 2, 2.1, 5).

## State
- Owner direction: B too fast, dropped. Go with C cadence (vanilla step 18.85 px, 3.66 steps/s) and minimize the pelvis wave with the hidden skeleton. Hidden skeleton follows human joint layout; its lengths, participation ratios and strengths must be fully controlled (named params, hard ranges, measured output in px).
- Skeleton now 13 joints (waist = lumbar added; spine = lumbar 1 px + thoracic 1 px) + virtual sole-corner contacts.
- core/Gait rewritten: sole-corner rocker (heel->toe), pelvic rotation + hip connector carry, pelvic list, sway, torso steady (waist/chest), straight feet, clavicle swing. Style = 13 clamped params, presets b/c/c2. Meter per stride.
- Measured (144 fps walk): C wave 4.53 px -> C2 1.51 px, feet planted (slide <0.05 px), 0.75 us/frame. 24 tests pass.
- client/Walk now lays hidden-skeleton FK deltas over vanilla setupAnim (keeps attack/items/crouch). Commands: /nam walk b|c|c2|off, /nam walk set|help NAME, /nam meter; bones works over walk. Installed in FO; NOT run in-game yet.
- Pose cache (decision 3) parked by owner.

## Next
- Owner in-game check per docs/M0.md "걸음 실험 (C2 중심)", tune via /nam meter.
- Then: side-stepping, slopes/stairs foot planning (discussed, feasible, analytic), neck nod.

## Blocked on
Owner in-game check.
