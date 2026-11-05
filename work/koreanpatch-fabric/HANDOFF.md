# koreanpatch-fabric handoff — 2026-11-05

Korean Patch (najoan125/KoreanPatch-multiLoader fork) on Minecraft 26.3 (Fabric), macOS arm64.

## Where things are
- Repo: ~/dev/KoreanPatch-multiLoader, local branch `26.3` (from 26.2 HEAD 0064f2d), all changes UNCOMMITTED (owner did not ask to commit).
  - The earlier mechanical 26.2->26.3 port (previous session, lived only in /private/tmp) was applied first, then this session's fixes.
- New native source: native/darwin/cocoainput.m + build.sh -> common/src/main/resources/native/libdarwincocoainput.dylib (universal).
- Build: JAVA_HOME=<zulu 25 JDK> ./gradlew :fabric:build --offline. JDK currently at /private/tmp/claude-501/.../5f7d33ff.../scratchpad/jdk (ephemeral; redownload Zulu 25 if gone).
- Installed (enabled): profile "Fabulously Optimized (2)"/mods/koreanpatch-fabric-1.9.6-snapshot+mc26.3-local.jar. Old broken jar backed up in this session's scratchpad only.

## Root causes found (26.3 = SDL3, no GLFW)
1. Old dylib swizzled GLFWContentView; under SDL3 that class never appears and its init thread busy-loops forever (no sleep) -> IME on/off control dead + one core pegged.
2. SDL3 macOS sends Caps Lock only from SDL3View flagsChanged as press+release when caps STATE flips; with "Caps Lock switches ABC" a tap gives 0 or 2 toggles -> lang toggle broken; OS Korean IME composes on top of mod composition.
3. JNA log callbacks were local lambdas (GC -> dangling native pointers), Darwin and Win.
4. Shift for jamo read from live SDL keyboard state at processing time (race at low FPS: ㄲ->ㄱ).

## Fixes
- New dylib: class-level hook of SDL3TranslatorResponder interpretKeyEvents: (class_addMethod, NSResponder untouched). Mod mode + non-ASCII input source -> insert ABC-layout text (UCKeyTranslate), skip OS IME. IME mode -> original. Exports isKoreanInputSource().
- DarwinController.syncWithSystem(): mod KO/EN follows macOS input source on change (edge), polled per key event + client tick.
- KeyboardHandlerMixin: Caps Lock ignored as lang toggle on Mac; removed racy caps "fix"; records key modifiers for shift.
- Static JNA callbacks.

## Verified
- Native harness vs real LWJGL libSDL3 (SDL 3.4.14): hook installed only on SDL3 class; with 2-Set Korean selected, mod mode inserts r|R|k| |R for r, shift+r, k, return, delete, cmd+v, ctrl+a, space, caps+r. Input source restored to ABC.
- JNA smoke test with static callbacks + System.gc(): OK. Mixin targets all exist in 26.3. Jar builds.
- NOT run in-game.

## Next step
Owner tests in-game and reports specifics. Check latest.log for "[Native|C] Hooked SDL3TranslatorResponder" and "Korean Patch Loaded". Windows path untested (WinHandle native still targets HWND IME; SDL3 also manages IME there).
