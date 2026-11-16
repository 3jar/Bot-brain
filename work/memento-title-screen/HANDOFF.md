# memento-title-screen handoff — 2026-11-17

Goal: Fabric 26.3 client mod "Memento". On world exit, shoot a good moment (third-person, Iris shaders temporarily on), save color+disparity. Title screen = left cinematic layout + DepthFlow parallax background + Continue.

## State
- Repo ~/dev/memento (local git, main). Commits: spec 0743412, spec amendments 7cc69a6, phase 1 plan f2b5cbd.
- Spec: docs/superpowers/specs/2026-11-17-memento-design.md (owner approved).
- Plan: docs/superpowers/plans/2026-11-17-memento-phase1.md (12 tasks, full code). No code written yet.
- Waiting: owner picks execution mode (subagent-driven vs inline).

## Key verified 26.3 facts (details in plan "API facts")
- Screens open via minecraft.gui.setScreen (Gui), not Minecraft.setScreen.
- GUI renderer accepts custom GuiElementRenderState via GuiGraphicsExtractor.guiRenderState (private, accessor). TextureSetup.doubleTexture + BindGroupLayouts.SAMPLER0_SAMPLER1 → two-sampler custom pipeline.
- Params via vertex data: camera offset packed 16-bit/axis in vertex color, fade in vertex z.
- NativeImage can't read 16-bit PNG → depth stored as 8-bit disparity (255 near).
- Mod Menu / Main Menu Credits / Reimagined Intro hook TitleScreen.init/extractRenderState by mixin; our subclass overrides without super, so they are bypassed.
- Shader compile check: ~/dev/mc-shader-harness/run.sh (shaderc like renderpearl).
- Isolated client: harness/run.sh in plan launches KnotClient directly from Modrinth meta (classpath via tools/classpath.py), -Dmemento.harness=1 makes title screen screenshot + quit.

## Next step
Execute plan Task 1..12. Task 7 is the risk checkpoint (custom pipeline renders in real client); stop and report if it fails.
