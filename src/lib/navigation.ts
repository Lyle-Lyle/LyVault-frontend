import {
  ChartNoAxesCombined,
  PackageCheck,
  PackagePlus,
  ReceiptText,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  labelKey: string;
  note?: string;
  noteKey?: string;
  icon: LucideIcon;
};

export const PRIMARY_ACTION_ITEM: AppNavItem = {
  href: "/group-buy/create",
  label: "创建拼团",
  labelKey: "createGroupBuy",
  note: "快速发起新活动",
  noteKey: "createGroupBuyNote",
  icon: PackagePlus,
};

export const ACCOUNT_MENU_ITEMS: AppNavItem[] = [
  {
    href: "/group-buy/mine",
    label: "我创建的团购",
    labelKey: "myCreatedGroupBuys",
    note: "查看活动与管理入口",
    noteKey: "myCreatedGroupBuysNote",
    icon: Users,
  },
  {
    href: "/group-buy/joined",
    label: "我参与的团购",
    labelKey: "myJoinedGroupBuys",
    note: "查看参团记录与活动入口",
    noteKey: "myJoinedGroupBuysNote",
    icon: PackageCheck,
  },
  {
    href: "/orders",
    label: "我的订单",
    labelKey: "myOrders",
    note: "确认收货与状态追踪",
    noteKey: "myOrdersNote",
    icon: ReceiptText,
  },
  {
    href: "/income-analysis",
    label: "收入分析",
    labelKey: "incomeAnalysis",
    note: "资金明细与用户数据",
    noteKey: "incomeAnalysisNote",
    icon: ChartNoAxesCombined,
  },
  {
    href: "/settings",
    label: "设置",
    labelKey: "settings",
    note: "团长与团员功能配置",
    noteKey: "settingsNote",
    icon: Settings2,
  },
];
