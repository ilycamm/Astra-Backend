import app from "../../..";
import Profiles from "../../../db/models/Profiles";
import { v4 as uuiv4 } from "uuid";
import path from "path";

export default function () {
  app.post(
    "/fortnite/api/game/v2/profile/:accountId/client/PurchaseCatalogEntry",
    async (c) => {
      let { profileId, rvn } = c.req.query();
      var profiles = await Profiles.findOne({
        accountId: c.req.param("accountId"),
      });
      let profile = profiles?.profiles["athena"];
      let common_core = profiles?.profiles["common_core"];

      if (!profile || !profiles || !common_core) {
        return c.json({
          profileRevision: 0,
          profileId: profileId,
          profileChangesBaseRevision: 0,
          profileChanges: [],
          profileCommandRevision: 0,
          serverTime: new Date().toISOString(),
          multiUpdate: [],
          responseVersion: 1,
        });
      }

      let BaseRevision = profile.rvn;
      let MultiUpdate: object[] = [];
      let ApplyProfileChanges: object[] = [];
      let notification: any = [];

      let shouldUpdateProfile = false;

      const body = await c.req.json();
      const { offerId, currency, purchaseQuantity } = body;

      if (!process.env.ENABLE_SHOP) {
        return c.json({
          profileRevision: 0,
          profileId: profileId,
          profileChangesBaseRevision: 0,
          profileChanges: [],
          profileCommandRevision: 0,
          serverTime: new Date().toISOString(),
          multiUpdate: [],
          responseVersion: 1,
        });
      }

      if (!offerId || !currency || !purchaseQuantity) {
        return c.json({
          error: "Invalid offerId, currency, or purchaseQuantity",
        });
      }

      if (purchaseQuantity < 1) {
        return c.json({
          error: "Invalid purchaseQuantity",
        });
      }

      const catalog = await Bun.file(
        path.join(
          __dirname,
          "..",
          "..",
          "..",
          "resources",
          "storefront",
          "catalog.json"
        )
      ).json();

      let owned = false;

      const currentShop = catalog;

      if (offerId.includes("Athena")) {
        notification.push({
          type: "CatalogPurchase",
          primary: true,
          lootResult: {
            items: [],
          },
        });

        let currentActiveStorefront = null;
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
          return c.json({
            error: "Invalid offerId",
          });
        }

        if (purchaseQuantity < 1) {
          return c.json({
            error: "Invalid purchaseQuantity",
          });
        }

        if (
          !owned &&
          currentActiveStorefront.prices[0].finalPrice >
            common_core.items["Currency:MtxPurchased"].quantity
        ) {
          return c.json({
            error: "You do not have enough currency to purchase this item.",
          });
        }

        const alreadyOwned = currentActiveStorefront.itemGrants.some(
          (item: any) => {
            const normalizedTemplateId = item.templateId.toLowerCase();
            return Object.keys(profile.items).some(
              (key) => key.toLowerCase() === normalizedTemplateId
            );
          }
        );

        if (alreadyOwned) {
          return c.json({ error: "You already own this item." });
        }

        const itemQuantitiesByTemplateId = new Map();
        const itemProfilesByTemplateId = new Map();

        for (const grant of currentActiveStorefront.itemGrants) {
          if (itemQuantitiesByTemplateId.has(grant.templateId)) {
            itemQuantitiesByTemplateId.set(
              grant.templateId,
              itemQuantitiesByTemplateId.get(grant.templateId) + grant.quantity
            );
          } else {
            itemQuantitiesByTemplateId.set(grant.templateId, grant.quantity);
          }
          if (!itemProfilesByTemplateId.has(grant.templateId)) {
            itemProfilesByTemplateId.set(grant.templateId, "athena");
          }
        }

        itemQuantitiesByTemplateId.forEach((quantity, templateId) => {
          profile.items[templateId] = {
            templateId,
            attributes: {
              level: 1,
              item_seen: false,
              xp: 0,
              variants: [],
              favorite: false,
            },
            quantity,
          };

          MultiUpdate.push({
            changeType: "itemAdded",
            itemId: templateId,
            item: profile.items[templateId],
          });

          notification[0].lootResult.items.push({
            itemType: templateId,
            itemGuid: templateId,
            itemProfile: "athena",
            quantity: 1,
          });

          MultiUpdate.push({
            changeType: "itemAdded",
            itemId: templateId,
            item: profile.items[templateId],
          });

          notification[0].lootResult.items.push({
            itemType: templateId,
            itemGuid: templateId,
            itemProfile: "athena",
            quantity: 1,
          });
        });

        common_core.items["Currency:MtxPurchased"].quantity -=
          currentActiveStorefront.prices[0].finalPrice;

        MultiUpdate.push({
          changeType: "itemQuantityChanged",
          itemId: "Currency:MtxPurchased",
          quantity: common_core.items["Currency:MtxPurchased"].quantity,
        });

        const purchase = {
          purchaseId: uuiv4(),
          offerId: `v2:/${offerId}`,
          purchaseDate: new Date().toISOString(),
          undoTimeout: "9999-12-12T00:00:00.000Z",
          freeRefundEligible: false,
          fulfillments: [],
          lootResult: Object.keys(itemQuantitiesByTemplateId).map(
            (templateId) => ({
              itemType: templateId,
              itemGuid: templateId,
              itemProfile: "athena",
              quantity: itemQuantitiesByTemplateId.get(templateId),
            })
          ),
          totalMtxPaid: currentActiveStorefront.prices[0].finalPrice,
          metadata: {},
          gameContext: "",
        };

        common_core.stats.attributes.mtx_purchase_history!.purchases.push(
          purchase
        );

        owned = true;
        shouldUpdateProfile = true;
      }

      if (shouldUpdateProfile) {
        profile.rvn += 1;
        profile.commandRevision += 1;
        profile.updated = new Date().toISOString();

        common_core.rvn += 1;
        common_core.commandRevision += 1;
        common_core.updated = new Date().toISOString();

        await profiles.updateOne({
          $set: {
            [`profiles.athena`]: profile,
          },
        });
        await profiles.updateOne({
          $set: {
            [`profiles.common_core`]: common_core,
          },
        });
      }

      ApplyProfileChanges = [
        {
          changeType: "fullProfileUpdate",
          profile: profile,
        },
      ];

      return c.json({
        profileRevision: common_core.rvn || 0,
        profileId: profileId,
        profileChangesBaseRevision: BaseRevision,
        profileChanges: ApplyProfileChanges,
        notifications: notification,
        profileCommandRevision: common_core.commandRevision || 0,
        serverTime: new Date().toISOString(),
        multiUpdate: [
          {
            profileRevision: profile.rvn,
            profileId: "athena",
            profileChangesBaseRevision: profile.rvn - 1,
            profileChanges: MultiUpdate,
            profileCommandRevision: profile.commandRevision,
          },
        ],
        responseVersion: 1,
      });
    }
  );
}
