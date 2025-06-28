import { Log } from "../handling/logging";

type itemID =
  | "AthenaCharacter"
  | "AthenaPickaxe"
  | "AthenaDance"
  | "AthenaGlider";

const itemPrefixThingy = {
  SKIN: "AthenaCharacter",
  PICKAXE: "AthenaPickaxe",
  DANCE: "AthenaDance",
  GLIDER: "AthenaGlider",
} as const;

const shopFile = Bun.file("config/shop_config.json");
const shopConfig = await shopFile.json();

interface CatalogEntry {
  devName: string;
  offerId: string;
  fulfillmentIds: string[];
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  categories: string[];
  prices: {
    currencyType: string;
    currencySubType: string;
    regularPrice: number;
    finalPrice: number;
    saleExpiration: string;
    basePrice: number;
  }[];
  meta: {
    NewDisplayAssetPath: string;
    SectionId: string;
    LayoutId: string;
    TileSize: string;
    AnalyticOfferGroupId: string;
    FirstSeen: string;
  };
  matchFilter: string;
  filterWeight: number;
  appStoreId: string[];
  requirements: {
    requirementType: string;
    requiredId: string;
    minQuantity: number;
  }[];
  offerType: string;
  giftInfo: {
    bIsEnabled: boolean;
    forcedGiftBoxTemplateId: string;
    purchaseRequirements: unknown[];
    giftRecordIds: unknown[];
  };
  refundable: boolean;
  metaInfo: { key: string; value: string }[];
  displayAssetPath: string;
  itemGrants: { templateId: string; quantity: number }[];
  sortPriority: number;
  catalogGroupPriority: number;
}

function createEntry(
  id: string,
  type: itemID,
  price: number,
  sectionId: "Featured" | "Daily"
): CatalogEntry {
  const layout = sectionId === "Featured" ? "Core" : "Daily";
  const analyticId = sectionId === "Featured" ? "Core" : "DailyCore";

  return {
    devName: `${type}:${id}`,
    offerId: `${type}:${id}`,
    fulfillmentIds: [],
    dailyLimit: -1,
    weeklyLimit: -1,
    monthlyLimit: -1,
    categories: [],
    prices: [
      {
        currencyType: "MtxCurrency",
        currencySubType: "",
        regularPrice: price,
        finalPrice: price,
        saleExpiration: "9999-12-02T01:12:00Z",
        basePrice: price,
      },
    ],
    meta: {
      NewDisplayAssetPath: "",
      SectionId: sectionId,
      LayoutId: layout,
      TileSize: "Normal",
      AnalyticOfferGroupId: analyticId,
      FirstSeen: "2/2/2020",
    },
    matchFilter: "",
    filterWeight: 0,
    appStoreId: [],
    requirements: [
      {
        requirementType: "DenyOnItemOwnership",
        requiredId: `${type}:${id}`,
        minQuantity: 1,
      },
    ],
    offerType: "StaticPrice",
    giftInfo: {
      bIsEnabled: true,
      forcedGiftBoxTemplateId: "",
      purchaseRequirements: [],
      giftRecordIds: [],
    },
    refundable: true,
    metaInfo: [
      { key: "NewDisplayAssetPath", value: "=" },
      { key: "SectionId", value: sectionId },
      { key: "LayoutId", value: layout },
      { key: "TileSize", value: "Normal" },
      { key: "AnalyticOfferGroupId", value: analyticId },
      { key: "FirstSeen", value: "2/2/2020" },
    ],
    displayAssetPath: `/Game/Catalog/DisplayAssets/DA_Featured_${id}.DA_Featured_${id}`,
    itemGrants: [{ templateId: `${type}:${id}`, quantity: 1 }],
    sortPriority: 0,
    catalogGroupPriority: 0,
  };
}

function* createEntries(): Generator<{
  id: string;
  type: itemID;
  price: number;
}> {
  const itemRegex = /^([A-Z]+)(\d*)$/;

  for (const key in shopConfig) {
    const match = key.match(itemRegex);
    if (!match) continue;

    const [_, prefix, number] = match;
    const id = shopConfig[key];
    const type = itemPrefixThingy[prefix as keyof typeof itemPrefixThingy];
    if (!type) continue;

    const priceKey = `${prefix}${number}_PRICE`;
    const price =
      typeof shopConfig[priceKey] === "number" ? shopConfig[priceKey] : 0;

    yield { id, type, price };
  }
}

export function createCatalog() {
  Log("Created Catalog");
  const allEntries = Array.from(createEntries());

  const weekly = allEntries
    .slice(0, 5)
    .map((e) => createEntry(e.id, e.type, e.price, "Featured"));

  const daily = allEntries
    .slice(5, 12)
    .map((e) => createEntry(e.id, e.type, e.price, "Daily"));

  return [
    { name: "BRWeeklyStorefront", catalogEntries: weekly },
    { name: "BRDailyStorefront", catalogEntries: daily },
  ];
}
