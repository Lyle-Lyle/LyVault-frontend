"use client";

import { Link } from "@/i18n/navigation";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, Plus } from "lucide-react";
import { ActivityStatusBadge } from "@/components/activity-status-badge";
import { AppPageShell } from "@/components/app-page-shell";
import { queryMyCreatedGroupBuyList } from "@/lib/api/mall";
import { formatDateTime, formatPercent } from "@/lib/format";
import { getFulfillmentLabel, getPricingModeLabel } from "@/lib/group-buy";
import { useSessionStore } from "@/store/session-store";

export default function GroupBuyMinePage() {
  const session = useSessionStore((state) => state.session);

  const activityQuery = useQuery({
    queryKey: ["group-buy", "mine", session?.account],
    queryFn: () =>
      queryMyCreatedGroupBuyList({
        userId: session?.account ?? "",
        lastId: null,
        pageSize: 20,
      }),
    enabled: Boolean(session?.account),
  });

  const activities = useMemo(() => activityQuery.data?.data?.activityList ?? [], [activityQuery.data]);

  return (
    <AppPageShell
      backgroundClassName="bg-[linear-gradient(180deg,#eaf0f8_0%,#f8f4ed_100%)]"
      maxWidthClassName="max-w-6xl"
    >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">Mine</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">我创建的团购</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              这里对接 `/api/v1/group-buy/query_my_created_list`，用于快速进入管理页和用户侧详情页。
            </p>
          </div>

          <Link
            href="/group-buy/create"
            className="inline-flex items-center gap-2 rounded-full bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            <Plus className="h-4 w-4" />
            创建新拼团
          </Link>
        </div>

        {!session?.account ? (
          <EmptyState
            title="请先登录后查看你创建的拼团"
            description="登录后会直接使用当前账号作为 userId 调用 query_my_created_list。"
            actionHref="/login"
            actionLabel="去登录"
          />
        ) : activityQuery.isLoading ? (
          <div className="grid min-h-[280px] place-items-center rounded-[32px] border border-slate-200 bg-white">
            <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="grid gap-4">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.45)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Activity #{activity.activityId}</p>
                    <h2 className="mt-3 text-2xl font-black text-slate-950">{activity.activityName}</h2>
                    <p className="mt-3 text-sm text-slate-500">
                      商品 {activity.productId} · {getPricingModeLabel(activity.pricingMode)} · {getFulfillmentLabel(activity.fulfillmentType)}
                    </p>
                  </div>
                  <ActivityStatusBadge status={activity.status} />
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric label="成团人数" value={`${activity.requiredParticipantCount} 人`} />
                  <Metric label="人数上限" value={`${activity.maxParticipantCount} 人`} />
                  <Metric label="服务费率" value={formatPercent(activity.serviceFeeRate)} />
                  <Metric label="创建时间" value={formatDateTime(activity.createTime)} compact />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/group-buy/manage/${activity.activityId}`}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    管理拼团
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/group-buy/detail/${activity.activityId}`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    查看用户页
                  </Link>
                </div>
              </article>
            ))}

            {!activities.length ? (
              <EmptyState
                title="当前账号还没有创建拼团"
                description="可以先去创建活动，再返回这里查看活动列表。"
                actionHref="/group-buy/create"
                actionLabel="去创建"
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
    <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-sm">
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
