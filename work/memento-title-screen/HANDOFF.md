# memento-title-screen handoff — 2026-11-17

Goal: Fabric 26.3 client mod "Memento" (working name). On world exit, pick a good moment from the session, shoot it from a composed third-person angle with Iris shaders temporarily on, save color+depth. Title screen = left-aligned cinematic layout + depth-parallax (DepthFlow) background + Continue entry.

## State
- Brainstorming done, owner approved all design sections.
- Spec committed: ~/dev/memento/docs/superpowers/specs/2026-11-17-memento-design.md (repo ~/dev/memento, local git, commit 0743412).
- Waiting: owner review of the written spec. Then writing-plans skill → plan for phase 1.

## Owner decisions
- Auto capture; play records only, shoot happens at exit (pause-menu Save&Quit / Disconnect only).
- All moment signals; multiple recipes (vista, golden hour, home, event, portrait), score + weighted random.
- Gallery: keep newest 30, newest first, crossfade rotation.
- Layout: left cinematic text list; Continue added; Realms removed.
- Phases: 1 title+parallax, 2 exit shoot (portrait only), 3 algorithm.

## Facts checked
- Iris 1.11.7 api.v0 has IrisApiConfig.setShadersEnabledAndApply(boolean), isReverseZDuringShaders().
- MC 26.3 RenderTarget exposes getDepthTexture(); GPU API is com.mojang.renderpearl (GL + Vulkan backends).
- Owner plays with shaders OFF (iris.properties enableShaders=false; pack Complementary Reimagined + Euphoria) → capture depth first, then enable shaders for color.
- Title-screen touching mods in pack: Mod Menu (modify_title_screen), Main Menu Credits, Reimagined Intro (TitleScreenMixin, PanoramaMixin), EaseGUI, Blur, Cherry Blossom Panorama RP.

## Next step
After owner approves spec: invoke superpowers:writing-plans; phase 1 starts with renderpearl custom pipeline + fragment shader spike.
