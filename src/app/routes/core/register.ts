import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import app from "../../..";
import User from "../../../db/models/User";
import Profiles from "../../../db/models/Profiles";
import createProfiles from "../../../utils/creationTools/createProfiles";

export default async function () {
  app.post("/register", async (c) => {
    const { username } = await c.req.json();
    const body = await c.req.json();

    const accountId = uuidv4().replace(/-/gi, "");

    const generateRandomPassword = () => {
      const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      let password = "";
      for (let i = 0; i < 4; i++) {
        password += letters.charAt(Math.floor(Math.random() * letters.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
      }
      return password;
    };

    let email;
    let password;

    if (body.email) email = body.email;
    if (!body.email)
      email = `${Math.floor(1000000 + Math.random() * 9000000)}@core.dev`;
    if (body.password) password = body.password;
    if (!body.password) password = generateRandomPassword();

    const hashedPassword = await bcrypt.hash(password, 10);
    const userProfile = await createProfiles(accountId);

    await User.create({
      accountId,
      username,
      email,
      password: hashedPassword,
      created: new Date(),
    }).then(async (user: any) => {
      await Profiles.create({
        accountId: user.accountId,
        profiles: userProfile,
        created: new Date().toISOString(),
        access_token: "",
        refresh_token: "",
      });
    });

    return c.json({ text: "Successfully Made an Account!" });
  });
}
