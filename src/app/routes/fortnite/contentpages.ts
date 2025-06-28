import app from "../../..";
import { createSection } from "../../../utils/creationTools/createSection";
import { getVersion } from "../../../utils/handling/getVersion";

export default function () {
  app.get("/content/api/pages/fortnite-game", async (c) => {
    const ver = await getVersion(c);
    const section = await createSection();

    const content = {
      _title: "Fortnite Game",
      _activeDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      _locale: "en-US",
      tournamentinformation: {
        _activeDate: new Date().toISOString(),
        _locale: "en-US",
        _templateName: "FortniteGameTournamentInfo",
        _title: "tournamentinformation",
        conversion_config: {
          _type: "Conversion Config",
          containerName: "tournament_info",
          contentName: "tournaments",
          enableReferences: true,
        },
        lastModified: "0001-01-01T00:00:00",
        tournament_info: {
          _type: "Tournaments Info",
          tournaments: [
            {
              _type: "Tournament Display Info",
              loading_screen_image:
                "https://cdn.projecthelix.website/Arena_Playlist.png",
              playlist_tile_image:
                "https://cdn.projecthelix.website/Arena_Playlist.png",
              title_line_1: "LATEGAME ARENA",
              title_line_2: null,
              tournament_display_id: "ARENA_SOLO",
            },
          ],
        },
      },
      playlistinformation: {
        frontend_matchmaking_header_style: "None",
        _title: "playlistinformation",
        frontend_matchmaking_header_text: "",
        playlist_info: {
          _type: "Playlist Information",
          playlists: [
            {
              image: ``,
              playlist_name: "Playlist_DefaultSolo",
              hidden: false,
              special_border: "None",
              _type: "FortPlaylistInfo",
            },
            {
              image:
                "https://cdn2.unrealengine.com/Fortnite/fortnite-game/playlistinformation/CM_LobbyTileArt-1024x512-fbcd48db36552ccb1ab4021b722ea29d515377cc.jpg",
              playlist_name: "Playlist_PlaygroundV2",
              hidden: false,
              special_border: "None",
              _type: "FortPlaylistInfo",
            },
            {
              image: ``,
              playlist_name: "Playlist_DefaultDuo",
              hidden: false,
              special_border: "None",
              _type: "FortPlaylistInfo",
            },
            {
              image: ``,
              playlist_name: "Playlist_DefaultSquad",
              hidden: false,
              special_border: "None",
              _type: "FortPlaylistInfo",
            },
          ],
        },
        _noIndex: false,
        _activeDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        _locale: "en-US",
      },
      playlistimages: {
        playlistimages: {
          images: [
            {
              image: ``,
              _type: "PlaylistImageEntry",
              playlistname: "Playlist_DefaultSolo",
            },
            {
              image:
                "https://cdn2.unrealengine.com/Fortnite/fortnite-game/playlistinformation/CM_LobbyTileArt-1024x512-fbcd48db36552ccb1ab4021b722ea29d515377cc.jpg",
              playlistname: "Playlist_PlaygroundV2",
              _type: "PlaylistImageEntry",
            },
            {
              image: ``,
              _type: "PlaylistImageEntry",
              playlistname: "Playlist_DefaultDuo",
            },
            {
              image: ``,
              _type: "PlaylistImageEntry",
              playlistname: "Playlist_DefaultSquad",
            },
          ],
          _type: "PlaylistImageList",
        },
        _title: "playlistimages",
        _activeDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        _locale: "en-US",
      },
      emergencynotice: {
        news: {
          _type: "Battle Royale News",
          messages: [
            {
              hidden: false,
              _type: "CommonUI Simple Message Base",
              title: "Core",
              body: "Welcome to Core Backend!",
              spotlight: true,
            },
          ],
        },
        _title: "emergencynotice",
        _noIndex: false,
        alwaysShow: false,
        _activeDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        _locale: "en-US",
      },
      emergencynoticev2: {
        "jcr:isCheckedOut": true,
        _title: "emergencynoticev2",
        _noIndex: false,
        emergencynotices: {
          _type: "Emergency Notices",
          emergencynotices: [
            {
              gamemodes: [],
              hidden: false,
              _type: "CommonUI Emergency Notice Base",
              title: "Core",
              body: "Welcome to Core Backend!",
            },
          ],
        },
        _activeDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        _locale: "en-US",
      },
      lobby: {
        stage: `season${ver.build}`,
        _title: "lobby",
        _activeDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        _locale: "en-US",
      },
      battleroyalenewsv2: {
        alwaysShow: true,
        lastModified: "0000-00-00T00:00:00.000Z",
        news: {},
      },
      dynamicbackgrounds: {
        backgrounds: {
          backgrounds: [
            {
              stage: `season${ver.build}`,
              _type: "DynamicBackground",
              key: "lobby",
            },
          ],
          _type: "DynamicBackgroundList",
        },
        _title: "dynamicbackgrounds",
        _noIndex: false,
        _activeDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        _locale: "en-US",
        _templateName: "FortniteGameDynamicBackgrounds",
      },
      ...section,
      _suggestedPrefetch: [],
    };

    return c.json(content);
  });
}
