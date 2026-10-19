# HANDOFF: notch-scroll-menubar

## Active topic
macOS app that makes notch-hidden third-party status items reachable via a horizontally scrollable strip.

## State
- Repo created on owner's MacBook external SSD: `/Volumes/SangHun/notch-scroll` (git, commit 3493a19).
- Files: `CLAUDE.md` (agent rules, design, layout), `docs/SPEC.md` (problem, macOS layout background, goals, acceptance), `docs/PLAN.md` (10 steps).
- Design agreed with owner: consolidate third-party items into a zone between two own separator NSStatusItems; system items stay put; real items hidden; captured-image strip in an NSPanel scrolls on hover + horizontal scroll; click temp-reveals the real item and forwards the click. Real moves only at consolidation, new-item insertion, and click.
- No code yet.

## Next step
Claude Code session in the repo: start PLAN step 1 (Xcode skeleton + permission onboarding), then step 2 (enumerate items).

## Blocked on
Nothing. Note: Developer ID signing ($99/yr) needed for full macOS 26 behaviour; ad-hoc OK for early steps.

## References
Ice https://github.com/jordanbaird/Ice (GPL-3.0), Thaw https://github.com/thaw-app/Thaw
