# discord-mc-chat — PLAN v2 (draft, awaiting owner approval)

Owner request (2026-11-09): connect Discord server and Minecraft server; chat with Discord channels from MC.
Origin: brainstorm 2026-11-05 (claude session cb371635). Any Discord channel the bot can see becomes selectable in MC.
v2 changes (owner, 2026-11-09): server is **Paper** -> server side must be a **plugin**; integrate Discord channels **into the vanilla chat window** (T).

## Architecture
- Discord bot (owner creates): Message Content intent on; perms View Channels, Send Messages, Read Message History, Manage Webhooks. Channel selection = Discord permissions for the bot. No MC-side channel config.
- Paper plugin: JDA via plugin.yml `libraries` (Paper downloads from Maven Central; no shading) on its own threads; token only in plugin config. Channel registry auto-built from bot-visible text channels. MC->Discord via per-channel webhook (name + skin head avatar, @everyone/@here blocked). Discord->MC: mentions/emoji/markdown -> Adventure Components, attachments -> click links; ignore bot/webhook messages. MC general chat mirrored to one chosen Discord channel via AsyncChatEvent. `/dc` commands via Paper Brigadier API. Per-channel ring buffer + paged history.
- Plugin <-> client mod: Bukkit plugin messaging channel (e.g. `qiemc:dc`). Client mod presence detected from the player's registered channels (Fabric API sends minecraft:register). Messages chunked under C2S 32 KB limit.
- Client mod (Fabric 26.3): tabs inside the vanilla chat screen: [All] [MC] [#ch...] with unread/mention badges. Implementation keeps vanilla chat rendering: per-tab message lists are swapped into ChatComponent (one accessor mixin) and re-trimmed; tab bar via Fabric ScreenEvents; send routing via ClientSendMessageEvents.ALLOW_CHAT (cancel + plugin message when tab is a Discord channel). HUD shows the selected tab. Input stays vanilla EditBox (KoreanPatch IME works).
- Players without the client mod: colored clickable channel tags + `/dc` (2026-11-05 option 1).
- Separate full-screen chat tool: dropped from MVP (tabs cover it); optional later.

## Compat risk
Profile has chat_heads, chatanimation, chattools, morechathistory mixing into ChatComponent/ChatScreen. List-swap approach leaves their render hooks alone; chatanimation may animate on tab switch, chattools may keep own state -> in-game test needed.

## Performance
Bodies only for subscribed channels, others unread counts; history 50 on open, paged; per-tab client cap ~500; Discord I/O off main thread; rate-limit queue.

## Milestones
- M0 owner: create/invite bot; confirm Paper server address + MC/Paper version.
- M1 Paper plugin + vanilla fallback (works for everyone, no client mod).
- M2 client mod chat tabs + plugin messaging protocol (version handshake).
- M3 join/leave/death/advancement feed, reply/edit/delete sync, publish client mod (no AutoModpack on Paper: manual install / Modrinth).

## Open
- Which Paper server (Qie MC on modrinth.gg seemed to use AutoModpack = Fabric, so maybe a different server) and its version vs client 26.3.
- Gradle builds were denied by auto-mode classifier before; Paper plugin + Loom client mod both need Gradle.
