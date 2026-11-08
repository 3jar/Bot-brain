# discord-mc-chat — PLAN (draft, awaiting owner approval)

Owner request (2026-11-09): connect Discord server and Minecraft server; chat with Discord channels through our own in-game chat tool.
Origin: brainstorm session 2026-11-05 (claude session cb371635, profile Fabulously Optimized (2)). Owner chose server-mod approach; any Discord channel the bot is allowed to see becomes selectable in MC. Open question then: how to display it in MC.

## Architecture
- Discord bot (owner creates): Message Content intent on; perms View Channels, Send Messages, Read Message History, Manage Webhooks. Channel selection = Discord channel permissions for the bot. No MC-side channel config.
- Server mod (Fabric, server side, works on integrated server too): JDA via jar-in-jar on its own thread; token only in server config; channel registry auto-built from bot-visible text channels (category/order kept, refreshed on permission events); MC->Discord via per-channel webhook (player name + skin head avatar, @everyone/@here blocked); Discord->MC converts mentions/channels/emoji to text, basic markdown to styles, attachments to click links; ignores bot/webhook messages (loop guard); per-channel ring buffer (~200) + paged history from Discord API.
- Client mod = own chat tool: separate screen on a keybind (left channel list with unread/mention badges, message pane, input). HUD shows only mentions/pinned channels. Vanilla chat untouched.
- Vanilla fallback for players without the client mod: `/dc` commands + colored channel tags (2026-11-05 option 1).

## Why a separate screen
Profile has chat_heads, chatanimation, chattools, morechathistory, all mixing into ChatComponent/ChatScreen. Tabs inside vanilla chat would collide with them; a separate Screen has no shared surface.

## Performance
- Server sends full bodies only for focused + subscribed channels; others get unread counts.
- History: 50 on open, paged on scroll-up.
- Render: cache wrapped lines per (message, width); draw visible lines only.
- Client cap ~500 msgs/channel.
- All Discord I/O off main thread; results via server.execute; rate-limit queue.
- Input uses vanilla EditBox so KoreanPatch IME hook applies.

## Milestones
- M0 owner: create/invite bot; confirm target server + MC version.
- M1 server mod + vanilla fallback (works with no client mod).
- M2 client chat tool + custom payloads (channel list, message, history req/resp, unread, send, focus; protocol version handshake).
- M3 join/leave/death/advancement feed, reply/edit/delete sync, distribute client mod via AutoModpack, deploy.

## Tests
Unit: markdown/mention conversion, escaping, routing with a fake Discord interface. Integration: dev server + dev client + test Discord guild.

## Risks / open
- Target server assumed Qie MC (uppaward3665.modrinth.gg); qiemc-anvil targets 26.1.2 while this client is 26.3 -> confirm version.
- Modrinth-hosted server: confirm custom jar upload + outbound to Discord gateway.
- Gradle builds were denied by auto-mode classifier before; JDA bundling needs Loom/Gradle, javac fallback won't do.
