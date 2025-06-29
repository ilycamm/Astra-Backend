import { serve } from "bun";
import crypto from "crypto";
import { gameservers, sessions } from "../utils/sessions/stored";

// fortmatchmaker v2?
async function server(): Promise<void> {
  while (true) {
    try {
      const res = await fetch(
        `http://127.0.0.1:${process.env.PORT}/v1/matchmaking/status/any`
      );
      const json = (await res.json()) as { status: string };
      if (json.status === "up") return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
}

const port = Number(process.env.MMPORT || 80);

serve({
  port,
  fetch(req, server) {
    const upgraded = server.upgrade(req, {
      data: { request: req },
    });
    return upgraded
      ? new Response(null, { status: 101 })
      : new Response("upgrade failed", { status: 400 });
  },

  websocket: {
    async open(ws) {
      const ticketId = crypto
        .createHash("md5")
        .update("1" + Date.now())
        .digest("hex");
      const matchId = crypto
        .createHash("md5")
        .update("2" + Date.now())
        .digest("hex");
      const sessionId = crypto
        .createHash("md5")
        .update("3" + Date.now())
        .digest("hex");

      const send = (name: string, payload: any) => {
        ws.send(JSON.stringify({ name, payload }));
      };

      send("StatusUpdate", { state: "Connecting" });
      await new Promise((r) => setTimeout(r, 800));

      send("StatusUpdate", {
        state: "Waiting",
        totalPlayers: 1,
        connectedPlayers: 1,
      });
      await new Promise((r) => setTimeout(r, 1000));

      send("StatusUpdate", {
        state: "Queued",
        ticketId,
        queuedPlayers: 0,
        estimatedWaitSec: 0,
        status: {},
      });

      await server();

      const interval = setInterval(() => {
        const gs = gameservers.find((g) => !g.key);
        if (!gs) return;

        clearInterval(interval);

        sessions.push({
          sessionId,
          matchId: gs.id,
        });

        send("StatusUpdate", {
          state: "SessionAssignment",
          matchId: gs.id,
        });

        setTimeout(() => {
          send("Play", {
            matchId: gs.id,
            sessionId,
            joinDelaySec: 1,
          });
          ws.close();
        }, 2000);
      }, 500);
    },

    message(ws, msg) {},

    close(ws) {},
  },
});
