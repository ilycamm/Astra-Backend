import app from "../../..";
import { createCatalog } from "../../../utils/creationTools/createShop";

export default function () {
  app.get("/fortnite/api/storefront/v2/catalog", async (c) => {
    const path = Bun.file("src/resources/storefront/catalog.json");
    const catalog = await path.json();
    return c.json(catalog);
  });
}
