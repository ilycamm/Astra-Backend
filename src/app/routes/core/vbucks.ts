import app from "../../..";
import User from "../../../db/models/User";
import Profiles from "../../../db/models/Profiles";

export default function () {
  app.get("/sessions/api/v1/vbucks/:username/:amount", async (c) => {
    const user = await User.findOne({ username: c.req.param("username") });
    if (!user) return c.text("User not found!");

    const profiles = await Profiles.findOne({ accountId: user.accountId });
    let profile = profiles?.profiles["common_core"];

    const vbucksAmount = Number(c.req.param("amount"));
    let currency = profile.items["Currency:MtxPurchased"];

    currency.quantity += vbucksAmount;
    await profiles?.updateOne({
      $set: { "profiles.profiles.common_core": profile },
    });

    return c.text("Success");
  });
}
