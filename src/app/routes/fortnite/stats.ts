import app from "../../..";
import User from "../../../db/models/User";

export default function () {
  app.get("/statsproxy/api/statsv2/leaderboards/:type", async (c) => {
    let users = await User.find({});

    const entries = users.map((u) => ({
      account: u.accountId,
      value: 1,
    }));

    return c.json({
      entries,
      maxSize: 1000,
    });
  });
}
