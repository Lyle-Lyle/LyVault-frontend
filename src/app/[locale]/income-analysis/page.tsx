"use client";

import { Link } from "@/i18n/navigation";
import { useMemo } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChartNoAxesCombined,
  ChevronRight,
  CircleDollarSign,
  LoaderCircle,
  MousePointerClick,
  PackageCheck,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";
import { AppPageShell } from "@/components/app-page-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryGroupBuyManageOverview, queryMyCreatedGroupBuyList } from "@/lib/api/mall";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useSessionStore } from "@/store/session-store";

const ACTIVE_STATUSES = new Set(["ACTIVE", "GROUP_SUCCESS", "WAITING_SHIP", "SHIPPED"]);

export default function IncomeAnalysisPage() {
  const session = useSessionStore((state) => state.session);

  const activityQuery = useQuery({
    queryKey: ["income-analysis", "created-activities", session?.account],
    queryFn: () =>
      queryMyCreatedGroupBuyList({
        userId: session?.account ?? "",
        lastId: null,
        pageSize: 20,
      }),
    enabled: Boolean(session?.account),
  });

  const activities = useMemo(() => activityQuery.data?.data?.activityList ?? [], [activityQuery.data]);

  const overviewQueries = useQueries({
    queries: activities.map((activity) => ({
      queryKey: ["income-analysis", "overview", session?.account, activity.activityId],
      queryFn: () =>
        queryGroupBuyManageOverview({
          userId: session?.account ?? "",
          activityId: activity.activityId,
          orderLastId: null,
          orderPageSize: 50,
        }),
      enabled: Boolean(session?.account),
    })),
  });

  const overviews = useMemo(
    () => overviewQueries.map((query) => query.data?.data).filter(Boolean),
    [overviewQueries],
  );

  const loadingOverview = overviewQueries.some((query) => query.isLoading);
  const isLoading = activityQuery.isLoading || loadingOverview;

  const summary = useMemo(() => {
    const totalPaidAmount = overviews.reduce(
      (sum, overview) => sum + (overview?.financialSummary.totalPaidAmount ?? 0),
      0,
    );
    const serviceFeeAmount = overviews.reduce(
      (sum, overview) => sum + (overview?.financialSummary.serviceFeeAmount ?? 0),
      0,
    );
    const settlementAmount = overviews.reduce(
      (sum, overview) => sum + (overview?.financialSummary.settlementAmount ?? 0),
      0,
    );
    const orderCount = overviews.reduce((sum, overview) => sum + (overview?.orderList.orderList.length ?? 0), 0);
    const paidParticipantCount = overviews.reduce(
      (sum, overview) => sum + (overview?.progressSummary.paidParticipantCount ?? 0),
      0,
    );
    const currentParticipantCount = overviews.reduce(
      (sum, overview) => sum + (overview?.progressSummary.currentParticipantCount ?? 0),
      0,
    );
    const doneParticipantCount = overviews.reduce(
      (sum, overview) => sum + (overview?.progressSummary.doneParticipantCount ?? 0),
      0,
    );
    const activeActivityCount = activities.filter((activity) => ACTIVE_STATUSES.has(activity.status)).length;
    const averageServiceFeeRate = overviews.length
      ? overviews.reduce((sum, overview) => sum + (overview?.financialSummary.serviceFeeRate ?? 0), 0) / overviews.length
      : 0;

    return {
      activeActivityCount,
      averageServiceFeeRate,
      currentParticipantCount,
      doneParticipantCount,
      orderCount,
      paidParticipantCount,
      serviceFeeAmount,
      settlementAmount,
      totalPaidAmount,
    };
  }, [activities, overviews]);

  const funnel = [
    { label: "参团人数", value: summary.currentParticipantCount, color: "bg-[#FF724C]" },
    { label: "已支付人数", value: summary.paidParticipantCount, color: "bg-[#FF9D5C]" },
    { label: "完成收货人数", value: summary.doneParticipantCount, color: "bg-[#FFBE55]" },
  ];

  return (
    <AppPageShell
      backgroundClassName="bg-[linear-gradient(180deg,#fff5ee_0%,#eef7f1_54%,#f8fbff_100%)]"
      maxWidthClassName="max-w-6xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-700">
            <ChartNoAxesCombined className="h-4 w-4" />
            数据统计
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">收入分析</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            汇总你创建的团购资金、服务费、结算金额和参团转化，先把团长最关心的钱袋子看清楚。
          </p>
        </div>

        <Button asChild variant="secondary" className="rounded-full px-5">
          <Link href="/group-buy/mine">
            查看我创建的团购
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {!session?.account ? (
        <EmptyState />
      ) : isLoading ? (
        <div className="grid min-h-[360px] place-items-center rounded-[32px] border border-orange-100 bg-white">
          <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <Tabs defaultValue="funds" className="gap-6">
          <TabsList className="w-full max-w-xl grid-cols-2 rounded-[28px] border border-orange-100 bg-white p-2 shadow-sm">
            <TabsTrigger
              value="funds"
              className="rounded-[20px] border-0 bg-transparent text-center data-[state=active]:bg-[#FF724C] data-[state=active]:text-white"
            >
              资金明细
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="rounded-[20px] border-0 bg-transparent text-center data-[state=active]:bg-[#FF724C] data-[state=active]:text-white"
            >
              用户数据
            </TabsTrigger>
          </TabsList>

          <TabsContent value="funds" className="space-y-6">
            <section className="overflow-hidden rounded-[36px] border border-orange-100 bg-white shadow-[0_30px_90px_-65px_rgba(255,114,76,0.75)]">
              <div className="grid gap-6 p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
                <div className="rounded-[28px] bg-[linear-gradient(135deg,#fff7f1_0%,#fff_48%,#edf8f2_100%)] p-6 ring-1 ring-orange-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-500">已入账收入</p>
                      <div className="mt-3 text-5xl font-black tracking-tight text-slate-950">
                        {formatCurrency(summary.settlementAmount)}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        按当前活动管理概览汇总，等后端补独立统计接口后可以替换为实时资金流水。
                      </p>
                    </div>
                    <Button className="rounded-full bg-emerald-500 px-5 text-white hover:bg-emerald-600">提现</Button>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <FundPill label="总收入" value={formatCurrency(summary.totalPaidAmount)} />
                    <FundPill label="技术服务费" value={formatCurrency(summary.serviceFeeAmount)} />
                    <FundPill label="平均费率" value={formatPercent(summary.averageServiceFeeRate)} />
                  </div>
                </div>

                <div className="grid gap-4">
                  <InsightCard
                    icon={ReceiptText}
                    label="跟团订单数"
                    value={`${summary.orderCount}`}
                    note="来自你创建的团购订单"
                  />
                  <InsightCard
                    icon={PackageCheck}
                    label="进行中的团购"
                    value={`${summary.activeActivityCount}`}
                    note="活跃、成团、待发货或已发货"
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <MetricPanel
                title="总收款"
                value={formatCurrency(summary.totalPaidAmount)}
                description="用户实际支付金额汇总"
                tone="orange"
              />
              <MetricPanel
                title="平台服务费"
                value={formatCurrency(summary.serviceFeeAmount)}
                description="按团购服务费率汇总"
                tone="slate"
              />
              <MetricPanel
                title="可结算金额"
                value={formatCurrency(summary.settlementAmount)}
                description="扣除服务费后的团长收入"
                tone="green"
              />
            </section>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <section className="rounded-[36px] border border-orange-100 bg-white p-6 shadow-[0_30px_90px_-65px_rgba(15,23,42,0.35)] lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">跟团路径分析</h2>
                  <p className="mt-2 text-sm text-slate-500">当前先展示参团到支付再到收货的核心漏斗。</p>
                </div>
                <button className="inline-flex items-center gap-1 text-sm font-bold text-orange-700">
                  流量宝典
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-2">
                  {funnel.map((item, index) => (
                    <div
                      key={item.label}
                      className={`mx-auto flex h-24 items-center justify-center text-center text-white ${item.color}`}
                      style={{
                        width: `${100 - index * 18}%`,
                        clipPath: "polygon(8% 0, 92% 0, 82% 100%, 18% 100%)",
                      }}
                    >
                      <div>
                        <div className="text-sm font-bold opacity-90">{item.label}</div>
                        <div className="mt-1 text-3xl font-black">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <InsightCard
                    icon={Users}
                    label="已下单用户"
                    value={`${summary.currentParticipantCount}`}
                    note="包含待支付与已支付"
                  />
                  <InsightCard
                    icon={CircleDollarSign}
                    label="支付转化率"
                    value={summary.currentParticipantCount ? formatPercent(summary.paidParticipantCount / summary.currentParticipantCount) : "0%"}
                    note="已支付人数 / 参团人数"
                  />
                  <InsightCard
                    icon={TrendingUp}
                    label="收货完成率"
                    value={summary.paidParticipantCount ? formatPercent(summary.doneParticipantCount / summary.paidParticipantCount) : "0%"}
                    note="完成收货 / 已支付人数"
                  />
                  <InsightCard
                    icon={MousePointerClick}
                    label="访问数据"
                    value="待接入"
                    note="后端补浏览埋点后展示"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">开团通知分析</h2>
                  <p className="mt-2 text-sm text-slate-500">预留给订阅通知、私信触达和复购来源。</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">coming soon</span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <FundPill label="团访问人数" value="待接入" />
                <FundPill label="跟团人数" value={`${summary.currentParticipantCount}`} />
                <FundPill label="下单金额" value={formatCurrency(summary.totalPaidAmount)} />
              </div>
            </section>
          </TabsContent>
        </Tabs>
      )}
    </AppPageShell>
  );
}

function FundPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-white/80 px-4 py-4 ring-1 ring-slate-200">
      <div className="text-xs font-bold text-slate-400">{label}</div>
      <div className="mt-2 text-xl font-black text-slate-950">{value}</div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-50 text-orange-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-500">{label}</div>
          <div className="text-2xl font-black text-slate-950">{value}</div>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{note}</p>
    </div>
  );
}

function MetricPanel({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  tone: "orange" | "green" | "slate";
}) {
  const toneClassName = {
    orange: "border-orange-100 bg-orange-50 text-orange-700",
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    slate: "border-slate-200 bg-white text-slate-700",
  }[tone];

  return (
    <div className={`rounded-[28px] border p-5 ${toneClassName}`}>
      <div className="text-sm font-bold opacity-80">{title}</div>
      <div className="mt-3 text-3xl font-black text-slate-950">{value}</div>
      <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[32px] border border-dashed border-orange-200 bg-white/80 p-10 text-center shadow-sm">
      <p className="text-xl font-bold text-slate-900">请先登录后查看收入分析</p>
      <p className="mt-3 text-base leading-7 text-slate-500">登录后会按当前账号汇总你创建的团购数据。</p>
      <Link
        href="/login"
        className="mt-6 inline-flex rounded-full bg-orange-600 px-5 py-3 font-semibold text-white transition hover:bg-orange-500"
      >
        去登录
      </Link>
    </div>
  );
}
