# HANDOFF: notch-scroll-menubar

## State
- Repo /Volumes/SangHun/notch-scroll, HEAD 6b5d46c, tree clean, Debug build succeeds. Local commits only.
- PLAN steps 1-9 implemented (step 10 skipped). Step 4: 84b8ada+1499d3a (right separator expands). Step 5: caab27a+4706e69. Step 6: a36e78a. Step 7: f3ad92d. Step 8: 808d6ac+c57a35c (notch-obscured nudge, CGWindowList menu-close polling). Step 9: 6b5d46c (signing placeholder + docs/SIGNING.md, multi-display, sleep/wake, detector gated on consolidation).
- App never run; nothing verified at runtime.

## Next step
Owner runs docs/MANUAL_TESTS.md end to end (grant Accessibility + Screen Recording, Snapshot positions, Consolidate Zone, strip hover/scroll, click forwarding). Then Developer ID signing per docs/SIGNING.md.

## Blocked on
Human: permission grants, runtime testing, paid Developer ID for owner PID resolution on macOS 26.

## Risks to check at runtime
Cmd-drag timing (50 ms steps), menu-close detection by popUpMenu level, temp nudge-back of items behind notch, CGS owner lookup failing ad-hoc.
