# HANDOFF: notch-scroll-menubar

## State
- Design pivot (2026-10-20): one fixed-width NSStatusItem widget right of the notch that draws captured icons of user-chosen apps and scrolls them horizontally; click opens the real menu via AXPress, fallback ClickForwarder moving only that item temporarily. No separators/zone/consolidation.
- Docs rewritten: CLAUDE.md, docs/SPEC.md, docs/PLAN.md (PLAN v2, 9 steps). Commit 3ed558d. No code changed yet; HEAD code still v1 (8c2b71f fix included).
- Reused v1: Bridging, MenuBarItems, Capture, EventPoster, ClickForwarder, Permissions, control window + hotkey. Deprecated (removed in v2 step 7): Zone/, UI/ScrollStrip/, global snapshot/restore.

## Next step
PLAN v2 step 1: AXPress spike (docs/AX_SPIKE.md), needs owner to run it with Accessibility granted.

## Blocked on
Owner runtime testing; Developer ID signing (paid account).
