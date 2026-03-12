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

export type CreatePayOrderRequest = {
  userId: string;
  productId: string;
  teamId?: string;
  activityId?: number;
  marketType: 0 | 1;
};

export type QueryOrderListRequest = {
  userId: string;
  lastId: number | null;
  pageSize: number;
};

export type QueryOrderListResponse = {
  orderList: Array<{
    id: number;
    userId: string;
    productId: string;
    productName: string;
    orderId: string;
    orderTime: string;
    totalAmount: number;
    status: string;
    payUrl: string;
    marketType: number;
    marketDeductionAmount: number;
    payAmount: number;
    payTime?: string | null;
  }>;
  hasMore: boolean;
  lastId: number | null;
};

export type RefundOrderRequest = {
  userId: string;
  orderId: string;
};

export type RefundOrderResponse = {
  success: boolean;
  orderId: string;
  message: string;
};
