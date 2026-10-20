# HANDOFF: notch-scroll-menubar

## State
- HEAD 67063f3: docs record AX spike result (AXPress opened menus for all tested items incl. notch-hidden); PLAN/SPEC note AXPress primary, ClickForwarder rare fallback. This commit also carries the v1-zone menu gating (NSMenuItemValidation) because commit c4183a1 vanished from the branch (reset outside this agent) while its change stayed in the tree.
- v2 Step 2 (widget shell) PARTIAL and uncommitted: NotchScroll/AppDelegate.swift modified + new NotchScroll/Widget/WidgetView.swift (not added to Xcode project); build currently FAILS (cannot find WidgetView, type inference errors). Claude Code hit usage limit, resets 21:00 KST 2026-10-20.
- Decided: control icon merged into widget; left-click = icons, right-click/Option-click = menu (Settings, Control Window, Quit).

## Next step
After 21:00 KST: fresh claude -p to finish v2 Step 2 from the partial tree (add WidgetView to project, fix errors, commit), then Steps 3-6. Driver: /tmp/ns_v2.sh "<tag>" "<prompt>".

## Blocked on
Claude Code usage limit.
