# smooth-toasts-mod — prior-art research (2026-11-15)

Goal (owner): Fabric 26.3 client mod that restyles ALL toasts (smooth animation, prettier look) and moves them from top-right (collides with JourneyMap minimap, position=TopRight) to center/top-center.

## Verdict
No existing mod covers all three (all toasts + restyle/animation + center) on Fabric 26.3. Building our own is justified.

## Candidates
| Mod | Fabric 26.3 | Scope | Center? | Notes |
|---|---|---|---|---|
| Fancy Toasts (Bivrik, MIT, github.com/Bivrik/FancyToasts) | yes, 1.5.1 (2026-10-01) | AdvancementToast + FTB Quests only (ToastManagerMixin.addToast filters AdvancementToast) | yes: ToastAnchor TOP/CENTER/BOTTOM + corners | has Jade compat + BossHealthOverlay/Subtitle mixins (avoids top-center collisions) |
| Fancy Notify (Bivrik, MIT, github.com/Bivrik/FancyNotify) | no, 26.2 only (1.1.0, 2026-09-20; depends minecraft ~26.2) | vanilla toasts (advancement, recipe, system, friend, music) + new types; unregistered/modded toasts fall back to vanilla | no: Anchor = 4 corners only | animations VANILLA/TOP_DOWN/QUIRKY; lists Sodium Extra as possible incompat |
| Advancement Plaques | yes 1.7.3 | advancements only | top-center | |
| Toast Control (Shadows_of_Fire) | no (Forge/NeoForge, up to 26.1.2) | all, hide/translucent/offset | offset | Fabric port stuck at 1.21.x |
| Toast Functions | no (Fabric ≤1.21.11, no source) | all vanilla; position, duration, queue, sound | `/toast move x y` | closest feature match, dead for 26.x |
| Toast Remover / Throwable Toasts fork / Sodium Extra | 26.3 | hide/dismiss only | — | |
| Toast Manager, Modular Toasts, Notification Control (CurseForge) | no | old/Forge | — | |

## Installed mods that touch toasts (compat targets)
- sodium-extra: MixinToastManager / MixinToastInstance (toast filter toggles)
- immersiveui: AdvancementToastMixin (renderItem only)
- puzzleslib: ToastComponentFabricMixin (AddToastCallback)
- mc-spotify (owner's own, com.jar3.mcspotify.TrackToast) — custom Toast subclass; must be covered
- chattools, optigui, punchy, packed_packs: own toast classes
- Jade HUD defaults to top-center; boss bar also top-center → placement must avoid both.

## Design implication
To cover modded toasts, hook ToastManager render/positioning generically (transform + easing per ToastInstance), not per-type replacement. Per-type restyle only possible for vanilla types; modded toasts get generic treatment (position, easing, fade/scale).
