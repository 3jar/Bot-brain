# mc-motion handoff — 2026-11-01

## Mod

- Name: "This Is Not a Movie", mod id `notamovie`.
- Project: `/Volumes/SangHun/dev/notamovie`. Git is initialized; nothing is committed.
- Owner decisions:
  - EMF is dropped.
  - The algorithm is the product; add-ons come via resource packs later.
  - Ecosystem work goes last (M5). Optimize first.
  - Lively Eyes is dropped from the plan.

## State: M0 built and installed, awaiting the owner's in-game check

- Core (pure Java, tests `python3 build.py test`, 14 passing):
  - Skeleton: 15 joints including pelvis, spine, neck and clavicles.
  - Pose (3x3 local rotations), Fk, Parts (6 top-level parts plus forearm and shin children).
  - Euler: ZYX decomposition, verified against JOML rotationZYX.
  - LimbSplit (box split math).
- Adapter mixins:
  - `AvatarRenderer.extractRenderState` TAIL: solve, then store the parts in the render state (`RenderStateDataKey`).
  - `PlayerModel.setupAnim` TAIL: apply the parts.
  - `createMesh` / `createArmorMeshSet` RETURN: split the limbs.
  - `translateToHand` HEAD: add the forearm transform.
  - `renderHand` HEAD: straighten the lower limbs.
- Debug client commands: `/nam on|off|demo on|off|set|reset|stats`.
- Installed into the clean Modrinth profile "Fabulously Optimized" (folder `profiles/Fabulously Optimized`). `instance.txt` points there.
- Note: folder "Fabulously Optimized (2)" is the full 109-mod instance, shown in the app as "26.1.2 MC optimized".

## Gotchas

- `setupAnim` runs several times per frame (body, then each armor model at deferred render time). Solve only in extract; `setupAnim` only copies.
- FO bundles EMF and ETF. If the split doesn't show, test with them disabled.
- The first-person `renderHand` draws the shared model's arm without `setupAnim`.

## Docs

- `docs/M0.md`: in-game checklist (Korean).
- `docs/research/{direction,motion-synthesis}.md`

## Next

1. The owner runs the `docs/M0.md` checklist.
2. Fix whatever breaks.
3. Decide the render backend.
4. M1 locomotion: phase from real distance, foot locking, two-bone IK.
