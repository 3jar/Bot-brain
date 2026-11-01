# mc-motion handoff — 2026-11-01

Project: /Volumes/SangHun/dev/notamovie (Fabric 26.1.2, plain javac via build.py, no git commits yet).

## State
- Cost research done: docs/research/realtime.md (procedural 0.53 us, hybrid DLS 4.2 us per avatar per frame; benches in docs/research/bench/).
- Owner decisions: compare gait B vs C in-game (A dropped); M0.5 on hold; whole-body optimization via shared state-keyed pose cache (sec. 11).
- Implemented gait experiment: core/Gait.java (+GaitTest, 21 tests pass), client/Walk.java layered over vanilla setupAnim, ElytraModelMixin, `/nam walk b|c|off|angle|bob|full`. Built and installed in FO profile; NOT yet run in-game (mixins unverified at runtime).
- Cache bench: 4D grid 41k cells, 6.5 MB, full bake 2.7 s on 6 threads, lookup 0.28 us. Recommendation: bake all at load in background + disk cache; lazy fill only for 5D+.

## Next
- Owner runs M0.md "걸음 실험 B vs C" checklist, picks style/params.
- Then: define the real offline objective to bake (balance, prior, style), cache infra (worker threads, disk, hash invalidation).

## Blocked on
Owner in-game check.
