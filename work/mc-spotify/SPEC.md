# mc-spotify — spec (2026-11-09, owner-approved choices)

Client-only Fabric mod for MC 26.3 (profile "Fabulously Optimized (2)") that controls the macOS Spotify desktop app from inside Minecraft.

## Control backend
- AppleScript via `osascript` (ProcessBuilder) on a single daemon worker thread. No OAuth, no Premium needed.
- Guard every script with `if application id "com.spotify.client" is running` so the mod never launches Spotify.
- State: player state, track name/artist/album, duration ms, position ms, volume, shuffling, repeating, artwork url, track id. Fields joined by char 31.
- Commands: playpause, next/previous track, set player position, set sound volume, set shuffling, set repeating.
- Errors: -1743 (Automation not authorized) -> panel shows hint (System Settings > Privacy & Security > Automation). Not running -> "Spotify not running".

## UI (owner chose: side panel in Options screen)
- On OptionsScreen: mini player panel in the empty right margin: album art, title/artist (scrolling), seekable progress bar, shuffle/prev/play-pause/next/repeat, volume slider.
- If the right margin is too narrow: a small "Spotify" button instead, opening a dedicated SpotifyScreen with the same panel.
- Local progress interpolation between polls. Poll 1 s while panel visible, 3 s otherwise.

## Extra (owner chose): track-change toast
- Custom toast with album art + title + artist when track id changes while playing.

## Not in scope
- Hotkeys, ESC-menu panel (owner did not pick them).
