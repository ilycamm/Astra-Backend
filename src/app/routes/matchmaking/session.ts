import { v4 } from "uuid";
import app from "../../..";
import Matchmaking from "../../../db/models/Matchmaking";
import { bucket } from "./ticket";

export default function () {
  app.get(
    "/fortnite/api/game/v2/matchmaking/account/:accountId/session/:sessionId",
    async (c) => {
      const { accountId, sessionId } = c.req.param();
      return c.json({
        accountId: accountId,
        sessionId: sessionId,
        key: "none",
      });
    }
  );

  app.get("/fortnite/api/matchmaking/session/:session_id", async (c) => {
    const sessionId = c.req.param("session_id");

    return c.json({
      id: sessionId,
      ownerId: v4().replace(/-/gi, "").toUpperCase(),
      ownerName: "[DS]fortnite-liveeugcec1c2e30ubrcore0a-z8hj-1968",
      serverName: "[DS]fortnite-liveeugcec1c2e30ubrcore0a-z8hj-1968",
      serverAddress: process.env.GameserverIP,
      serverPort: Number(process.env.GameserverPort),
      maxPublicPlayers: 220,
      openPublicPlayers: 175,
      maxPrivatePlayers: 0,
      openPrivatePlayers: 0,
      attributes: {
        REGION_s: "NAE",
        GAMEMODE_s: "FORTATHENA",
        ALLOWBROADCASTING_b: true,
        SUBREGION_s: "GB",
        DCID_s: "FORTNITE-LIVEEUGCEC1C2E30UBRCORE0A-14840880",
        tenant_s: "Fortnite",
        MATCHMAKINGPOOL_s: "Any",
        STORMSHIELDDEFENSETYPE_i: 0,
        HOTFIXVERSION_i: 0,
        PLAYLISTNAME_s: "Playlist_ShowdownAlt_Solo",
        SESSIONKEY_s: v4().replace(/-/gi, "").toUpperCase(),
        TENANT_s: "Fortnite",
        BEACONPORT_i: 15009,
      },
      publicPlayers: [],
      privatePlayers: [],
      totalPlayers: 45,
      allowJoinInProgress: false,
      shouldAdvertise: false,
      isDedicated: false,
      usesStats: false,
      allowInvites: false,
      usesPresence: false,
      allowJoinViaPresence: true,
      allowJoinViaPresenceFriendsOnly: false,
      buildUniqueId: parseInt(bucket.split(".")[0]),
      lastUpdated: new Date().toISOString(),
      started: false,
    });
  });
}
