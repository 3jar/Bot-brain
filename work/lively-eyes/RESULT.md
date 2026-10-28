# Lively Eyes — result (0.1.0, 2026-10-28)

## What
Original Entity Model Features (EMF) resource pack that gives Minecraft player models reactive eyes and head motion, plus the optional Fabric mod "Lively Eyes Bridge" (zoom). Release author name: Tokid.
- Compatible with Fresh Animations Player (fills FA's `player_face.jpm` slot; FA must sit ABOVE Lively Eyes in the pack list) and with Fresh Moves skins (reads their eye-slot UV layout). Also works standalone.
- Owner's positioning: FA-compatible, not an FA add-on; original work, no FA/FM files.

## Where
- Source: `/Volumes/SangHun/dev/mc/lively-eyes` (external SSD). Git repo, first commit `696478d` "Lively Eyes 0.1.0", local only (not pushed).
- All future MC mod/pack projects: `/Volumes/SangHun/dev/mc/<project>`.
- Test instance: path in `/Volumes/SangHun/dev/mc/instance.txt` (Modrinth profile "Fabulously Optimized (2)"), or `$MC_INSTANCE`; read by `src/lively_eyes/instance.py`.
- Build pack: `PYTHONPATH=src python3 -m lively_eyes.build --install` → `dist/LivelyEyes-0.1.0.zip` + copy into the instance's resourcepacks.
- Build mod: `PYTHONPATH=src python3 -m lively_eyes.build_bridge --install` → `dist/LivelyEyesBridge-0.1.0.jar` + copy into mods. Plain `javac --release 25` against the instance's MC/EMF/ETF jars (MC 26.1 is unobfuscated, no Gradle). JDK: `~/dev/jdks/jdk-25.0.4.1+1`.
- Tests: `python3 -m unittest discover -s tests`. 68 tests; a Python EMF-expression compiler + frame simulator (standalone and mock-FA modes).
- Repo docs: `README.md` (= the Modrinth description), `docs/DESIGN.md`, `docs/SKIN_FORMAT.md`, `docs/RELEASE.md` (checklist), `docs/DEMOS.md` (GIF shot list). `art/`: icon, GIFs.

## Shipped in 0.1.0
- Gaze: eyes lead, lagged head follows (deadzone 12°, speed trigger 120°/s); pupils overshoot past eye edges. Head is injected into FA through `var.idl_headry/rx/rz`, with readback of `var.head_ry/rx`.
- Blinking: hazard model from dryness, tension and fatigue, plus reflex blinks.
- Idle glances: eyes only (`tilt_prob` 0), and only when fully idle.
- Dozing timeline:
  - 45 s idle: drowsy lids.
  - From ~65 s: nodding off (head sinks to 22°, then jerks up with a blink) and yawns.
  - 150 s: asleep, head droops 12°.
  - Any input wakes the player with a startle.
- Reactions:
  - Hit: flinch and wide eyes.
  - Falling: wide eyes, looking down.
  - Hard landing: head dip.
  - Attack swing: effort push and squint.
  - Panting after exertion.
  - Surfacing: head shake and a blink burst, only after ≥3 s with the head under water. Head depth is eye height vs the water top; flips need 0.15 s to settle.
- Squints: rain, Nether, sun glare, water.
- Bed: eyes shut via `nbt(SleepingX,exists:true)` (`config.BED_NBT`).
- Zoom squint: the bridge reads Zoomify's divisor or the spyglass and writes `global_var.le_zoom`.

## Switched off for 0.1.0 (code kept, `config.py`)
- `BROWS`: brows looked odd. When on, they are drawn over the bangs at z -4.85.
- `GESTURES`: crouch spam / nod / head shake. Without brows these faces only half-close the eyes. Bring back after brows are developed.
- `CONTACT`: eye contact between players. No good use yet.
- Tests pass in all 8 switch combinations. `ReleaseSwitchTest` checks that a switched-off feature leaves no trace in the build.

## Release state
- Minecraft 26.1–26.1.2 (resource format 84). All Rights Reserved (`LICENSE.txt`).
- Modrinth: two projects (pack + bridge mod). The pack project is a draft for moderation review; a moderation message was drafted for the owner.
- README placeholders still to fill before review: `REPLACE_WITH_PACK_ORDER_IMAGE_URL`, `REPLACE_WITH_BRIDGE_PROJECT_URL`.
- Objective overlap check vs Fresh Moves 3.1.1:
  - Expressions: none shared beyond constants.
  - Variable/part names: none shared except the vanilla `head`.
  - Boxes: 0 identical.
  - Only the skin UV slot positions are shared, which is format compatibility.
- Never distribute `resourcepacks/Fresh Moves v3.1.1 (Eye-Head Gaze).zip` in the instance. It is FM-derived, an early experiment.

## In-game status
- Seen working:
  - Eye placement and pupil direction.
  - Gaze/head lag, including vertical and under FA.
  - Pupil overshoot.
  - Glances.
  - Dozing (before nodding was restored).
  - Surfacing reaction.
  - EMF accepts the `nbt()` expression.
  - The bridge mod loads without crashing.
- Not seen yet:
  - Bed eyes.
  - Zoom squint.
  - Panting.
  - Landing and swing reactions.
  - Rain and Nether squints.
  - Yawns.
  - Restored nodding.
  - The bobbing fix for surfacing.
  - Head roll direction.

## Side work in the same session
- Skin edit for the owner: `char (2).png` head moved onto `d50715eb6d0b1849.png`, hair and brows flat black. Output: `d50715eb6d0b1849 (black hair head).png` in the instance folder.
- Demo GIFs made from screen recordings with ffmpeg (crop, fps, palette); uploaded to Modrinth CDN by the owner.
