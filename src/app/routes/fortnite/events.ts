import app from "../../..";
import Tournaments from "../../../db/models/Tournaments";
import User from "../../../db/models/User";
import { getVersion } from "../../../utils/handling/getVersion";
import path from "path";
import fs from "fs";

export default function () {
  app.get("/api/v1/events/Fortnite/download/:accountId", async (c) => {
    const ver = await getVersion(c);
    if (!ver) return c.json({ error: "Incorrect HTTP Method" });
    if (ver.build < 8) {
      return c.json({});
    }
    const user = await User.findOne({ accountId: c.req.param("accountId") });
    if (!user) return c.json([], 404);

    const tournament = await Tournaments.findOne({ accountId: user.accountId });
    if (!tournament) return c.json([], 404);

    const hypeName = "NormalHype";
    const event: any = await Bun.file("src/resources/events/event.json").json();

    event.player.accountId = tournament.accountId;
    event.player.persistentScores = { [hypeName]: tournament.hype };
    event.player.tokens = tournament.divisions;

    return c.json(event);
  });

  app.get("/api/v1/events/Fortnite/:eventId/history/:accountId", async (c) => {
    var history: any = await Bun.file(
      "src/resources/events/history.json"
    ).json();
    history[0].scoreKey.eventId = c.req.param("eventId");
    history[0].teamId = c.req.param("accountId");
    history[0].teamAccountIds.push(c.req.param("accountId"));

    return c.json(history);
  });

  app.post("/fortnite/api/game/v2/events/v2/setSubgroup/*", async (c) => {
    return c.json([]);
  });
}
