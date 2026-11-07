# immersive-interface-pack — HANDOFF (2026-11-08, round 2)

Profile: ModrinthApp/profiles/Fabulously Optimized (2), MC 26.3, Apple M2, OpenGL 4.1 Metal backend.

## State after round 1
II (GitHub main as of 11-07, plus generated lang files) is installed. The owner reports the hotbar is fixed, but every other GUI is still warped.

## Root cause (round 2)
- The II shaders get the quad corner from `(gl_VertexIndex - gl_BaseVertex) % 4`.
- MC 26.3 (renderpearl) compiles shaders to SPIR-V, then uses SPIRV-Cross to emit GLSL 330 for OpenGL. macOS GL 4.1 has no GL_ARB_shader_draw_parameters, and MC never sets the SPIRV_Cross_BaseVertex uniform, so gl_BaseVertex is 0.
- GuiRenderer puts every vertex format into one StagedVertexBuffer, with baseVertex = Mth.roundToward(byteOffset, stride) / stride, so it is often not a multiple of 4. The corners rotate and the GUI warps. The HUD hotbar happens to land aligned.
- Upstream issue #96 has the same symptom, caused by batching mods.
- The owner's new zip, resourcepacks/§6Immersive§8_§6Interfaces§8.zip, is official 0.8.2 (max_format 84). It is not 26.3-compatible; do not use it.

## Fix applied (untested in game)
- Built the local mod mods/quadalign-1.0.0+26.3.jar. Source is in ~/dev/quadalign.
- It is one @ModifyArg on StagedVertexBuffer.upload, at the first Mth.roundToward call: vertexSize -> vertexSize*4. Every draw then gets baseVertex % 4 == 0.
- Sodium's StagedVertexBufferMixin only wraps decodeSortingPoints, so no conflict.

## Pending (owner)
- Restart the game.
- Keep II above Redstone Tweaks; it is still below (II is #11, RT is #18).
- If the GUI is still warped after the restart, the alternative is Video Settings > Graphics API > Prefer Vulkan (Experimental), which loses Iris shaders. Next suspects after that: easegui and smoothgui.
