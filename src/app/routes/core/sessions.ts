import app from "../../..";
import Matchmaking from "../../../db/models/Matchmaking";

// most shit system, 2 lazy to rewrite crystals code
export default function () {
  app.get("/v1/matchmaker/send/:status/:ip/:region/:playlist", async (c) => {
    const { status } = c.req.param();

    if (!status) return c.json({ error: "Please provide a status!" });

    if (status == "up") {
      await Matchmaking.create({
        status: "UP",
      });
    } else if (status == "offline") {
      await Matchmaking.deleteOne({
        status: "UP",
      });
    }

    return c.json({ success: "matchmake thing" });
  });

  app.get("/v1/matchmaking/status/any", async (c) => {
    const anyOnline = await Matchmaking.findOne({ status: "UP" });
    return c.json({ status: anyOnline ? "up" : "offline" });
  });
}
