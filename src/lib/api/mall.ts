import { apiRequest } from "@/lib/api/client";
import type {
  AccountLoginRequest,
  CreatePayOrderRequest,
  QueryOrderListRequest,
  QueryOrderListResponse,
  RefundOrderRequest,
  RefundOrderResponse,
  SendLoginCodeRequest,
} from "@/lib/api/types";

export function sendLoginCode(payload: SendLoginCodeRequest) {
  return apiRequest<string>("/api/v1/login/send_login_code", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function accountLogin(payload: AccountLoginRequest) {
  return apiRequest<string>("/api/v1/login/account_login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createPayOrder(payload: CreatePayOrderRequest) {
  return apiRequest<string>("/api/v1/alipay/create_pay_order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function activePayNotify(outTradeNo: string) {
  return apiRequest<string>(`/api/v1/alipay/active_pay_notify?outTradeNo=${encodeURIComponent(outTradeNo)}`, {
    method: "POST",
  });
}

export function queryUserOrderList(payload: QueryOrderListRequest) {
  return apiRequest<QueryOrderListResponse>("/api/v1/alipay/query_user_order_list", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refundOrder(payload: RefundOrderRequest) {
  return apiRequest<RefundOrderResponse>("/api/v1/alipay/refund_order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
