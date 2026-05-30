"use client";

import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, PackageCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { ActivityStatusBadge } from "@/components/activity-status-badge";
import { AppPageShell } from "@/components/app-page-shell";
import { OrderStatusBadge } from "@/components/order-status-badge";
import { queryGroupBuyManageOverview, shipGroupBuy } from "@/lib/api/mall";
import { formatCurrency, formatDateTime, formatPercent } from "@/lib/format";
import { getFulfillmentLabel, getPricingModeLabel } from "@/lib/group-buy";
import { useSessionStore } from "@/store/session-store";

export default function GroupBuyManagePage() {
  const params = useParams<{ activityId: string }>();
  const session = useSessionStore((state) => state.session);
  const queryClient = useQueryClient();
  const activityId = Number(params.activityId);

  const overviewQuery = useQuery({
    queryKey: ["group-buy", "manage", activityId, session?.account],
    queryFn: () =>
      queryGroupBuyManageOverview({
        userId: session?.account ?? "",
        activityId,
        orderLastId: null,
        orderPageSize: 20,
      }),
    enabled: Boolean(session?.account) && Number.isFinite(activityId),
    refetchInterval: 5000,
  });

  const shipMutation = useMutation({
    mutationFn: shipGroupBuy,
    onSuccess: (response) => {
      if (response.code !== "0000" || !response.data) {
        toast.error(response.info || "发货失败");
        return;
      }

      toast.success("卖家已发货，活动状态已更新");
      queryClient.invalidateQueries({ queryKey: ["group-buy", "manage", activityId, session?.account] });
      queryClient.invalidateQueries({ queryKey: ["orders", session?.account] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "发货失败");
    },
  });

  const overview = overviewQuery.data?.data;
  const detail = overview?.activityDetail;
  const progress = overview?.progressSummary;
  const financial = overview?.financialSummary;

  return (
    <AppPageShell backgroundClassName="bg-[linear-gradient(180deg,#eef3f8_0%,#fbf5eb_100%)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">Manage Overview</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">拼团管理详情</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              这个页面对接 `/api/v1/group-buy/query_manage_overview`，包含活动信息、价格规则、进度摘要、资金摘要和订单列表。
            </p>
          </div>

          {detail ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/group-buy/detail/${detail.activityId}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                查看用户页
              </Link>
              <button
                type="button"
                disabled={!overview?.shippable || shipMutation.isPending}
                onClick={() =>
                  shipMutation.mutate({
                    userId: session?.account ?? "",
                    activityId,
                  })
                }
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {shipMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                发货
              </button>
            </div>
          ) : null}
        </div>

        {!session?.account ? (
          <EmptyState />
        ) : overviewQuery.isLoading ? (
          <div className="grid min-h-[280px] place-items-center rounded-[32px] border border-slate-200 bg-white">
            <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : !detail || !progress || !financial ? (
          <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
            当前未拿到拼团详情，请确认活动 ID 是否正确。
          </div>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <article className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.45)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Activity #{detail.activityId}</p>
                    <h2 className="mt-3 text-3xl font-black text-slate-950">{detail.activityName}</h2>
                    <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">{detail.activityDesc}</p>
                  </div>
                  <ActivityStatusBadge status={detail.status} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric label="商品 ID" value={detail.productId} />
                  <Metric label="定价模式" value={getPricingModeLabel(detail.pricingMode)} />
                  <Metric label="履约方式" value={getFulfillmentLabel(detail.fulfillmentType)} />
                  <Metric label="自动确认" value={`${detail.autoConfirmDays} 天`} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <Metric label="当前参团人数" value={`${detail.currentParticipantCount} 人`} />
                  <Metric label="已支付人数" value={`${detail.paidParticipantCount} 人`} />
                  <Metric label="已完成人数" value={`${detail.doneParticipantCount} 人`} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <Metric label="创建时间" value={formatDateTime(detail.createTime ?? null)} compact />
                  <Metric label="成团时间" value={formatDateTime(detail.groupSuccessTime ?? null)} compact />
                  <Metric label="发货时间" value={formatDateTime(detail.sellerShipTime ?? null)} compact />
                </div>

                <section className="mt-6 rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-200">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <PackageCheck className="h-4 w-4 text-emerald-600" />
                    价格规则
                  </div>
                  <div className="mt-4 grid gap-3">
                    {detail.priceRules?.map((rule) => (
                      <div
                        key={`${rule.stepNo ?? rule.thresholdPeople}-${rule.price}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-white px-4 py-4 ring-1 ring-slate-200"
                      >
                        <span className="text-sm font-semibold text-slate-600">满 {rule.thresholdPeople} 人</span>
                        <span className="text-xl font-black text-orange-600">{formatCurrency(rule.price)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </article>

              <aside className="grid gap-6">
                <Panel title="进度摘要">
                  <PanelMetric label="距离成团" value={`${progress.remainingToSuccessCount} 人`} />
                  <PanelMetric label="待支付人数" value={`${progress.waitingPayParticipantCount} 人`} />
                  <PanelMetric label="待确认收货" value={`${progress.waitingReceiptParticipantCount} 人`} />
                  <PanelMetric label="人数上限" value={`${progress.maxParticipantCount} 人`} />
                </Panel>

                <Panel title="资金摘要">
                  <PanelMetric label="总支付金额" value={formatCurrency(financial.totalPaidAmount)} />
                  <PanelMetric label="服务费率" value={formatPercent(financial.serviceFeeRate)} />
                  <PanelMetric label="服务费金额" value={formatCurrency(financial.serviceFeeAmount)} />
                  <PanelMetric label="结算金额" value={formatCurrency(financial.settlementAmount)} />
                </Panel>

                <Panel title="按钮状态">
                  <PanelMetric label="可发货" value={overview.shippable ? "是" : "否"} />
                  <PanelMetric label="进入确认收货阶段" value={overview.receivable ? "是" : "否"} />
                  <PanelMetric label="已结算" value={overview.settled ? "是" : "否"} />
                </Panel>
              </aside>
            </section>

            <section className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.45)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">参团订单</h2>
                  <p className="mt-2 text-sm text-slate-500">来自 manage overview 的 orderList。</p>
                </div>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  去我的订单
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 grid gap-4">
                {overview.orderList.orderList.map((order) => (
                  <article key={order.orderId} className="rounded-[28px] bg-slate-50 p-5 ring-1 ring-slate-200">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Order {order.orderId}</p>
                        <h3 className="mt-2 text-xl font-black text-slate-950">{order.productName}</h3>
                        <p className="mt-2 text-sm text-slate-500">
                          用户 {order.userId} · 下单时间 {formatDateTime(order.orderTime)}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <Metric label="支付金额" value={formatCurrency(order.payAmount)} />
                      <Metric label="原价" value={formatCurrency(order.totalAmount)} />
                      <Metric label="优惠金额" value={formatCurrency(order.marketDeductionAmount)} />
                      <Metric label="支付时间" value={formatDateTime(order.payTime ?? null)} compact />
                    </div>
                  </article>
                ))}

                {!overview.orderList.orderList.length ? (
                  <div className="rounded-[28px] border border-dashed border-slate-300 p-8 text-center text-slate-500">
                    当前活动还没有参团订单。
                  </div>
                ) : null}
              </div>
            </section>
          </>
        )}
    </AppPageShell>
  );
}

function Metric({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[24px] bg-slate-50 px-4 py-4 ring-1 ring-slate-200">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 font-black text-slate-900 ${compact ? "text-lg" : "text-2xl"}`}>{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[32px] border border-slate-300/60 bg-slate-950 p-6 text-white shadow-[0_24px_90px_-45px_rgba(15,23,42,0.82)]">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function PanelMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] bg-white/8 px-4 py-4 ring-1 ring-white/10">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
      <p className="text-lg text-slate-600">请先登录后查看拼团管理详情。</p>
      <Link
        href="/login"
        className="mt-6 inline-flex rounded-full bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
      >
        去登录
      </Link>
    </div>
  );
}
