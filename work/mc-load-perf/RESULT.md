# mc-load-perf — JFR startup profile (2026-11-18 04:37, 26.3, 272 mods, M2 8c/16GB)

Recording: /tmp/mc-startup.jfr (120s, settings=profile). Owner added `-XX:StartFlightRecording=duration=120s,filename=/tmp/mc-startup.jfr,settings=profile` to Modrinth instance Java args; should be removed after.
Startup timeline: launch 0s, reload start 15s, atlas 27s, overlay removed 39s.

## CPU (machine total)
- 0-15s init: 40-60%
- 15-27s reload prepare: 94-100% (only phase that saturates the machine)
- 27-39s reload apply: 20-35% => single-thread render-thread bound, machine mostly idle

## Render-thread hotspots (sampled)
1. Punchy (punchy-fpa, third party) `PunchyTuningConfig.loadAndApply -> buildMixCatalog -> listResourceStacks` scans every zip pack's full entry list. Runs 3x per startup: ClientTick handler during prepare (16-27s), reload listener (28-35s), ClientTick again (36-39s). ~12s of render-thread time. Root cause of the early loading-screen freeze.
2. Font provider selection (FontSet.selectProviders) runs twice: vanilla FontManager.apply (~2s) + ImmediatelyFast `checkResourcePackCompatibility -> reloadFontStorages` (~2s) because Immersive-Interfaces pack is incompatible with font_atlas_resizing (config/immediatelyfast.json font_atlas_resizing=true).
3. Init: libjf-unsafe AsmTransformer InterfaceImplTargetPatch scans interfaces for every loaded class (~3s); libjf needed by respackopts (used by Fire_Rekindled, Redstone Tweaks, Untitled Punchies) and async-pack-scan.
4. Smaller: MoreCulling cache clear, Punchy Moves clips, EMF, fabric-registry-sync mixin.

## Worker (prepare) hotspots
polytone directory scans, fusion connecting-texture baking (Rechiseled CTM), DFU BaseMapCodec decode, zip listing (DirectoryLister), font load, EMF resource caching.

## GC
82 GCs in first 45s, 1.7s total; G1Full from System.gc() 0.35-0.6s at ~66s/69s/104s (world join), not during loading screen.

## Proposed fixes (not applied)
- immediatelyfast.json font_atlas_resizing=false (removes second font rebuild, ~2s per reload).
- Punchy: report to author / test without; biggest single win (~12s).
