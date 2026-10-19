# HANDOFF: notch-scroll-menubar

## State
- Repo /Volumes/SangHun/notch-scroll, HEAD 524d39b, tree clean, Debug build succeeds (Xcode 27.1, macOS 26 min target).
- Step 2 done: dfc3e90 + fix da09fd0 (namespace:title classification, CGS owner lookup in Bridging/, own-item filter, debug window DEBUG-only).
- Step 3 done: c1be841 + fix 524d39b (Preferred Position + Visible snapshot to Application Support JSON, plist domain scan, overwrite confirm + backup, safe restore).
- Step 4 not started: Claude Code hit its usage limit (resets 10:20 KST 2026-10-20).

## Next step
After limit reset: Step 4 (two separator NSStatusItems, left-length expand/collapse, wrong-order detection, no CGEvents), then 5-9. Driver: /tmp/ns_run.sh <tag> <prompt>, review: /tmp/ns_rev.sh <tag> on the MacBook.

## Manual checks needed (docs/MANUAL_TESTS.md)
- Step 2: hidden-behind-notch items listed, third-party vs system classification, owner PID resolution (needs Developer ID).
- Step 3: snapshot JSON contents, restore after app relaunch.
- App was never run headlessly.
