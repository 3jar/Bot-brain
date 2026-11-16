# memento-title-screen handoff — 2026-11-17 (phase 1 built, awaiting owner in-game check)

Goal: Fabric 26.3 client mod "Memento". Phase 1 = cinematic left-aligned title screen over depth-parallax shots + Continue. Phase 2 = exit shoot (Iris on, third person). Phase 3 = moment algorithm.

## State
- Repo ~/dev/memento (local git, no remote). Branch `phase1` (HEAD 359ccc2), not merged to main. Spec docs/superpowers/specs/2026-11-17-memento-design.md, plan docs/superpowers/plans/2026-11-17-memento-phase1.md (see "Execution notes" at the end for every deviation).
- Build: `./build.sh` (plain javac, 9 main-based test suites pass). Jar build/libs/memento-0.1.0+26.3.jar.
- INSTALLED in profile "Fabulously Optimized (2)": mods/memento-0.1.0+26.3.jar (sha256 568c0a61…) + memento/ with 2 placeholder shots (Cherry Blossom panorama faces + synthetic depth, worldId "New World"). Not yet launched in the real pack.

## Verified (isolated client: vanilla 26.3 + Fabric API + Memento, `harness/run.sh`)
- Custom two-sampler GUI pipeline (DepthFlow) draws; near band shifts 16 px vs 2 px far between frames; gallery crossfade + caption; layout, footer, Continue subtitle, focus bar.
- Both title-screen paths are swapped: explicit TitleScreen and setScreen(null) → internal `new TitleScreen()`.

## Not verified (needs owner launch in the real pack)
- Reimagined Intro flow: intro plays (hook on TitleScreen.init HEAD, reached via our super.init()), then onIntroFinished → TitleScreen(true) → cinematic screen with fade.
- Mods entry (Mod Menu by reflection), Main Menu Credits text gone, EaseGUI double animation, Blur, Controlify navigation, Continue → "New World".

## Gotchas
- With RRLS the first title screen is created inside Gui.setScreen(null) during Minecraft.<init>; a HEAD-only swap misses it.
- Launch harness clients with cwd = game dir (log4j + several mods write cwd-relative logs/ and config/).
- `harness/run-pack.sh` (clones of pack mods) is NOT a usable gate: never leaves Reimagined Intro's IntroScreen (frames not rendered while the window is covered), EuphoriaPatcher overwrites the clipboard with a download link, window opens full-screen size. Do not rerun as is.
- A built-in safety check blocks `rm` with relative globs after `cd`; harness scripts delete nothing.

## Next step
Owner launches the pack and runs the Task 12 checklist. Then: read `logs/latest.log` (grep -iE "memento|mixin apply failed|InvalidInjection"), fix reports, merge `phase1`, write the phase 2 plan (exit shoot).

## Leftovers the owner may delete
~/dev/memento/harness/run (small) and ~/dev/memento/harness/run-pack (~320 MB of APFS-cloned jars).
