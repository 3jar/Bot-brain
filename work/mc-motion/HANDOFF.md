# mc-motion handoff — 2026-11-01 (to the animation session)

Project: /Volumes/SangHun/dev/notamovie (Fabric 26.1.2, plain javac via build.py, no git commits yet).

## Read first
- docs/skeleton.md: the rig in one place. 12 joints, 6 whole vanilla boxes on short boxless connectors (neck/clavicle/hip 3 px, spine 2 px, not final). Covers coordinates and signs (measured pivot shifts), render pipeline, closed-form task solutions, gait facts, optimization rules, decided/open items, code map.
- Background: docs/research/direction.md (decisions), realtime.md (costs, gait geometry, pose cache), motion-synthesis.md (survey). In-game checklist: docs/M0.md.

## State
- Core: Skeleton/Pose/Fk/Parts/Euler + Gait; 21 tests pass (`python3 build.py test`).
- Two render paths today: skeleton path (replaces all 6 parts, vanilla arm poses are lost) and the gait overlay (`/nam walk b|c`, keeps the vanilla pose). Unifying them is open.
- Not yet run in game: the connector rig, gait B/C, bones view.

## Owner rules for animation
- Do not split boxes; no elbows or knees; avoid realistic RPG-style motion (Better Combat, Epic Fight). Liveliness comes from 1-2 px pivot motion of connectors.
- Optimize first; no ecosystem generalization until M5.

## Next
- Owner: pick connector lengths and gait B or C in game. Then bake the lengths as defaults; start M1 locomotion.

## Blocked on
Owner in-game check.
