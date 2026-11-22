# minecraft-perf — resource hogs (non-shader), 2026-11-22

Profile: ModrinthApp/profiles/Fabulously Optimized (2), MC 26.3, Apple M2 16GB, Xmx 7040MB.
Source: JFR /tmp/mc-startup.jfr (launch arg in instance_launch_overrides), in-game window 10:02:56-10:03:59 on mchardcore, ToonShader on, 2 shader reloads inside window. Scripts: session scratchpad analyze.py / packs.py (leaf = first mod frame from top of stack).

## Mods (measured)
- BetterGrassify: 52% of Chunk Render Task Executor samples, 7.1GB of 16.2GB allocated (44%). Hot: BetterSnowUtils.getLayerNeighbour. betterGrassMode already OFF; betterSnowMode LAMBDA is the cost.
- punchy-moves 1.0.6-hotfix: 9.5% main-thread Java samples, 1.47GB alloc. Hot: ConflictingAnimationsState.normalize(String) per tick. Owner ignored update 1.0.9b.
- enchantment-glint-outline 3.3 port (owner's): 2.1% main, 1.04GB alloc. Hot: VertexHelper.growFace per frame.
- JourneyMap: ~7% of all samples (IO-Worker, JM-task, main), 609MB alloc.
- MoreCulling: 15.7% chunk build (inflated by Better Ores 3D faces); keep.
- AmbientSounds: own thread, AirPocketScanner.scan, 84 samples.
- Litematica 3% main; Interactive Stuff 2.7% main + 5888 ReturnException throws (80% of all exceptions); Atmospherics 6.7% main (already disabled since).
- GC: 116 GCs in 63s, ~257MB/s allocation; heap peak used 2.8GB, RSS peak 3.8GB. System.gc() full GCs 0.43-0.55s right after shader reloads.

## Resource packs (measured from enabled list, top-wins overlay)
- blackhole + sun_moon (1).zip: 9 x 2048^2 celestial textures -> celestials atlas 16384x8192 = ~512MB VRAM (at M2 GL max texture size).
- Better Ores 3D: avg 115 elements per ore model, iron_ore 852 faces.
- RAYs 3D Rails: 8229 block models (mostly Railcraft, not installed) -> reload parse cost + failed-model log spam.
- Immersive-Interfaces ~56MB GUI textures; Torta's Glint 16MB; Fresh Textures 12.8MB.
- blocks atlas 8192x4096 mip4 (~170MB).

Not changed anything. Offered: betterSnowMode OFF, downscale sun/moon to 512px, cache glint outline geometry.
