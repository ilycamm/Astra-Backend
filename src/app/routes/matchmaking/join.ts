import app from "../../..";

export default function () {
  app.post("/fortnite/api/matchmaking/session/*/join", async (c) => {
    c.status(204);
    return c.json([], 200);
  });
}
