# mc-motion handoff — 2026-11-01 (night)

Project: /Volumes/SangHun/dev/notamovie. Docs: docs/skeleton.md (rig, C2), docs/research/data-driven.md (new direction proposal).

## State
- C2 gait (13-joint hidden skeleton, contact solver) built, 24 tests pass, installed in FO, not yet run in-game.
- Owner does not want to hand-author motions; goal is partial-motion optimization + motion matching. Proposal written (data-driven.md): 100STYLE (CC BY 4.0, XSens 60 fps, 23 joints, FW/BW/SW/FR/BR/SR/ID/TR) -> two-stage retarget (offline normalize in Python tools/, runtime map in Java core so skeleton tweaks re-map instantly) -> playback viewer (/nam play) for skeleton tuning -> warping + blend space -> motion matching; legs always from C2 contact solver; actions via partial optimization with MM pose as prior.
- Key numbers: in leg-length units MC sneak ~= human walk (time x1.01), MC walk ~= human run (time x1.14) or human walk x1.75; MM brute search ~13 us/player/frame for 20k frames.

## Next
- Owner decisions in data-driven.md sec. 11 (adopt route, download permission + location, runtime retarget, first scope Neutral ID/FW/FR).
- Then D0 download, D1 BVH tools + human reference sheet.

## Blocked on
Owner decisions; in-game check of C2 still pending.
