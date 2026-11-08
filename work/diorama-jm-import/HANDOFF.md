# diorama-jm-import handoff — 2026-11-08 09:45

Done: JourneyMap data for server "야생" (mchardcore.o-r.kr:25596) moved into Diorama 0.7.0 (MC 26.3, profile "Fabulously Optimized (2)").

## Result
- Waypoints: 14 JM waypoints appended to diorama/server-mchardcore.o-r.kr_25596-84d5ff54-world-5dee6aa60921803b/waypoints.json (owner confirmed visible in-game).
- Map: JM chunk_cache -> 26.3 .mca (tool ~/dev/diorama-jm-import/JmToMca.java) in void world saves/diorama-import-yasaeng; Diorama saved-chunk import baked overworld 1286 / nether 140 / end 498 tiles; 2402 tile files (lod0 + overviews) copied into the server map folder (447 MB). Skipped 27 empty tiles near spawn 100000,100000 and saved-chunks.bin/seen.bin.
- Store folder names: overworld/end `surface-50`, nether `under-roof-50` (pitch 50).
- Backups: pack-backups/diorama-야생-before-journeymap-import-20261108/ (08:59 original + server-folder-at-0942).

## Gotchas
- 26.3 chunk NBT palettes: plain string or {id, properties}; mixed lists wrap strings as {"": name}. Worlds live under dimensions/minecraft/<dim>/region; worldgen in data/minecraft/world_gen_settings.dat.
- Diorama SavedChunkImport uses 1 worker unless map screen open or game paused; End took long until owner opened the map.
- JM cache has no block light, so imported nether lacks warm lava glow until revisited live.

## Open
- Owner to confirm map shows on server; then optionally delete saves/diorama-import-yasaeng (~1.7 GB) and diorama/singleplayer-diorama-import-yasaeng-3ced858a (~450 MB) — ask before deleting.
