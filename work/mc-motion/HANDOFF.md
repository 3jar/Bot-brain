# mc-motion handoff — 2026-11-01

Active topic: mc-motion. This is a new Fabric mod for Minecraft 26.1.x that generates third-person player motion. Inputs are body state, partial intent (e.g. a hand target) and game-style exaggeration; the rest of the body is solved by optimization.

## Decisions (owner, 2026-11-01)

- EMF is dropped. The mod computes and applies the pose itself.
- The algorithm is the product. Per-joint motions (arms etc.) come later as add-ons via resource packs.
- Ecosystem work (formats, API, sync, tools) goes last (M5).
- During development, ignore the ecosystem and optimize as much as possible.
- Rig: only the 6 vanilla boxes. Arms and legs split into halves for elbows and knees. Intermediate joints (neck, clavicles, pelvis, hips, waist) exist only in the solver skeleton.

## Docs (Korean, local)

- `/Volumes/SangHun/dev/mc/research/direction.md`: decisions, 26.1.2 hook points, optimization rules, milestones M0–M5.
- `/Volumes/SangHun/dev/mc/research/motion-synthesis.md`: research survey, algorithms, licenses, open-source list.

## Open decisions

- Relationship with Lively Eyes (absorb / mutually exclusive / yield head only).
- v0 render backend: vanilla ModelPart, or custom geometry if M0 fails.

## Next step

M0 spike, after the owner says go:
- solver FK
- in-game joint debug render
- mesh split via `PlayerModel.createMesh`
- joint sliders
- check that held items (`translateToHand`), armor, cape, head items and parrots attach correctly
- measure the cost per player

Use a Mannequin to test the remote-player path. Check whether plain-javac builds with mixins work on unobfuscated 26.1 (no refmap expected).

Blocked on: owner go-ahead for M0.
