# mc-spotify handoff — 2026-11-09

Goal: control the macOS Spotify app from the MC 26.3 Options screen (owner chose: side panel + track-change toast). Spec: work/mc-spotify/SPEC.md.

## State
- Source: ~/dev/mc-spotify (not a git repo). Build: `./build.sh` (plain javac against Modrinth meta 26.3 client jar + libs + fabric-api nested modules; runs SpotifyBackendTest incl. a live osascript query). No Gradle.
- Installed: profile "Fabulously Optimized (2)"/mods/mc-spotify-1.0.0+26.3.jar. MC was running during install -> takes effect after restart. NOT yet seen in-game.
- No mixins. Fabric ScreenEvents.AFTER_INIT adds SpotifyPanel to OptionsScreen via Screens.getWidgets (removeIf old one first; AFTER_INIT also fires on resize).

## Design notes
- SpotifyBackend: osascript per call, guarded by `application id "com.spotify.client" is running`. AppleScript var names must avoid reserved words (`st` broke compile -> vState etc.).
- SpotifyController: one daemon worker; optimistic local edits bump an epoch, overlapping polls are discarded. Poll 1 s while panel drawn, 3 s idle, 5 s offline. Volume drag coalesced.
- AlbumArt: HttpClient + ImageIO (NativeImage.read is PNG-only), box-filter to 160 px, DynamicTexture drawn with blit(view, LINEAR sampler). Evicted textures closed on next client tick.
- 26.3 API: GuiGraphicsExtractor (not GuiGraphics), extractWidgetRenderState, mc.gui.setScreen / mc.gui.toastManager(), RenderSystem.getSamplerCache().

## Next step
Owner restarts MC, approves the macOS "control Spotify" Automation prompt (likely attributed to Modrinth App), opens Options. Check panel layout, seek/volume drag, toast on track change. If broken, read logs/latest.log for "mcspotify".

## Risks
UI never rendered yet (pixel icons, layout math). If the margin is narrow the panel falls back to a 20x20 button at top-right opening SpotifyScreen.
