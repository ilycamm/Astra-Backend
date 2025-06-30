export interface CatalogEntry {
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
