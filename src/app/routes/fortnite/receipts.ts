import app from "../../..";

export default function () {
  app.get(
    "/fortnite/api/receipts/v1/account/:accountId/receipts",
    async (c) => {
      return c.json([]);
    }
  );
}
