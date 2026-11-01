# mc-motion handoff — 2026-11-02

Project: /Volumes/SangHun/dev/notamovie. Design: docs/research/walking.md sec. 9 (three layers, status, next). Scope: own avatar, 3rd person, walking.

## State
- Adopted the three-layer design from the other session (L0 root contact / L1 Fourier cycle baked offline / L2 event-driven segments), with one change: L0 pillars are fixed in world 3D, not by 1D distance phase.
- L0 done in core/Gait: world anchors, closed-form 3-axis rigid-leg solve (pitch/twist/roll), steps along actual movement direction, stair step-up by meeting the new pillar at current body height (only when ground rose >1 px above the holding pillar; doing it every step locks a long/short limp, and inferring stairs from height gaps ran away on diagonals), inertialized hand-over.
- L2 done: modes WALK/STOP/STAND/AIR. Standing = mid-stride, so starts begin at phase 0.25/0.75 (half first step). Standing re-step rule (>2 px off hip or >30° twist) gives closing steps and turn-on-the-spot steps. Planned stop for the local player: rest point = tick pos + v/(1 - friction*0.91), swing foot progress matched to distance left.
- Fixed earlier: 6.25% foot drag from world-vs-model pixel units (model drawn at 15/16).
- 31 core tests pass (slide <0.05 px in world for straight/back/curve/diagonal/sneak/stops/turn-in-place/start; stair pelvis jump <0.5 px). ~1.0 us/frame. Installed in FO; not yet run in-game.

## Next
1. Split L1 out of Gait (hidden-joint generators -> phase/speed/direction -> channels interface; current sin formulas as default).
2. Define the offline objective (vertical angular momentum balance, head stability, vanilla budgets, smoothness, rest prior; masses = box volumes).
3. Optimizer + harmonic-order bench (target <0.1 px).
4. Double support (removes 0.03-0.25 px hand-over float), Ground terrain queries.

## Blocked on
Owner in-game check (docs/M0.md items 10-14).
