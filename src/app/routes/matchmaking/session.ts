import { v4 } from "uuid";
import app from "../../..";
import { bucket } from "./ticket";
import { region } from "./ticket";

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

    type MatchmakingConfig = Record<string, string>;

    const MatchmakingData: MatchmakingConfig = await Bun.file(
      "config/matchmaking.json"
    ).json();

    const userRegion = region || "NAE";
    const gameserverIp = MatchmakingData[userRegion] ?? "127.0.0.1";
    const gameserverPort = 7777;

    return c.json({
      id: sessionId,
      ownerId: v4().replace(/-/gi, "").toUpperCase(),
      ownerName: "[DS]fortnite-liveeugcec1c2e30ubrcore0a-z8hj-1968",
      serverName: "[DS]fortnite-liveeugcec1c2e30ubrcore0a-z8hj-1968",
      serverAddress: gameserverIp,
      serverPort: Number(gameserverPort),
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
        PLAYLISTNAME_s: "Playlist_DefaultSolo",
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
