// Vercel Function: the bot-brain MCP endpoint (also served at /mcp, see vercel.json).
import { createBrainHandler } from "../lib/server.mjs";
import { storeFromEnv } from "../lib/store.mjs";

let store;
const handler = createBrainHandler({ getStore: () => (store ??= storeFromEnv()) });

export { handler as GET, handler as POST, handler as DELETE };
