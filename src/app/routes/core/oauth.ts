import axios from "axios";
import User from "../../../db/models/User";
import Profiles from "../../../db/models/Profiles";
import { v4 } from "uuid";
import app from "../../..";
import createProfiles from "../../../utils/creationTools/createProfiles";
import { sign } from "hono/jwt";

interface DiscordConfig {
  clientId: string;
  clientSecret: string;
  scope: string;
  bot: string;
  targetGuildId: string;
  redirectUri: string;
}

export const config: DiscordConfig = {
  clientId: "",
  clientSecret: "",
  scope: "identify",
  targetGuildId: "",
  bot: "",
  redirectUri: `http://127.0.0.1:3551/oauth/discord/callback`,
};

export default function () {
  const auth = app;

  auth.get("/oauth/redirectoauth", (c) => {
    const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${
      config.clientId
    }&redirect_uri=${encodeURIComponent(
      config.redirectUri
    )}&response_type=code&scope=${config.scope}&prompt=none`;
    return c.redirect(oauthUrl);
  });

  app.get("/oauth/discord/callback", async (c) => {
    const code = c.req.query("code");
    if (!code) {
      return c.text("No code provided!", 400);
    }

    const redirectUri = `http://127.0.0.1:8080/oauth/discord/callback`;

    try {
      const tokenParams = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      });

      const [tokenResponse] = await Promise.all([
        axios.post("https://discord.com/api/oauth2/token", tokenParams, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }),
      ]);

      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) return c.text("Error fetching token", 500);

      const userResponse = await axios.get(
        "https://discord.com/api/users/@me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const userId = userResponse.data.id;
      const username = userResponse.data.username
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 25);

      const memberResponse = await axios.get(
        `https://discord.com/api/guilds/${config.targetGuildId}/members/${userId}`,
        {
          headers: { Authorization: `Bot ${config.bot}` },
          validateStatus: (status) => status === 200 || status === 404,
        }
      );

      if (memberResponse.status === 404) {
        return c.text("User is **not in the guild**.", 403);
      }

      const roleIds = memberResponse.data?.roles || [];
      let mainRole = "Member";
      let allRoles: string[] = [];

      if (roleIds.length > 0) {
        const guildRoles = await axios.get(
          `https://discord.com/api/guilds/${config.targetGuildId}/roles`,
          {
            headers: { Authorization: `Bot ${config.bot}` },
          }
        );

        const matchingRoles = guildRoles.data.filter((role: { id: string }) =>
          roleIds.includes(role.id)
        );

        const sortedRoles = matchingRoles.sort(
          (a: { position: number }, b: { position: number }) =>
            b.position - a.position
        );

        allRoles = sortedRoles.map((role: { name: string }) => role.name);
        mainRole = sortedRoles.length > 0 ? sortedRoles[0].name : "Member";
      }

      let user = await User.findOne({ discordId: userId });

      if (!user) {
        const accountId = v4();
        const createUser = {
          discordId: userId,
          accountId: accountId,
          username: username,
          email: `${username}@core.dev`,
          password: v4(),
          banned: false,
          Created: new Date().toISOString(),
        };

        const userProfile = await createProfiles(accountId);
        await Profiles.create({
          accountId: accountId,
          profiles: userProfile,
        });

        user = await User.create(createUser);
      }

      const profiles = await Profiles.findOne({ accountId: user.accountId });
      const athena = profiles?.profiles["athena"];
      const common_core = profiles?.profiles["common_core"];

      if (!athena || !common_core) {
        return c.text("Incorrect Profile", 403);
      }

      let favoriteCharacterString =
        athena.items?.["sandbox_loadout"]?.attributes?.locker_slots_data?.slots
          ?.Character?.items?.[0];

      if (!favoriteCharacterString) {
        favoriteCharacterString =
          "AthenaCharacter:CID_960_Athena_Commando_M_Cosmos";
      }

      const vbucks =
        common_core.items?.["Currency:MtxPurchased"]?.quantity || 0;

      const favoriteCharacter =
        (favoriteCharacterString &&
          athena.items?.[favoriteCharacterString]?.templateId
            ?.split(":")[1]
            ?.trim()) ||
        "AthenaCharacter:CID_001_Athena_Commando_F_Default";

      const fav =
        favoriteCharacter
          ?.toLowerCase()
          .replace(
            /(athenacharacter|athenabackpack|athenapickaxe|athenaglider|athenadance):/,
            ""
          ) || "";

      if (user.banned) {
        return c.text("You are banned from Core!");
      }

      let token = await sign(
        {
          discordId: user.discordId,
          email: user.email,
          password: user.password,
          username: user.username,
          vbucks: vbucks,
          favorite_character: fav,
          role: mainRole,
          accountId: user.accountId,
          type: "launcher",
        },
        "Secret"
      );

      return c.redirect("core://" + token);
    } catch (err) {
      console.error("Failed to get token from Discord:" + err);
      return c.text("ERROR: Could not auth with discord", 401);
    }
  });
}
