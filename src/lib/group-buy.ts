export const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  WAITING_JOIN: "招募中",
  GROUP_SUCCESS: "已成团",
  SELLER_SHIPPED: "卖家已发货",
  WAIT_RECEIPT_CONFIRM: "待确认收货",
  DONE: "已完成",
  CLOSED: "已关闭",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  CREATE: "已创建",
  PAY_WAIT: "待支付",
  PAY_SUCCESS: "支付成功",
  MARKET: "营销结算中",
  DEAL_DONE: "交易完成",
  CLOSE: "已关闭",
};

export const FULFILLMENT_LABELS: Record<string, string> = {
  DELIVERY: "商家配送",
  SELF_PICKUP: "到店自提",
};

export const PRICING_MODE_LABELS: Record<string, string> = {
  "1": "早鸟阶梯价",
  "2": "按人数阶梯价",
  "3": "满员成团",
};

export function getActivityStatusLabel(status: string) {
  return ACTIVITY_STATUS_LABELS[status] ?? status;
}

export function getOrderStatusLabel(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function getFulfillmentLabel(type: string) {
  return FULFILLMENT_LABELS[type] ?? type;
}

export function getPricingModeLabel(mode: number | string) {
  return PRICING_MODE_LABELS[String(mode)] ?? String(mode);
}

export function canConfirmReceipt(status: string) {
  return status === "PAY_SUCCESS" || status === "MARKET";
}
