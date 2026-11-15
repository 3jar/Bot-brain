# smooth-toasts-mod handoff — 2026-11-15

Goal: Fabric 26.3 client mod. All toasts at top center as a card deck (vanilla sprites + soft shadow, smooth motion), covering HUD instead of top-right (JourneyMap minimap).

## State
- Repo ~/dev/smooth-toasts (local git, no remote), branch `deck-v1` (8 commits over main's spec/plan). Spec docs/superpowers/specs/2026-11-15-smooth-toasts-design.md, plan docs/superpowers/plans/2026-11-15-smooth-toasts.md.
- Jar INSTALLED: profile "Fabulously Optimized (2)"/mods/smoothtoasts-1.0.0+26.3.jar. Not yet run inside the full modpack.
- Build: `./build.sh` (plain javac vs Modrinth 26.3 libs; Gradle blocked). 4 main-based test suites pass.

## Verified (isolated vanilla 26.3 + Fabric API + test-only demo mod, scratch harness)
- Mixins apply, no errors. Top-center front card, enter-from-above with overshoot, deck peeks under front, leaving card flies up over the incoming one, unknown modded toast class works.
- Bug found + fixed: timer-less TutorialToast held the single front forever. Now a front fully visible > 6 s (×display multiplier) yields; it waits behind dimmed and returns later (verified).
- Shadow needs fabric-resource-loader-v1 (declared dependency); without Fabric API it rendered as missing texture.

## Not verified
- Full modpack compat (Sodium Extra toast filter, Puzzles Lib AddToastCallback, ImmersiveUI advancement mixin), F1 hide, vanilla NowPlaying music toast untouched, GUI scales 2/3/4, container screens, real advancement/recipe toasts.

## Next step
Owner launches the game: `/advancement grant @s everything`, `/recipe give @s *`, Ctrl+B. If issues: grep logs/latest.log for smoothtoasts / Mixin apply failed. Tunables all in ToastStyle.java.
