"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useState } from "react";
import {
  BadgeDollarSign,
  ArrowRight,
  BadgePercent,
  BaggageClaim,
  Clock3,
  CookingPot,
  Gift,
  HandPlatter,
  Leaf,
  MapPinned,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { AppPageShell } from "@/components/app-page-shell";
import { getCommunityLocationByPostalCode } from "@/lib/location";

const HERO_BANNERS = [
  {
    eyebrow: "本周热门团购",
    title: "湾区妈妈群都在拼的春季补货团",
    subtitle: "抹茶零食 + 牛乳面包 + 火锅底料",
    cta: "立即参团",
    href: "/group-buy/detail/100123",
    span: "lg:col-span-5",
    bgClassName: "bg-[linear-gradient(135deg,#f8f4ea_0%,#ffffff_38%,#eef7ff_100%)]",
    toneClassName: "bg-[radial-gradient(circle_at_78%_18%,rgba(255,207,163,0.88),transparent_18%),radial-gradient(circle_at_88%_78%,rgba(184,221,255,0.7),transparent_18%)]",
    products: [
      {
        src: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
        alt: "咔滋脆片",
        className: "bottom-10 right-[30%] h-[220px] w-[220px] rotate-[-8deg]",
      },
      {
        src: "https://cdn.yamibuy.net/item/2c9f9d3693fd0d7f4c70b50747adafbe_757x757.webp",
        alt: "牛乳面包",
        className: "bottom-8 right-[6%] h-[260px] w-[260px] rotate-[6deg]",
      },
      {
        src: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
        alt: "火锅底料",
        className: "top-12 right-[18%] h-[180px] w-[180px] rotate-[9deg]",
      },
    ],
  },
  {
    eyebrow: "新人首单团",
    title: "新用户进团立减",
    subtitle: "低门槛早餐补货组合",
    cta: "立即开团",
    href: "/group-buy/create",
    span: "lg:col-span-4",
    bgClassName: "bg-[linear-gradient(135deg,#edf7ff_0%,#e5f1fb_100%)]",
    toneClassName: "bg-[radial-gradient(circle_at_72%_18%,rgba(255,233,145,0.88),transparent_16%),radial-gradient(circle_at_76%_82%,rgba(185,220,248,0.72),transparent_20%)]",
    products: [
      {
        src: "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
        alt: "早餐饼干",
        className: "bottom-16 right-[26%] h-[140px] w-[140px] rotate-[-6deg] opacity-90",
      },
      {
        src: "https://cdn.yamibuy.net/item/2c9f9d3693fd0d7f4c70b50747adafbe_757x757.webp",
        alt: "早餐面包",
        className: "bottom-8 right-[10%] h-[228px] w-[228px] rotate-[8deg]",
      },
      {
        src: "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
        alt: "牛奶",
        className: "top-24 right-[34%] h-[110px] w-[110px] rotate-[4deg]",
      },
    ],
  },
  {
    eyebrow: "限时特价团",
    title: "48 小时快闪团",
    subtitle: "低价高频 · 今日截止",
    cta: "查看特价",
    href: "/orders",
    span: "lg:col-span-3",
    bgClassName: "bg-[linear-gradient(135deg,#fff4ee_0%,#fff8f4_100%)]",
    toneClassName: "bg-[radial-gradient(circle_at_86%_18%,rgba(255,214,202,0.95),transparent_22%)]",
    products: [
      {
        src: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
        alt: "膨化零食",
        className: "bottom-20 right-[26%] h-[150px] w-[150px] rotate-[-10deg]",
      },
      {
        src: "https://cdn.yamibuy.net/item/2c9f9d3693fd0d7f4c70b50747adafbe_757x757.webp",
        alt: "面包零食",
        className: "bottom-10 right-[6%] h-[168px] w-[168px] rotate-[8deg]",
      },
    ],
  },
];

const FEATURE_SHELVES = [
  {
    title: "本周劲爆特价",
    href: "/orders",
    items: [
      {
        title: "望梅好气泡果汁拼团",
        price: "$2.69",
        originalPrice: "$3.29",
        badge: "限时秒杀",
        meta: "6 / 8 人 · 还差 2 人",
        participants: ["J", "R", "M", "A", "K", "T"],
        href: "/group-buy/detail/200101",
        image: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      },
      {
        title: "桂花米酒微醺小聚团",
        price: "$4.49",
        originalPrice: "$4.99",
        badge: "额外 9 折",
        meta: "12 / 15 人 · 今晚截止",
        participants: ["S", "L", "C", "N", "E"],
        href: "/group-buy/detail/200102",
        image: "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
      },
      {
        title: "牛乳面包早餐拼团",
        price: "$8.99",
        originalPrice: "$11.20",
        badge: "早餐必入",
        meta: "18 / 20 人 · 还差 2 人",
        participants: ["F", "B", "Y", "H", "Q", "D"],
        href: "/group-buy/detail/200113",
        image: "https://cdn.yamibuy.net/item/2c9f9d3693fd0d7f4c70b50747adafbe_757x757.webp",
      },
      {
        title: "东方树叶乌龙茶团",
        price: "$6.99",
        originalPrice: "$8.29",
        badge: "低价高频",
        meta: "7 / 10 人 · 周日自提",
        participants: ["P", "W", "G", "H"],
        href: "/group-buy/detail/200115",
        image: "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
      },
      {
        title: "黑芝麻豆核桃桑葚粉团",
        price: "$17.99",
        originalPrice: "$25.99",
        badge: "69 折",
        meta: "11 / 12 人 · 即将成团",
        participants: ["R", "J", "C", "S", "M", "Y"],
        href: "/group-buy/detail/200116",
        image: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      },
    ],
  },
  {
    title: "本地热拼榜",
    href: "/group-buy/mine",
    items: [
      {
        title: "川味火锅底料周末局",
        price: "$15.50",
        originalPrice: "$18.99",
        badge: "社区爆团",
        meta: "27 / 30 人 · 还差 3 人",
        participants: ["I", "J", "A", "M", "R", "T"],
        href: "/group-buy/detail/200109",
        image: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      },
      {
        title: "抹茶零食补货团",
        price: "$19.99",
        originalPrice: "$24.50",
        badge: "妈妈群热拼",
        meta: "8 / 10 人 · 本地自提",
        participants: ["S", "B", "L", "N", "C"],
        href: "/group-buy/detail/200105",
        image: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      },
      {
        title: "早餐奶首单体验团",
        price: "$12.49",
        originalPrice: "$14.99",
        badge: "新人首单",
        meta: "14 / 18 人 · 适合首单",
        participants: ["N", "Y", "Q", "F"],
        href: "/group-buy/detail/200104",
        image: "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
      },
      {
        title: "社区纸巾日用快团",
        price: "$11.39",
        originalPrice: "$15.39",
        badge: "家庭补货",
        meta: "13 / 16 人 · 明天取货",
        participants: ["R", "H", "E", "P", "T"],
        href: "/group-buy/detail/200114",
        image: "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
      },
      {
        title: "周末夜宵快乐团",
        price: "$18.99",
        originalPrice: "$21.50",
        badge: "本周爆款",
        meta: "22 / 26 人 · 快速成团",
        participants: ["W", "K", "J", "S", "D", "M"],
        href: "/group-buy/detail/200119",
        image: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      },
    ],
  },
];

const CATEGORY_ICON_RAIL = [
  { label: "本地自提", icon: BaggageClaim, href: "/#explore-more" },
  { label: "新人首单", icon: BadgePercent, href: "/#explore-more" },
  { label: "今日特价", icon: BadgeDollarSign, href: "/#explore-more" },
  { label: "即将成团", icon: PackageCheck, href: "/#explore-more" },
  { label: "轻食减脂", icon: Leaf, href: "/#explore-more" },
  { label: "百味火锅", icon: CookingPot, href: "/#explore-more" },
  { label: "家庭补货", icon: HandPlatter, href: "/#explore-more" },
  { label: "节日礼盒", icon: Gift, href: "/#explore-more" },
];

const ALMOST_FULL_GROUPS = [
  {
    title: "潮汕牛肉丸家庭补货团",
    community: "San Jose 华人家庭群",
    progress: "8 / 10 人",
    remaining: "还差 2 人成团",
    price: "$12.99 起",
    href: "/group-buy/detail/300101",
    products: [
      "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
    ],
    records: [
      { name: "Jefferson 邻居", time: "18 分钟前", item: "牛肉丸", quantity: 1 },
      { name: "Richmond Hill 团友", time: "32 分钟前", item: "火锅底料", quantity: 1 },
      { name: "Maple 家庭群", time: "1 小时前", item: "早餐奶", quantity: 2 },
    ],
  },
  {
    title: "北海道牛乳面包早餐团",
    community: "Fremont 上班族小群",
    progress: "18 / 20 人",
    remaining: "还差 2 人成团",
    price: "$8.99 起",
    href: "/group-buy/detail/300102",
    products: [
      "https://cdn.yamibuy.net/item/2c9f9d3693fd0d7f4c70b50747adafbe_757x757.webp",
      "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
      "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
    ],
    records: [
      { name: "Fremont 早餐搭子", time: "12 分钟前", item: "牛乳面包", quantity: 1 },
      { name: "Sunnyvale 宝妈", time: "27 分钟前", item: "早餐奶", quantity: 2 },
      { name: "North York 新客", time: "56 分钟前", item: "饼干组合", quantity: 1 },
    ],
  },
  {
    title: "火锅底料周末局自提团",
    community: "Irvine 社区团长",
    progress: "27 / 30 人",
    remaining: "还差 3 人成团",
    price: "$15.50 起",
    href: "/group-buy/detail/300103",
    products: [
      "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
    ],
    records: [
      { name: "Irvine 火锅搭子", time: "9 分钟前", item: "锅底", quantity: 1 },
      { name: "社区邻居", time: "21 分钟前", item: "蘸料", quantity: 2 },
      { name: "周末局团友", time: "43 分钟前", item: "饮料", quantity: 1 },
    ],
  },
];

const CATEGORY_SHOWCASE = [
  {
    value: "for-you",
    label: "猜你喜欢",
    items: [
      {
        title: "望梅好气泡果汁拼团",
        subtitle: "湾区办公室下午茶团",
        price: "$2.69",
        originalPrice: "$3.29",
        meta: "6 / 8 人 · 还差 2 人",
        badge: "Low Price",
        href: "/group-buy/detail/200101",
        image: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      },
      {
        title: "桂花米酒微醺小聚团",
        subtitle: "North York 周末饭搭子",
        price: "$4.49",
        originalPrice: "$4.99",
        meta: "12 / 15 人 · 今晚截止",
        badge: "-10%",
        href: "/group-buy/detail/200102",
        image: "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
      },
      {
        title: "螺蛳粉夜宵团",
        subtitle: "Markham 留学生群",
        price: "$22.99",
        originalPrice: "$24.79",
        meta: "30 / 35 人 · 爆款快满",
        badge: "Hot",
        href: "/group-buy/detail/200103",
        image: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      },
      {
        title: "早餐奶首单体验团",
        subtitle: "新客专享 · GTA 配送",
        price: "$12.49",
        originalPrice: "$14.99",
        meta: "14 / 18 人 · 适合首单",
        badge: "New",
        href: "/group-buy/detail/200104",
        image: "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
      },
      {
        title: "办公室小零食共享团",
        subtitle: "Downtown 团队补货",
        price: "$5.99",
        originalPrice: "$7.49",
        meta: "9 / 12 人 · 周五截团",
        badge: "Snack",
        href: "/group-buy/detail/200117",
        image: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      },
      {
        title: "家庭早餐速食拼单",
        subtitle: "Markham 家庭群",
        price: "$10.99",
        originalPrice: "$13.20",
        meta: "15 / 18 人 · 差 3 人",
        badge: "Family",
        href: "/group-buy/detail/200118",
        image: "https://cdn.yamibuy.net/item/2c9f9d3693fd0d7f4c70b50747adafbe_757x757.webp",
      },
      {
        title: "周末夜宵快乐团",
        subtitle: "Mississauga 宵夜群",
        price: "$18.99",
        originalPrice: "$21.50",
        meta: "22 / 26 人 · 本周爆款",
        badge: "Hot",
        href: "/group-buy/detail/200119",
        image: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      },
    ],
  },
  {
    value: "snacks",
    label: "零食饮料",
    items: [
      {
        title: "抹茶零食补货团",
        subtitle: "Sunnyvale 妈妈群",
        price: "$19.99",
        originalPrice: "$24.50",
        meta: "8 / 10 人 · 本地自提",
        badge: "Hot",
        href: "/group-buy/detail/200105",
        image: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      },
      {
        title: "柠檬汽泡茶下午茶团",
        subtitle: "Richmond Hill 白领拼单",
        price: "$9.49",
        originalPrice: "$10.59",
        meta: "9 / 12 人 · 下午 6 点截团",
        badge: "Low Price",
        href: "/group-buy/detail/200106",
        image: "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
      },
      {
        title: "蟹黄味蚕豆周末分享团",
        subtitle: "Mississauga 家庭群",
        price: "$2.99",
        originalPrice: "$4.69",
        meta: "20 / 24 人 · 差 4 人",
        badge: "-33%",
        href: "/group-buy/detail/200107",
        image: "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
      },
      {
        title: "杨枝甘露风味果饮团",
        subtitle: "Scarborough 奶茶搭子群",
        price: "$6.99",
        originalPrice: "$7.99",
        meta: "11 / 14 人 · 本周热卖",
        badge: "Refresh",
        href: "/group-buy/detail/200108",
        image: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      },
      {
        title: "玉米棒零嘴小团",
        subtitle: "North York 追剧群",
        price: "$3.99",
        originalPrice: "$5.20",
        meta: "10 / 14 人 · 低价高频",
        badge: "Snack",
        href: "/group-buy/detail/200120",
        image: "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
      },
      {
        title: "果汁饮料拼箱团",
        subtitle: "Richmond Hill 补货群",
        price: "$11.99",
        originalPrice: "$14.40",
        meta: "13 / 16 人 · 今晚拼满",
        badge: "Drink",
        href: "/group-buy/detail/200121",
        image: "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
      },
      {
        title: "日式米果下午茶团",
        subtitle: "GTA 闺蜜分享团",
        price: "$7.99",
        originalPrice: "$9.99",
        meta: "8 / 12 人 · 本周新开",
        badge: "New",
        href: "/group-buy/detail/200122",
        image: "https://cdn.yamibuy.net/item/2c9f9d3693fd0d7f4c70b50747adafbe_757x757.webp",
      },
    ],
  },
  {
    value: "hotpot",
    label: "火锅烧烤",
    items: [
      {
        title: "川味火锅底料周末局",
        subtitle: "Irvine 社区团长",
        price: "$15.50",
        originalPrice: "$18.99",
        meta: "27 / 30 人 · 还差 3 人",
        badge: "Hot",
        href: "/group-buy/detail/200109",
        image: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      },
      {
        title: "烧烤蘸料家庭补货团",
        subtitle: "Etobicoke 周末烧烤群",
        price: "$11.39",
        originalPrice: "$15.39",
        meta: "16 / 20 人 · 本周六截团",
        badge: "-26%",
        href: "/group-buy/detail/200110",
        image: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      },
      {
        title: "麻辣小龙虾宵夜局",
        subtitle: "Downtown 夜猫子群",
        price: "$22.99",
        originalPrice: "$24.79",
        meta: "10 / 12 人 · 今晚截单",
        badge: "Night",
        href: "/group-buy/detail/200111",
        image: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      },
      {
        title: "串串锅底朋友拼团",
        subtitle: "GTA 华人火锅局",
        price: "$9.99",
        originalPrice: "$13.99",
        meta: "21 / 25 人 · 差 4 人",
        badge: "Popular",
        href: "/group-buy/detail/200112",
        image: "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
      },
      {
        title: "牛油锅底囤货团",
        subtitle: "Scarborough 火锅搭子",
        price: "$13.99",
        originalPrice: "$16.80",
        meta: "19 / 24 人 · 周末截单",
        badge: "Classic",
        href: "/group-buy/detail/200123",
        image: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      },
      {
        title: "麻辣蘸料烧烤团",
        subtitle: "Brampton 后院烧烤群",
        price: "$8.49",
        originalPrice: "$10.50",
        meta: "11 / 14 人 · 差 3 人",
        badge: "BBQ",
        href: "/group-buy/detail/200124",
        image: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      },
      {
        title: "冒菜底料下班团",
        subtitle: "Downtown 上班族群",
        price: "$12.99",
        originalPrice: "$15.20",
        meta: "9 / 10 人 · 即将成团",
        badge: "Fast",
        href: "/group-buy/detail/200125",
        image: "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
      },
    ],
  },
  {
    value: "pickup",
    label: "本地自提",
    items: [
      {
        title: "牛乳面包早餐自提团",
        subtitle: "North York 地铁站自提",
        price: "$8.99",
        originalPrice: "$11.20",
        meta: "18 / 20 人 · 还差 2 人",
        badge: "Pickup",
        href: "/group-buy/detail/200113",
        image: "https://cdn.yamibuy.net/item/2c9f9d3693fd0d7f4c70b50747adafbe_757x757.webp",
      },
      {
        title: "社区纸巾日用快团",
        subtitle: "Markham 华超停车场自提",
        price: "$11.39",
        originalPrice: "$15.39",
        meta: "13 / 16 人 · 明天取货",
        badge: "Daily",
        href: "/group-buy/detail/200114",
        image: "https://cdn.yamibuy.net/item/a5bfb365ffb2e254afee3f2727475b2e_757x757.webp",
      },
      {
        title: "周末饮品拼箱团",
        subtitle: "Scarborough 周日自提",
        price: "$6.99",
        originalPrice: "$8.29",
        meta: "7 / 10 人 · 还差 3 人",
        badge: "Fresh",
        href: "/group-buy/detail/200115",
        image: "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
      },
      {
        title: "妈妈群补货套装",
        subtitle: "Richmond Hill 社区柜台",
        price: "$19.99",
        originalPrice: "$24.50",
        meta: "11 / 12 人 · 即将成团",
        badge: "Fast",
        href: "/group-buy/detail/200116",
        image: "https://cdn.yamibuy.net/item/112f988ddd32a07f1c93b578a91c42a8_757x757.webp",
      },
      {
        title: "晚餐速食自提拼团",
        subtitle: "Downtown 地铁口自提",
        price: "$9.49",
        originalPrice: "$11.39",
        meta: "6 / 8 人 · 差 2 人",
        badge: "Quick",
        href: "/group-buy/detail/200126",
        image: "https://cdn.yamibuy.net/item/b01da3a1cfc0377f08f1f947ab19e6dc_757x757.webp",
      },
      {
        title: "饮料拼箱周末团",
        subtitle: "North York 商场自提",
        price: "$13.99",
        originalPrice: "$16.29",
        meta: "17 / 20 人 · 周日取货",
        badge: "Pickup",
        href: "/group-buy/detail/200127",
        image: "https://cdn.yamibuy.net/item/c01496995e9ddcc2a830e5319742a3d6_757x757.webp",
      },
      {
        title: "社区面包早餐快团",
        subtitle: "Markham 社区站点",
        price: "$7.99",
        originalPrice: "$9.50",
        meta: "13 / 15 人 · 明早截团",
        badge: "Morning",
        href: "/group-buy/detail/200128",
        image: "https://cdn.yamibuy.net/item/2c9f9d3693fd0d7f4c70b50747adafbe_757x757.webp",
      },
    ],
  },
];

export default function HomePage() {
  const userPostalCode = "L4E";
  const communityLocation = getCommunityLocationByPostalCode(userPostalCode);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_SHOWCASE[0]?.value ?? "for-you");
  const currentCategory =
    CATEGORY_SHOWCASE.find((section) => section.value === selectedCategory) ?? CATEGORY_SHOWCASE[0];
  const featureShelves = FEATURE_SHELVES.map((shelf, index) =>
    index === 1 && communityLocation
      ? {
          ...shelf,
          title: `${communityLocation.city} · ${communityLocation.community} 热拼榜`,
        }
      : shelf,
  );
  const showcaseItems = Array.from({ length: 21 }, (_, index) => {
    const item = currentCategory.items[index % currentCategory.items.length];

    return {
      ...item,
      key: `${currentCategory.value}-${index}-${item.title}`,
    };
  });

  return (
    <AppPageShell
      backgroundClassName="bg-[linear-gradient(180deg,#dfebf7_0%,#f8efe2_48%,#fffaf3_100%)]"
      maxWidthClassName="max-w-[1680px]"
      contentClassName="gap-6 pb-12 pt-4"
      paddingClassName="px-4 sm:px-6 lg:px-8 xl:px-10"
    >
      <section className="grid gap-0 overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_24px_90px_-45px_rgba(15,23,42,0.38)] lg:grid-cols-12">
        {HERO_BANNERS.map((banner, index) => (
          <Link
            key={banner.eyebrow}
            href={banner.href}
            className={`group relative min-h-[280px] overflow-hidden border-slate-200 ${banner.bgClassName} xl:min-h-[320px] ${banner.span} ${index !== 0 ? "lg:border-l" : ""}`}
          >
            <div className={`absolute inset-0 ${banner.toneClassName}`} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.84)_0%,rgba(255,255,255,0.68)_30%,rgba(255,255,255,0.14)_58%,rgba(255,255,255,0)_82%)]" />
            {banner.products.map((product, productIndex) => (
              <div
                key={`${banner.eyebrow}-${product.alt}-${productIndex}`}
                className={`absolute ${product.className} transition duration-500 group-hover:scale-[1.04]`}
              >
                <Image
                  src={product.src}
                  alt={product.alt}
                  fill
                  sizes="(min-width: 1280px) 260px, 180px"
                  className="object-contain drop-shadow-[0_22px_35px_rgba(15,23,42,0.14)]"
                  unoptimized
                  priority={index === 0}
                />
              </div>
            ))}

            <div className="relative flex h-full flex-col justify-between p-6 xl:p-8">
              <div className={`${index === 0 ? "max-w-[48%]" : "max-w-[58%]"} min-w-[200px]`}>
                <div className="text-xs font-semibold tracking-[0.12em] text-slate-500">{banner.eyebrow}</div>
                <h2
                  className={`mt-4 font-black leading-[1.06] tracking-tight text-slate-950 ${
                    index === 0 ? "text-[40px] xl:text-[54px]" : "text-[28px] xl:text-[36px]"
                  }`}
                >
                  {banner.title}
                </h2>
                <p className="mt-3 text-[15px] text-slate-700 xl:text-[16px]">{banner.subtitle}</p>
              </div>

              <div className="inline-flex w-fit items-center border-b-3 border-slate-950 pb-1 text-[22px] font-black text-slate-950 xl:text-[26px]">
                {banner.cta}
              </div>
            </div>
          </Link>
        ))}
      </section>

      <section className="rounded-[28px] border border-rose-100 bg-[linear-gradient(180deg,#fffdfc_0%,#fff7f4_100%)] p-3 shadow-[0_16px_50px_-40px_rgba(244,114,182,0.28)]">
        <div className="rounded-[22px] bg-[linear-gradient(90deg,rgba(255,241,236,0.96)_0%,rgba(255,247,244,0.96)_35%,rgba(255,240,240,0.92)_100%)] px-4 py-2.5 ring-1 ring-rose-100">
          <div className="border-b border-rose-100/80 pb-3">
            <div className="text-[24px] font-black tracking-tight text-slate-950">全球购</div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            {[
              { label: "满 $49 免运费", icon: Truck },
              { label: "GTA 本地发货", icon: MapPinned },
              { label: "当日团当日发", icon: PackageCheck },
              { label: "正品保障", icon: ShieldCheck },
            ].map((perk) => (
              <div
                key={perk.label}
                className="inline-flex items-center gap-2 text-[13px] font-semibold text-slate-700"
              >
                <perk.icon className="h-4 w-4 text-rose-500" />
                {perk.label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          {CATEGORY_ICON_RAIL.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex flex-col items-center gap-2 rounded-[22px] px-2 py-1.5 text-center transition hover:-translate-y-0.5"
            >
              <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-50 text-slate-700 ring-1 ring-slate-200 transition group-hover:bg-white group-hover:text-rose-500 group-hover:shadow-[0_18px_40px_-32px_rgba(244,114,182,0.7)]">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="text-[13px] font-semibold text-slate-700">{item.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6">
        {featureShelves.map((shelf, shelfIndex) => (
          <section
            key={shelf.title}
            className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_22px_60px_-45px_rgba(15,23,42,0.22)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-black tracking-tight text-slate-950">{shelf.title}</h2>
                {shelfIndex === 1 && communityLocation ? (
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    基于邮编 {communityLocation.postalPrefix} 推荐你附近的社区团
                  </p>
                ) : null}
              </div>
              <Link
                href={shelf.href}
                className="inline-flex items-center gap-1.5 text-base font-black text-slate-950 transition hover:text-orange-600"
              >
                查看全部
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {shelf.items.map((item) => (
                <Link
                  key={`${shelf.title}-${item.title}`}
                  href={item.href}
                  className="group overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_12px_34px_-28px_rgba(15,23,42,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-30px_rgba(15,23,42,0.26)]"
                >
                  <div className="relative aspect-[1/1] bg-slate-50">
                    <div className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                      {item.badge}
                    </div>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(min-width: 1280px) 20vw, (min-width: 768px) 40vw, 100vw"
                      className="object-contain p-3 transition duration-500 group-hover:scale-[1.03]"
                      unoptimized
                    />
                  </div>

                  <div className="p-3.5">
                    <h3 className="line-clamp-2 text-[15px] font-black leading-snug text-slate-950">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] font-semibold text-orange-700">{item.meta}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex items-center">
                        {item.participants.slice(0, 5).map((participant, index) => (
                          <div
                            key={`${item.title}-${participant}-${index}`}
                            className={`grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[linear-gradient(135deg,#ffe3d1_0%,#fff4eb_100%)] text-[11px] font-black text-orange-700 shadow-sm ${index === 0 ? "" : "-ml-2"}`}
                          >
                            {participant}
                          </div>
                        ))}
                        {item.participants.length > 5 ? (
                          <div className="-ml-2 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-black text-slate-600 shadow-sm">
                            +{item.participants.length - 5}
                          </div>
                        ) : null}
                      </div>

                      <div className="text-[12px] font-medium text-slate-500">
                        已有 {item.participants.length} 人参与
                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-[18px] font-black leading-none text-red-600">{item.price}</div>
                        <div className="mt-1 text-[12px] text-slate-400 line-through">{item.originalPrice}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </section>

      <section>
        <article className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.28)]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Almost Full</p>
              <h2 className="mt-2 text-[28px] font-black tracking-tight text-slate-950">即将成团</h2>
              <p className="mt-2 max-w-2xl text-[14px] leading-6 text-slate-600">
                这块优先展示差几个人成团的高转化活动，同时把团里的商品直接展示出来。
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
              <Clock3 className="h-4 w-4" />
              差你一个就成团
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {ALMOST_FULL_GROUPS.map((group) => (
              <Link
                key={group.title}
                href={group.href}
                className="grid gap-4 rounded-[24px] bg-slate-50 p-4 ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_40px_-32px_rgba(15,23,42,0.28)] lg:grid-cols-[280px_1fr_auto]"
              >
                <div className="grid grid-cols-[1.2fr_0.9fr] gap-2">
                  <div className="relative min-h-[180px] overflow-hidden rounded-[20px] bg-white ring-1 ring-slate-200">
                    <Image
                      src={group.products[0]}
                      alt={`${group.title} 主图`}
                      fill
                      sizes="(min-width: 1280px) 220px, 100vw"
                      className="object-contain p-3"
                      unoptimized
                    />
                  </div>

                  <div className="grid gap-2">
                    {group.products.slice(1).map((product, index) => (
                      <div
                        key={`${group.title}-${product}-${index}`}
                        className="relative min-h-[86px] overflow-hidden rounded-[18px] bg-white ring-1 ring-slate-200"
                      >
                        <Image
                          src={product}
                          alt={`${group.title} 副图 ${index + 1}`}
                          fill
                          sizes="120px"
                          className="object-contain p-2.5"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-center">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{group.community}</div>
                  <h3 className="mt-2 text-[28px] font-black leading-tight text-slate-950">{group.title}</h3>
                  <p className="mt-3 text-base font-semibold text-orange-700">
                    {group.progress} · {group.remaining}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    团内可见多件商品组合，适合家庭补货、周末局或社区高频购买。
                  </p>

                  <div className="mt-5 rounded-[20px] bg-white px-4 py-4 ring-1 ring-slate-200">
                    <div className="text-sm font-semibold text-slate-900">最近参团</div>
                    <div className="mt-3 grid gap-3">
                      {group.records.map((record, index) => (
                        <div
                          key={`${group.title}-${record.name}-${index}`}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#ffe3d1_0%,#fff4eb_100%)] text-xs font-black text-orange-700 ring-1 ring-orange-100">
                              {record.name.slice(0, 1)}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-slate-900">{record.name}</div>
                              <div className="text-xs text-slate-500">{record.time}</div>
                            </div>
                          </div>

                          <div className="shrink-0 text-sm font-medium text-slate-700">
                            {record.item} <span className="font-semibold text-orange-600">+{record.quantity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 lg:items-end">
                  <div className="text-[30px] font-black text-orange-600">{group.price}</div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
                    立即参团
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section
        id="explore-more"
        className="rounded-[34px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_90px_-55px_rgba(15,23,42,0.36)] lg:p-7"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-[34px] font-black tracking-tight text-slate-950">探索更多</h2>
            <p className="mt-2 text-lg font-semibold text-slate-400">Explore more</p>
          </div>

          <Link
            href={currentCategory ? currentCategory.items[0]?.href ?? "/group-buy/mine" : "/group-buy/mine"}
            className="inline-flex min-w-[168px] items-center justify-center gap-2 self-start whitespace-nowrap rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold !text-white transition hover:bg-slate-800"
          >
            查看全部团购
            <ArrowRight className="h-4 w-4 text-white" />
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {CATEGORY_SHOWCASE.map((category) => {
            const active = category.value === selectedCategory;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() => setSelectedCategory(category.value)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white shadow-[0_18px_35px_-24px_rgba(15,23,42,0.8)]"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {showcaseItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="group rounded-[22px] bg-white p-2 shadow-[0_14px_45px_-36px_rgba(15,23,42,0.45)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-[0_26px_60px_-36px_rgba(15,23,42,0.45)]"
            >
              <div className="relative overflow-hidden rounded-[16px] bg-[linear-gradient(180deg,#fffaf4_0%,#f8fafc_100%)]">
                <div className="absolute left-2 top-2 z-10 rounded-lg bg-white/92 px-2 py-1 text-[10px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
                  {item.badge}
                </div>
                <div className="relative aspect-[1/1]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1536px) 14vw, (min-width: 1024px) 24vw, (min-width: 640px) 40vw, 100vw"
                    className="object-contain p-2.5 transition duration-500 group-hover:scale-[1.04]"
                    unoptimized
                  />
                </div>
              </div>

              <div className="mt-2.5">
                <div className="truncate text-[11px] text-slate-500">{item.subtitle}</div>
                <h3 className="mt-1 line-clamp-2 text-[16px] font-black leading-tight text-slate-950">
                  {item.title}
                </h3>
                <div className="mt-1.5 text-[11px] font-semibold text-orange-700">{item.meta}</div>
              </div>

              <div className="mt-2.5 flex items-end justify-between gap-2">
                <div>
                  <div className="text-[22px] font-black leading-none text-red-600">{item.price}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400 line-through">{item.originalPrice}</div>
                </div>

                <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-900">
                  <span>探索更多</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppPageShell>
  );
}
