"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { queryUserOrderList, refundOrder } from "@/lib/api/mall";
import { useSessionStore } from "@/store/session-store";

export default function OrdersPage() {
  const session = useSessionStore((state) => state.session);
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["orders", session?.account],
    queryFn: () =>
      queryUserOrderList({
        userId: session?.account ?? "",
        lastId: null,
        pageSize: 20,
      }),
    enabled: Boolean(session?.account),
  });

  const refundMutation = useMutation({
    mutationFn: refundOrder,
    onSuccess: (response) => {
      if (response.code !== "0000" || !response.data?.success) {
        toast.error(response.data?.message || response.info || "退款失败");
        return;
      }
      toast.success("退款请求已发起");
      queryClient.invalidateQueries({ queryKey: ["orders", session?.account] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "退款失败");
    },
  });

  const orders = useMemo(() => orderQuery.data?.data?.orderList ?? [], [orderQuery.data]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eaf0f8_0%,#f8f4ed_100%)] text-slate-900">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">我的订单</h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              查看 mock 支付后的订单状态、拼团优惠金额，以及发起退款请求。
            </p>
          </div>

          <div className="rounded-[28px] bg-slate-950 px-5 py-4 text-white">
            <div className="text-sm text-slate-300">当前用户</div>
            <div className="mt-2 text-lg font-bold">{session?.account ?? "未登录"}</div>
          </div>
        </div>

        {!session?.account ? (
          <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
            <p className="text-lg text-slate-600">请先登录后查看订单。</p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
            >
              去登录
            </Link>
          </div>
        ) : orderQuery.isLoading ? (
          <div className="grid min-h-[280px] place-items-center rounded-[32px] border border-slate-200 bg-white">
            <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <article
                key={order.orderId}
                className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.45)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      <ReceiptText className="h-4 w-4" />
                      订单号 {order.orderId}
                    </div>
                    <h2 className="text-2xl font-black text-slate-950">{order.productName}</h2>
                    <p className="text-sm text-slate-500">商品 ID：{order.productId}</p>
                  </div>

                  <OrderStatusBadge status={order.status ?? "UNKNOWN"} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric label="原价" value={`¥${order.totalAmount ?? 0}`} />
                  <Metric label="支付金额" value={`¥${order.payAmount ?? order.totalAmount ?? 0}`} highlight />
                  <Metric label="营销类型" value={order.marketType === 1 ? "拼团营销" : "普通购买"} />
                  <Metric label="优惠金额" value={`¥${order.marketDeductionAmount ?? 0}`} />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {order.marketType === 1 ? (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                      拼团优惠已生效
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      普通订单
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={refundMutation.isPending}
                    onClick={() =>
                      refundMutation.mutate({
                        userId: session.account,
                        orderId: order.orderId,
                      })
                    }
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    发起退款
                  </button>
                </div>
              </article>
            ))}

            {!orders.length ? (
              <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
                当前账号还没有订单。
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-[24px] px-4 py-4 ${highlight ? "bg-orange-50 ring-1 ring-orange-100" : "bg-slate-50 ring-1 ring-slate-200"}`}>
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-black ${highlight ? "text-orange-600" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}
