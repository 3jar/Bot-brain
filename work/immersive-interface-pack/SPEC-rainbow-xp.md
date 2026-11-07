# II Rainbow XP add-on — spec (approved 2026-11-08)

Goal: give Immersive Interfaces' own XP bar a flowing rainbow fill. It replaces the owner's old "Animated Rainbow XP Bar" pack, which only fits the vanilla 182x5 bar.

- Resource pack "II Rainbow XP". It contains only textures/gui/sprites/hud/experience_bar_progress.png and its .mcmeta. No shaders. It goes directly above II in the pack list; the II background bar is untouched.
- Frames are generated from II's 182x9 progress sprite. Rows 0-7 keep their tone hierarchy: brightness is mapped from the source luminance and only the hue is replaced. The hue depends on x (one full rainbow across the bar) and shifts each frame, so the colors flow left. Transparent pixels are unchanged. Row 8 holds II's shader markers (1,7,0,2) and is copied verbatim into every frame.
- Animation: 24 frames, interpolate true, frametime 4, about a 4.8 s loop. 26.3 interpolates on the GPU with mix(a, b, t), so identical marker rows stay exact.
- The generator script lives in ~/dev/ii-rainbow-xp so the pack can be rebuilt if II's sprite changes.
- Verification: frame size, marker rows identical to the source, mcmeta valid, a visual preview strip. The in-game check is up to the owner.
