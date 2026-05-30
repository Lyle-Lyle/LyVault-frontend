import { apiRequest } from "@/lib/api/client";
import type {
  AccountLoginRequest,
  ConfirmReceiptRequest,
  ConfirmReceiptResponse,
  CreateGroupBuyActivityRequest,
  CreateGroupBuyActivityResponse,
  JoinGroupBuyRequest,
  JoinGroupBuyResponse,
  QueryGroupBuyDetailRequest,
  QueryGroupBuyManageOverviewRequest,
  QueryGroupBuyManageOverviewResponse,
  QueryGroupBuyOrderListRequest,
  QueryGroupBuyOrderListResponse,
  QueryGroupBuyProductLibraryRequest,
  QueryGroupBuyProductLibraryResponse,
  QueryMyCreatedGroupBuyRequest,
  QueryMyCreatedGroupBuyResponse,
  QueryOrderListRequest,
  QueryOrderListResponse,
  SendLoginCodeRequest,
  ShipGroupBuyRequest,
  ShipGroupBuyResponse,
  GroupBuyActivityDetail,
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

export function createGroupBuy(payload: CreateGroupBuyActivityRequest) {
  return apiRequest<CreateGroupBuyActivityResponse>("/api/v1/group-buy/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function queryMyCreatedGroupBuyList(payload: QueryMyCreatedGroupBuyRequest) {
  return apiRequest<QueryMyCreatedGroupBuyResponse>("/api/v1/group-buy/query_my_created_list", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function queryGroupBuyDetail(payload: QueryGroupBuyDetailRequest) {
  return apiRequest<GroupBuyActivityDetail>("/api/v1/group-buy/query_detail", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function queryGroupBuyProductLibrary(payload: QueryGroupBuyProductLibraryRequest) {
  return apiRequest<QueryGroupBuyProductLibraryResponse>("/api/v1/group-buy/product_library/search", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function queryGroupBuyManageOverview(payload: QueryGroupBuyManageOverviewRequest) {
  return apiRequest<QueryGroupBuyManageOverviewResponse>("/api/v1/group-buy/query_manage_overview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function queryGroupBuyOrderList(payload: QueryGroupBuyOrderListRequest) {
  return apiRequest<QueryGroupBuyOrderListResponse>("/api/v1/group-buy/query_order_list", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function joinGroupBuy(payload: JoinGroupBuyRequest) {
  return apiRequest<JoinGroupBuyResponse>("/api/v1/group-buy/join", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function shipGroupBuy(payload: ShipGroupBuyRequest) {
  return apiRequest<ShipGroupBuyResponse>("/api/v1/group-buy/ship", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function queryUserOrderList(payload: QueryOrderListRequest) {
  return apiRequest<QueryOrderListResponse>("/api/v1/alipay/query_user_order_list", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function confirmReceipt(payload: ConfirmReceiptRequest) {
  return apiRequest<ConfirmReceiptResponse>("/api/v1/group-buy/confirm_receipt", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
