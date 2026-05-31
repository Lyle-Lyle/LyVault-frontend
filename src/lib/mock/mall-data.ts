import type {
  ConfirmReceiptResponse,
  CreateGroupBuyActivityRequest,
  CreateGroupBuyActivityResponse,
  GroupBuyActivityDetail,
  GroupBuyActivityListItem,
  GroupBuyOrderListItem,
  GroupBuyProduct,
  JoinGroupBuyResponse,
  QueryGroupBuyManageOverviewResponse,
  QueryGroupBuyOrderListResponse,
  QueryGroupBuyProductLibraryResponse,
  QueryMyCreatedGroupBuyResponse,
  QueryOrderListItem,
  QueryOrderListResponse,
  ShipGroupBuyResponse,
} from "@/lib/api/types";

export type MockLocale = "zh" | "en";

const productImages = [
  "/mock-products/sparkling-juice.png",
  "/mock-products/milk-bread.png",
  "/mock-products/hot-pot-base.png",
  "/mock-products/tea-drinks.png",
  "/mock-products/office-snacks.png",
  "/mock-products/family-pantry.png",
  "/mock-products/rice-crackers.png",
  "/mock-products/rice-noodle-soup.png",
];

const copy = {
  zh: {
    products: [
      ["望梅好气泡果汁", "办公室下午茶补货，低糖清爽。", "饮料"],
      ["北海道牛乳面包", "松软早餐面包，适合家庭囤货。", "零食"],
      ["川味火锅底料", "周末火锅局必备，香辣浓郁。", "速食粮油"],
    ],
    activities: [
      ["望梅好气泡果汁拼团", "湾区办公室下午茶团，满 8 人成团。", "本地自提点会在成团后通知。"],
      ["牛乳面包早餐拼团", "低门槛早餐补货组合，适合新用户体验。", "可配送到 GTA 社区自提点。"],
      ["川味火锅底料周末局", "社区火锅补货团，今晚截止。", "团长统一发货并通知取货。"],
    ],
  },
  en: {
    products: [
      ["Plum Sparkling Juice", "Light afternoon drink for office restocks.", "Drinks"],
      ["Hokkaido Milk Bread", "Soft breakfast bread for family restocks.", "Snacks"],
      ["Sichuan Hot Pot Base", "Rich and spicy base for weekend hot pot.", "Instant & Pantry"],
    ],
    activities: [
      ["Plum Sparkling Juice Group Buy", "Office afternoon drink group. Forms at 8 participants.", "Pickup details will be sent after the group forms."],
      ["Milk Bread Breakfast Group", "Easy breakfast restock bundle, great for first-time users.", "Delivery is available to GTA community pickup points."],
      ["Sichuan Hot Pot Weekend Group", "Community hot pot restock group. Ends tonight.", "The leader ships together and sends pickup notices."],
    ],
  },
} satisfies Record<MockLocale, { products: string[][]; activities: string[][] }>;

function nowOffset(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

export function createMockProducts(locale: MockLocale): Array<GroupBuyProduct & { id: number; productId: string }> {
  return copy[locale].products.map(([productName, productDesc, categoryName], index) => {
    const price = [2.69, 8.99, 15.5][index] ?? 6.99;

    return {
      id: index + 1,
      productId: `mock-product-${index + 1}`,
      sourceProductId: null,
      productName,
      productImages: [productImages[index % productImages.length]],
      coverImageUrl: productImages[index % productImages.length],
      price,
      costPrice: Number((price * 0.62).toFixed(2)),
      categoryId: `mock-category-${index + 1}`,
      categoryName,
      productDesc,
      videoUrl: null,
      displayOrder: index + 1,
      status: "ACTIVE",
      specGroups: [
        {
          specGroupId: `spec-${index + 1}`,
          specGroupName: locale === "en" ? "Pack" : "规格",
          imageRequired: false,
          displayOrder: 1,
          specValues: [
            { specValueId: `spec-${index + 1}-a`, valueName: locale === "en" ? "Single" : "单件", displayOrder: 1 },
            { specValueId: `spec-${index + 1}-b`, valueName: locale === "en" ? "Bundle" : "组合装", displayOrder: 2 },
          ],
        },
      ],
      skus: [
        {
          skuId: `sku-${index + 1}-single`,
          skuCode: `MOCK-${index + 1}-S`,
          price,
          costPrice: Number((price * 0.62).toFixed(2)),
          stock: 100,
          specValues: [{ specGroupName: locale === "en" ? "Pack" : "规格", specValueName: locale === "en" ? "Single" : "单件" }],
        },
      ],
    };
  });
}

export function createMockActivityList(locale: MockLocale, userId = "postman_user_001@test.com"): GroupBuyActivityListItem[] {
  const products = createMockProducts(locale);

  return copy[locale].activities.map(([activityName], index) => ({
    id: index + 1,
    activityId: 200101 + index,
    creatorUserId: userId,
    productId: products[index]?.productId ?? `mock-product-${index + 1}`,
    activityName,
    coverImageUrl: products[index]?.coverImageUrl,
    firstProductName: products[index]?.productName,
    productCount: 1,
    pricingMode: "3",
    requiredParticipantCount: [8, 20, 30][index] ?? 10,
    maxParticipantCount: [12, 25, 35][index] ?? 20,
    fulfillmentType: index === 1 ? "DELIVERY" : "SELF_PICKUP",
    status: index === 2 ? "GROUP_SUCCESS" : "WAITING_JOIN",
    serviceFeeRate: 0.03,
    createTime: nowOffset(120 + index * 45),
  }));
}

export function createMockActivityDetail(locale: MockLocale, activityId = 200101, userId = "postman_user_001@test.com"): GroupBuyActivityDetail {
  const activityIndex = Math.max(0, Math.min(2, activityId - 200101));
  const [activityName, activityDesc, deliveryRemark] = copy[locale].activities[activityIndex] ?? copy[locale].activities[0];
  const product = createMockProducts(locale)[activityIndex] ?? createMockProducts(locale)[0];
  const currentParticipantCount = [6, 18, 27][activityIndex] ?? 6;
  const requiredParticipantCount = [8, 20, 30][activityIndex] ?? 8;
  const price = product.price;

  return {
    activityId,
    creatorUserId: userId,
    productId: product.productId,
    activityName,
    activityDesc,
    mediaList: [
      { mediaType: "IMAGE", mediaUrl: product.coverImageUrl, displayOrder: 1 },
      { mediaType: "TEXT", content: activityDesc, displayOrder: 2 },
    ],
    productList: [product],
    pricingMode: "3",
    requiredParticipantCount,
    maxParticipantCount: requiredParticipantCount + 8,
    fulfillmentType: activityIndex === 1 ? "DELIVERY" : "SELF_PICKUP",
    pickupAddress: locale === "en" ? "GTA community pickup point" : "GTA 社区自提点",
    deliveryRemark,
    autoConfirmDays: 3,
    status: currentParticipantCount >= requiredParticipantCount ? "GROUP_SUCCESS" : "WAITING_JOIN",
    serviceFeeRate: 0.03,
    serviceFeeAmount: Number((price * currentParticipantCount * 0.03).toFixed(2)),
    settlementAmount: Number((price * currentParticipantCount * 0.97).toFixed(2)),
    currentParticipantCount,
    paidParticipantCount: currentParticipantCount,
    doneParticipantCount: Math.max(0, currentParticipantCount - 2),
    groupSuccessTime: currentParticipantCount >= requiredParticipantCount ? nowOffset(90) : null,
    sellerShipTime: null,
    autoConfirmTime: null,
    doneTime: null,
    settledTime: null,
    createTime: nowOffset(360),
    updateTime: nowOffset(30),
    priceRules: [{ stepNo: 1, thresholdPeople: requiredParticipantCount, price }],
  };
}

export function createMockOrders(locale: MockLocale, userId = "postman_user_001@test.com"): QueryOrderListItem[] {
  const activities = createMockActivityList(locale, userId);
  const products = createMockProducts(locale);

  return activities.map((activity, index) => ({
    id: index + 1,
    userId,
    productId: activity.productId,
    productName: products[index]?.productName ?? activity.firstProductName ?? activity.activityName,
    orderId: `mock-order-${2000 + index}`,
    orderTime: nowOffset(80 + index * 30),
    totalAmount: products[index]?.price ?? 9.99,
    status: index === 0 ? "PAY_SUCCESS" : index === 1 ? "MARKET" : "DEAL_DONE",
    payUrl: null,
    marketType: 1,
    marketDeductionAmount: 0,
    payAmount: products[index]?.price ?? 9.99,
    payTime: nowOffset(70 + index * 30),
    groupBuyActivityId: activity.activityId,
  }));
}

export function createMockGroupOrders(locale: MockLocale, activityId: number, userId?: string): GroupBuyOrderListItem[] {
  return createMockOrders(locale, userId).map((order, index) => ({
    ...order,
    groupBuyActivityId: activityId,
    id: index + 10,
    userId: index === 0 ? order.userId : `mock_buyer_${index}@test.com`,
  }));
}

export function createMockCreatedResponse(locale: MockLocale, userId?: string): QueryMyCreatedGroupBuyResponse {
  const activityList = createMockActivityList(locale, userId);

  return {
    activityList,
    hasMore: false,
    lastId: activityList.at(-1)?.id ?? null,
  };
}

export function createMockProductLibraryResponse(locale: MockLocale): QueryGroupBuyProductLibraryResponse {
  const productList = createMockProducts(locale);

  return {
    productList,
    hasMore: false,
    lastId: productList.at(-1)?.id ?? null,
  };
}

export function createMockOrderListResponse(locale: MockLocale, userId?: string): QueryOrderListResponse {
  const orderList = createMockOrders(locale, userId);

  return {
    orderList,
    hasMore: false,
    lastId: orderList.at(-1)?.id ?? null,
  };
}

export function createMockGroupOrderListResponse(locale: MockLocale, activityId: number, userId?: string): QueryGroupBuyOrderListResponse {
  const orderList = createMockGroupOrders(locale, activityId, userId);

  return {
    orderList,
    hasMore: false,
    lastId: orderList.at(-1)?.id ?? null,
  };
}

export function createMockManageOverview(locale: MockLocale, activityId: number, userId?: string): QueryGroupBuyManageOverviewResponse {
  const activityDetail = createMockActivityDetail(locale, activityId, userId);
  const orderList = createMockGroupOrderListResponse(locale, activityId, userId);
  const remainingToSuccessCount = Math.max(0, activityDetail.requiredParticipantCount - activityDetail.currentParticipantCount);

  return {
    activityDetail,
    orderList,
    progressSummary: {
      currentParticipantCount: activityDetail.currentParticipantCount,
      requiredParticipantCount: activityDetail.requiredParticipantCount,
      maxParticipantCount: activityDetail.maxParticipantCount,
      remainingToSuccessCount,
      waitingPayParticipantCount: 1,
      paidParticipantCount: activityDetail.paidParticipantCount,
      waitingReceiptParticipantCount: 2,
      doneParticipantCount: activityDetail.doneParticipantCount,
    },
    financialSummary: {
      totalPaidAmount: Number((activityDetail.paidParticipantCount * activityDetail.priceRules[0].price).toFixed(2)),
      serviceFeeRate: activityDetail.serviceFeeRate,
      serviceFeeAmount: activityDetail.serviceFeeAmount,
      settlementAmount: activityDetail.settlementAmount,
    },
    shippable: true,
    receivable: true,
    settled: false,
  };
}

export function createMockCreateResponse(payload: CreateGroupBuyActivityRequest): CreateGroupBuyActivityResponse {
  return {
    activityId: 200999,
    creatorUserId: payload.userId,
    status: "WAITING_JOIN",
    serviceFeeRate: 0.03,
  };
}

export function createMockJoinResponse(activityId: number): JoinGroupBuyResponse {
  return {
    activityId,
    orderId: `mock-order-${Date.now()}`,
    payChannel: "MOCK",
    payAmount: 8.99,
    currency: "USD",
    paymentIntentId: "pi_mock_vercel_demo",
    clientSecret: "pi_mock_vercel_demo_secret_mock",
    publishableKey: "pk_test_mock",
    currentParticipantCount: 7,
    nextParticipantCount: 8,
    pricingMode: "3",
  };
}

export function createMockShipResponse(activityId: number): ShipGroupBuyResponse {
  return {
    activityId,
    status: "SELLER_SHIPPED",
    currentParticipantCount: 8,
    paidParticipantCount: 8,
    groupSuccessTime: nowOffset(60),
    sellerShipTime: new Date().toISOString(),
    autoConfirmTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    serviceFeeRate: 0.03,
  };
}

export function createMockConfirmReceiptResponse(orderId: string): ConfirmReceiptResponse {
  return {
    activityId: 200101,
    orderId,
    activityStatus: "DONE",
    paidParticipantCount: 8,
    doneParticipantCount: 8,
    serviceFeeAmount: 1.29,
    settlementAmount: 41.71,
    settledTime: new Date().toISOString(),
  };
}
