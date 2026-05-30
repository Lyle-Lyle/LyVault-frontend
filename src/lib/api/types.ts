export type ApiResponse<T> = {
  code: string;
  info: string;
  data: T;
};

export type SendLoginCodeRequest = {
  loginType: "email" | "phone";
  account: string;
};

export type AccountLoginRequest = SendLoginCodeRequest & {
  verifyCode: string;
};

export type GroupBuyActivityMedia = {
  mediaType: "IMAGE" | "TEXT" | "VIDEO";
  mediaUrl?: string | null;
  content?: string | null;
  displayOrder?: number;
};

export type GroupBuySkuSpecValue = {
  specGroupId?: string | null;
  specGroupName?: string | null;
  specValueId?: string | null;
  specValueName?: string | null;
};

export type GroupBuySku = {
  skuId?: string | null;
  skuCode?: string | null;
  price: number;
  costPrice?: number | null;
  stock?: number | null;
  specValues: GroupBuySkuSpecValue[];
};

export type GroupBuySpecValue = {
  specValueId?: string | null;
  valueName: string;
  imageUrl?: string | null;
  displayOrder?: number;
};

export type GroupBuySpecGroup = {
  specGroupId?: string | null;
  specGroupName: string;
  imageRequired?: boolean | null;
  displayOrder?: number;
  specValues: GroupBuySpecValue[];
};

export type GroupBuyProduct = {
  productId?: string | null;
  sourceProductId?: string | null;
  productName: string;
  productImages: string[];
  coverImageUrl?: string | null;
  price: number;
  costPrice?: number | null;
  categoryId?: string | null;
  categoryName?: string | null;
  productDesc?: string | null;
  videoUrl?: string | null;
  displayOrder?: number;
  status?: string | null;
  specGroups: GroupBuySpecGroup[];
  skus: GroupBuySku[];
};

export type CreateGroupBuyActivityRequest = {
  userId: string;
  title?: string;
  productId?: string;
  activityName?: string;
  activityDesc?: string;
  introImages?: string[];
  introText?: string;
  mediaList?: GroupBuyActivityMedia[];
  productList?: GroupBuyProduct[];
  pricingMode: 1 | 2 | 3;
  requiredParticipantCount: number;
  maxParticipantCount: number;
  fulfillmentType: "DELIVERY" | "SELF_PICKUP";
  logisticsMethod?: "EXPRESS" | "LOCAL_DELIVERY" | "SELF_PICKUP";
  freightTemplate?: "BASE" | "FREE_BY_AMOUNT" | "FREE_BY_QUANTITY";
  freightPayScope?: "EVERY_ORDER" | "FIRST_ORDER";
  freightAmountMode?: "FIXED" | "BY_QUANTITY";
  baseFreightAmount?: number | null;
  freightBaseQuantity?: number | null;
  freeShippingAmount?: number | null;
  freeShippingQuantity?: number | null;
  freightQuantityStep?: number | null;
  freightStepAmount?: number | null;
  deliveryNote?: string;
  receiverFields?: Array<"CONTACT" | "PHONE" | "ADDRESS">;
  customReceiverFields?: string[];
  pickupAddress: string;
  deliveryRemark: string;
  autoConfirmDays: number;
  shipmentTime?: string;
  groupStartTime?: string;
  groupEndTime?: string;
  notifyTarget?: "ALL_SUBSCRIBERS" | "JOINED_USERS" | "NONE";
  couponEnabled?: boolean;
  assistSaleEnabled?: boolean;
  privacyMode?: "PUBLIC" | "LINK_ONLY";
  priceRules: Array<{
    thresholdPeople: number;
    price: number;
  }>;
};

export type CreateGroupBuyActivityResponse = {
  activityId: number;
  creatorUserId: string;
  status: string;
  serviceFeeRate: number;
};

export type QueryMyCreatedGroupBuyRequest = {
  userId: string;
  lastId: number | null;
  pageSize: number;
};

export type GroupBuyActivityListItem = {
  id: number;
  activityId: number;
  creatorUserId: string;
  productId: string;
  activityName: string;
  coverImageUrl?: string | null;
  firstProductName?: string | null;
  productCount?: number | null;
  pricingMode: string;
  requiredParticipantCount: number;
  maxParticipantCount: number;
  fulfillmentType: string;
  status: string;
  serviceFeeRate: number;
  createTime: string;
};

export type QueryMyCreatedGroupBuyResponse = {
  activityList: GroupBuyActivityListItem[];
  hasMore: boolean;
  lastId: number | null;
};

export type GroupBuyPriceRule = {
  stepNo?: number;
  thresholdPeople: number;
  price: number;
};

export type GroupBuyActivityDetail = {
  activityId: number;
  creatorUserId: string;
  productId: string;
  activityName: string;
  activityDesc: string;
  mediaList?: GroupBuyActivityMedia[];
  productList?: GroupBuyProduct[];
  pricingMode: string;
  requiredParticipantCount: number;
  maxParticipantCount: number;
  fulfillmentType: string;
  pickupAddress: string;
  deliveryRemark: string;
  autoConfirmDays: number;
  status: string;
  serviceFeeRate: number;
  serviceFeeAmount: number;
  settlementAmount: number;
  currentParticipantCount: number;
  paidParticipantCount: number;
  doneParticipantCount: number;
  groupSuccessTime?: string | null;
  sellerShipTime?: string | null;
  autoConfirmTime?: string | null;
  doneTime?: string | null;
  settledTime?: string | null;
  createTime?: string | null;
  updateTime?: string | null;
  priceRules: GroupBuyPriceRule[];
};

export type QueryGroupBuyDetailRequest = {
  userId: string;
  activityId: number;
};

export type QueryGroupBuyProductLibraryRequest = {
  userId: string;
  keyword: string;
  lastId: number | null;
  pageSize: number;
};

export type QueryGroupBuyProductLibraryResponse = {
  productList: Array<GroupBuyProduct & { id: number; productId: string }>;
  hasMore: boolean;
  lastId: number | null;
};

export type QueryGroupBuyManageOverviewRequest = {
  userId: string;
  activityId: number;
  orderLastId: number | null;
  orderPageSize: number;
};

export type QueryGroupBuyOrderListRequest = {
  userId: string;
  activityId: number;
  lastId: number | null;
  pageSize: number;
};

export type GroupBuyOrderListItem = {
  id: number;
  userId: string;
  productId: string;
  productName: string;
  orderId: string;
  orderTime: string;
  totalAmount: number;
  status: string;
  marketType: number;
  marketDeductionAmount: number;
  payAmount: number;
  payTime?: string | null;
  groupBuyActivityId: number;
};

export type QueryGroupBuyOrderListResponse = {
  orderList: GroupBuyOrderListItem[];
  hasMore: boolean;
  lastId: number | null;
};

export type QueryGroupBuyManageOverviewResponse = {
  activityDetail: GroupBuyActivityDetail;
  orderList: QueryGroupBuyOrderListResponse;
  progressSummary: {
    currentParticipantCount: number;
    requiredParticipantCount: number;
    maxParticipantCount: number;
    remainingToSuccessCount: number;
    waitingPayParticipantCount: number;
    paidParticipantCount: number;
    waitingReceiptParticipantCount: number;
    doneParticipantCount: number;
  };
  financialSummary: {
    totalPaidAmount: number;
    serviceFeeRate: number;
    serviceFeeAmount: number;
    settlementAmount: number;
  };
  shippable: boolean;
  receivable: boolean;
  settled: boolean;
};

export type ShipGroupBuyRequest = {
  userId: string;
  activityId: number;
};

export type ShipGroupBuyResponse = {
  activityId: number;
  status: string;
  currentParticipantCount: number;
  paidParticipantCount: number;
  groupSuccessTime?: string | null;
  sellerShipTime?: string | null;
  autoConfirmTime?: string | null;
  serviceFeeRate: number;
};

export type JoinGroupBuyRequest = {
  userId: string;
  activityId: number;
};

export type JoinGroupBuyResponse = {
  activityId: number;
  orderId: string;
  payChannel: string;
  payAmount: number;
  currency: string;
  paymentIntentId: string;
  clientSecret: string;
  publishableKey: string;
  currentParticipantCount: number;
  nextParticipantCount: number;
  pricingMode: string;
};

export type QueryOrderListRequest = {
  userId: string;
  lastId: number | null;
  pageSize: number;
};

export type QueryOrderListItem = {
  id: number;
  userId: string;
  productId: string;
  productName: string;
  orderId: string;
  orderTime: string;
  totalAmount: number;
  status: string;
  payUrl?: string | null;
  marketType: number;
  marketDeductionAmount: number;
  payAmount: number;
  payTime?: string | null;
  groupBuyActivityId?: number | null;
};

export type QueryOrderListResponse = {
  orderList: QueryOrderListItem[];
  hasMore: boolean;
  lastId: number | null;
};

export type ConfirmReceiptRequest = {
  userId: string;
  orderId: string;
};

export type ConfirmReceiptResponse = {
  activityId: number;
  orderId: string;
  activityStatus: string;
  paidParticipantCount: number;
  doneParticipantCount: number;
  serviceFeeAmount: number;
  settlementAmount: number;
  settledTime?: string | null;
};
