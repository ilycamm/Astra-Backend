import { v4 } from "uuid";
import app from "../../..";
import Matchmaking from "../../../db/models/Matchmaking";
import { gameservers, sessions } from "../../../utils/sessions/stored";

// aids, will get proper later
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
