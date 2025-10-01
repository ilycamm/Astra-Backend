import app from "../../..";
import Profiles from "../../../db/models/Profiles";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

export default function () {
  app.post(
    "/fortnite/api/game/v2/profile/:accountId/client/PurchaseCatalogEntry",
    async (c) => {
      const { profileId } = c.req.query();
      const accountId = c.req.param("accountId");

      const profiles = await Profiles.findOne({ accountId });
      let profile = profiles?.profiles[profileId || "athena"];
      let athena = profiles?.profiles["athena"];
      let common_core = profiles?.profiles["common_core"];

      if (!profile || !athena || !common_core) {
        return c.json({
          profileRevision: 0,
          profileId,
          profileChangesBaseRevision: 0,
          profileChanges: [],
          profileCommandRevision: 0,
          serverTime: new Date().toISOString(),
          multiUpdate: [],
          responseVersion: 1,
        });
      }

      const body = await c.req.json();
      const { offerId } = body;

      if (!offerId) {
        return c.json({ error: "Invalid offerId" });
      }

      const catalogPath = path.join(
        __dirname,
        "..",
        "..",
        "..",
        "resources",
        "storefront",
        "catalog.json"
      );

      const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
      const currentShop = catalog;

      let currentActiveStorefront: any = null;
      for (const section of currentShop.storefronts) {
        const found = section.catalogEntries.find(
          (entry: any) => entry.offerId === offerId
        );
        if (found) {
          currentActiveStorefront = found;
          break;
        }
      }

      if (!currentActiveStorefront) {
        return c.json({ error: "Invalid offerId" });
      }

      const alreadyOwned = currentActiveStorefront.itemGrants.some(
        (item: any) => {
          const normalizedTemplateId = item.templateId.toLowerCase();
          return Object.keys(athena.items).some(
            (key) => key.toLowerCase() === normalizedTemplateId
          );
        }
      );

      if (alreadyOwned) {
        return c.json({ error: "You already own this item." });
      }

      if (
        currentActiveStorefront.prices[0].finalPrice >
        common_core.items["Currency:MtxPurchased"].quantity
      ) {
        return c.json({
          error: "You do not have enough currency to purchase this item.",
        });
      }

      const profileChanges: object[] = [];
      const athenaChanges: object[] = [];
      const lootItems: object[] = [];

      for (const grant of currentActiveStorefront.itemGrants) {
        athena.items[grant.templateId] = {
          templateId: grant.templateId,
          attributes: {
            max_level_bonus: 0,
            level: 1,
            xp: 0,
            item_seen: false,
            variants: [],
            favorite: false,
            ...grant.attributes,
          },
          quantity: grant.quantity,
        };

        athenaChanges.push({
          changeType: "itemAdded",
          itemId: grant.templateId,
          item: athena.items[grant.templateId],
        });

        lootItems.push({
          itemType: grant.templateId,
          itemGuid: grant.templateId,
          itemProfile: "athena",
          quantity: grant.quantity,
        });
      }

      common_core.items["Currency:MtxPurchased"].quantity -=
        currentActiveStorefront.prices[0].finalPrice;

      profileChanges.push({
        changeType: "itemQuantityChanged",
        itemId: "Currency:MtxPurchased",
        quantity: common_core.items["Currency:MtxPurchased"].quantity,
      });

      athena.rvn += 1;
      athena.commandRevision += 1;
      athena.updated = new Date().toISOString();

      common_core.rvn += 1;
      common_core.commandRevision += 1;
      common_core.updated = new Date().toISOString();

      await profiles?.updateOne({
        $set: {
          [`profiles.${profileId}`]: profile,
          [`profiles.athena`]: athena,
          [`profiles.common_core`]: common_core,
        },
      });

      return c.json({
        profileRevision: common_core.rvn,
        profileId,
        profileChangesBaseRevision: common_core.rvn - 1,
        profileChanges,
        notifications: [
          {
            type: "CatalogPurchase",
            primary: true,
            lootResult: { items: lootItems },
          },
        ],
        profileCommandRevision: common_core.commandRevision,
        serverTime: new Date().toISOString(),
        multiUpdate: [
          {
            profileRevision: athena.rvn,
            profileId: "athena",
            profileChangesBaseRevision: athena.rvn - 1,
            profileChanges: athenaChanges,
            profileCommandRevision: athena.commandRevision,
          },
        ],
        responseVersion: 1,
      });
    }
  );
}
