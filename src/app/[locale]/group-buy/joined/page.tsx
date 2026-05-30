"use client";

import { Link } from "@/i18n/navigation";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, PackageCheck, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { AppPageShell } from "@/components/app-page-shell";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { confirmReceipt, queryUserOrderList } from "@/lib/api/mall";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { canConfirmReceipt } from "@/lib/group-buy";
import { useSessionStore } from "@/store/session-store";

export default function GroupBuyJoinedPage() {
  const session = useSessionStore((state) => state.session);
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ["group-buy", "joined", session?.account],
    queryFn: () =>
      queryUserOrderList({
        userId: session?.account ?? "",
        lastId: null,
        pageSize: 20,
      }),
    enabled: Boolean(session?.account),
    refetchInterval: 5000,
  });

  const confirmMutation = useMutation({
    mutationFn: confirmReceipt,
    onSuccess: (response) => {
      if (response.code !== "0000" || !response.data) {
        toast.error(response.info || "确认收货失败");
        return;
      }
      toast.success("确认收货成功");
      queryClient.invalidateQueries({ queryKey: ["group-buy", "joined", session?.account] });
      queryClient.invalidateQueries({ queryKey: ["orders", session?.account] });
      queryClient.invalidateQueries({ queryKey: ["group-buy", "manage", response.data.activityId] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "确认收货失败");
    },
  });

  const groupBuyOrders = useMemo(
    () => (orderQuery.data?.data?.orderList ?? []).filter((order) => order.marketType === 1),
    [orderQuery.data],
  );

  return (
    <AppPageShell
      backgroundClassName="bg-[linear-gradient(180deg,#fff3ea_0%,#eef6f0_100%)]"
      maxWidthClassName="max-w-6xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-700">
            <PackageCheck className="h-4 w-4" />
            Joined Group Buys
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">我参与的团购</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            这里集中展示当前账号参与过的拼团订单，可以返回活动页，也可以在可收货状态下确认收货。
          </p>
        </div>

        <Link
          href="/orders"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
        >
          <ReceiptText className="h-4 w-4" />
          查看全部订单
        </Link>
      </div>

      {!session?.account ? (
        <EmptyState
          title="请先登录后查看你参与的团购"
          description="登录后会使用当前账号查询订单，再筛选出拼团订单。"
          actionHref="/login"
          actionLabel="去登录"
        />
      ) : orderQuery.isLoading ? (
        <div className="grid min-h-[280px] place-items-center rounded-[32px] border border-slate-200 bg-white">
          <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid gap-4">
          {groupBuyOrders.map((order) => (
            <article
              key={order.orderId}
              className="rounded-[32px] border border-orange-100 bg-white p-6 shadow-[0_24px_90px_-60px_rgba(255,114,76,0.45)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
                    <ReceiptText className="h-4 w-4" />
                    拼团订单 {order.orderId}
                  </div>
                  <h2 className="text-2xl font-black text-slate-950">{order.productName}</h2>
                  <p className="text-sm text-slate-500">
                    商品 ID：{order.productId}
                    {order.groupBuyActivityId ? ` · 活动 ID：${order.groupBuyActivityId}` : ""}
                  </p>
                </div>

                <OrderStatusBadge status={order.status ?? "UNKNOWN"} />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="支付金额" value={formatCurrency(order.payAmount)} highlight />
                <Metric label="原价" value={formatCurrency(order.totalAmount)} />
                <Metric label="优惠金额" value={formatCurrency(order.marketDeductionAmount)} />
                <Metric label="支付时间" value={formatDateTime(order.payTime ?? null)} compact />
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {order.groupBuyActivityId ? (
                  <Link
                    href={`/group-buy/detail/${order.groupBuyActivityId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                  >
                    查看团购
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}

                <button
                  type="button"
                  disabled={confirmMutation.isPending || !canConfirmReceipt(order.status)}
                  onClick={() =>
                    confirmMutation.mutate({
                      userId: session.account,
                      orderId: order.orderId,
                    })
                  }
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  确认收货
                </button>
              </div>
            </article>
          ))}

          {!groupBuyOrders.length ? (
            <EmptyState
              title="当前账号还没有参与过团购"
              description="之后用户参与拼团并完成下单后，会在这里看到自己的参团记录。"
              actionHref="/"
              actionLabel="去逛逛"
            />
          ) : null}
        </div>
      )}
    </AppPageShell>
  );
}

function Metric({
  label,
  value,
  highlight = false,
  compact = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] px-4 py-4 ${
        highlight ? "bg-orange-50 ring-1 ring-orange-100" : "bg-slate-50 ring-1 ring-slate-200"
      }`}
    >
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 font-black ${compact ? "text-lg" : "text-2xl"} ${highlight ? "text-orange-600" : "text-slate-900"}`}>
        {value}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-[32px] border border-dashed border-orange-200 bg-white/80 p-10 text-center shadow-sm">
      <p className="text-xl font-bold text-slate-900">{title}</p>
      <p className="mt-3 text-base leading-7 text-slate-500">{description}</p>
      <Link
        href={actionHref}
        className="mt-6 inline-flex rounded-full bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
