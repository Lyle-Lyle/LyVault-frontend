"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BellRing,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Headphones,
  Home,
  Library,
  LoaderCircle,
  MapPinned,
  MessageCircle,
  PackagePlus,
  ReceiptText,
  RotateCcw,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Tags,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";
import { AppPageShell } from "@/components/app-page-shell";
import { Button } from "@/components/ui/button";
import { queryMyCreatedGroupBuyList, queryUserOrderList } from "@/lib/api/mall";
import { useSessionStore } from "@/store/session-store";

type RoleView = "leader" | "member";

const roleCopy = {
  leader: {
    eyebrow: "团长工作台",
    title: "把商品、配送和结算先配置好",
    description: "适合发起团购的人使用，重点管理商品库、规格模板、配送规则和收入结算。",
  },
  member: {
    eyebrow: "团员服务台",
    title: "下单、收货和售后都放在这里",
    description: "适合参团购买的人使用，重点处理联系团长、收货信息、订单通知和退款售后。",
  },
};

const leaderFeatures = [
  {
    title: "我的商品库",
    description: "维护常卖商品、图片、分类和价格，创建团购时可以直接导入。",
    icon: Library,
    href: "/group-buy/create",
    action: "去导入",
    accent: "bg-[#FFF0E7] text-[#D94D2A]",
  },
  {
    title: "商品资料设置",
    description: "管理商品分类、图片规范、默认描述和上架信息。",
    icon: Store,
    href: "/group-buy/create",
    action: "配置商品",
    accent: "bg-[#FFF6D8] text-[#9A5A00]",
  },
  {
    title: "常见规格模板",
    description: "保存小料、口味、重量、尺码等规格组，减少重复录入。",
    icon: Tags,
    href: "/group-buy/create",
    action: "管理规格",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "配送与运费模板",
    description: "配置同城配送、自提点、快递运费和用户需填写的信息。",
    icon: Truck,
    href: "/group-buy/create",
    action: "设置物流",
    accent: "bg-sky-50 text-sky-700",
  },
  {
    title: "收入与提现",
    description: "查看收入分析、服务费、结算金额和后续提现入口。",
    icon: WalletCards,
    href: "/income-analysis",
    action: "看收入",
    accent: "bg-orange-50 text-orange-700",
  },
  {
    title: "团购通知设置",
    description: "配置开团通知、成团提醒、发货提醒和订阅成员触达。",
    icon: BellRing,
    href: "/settings",
    action: "待接入",
    accent: "bg-slate-100 text-slate-700",
  },
];

const memberFeatures = [
  {
    title: "联系团长",
    description: "查看当前参与团购的团长联系方式，处理取货、配送和临时问题。",
    icon: MessageCircle,
    href: "/group-buy/joined",
    action: "查看团购",
    accent: "bg-[#FFF0E7] text-[#D94D2A]",
  },
  {
    title: "客服与售后",
    description: "订单异常、退款申请、漏发错发等问题统一从这里进入。",
    icon: Headphones,
    href: "/orders",
    action: "看订单",
    accent: "bg-sky-50 text-sky-700",
  },
  {
    title: "收货信息",
    description: "维护联系人、电话、地址和宿舍楼下取货备注。",
    icon: MapPinned,
    href: "/settings",
    action: "待接入",
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "参团通知",
    description: "设置开团、成团、发货、到达提醒，减少漏取餐和拿错团。",
    icon: BellRing,
    href: "/settings",
    action: "待接入",
    accent: "bg-[#FFF6D8] text-[#9A5A00]",
  },
  {
    title: "我的订单",
    description: "查看支付、配送、确认收货和退款状态。",
    icon: ReceiptText,
    href: "/orders",
    action: "去查看",
    accent: "bg-slate-100 text-slate-700",
  },
  {
    title: "隐私与授权",
    description: "管理手机号、地址等个人信息授权和安全提示。",
    icon: ShieldCheck,
    href: "/settings",
    action: "待接入",
    accent: "bg-purple-50 text-purple-700",
  },
];

export default function SettingsPage() {
  const session = useSessionStore((state) => state.session);
  const [roleView, setRoleView] = useState<RoleView>("leader");

  const createdQuery = useQuery({
    queryKey: ["settings", "created-activities", session?.account],
    queryFn: () =>
      queryMyCreatedGroupBuyList({
        userId: session?.account ?? "",
        lastId: null,
        pageSize: 20,
      }),
    enabled: Boolean(session?.account),
  });

  const orderQuery = useQuery({
    queryKey: ["settings", "orders", session?.account],
    queryFn: () =>
      queryUserOrderList({
        userId: session?.account ?? "",
        lastId: null,
        pageSize: 20,
      }),
    enabled: Boolean(session?.account),
  });

  const createdActivities = useMemo(() => createdQuery.data?.data?.activityList ?? [], [createdQuery.data]);
  const joinedOrders = useMemo(
    () => (orderQuery.data?.data?.orderList ?? []).filter((order) => order.marketType === 1),
    [orderQuery.data],
  );

  const inferredRole: RoleView = createdActivities.length || !joinedOrders.length ? "leader" : "member";
  const selectedCopy = roleCopy[roleView];
  const isLoading = createdQuery.isLoading || orderQuery.isLoading;

  const activeFeatures = roleView === "leader" ? leaderFeatures : memberFeatures;

  return (
    <AppPageShell
      backgroundClassName="bg-[linear-gradient(180deg,#fff4ed_0%,#edf7f2_58%,#f7fbff_100%)]"
      maxWidthClassName="max-w-6xl"
    >
      <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="rounded-[36px] border border-orange-100 bg-white p-6 shadow-[0_30px_90px_-68px_rgba(255,114,76,0.7)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-700">
            <Settings2 className="h-4 w-4" />
            设置
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">我的工作台</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            同一个账号可能既是团长，也会参与别人的团购。这里按身份把常用功能分开，避免团员看到一堆不相关的后台配置。
          </p>

          <div className="mt-6 rounded-[28px] bg-[linear-gradient(135deg,#fff1e9_0%,#fff_56%,#eff8f2_100%)] p-5 ring-1 ring-orange-100">
            <div className="text-sm font-bold text-slate-500">当前推荐视角</div>
            <div className="mt-2 text-2xl font-black text-slate-950">
              {inferredRole === "leader" ? "团长" : "团员"}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              已创建 {createdActivities.length} 个团购，已参与 {joinedOrders.length} 个团购。
            </p>
          </div>

          {isLoading ? (
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin text-orange-500" />
              正在判断当前身份
            </div>
          ) : null}
        </aside>

        <section className="rounded-[36px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#D94D2A]">{selectedCopy.eyebrow}</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{selectedCopy.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{selectedCopy.description}</p>
            </div>

            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <RoleButton active={roleView === "leader"} onClick={() => setRoleView("leader")}>
                团长
              </RoleButton>
              <RoleButton active={roleView === "member"} onClick={() => setRoleView("member")}>
                团员
              </RoleButton>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {activeFeatures.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>

          <div className="mt-6 grid gap-3 rounded-[28px] border border-dashed border-orange-200 bg-orange-50/60 p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2 text-lg font-black text-slate-950">
                <CircleHelp className="h-5 w-5 text-orange-600" />
                角色权限后面可以接后端
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                现在先按“是否创建过团购 / 是否参与过团购”推断身份。后续如果账号表提供 `团长、团员、管理员` 等角色字段，这里可以直接按角色渲染。
              </p>
            </div>
            <Button asChild className="rounded-full bg-[#FF724C] text-white hover:bg-[#FF8A52]">
              <Link href="/group-buy/create">
                创建拼团
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickSetting
          icon={SlidersHorizontal}
          title="默认偏好"
          description="后续可保存默认物流、默认描述、默认团购规则。"
        />
        <QuickSetting icon={ClipboardList} title="操作记录" description="预留给商品修改、发货、退款和客服处理记录。" />
        <QuickSetting icon={Home} title="本地服务" description="GTA 地区、自提点和校园楼栋服务配置。" />
      </section>
    </AppPageShell>
  );
}

function RoleButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-5 py-2 text-sm font-black transition ${
        active ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  action,
  accent,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  action: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[28px] border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_24px_70px_-55px_rgba(255,114,76,0.9)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 transition group-hover:bg-orange-50 group-hover:text-orange-700">
          {action}
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
      <h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}

function QuickSetting({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-sm">
      <Icon className="h-5 w-5 text-[#D94D2A]" />
      <h3 className="mt-4 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
