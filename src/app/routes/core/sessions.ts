import app from "../../..";
import Matchmaking from "../../../db/models/Matchmaking";

// shit system, rewriting soon
export default function () {
  app.post("/v1/matchmaker/send/:status", async (c) => {
    const { status } = c.req.param();
    if (!status)
      return c.json({
        error: "errors.com.core.sessions.invalid_status",
      });

    const body = await c.req.json();
    if (!body) return c.json({ error: "errors.com.core.parsing.invalid_body" });

    let region = body.region;

    if (status.toLowerCase() === "online") {
      await Matchmaking.updateOne(
        { status: "online" },
        { region: region },
        { upsert: true }
      );
    } else if (status.toLowerCase() === "offline") {
      await Matchmaking.deleteOne({ status: "online", region: region });
    } else {
      return c.json(
        { error: "errors.com.core.common.sessions.invalid_status" },
        400
      );
    }

    return c.json({ success: true, status });
  });

  app.get("/v1/matchmaking/status", async (c) => {
    const anyOnline = await Matchmaking.findOne({ status: "UP" });
    return c.json({ status: anyOnline ? "up" : "offline" });
  });
}
