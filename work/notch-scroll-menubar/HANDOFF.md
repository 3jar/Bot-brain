# HANDOFF: notch-scroll-menubar

## State
- HEAD 82d7a0d, build OK, tree clean, local only. PLAN v2 steps 1-6 implemented (written by grok-coding-bot directly, no Claude Code):
  - 76f1108 step 2 widget status item (WidgetView handles own events; right/Option/Control-click menu: Settings, Control Window, Quit). Project regenerated with xcodegen (project.yml is source of truth).
  - b044185 step 3 AX/AXExtrasEnumerator (public AX only), Settings/SettingsStore (UserDefaults selectedExtras JSON + widgetWidth), SettingsWindow.
  - 6441335 step 4 Widget/WidgetController: 3 s refresh of selected extras, AX frame matched to CG window for capture, app-icon fallback, theme-change refresh.
  - 66aaf15 step 5 in-widget horizontal scroll.
  - 82d7a0d step 6 left-click -> AXPress (detached task); .cannotComplete treated as opened; other errors -> ClickForwarder fallback.
- c4183a1 is not in git reflog at all; its change survives in 67063f3.
- App never run by agents.

## Next step
Owner runtime test (docs/MANUAL_TESTS.md 'v2 widget'). Then PLAN v2 step 7 (delete Zone/, UI/ScrollStrip/, global snapshot UI; ClickForwarder still calls nil-safe SeparatorController) and step 8 robustness.

## Risks
Scroll events may not reach status bar view; ExtraKey label collisions for apps with several unlabeled extras; capture match tolerance 2 pt.
