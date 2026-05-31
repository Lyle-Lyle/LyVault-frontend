import {
  createMockConfirmReceiptResponse,
  createMockCreateResponse,
  createMockCreatedResponse,
  createMockGroupOrderListResponse,
  createMockJoinResponse,
  createMockManageOverview,
  createMockOrderListResponse,
  createMockProductLibraryResponse,
  createMockShipResponse,
  type MockLocale,
} from "@/lib/mock/mall-data";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function getLocale(request: Request): MockLocale {
  const language = request.headers.get("accept-language") ?? "";

  return language.toLowerCase().startsWith("en") ? "en" : "zh";
}

function ok<T>(data: T, info = "success") {
  return Response.json({
    code: "0000",
    info,
    data,
  });
}

function notFound(path: string) {
  return Response.json(
    {
      code: "404",
      info: `Mock API not found: ${path}`,
      data: null,
    },
    { status: 404 },
  );
}

async function readPayload(request: Request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const apiPath = path.join("/");
  const locale = getLocale(request);
  const payload = await readPayload(request);
  const userId = typeof payload.userId === "string" ? payload.userId : "postman_user_001@test.com";
  const activityId = Number(payload.activityId ?? 200101);

  switch (apiPath) {
    case "login/send_login_code":
      return ok("123456", locale === "en" ? "Verification code sent" : "验证码已发送");
    case "login/account_login":
      return ok("mock-vercel-demo-token", locale === "en" ? "Login successful" : "登录成功");
    case "group-buy/create":
      return ok(createMockCreateResponse({ ...payload, userId }), locale === "en" ? "Group buy created" : "拼团已创建");
    case "group-buy/query_my_created_list":
      return ok(createMockCreatedResponse(locale, userId));
    case "group-buy/query_detail":
      return ok(createMockManageOverview(locale, activityId, userId).activityDetail);
    case "group-buy/product_library/search":
      return ok(createMockProductLibraryResponse(locale));
    case "group-buy/query_manage_overview":
      return ok(createMockManageOverview(locale, activityId, userId));
    case "group-buy/query_order_list":
      return ok(createMockGroupOrderListResponse(locale, activityId, userId));
    case "group-buy/join":
      return ok(createMockJoinResponse(activityId), locale === "en" ? "Joined group buy" : "参团成功");
    case "group-buy/ship":
      return ok(createMockShipResponse(activityId), locale === "en" ? "Shipment marked" : "已标记发货");
    case "group-buy/confirm_receipt":
      return ok(createMockConfirmReceiptResponse(String(payload.orderId ?? "mock-order-2000")), locale === "en" ? "Receipt confirmed" : "已确认收货");
    case "alipay/query_user_order_list":
      return ok(createMockOrderListResponse(locale, userId));
    default:
      return notFound(apiPath);
  }
}

export async function GET(request: Request, context: RouteContext) {
  return POST(request, context);
}
