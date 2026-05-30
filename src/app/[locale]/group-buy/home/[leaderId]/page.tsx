"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  BellPlus,
  ChevronRight,
  Clock3,
  Headphones,
  HeartHandshake,
  ImagePlus,
  LoaderCircle,
  MapPin,
  MessageCircle,
  PackagePlus,
  PenLine,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { ActivityStatusBadge } from "@/components/activity-status-badge";
import { AppPageShell } from "@/components/app-page-shell";
import { Button } from "@/components/ui/button";
import { queryMyCreatedGroupBuyList } from "@/lib/api/mall";
import { formatDateTime } from "@/lib/format";
import { useSessionStore } from "@/store/session-store";

type SortMode = "default" | "newest" | "sales";

const sortOptions: Array<{ value: SortMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { value: "default", label: "默认", icon: Star },
  { value: "newest", label: "上新", icon: Clock3 },
  { value: "sales", label: "销量", icon: TrendingUp },
];

export default function GroupBuyHomePage() {
  const params = useParams<{ leaderId: string }>();
  const session = useSessionStore((state) => state.session);
  const leaderId = decodeURIComponent(params.leaderId);
  const isOwner = session?.account === leaderId;
  const [sortMode, setSortMode] = useState<SortMode>("default");

  const activityQuery = useQuery({
    queryKey: ["group-buy", "home", leaderId],
    queryFn: () =>
      queryMyCreatedGroupBuyList({
        userId: leaderId,
        lastId: null,
        pageSize: 30,
      }),
    enabled: Boolean(leaderId),
    refetchInterval: 8000,
  });

  const activities = useMemo(() => activityQuery.data?.data?.activityList ?? [], [activityQuery.data]);

  const sortedActivities = useMemo(() => {
    const next = [...activities];
    if (sortMode === "newest") {
      return next.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    }
    if (sortMode === "sales") {
      return next.sort((a, b) => b.requiredParticipantCount - a.requiredParticipantCount);
    }
    return next.sort((a, b) => {
      const statusScore = Number(a.status === "ACTIVE") - Number(b.status === "ACTIVE");
      return statusScore === 0 ? new Date(b.createTime).getTime() - new Date(a.createTime).getTime() : -statusScore;
    });
  }, [activities, sortMode]);

  const activeCount = activities.filter((activity) => activity.status === "ACTIVE").length;
  const productCount = activities.reduce((sum, activity) => sum + (activity.productCount ?? 1), 0);
  const followerCount = Math.max(125, activities.length * 18 + activeCount * 7);
  const memberCount = Math.max(60, activities.length * 46 + productCount * 3);

  return (
    <AppPageShell
      backgroundClassName="bg-[linear-gradient(180deg,#fff4ed_0%,#edf7f2_48%,#f8fbff_100%)]"
      maxWidthClassName="max-w-6xl"
      contentClassName="gap-6 pb-14 pt-6"
    >
      <section className="overflow-hidden rounded-[36px] border border-orange-100 bg-white shadow-[0_30px_95px_-68px_rgba(255,114,76,0.75)]">
        <div className="relative min-h-[300px] bg-[linear-gradient(135deg,#ff724c_0%,#ffb35c_46%,#e7f5ef_100%)]">
          <div className="absolute inset-0 opacity-85 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.52),transparent_24%),radial-gradient(circle_at_82%_10%,rgba(255,255,255,0.38),transparent_22%),radial-gradient(circle_at_76%_82%,rgba(255,255,255,0.48),transparent_26%)]" />
          <div className="relative flex flex-wrap items-start justify-between gap-4 p-5 sm:p-7">
            <button className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white/85 px-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur">
              <Search className="h-4 w-4" />
              搜索团内商品
            </button>
            <div className="flex items-center gap-2">
              <IconButton label="相册素材号" icon={ImagePlus} />
              <IconButton label="分享" icon={Share2} />
              {isOwner ? <IconButton label="编辑主页" icon={PenLine} /> : null}
            </div>
          </div>
        </div>

        <div className="relative px-5 pb-6 sm:px-7">
          <div className="-mt-16 grid gap-5 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-62px_rgba(15,23,42,0.55)] lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[24px] border-4 border-white bg-orange-50 shadow-lg">
                <Image src="/logo-spark-mascot.svg" alt="团长头像" fill className="object-cover p-3" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-slate-950">
                    {leaderId.length > 18 ? `${leaderId.slice(0, 18)}...` : leaderId}
                  </h1>
                  {isOwner ? (
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">我的主页</span>
                  ) : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold text-slate-500">
                  <span>成员 {memberCount}+</span>
                  <span>跟团 {activities.length}</span>
                  <span>关注 {followerCount}</span>
                </div>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                  GTA 本地团购 · 校园宿舍楼下配送、自提和周末补货。订阅后可以及时收到开团、成团和到达提醒。
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <MapPin className="h-4 w-4 text-[#D94D2A]" />
                  GTA 地区 · 校园楼下 / 社区自提
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 lg:w-[280px]">
              <QuickAction
                icon={Headphones}
                label="客服"
                onClick={() => toast.message("客服入口待接入，可先联系团长微信或站内消息")}
              />
              <QuickAction
                icon={BellPlus}
                label="订阅邀请"
                onClick={() => toast.success("已模拟订阅，后面可接订阅接口")}
              />
              <QuickAction
                icon={HeartHandshake}
                label="帮卖介绍"
                onClick={() => toast.message("帮卖介绍待接入")}
              />
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <InfoStrip icon={MessageCircle} title="主页公告" text="下单后请留意电话和私信，到达后尽快取货，避免拿错团。" />
            <InfoStrip icon={ImagePlus} title="相册素材号" text="团长可上传商品素材，方便团员分享和帮卖。" />
            <InfoStrip icon={Sparkles} title="推荐赚" text="后续可配置佣金比例，帮卖员带来的订单可追踪。" />
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-950">正在开的团</h2>
            <p className="mt-2 text-sm text-slate-500">默认优先展示进行中的团购，也可以按上新或销量查看。</p>
          </div>

          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSortMode(option.value)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${
                  sortMode === option.value ? "bg-[#FF724C] text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
              >
                <option.icon className="h-4 w-4" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {activityQuery.isLoading ? (
          <div className="mt-6 grid min-h-[260px] place-items-center rounded-[28px] border border-slate-200 bg-slate-50">
            <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : sortedActivities.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {sortedActivities.map((activity, index) => (
              <Link
                key={activity.activityId}
                href={`/group-buy/detail/${activity.activityId}`}
                className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_28px_80px_-58px_rgba(255,114,76,0.9)]"
              >
                <div className="grid gap-4 p-4 sm:grid-cols-[150px_1fr]">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-orange-50">
                    <Image
                      src={activity.coverImageUrl || fallbackImage(index)}
                      alt={activity.activityName}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-[1.04]"
                    />
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-black text-[#D94D2A] shadow-sm">
                      {index + 1}
                    </div>
                  </div>

                  <div className="min-w-0 py-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-xl font-black leading-snug text-slate-950">{activity.activityName}</h3>
                      <ActivityStatusBadge status={activity.status} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {activity.firstProductName || "团内多件商品组合，适合本地补货和社区拼团。"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-orange-700">
                        {activity.productCount ?? 1} 个商品
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        满 {activity.requiredParticipantCount} 人成团
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {formatDateTime(activity.createTime)}
                      </span>
                    </div>
                    <div className="mt-4 inline-flex items-center gap-1 text-sm font-black text-[#D94D2A]">
                      进入团购
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[28px] border border-dashed border-orange-200 bg-orange-50/70 p-10 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-[#D94D2A]" />
            <p className="mt-4 text-lg font-black text-slate-950">这个团长还没有公开团购</p>
            <p className="mt-2 text-sm text-slate-500">可以先订阅主页，等下一次开团提醒。</p>
          </div>
        )}
      </section>

      {isOwner ? (
        <div className="sticky bottom-4 z-10 mx-auto flex w-fit rounded-full border border-orange-100 bg-white/92 p-2 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.65)] backdrop-blur">
          <Button asChild className="rounded-full bg-[#FF724C] px-6 text-white hover:bg-[#FF8A52]">
            <Link href="/group-buy/create">
              <PackagePlus className="h-4 w-4" />
              创建新团购
            </Link>
          </Button>
        </div>
      ) : null}
    </AppPageShell>
  );
}

function IconButton({
  label,
  icon: Icon,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white/85 px-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur transition hover:bg-white"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid place-items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-black text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function InfoStrip({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-slate-900">
        <Icon className="h-4 w-4 text-[#D94D2A]" />
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}

function fallbackImage(index: number) {
  const images = ["/hero-spring-bundle.svg", "/banner-weekly-hot.svg", "/hero-newcomer.svg", "/banner-flash-sale.svg"];
  return images[index % images.length];
}
