"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, PartyPopper, ShoppingBag, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { BookShowcase } from "@/components/book-showcase";
import { ProductSpotlightCard } from "@/components/product-spotlight-card";
import { APP_COPY, FEATURED_PRODUCT } from "@/lib/catalog";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#dfe8f7_0%,#f8f0ea_52%,#fffaf3_100%)] text-slate-900">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-slate-300/60 bg-white/80 p-8 shadow-[0_24px_90px_-45px_rgba(15,23,42,0.55)] backdrop-blur">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 font-medium text-orange-700">
                <Sparkles className="h-4 w-4" />
                {APP_COPY.brand}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                Mock 支付 + 拼团交易联调
              </span>
            </div>

            <div className="mt-8 flex flex-col gap-5">
              <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                登录后直接浏览商品、发起拼团、模拟支付，再把订单闭环走通。
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                当前前端已经对接你本地的商城接口。首页展示商品，详情页支持单独购买、开团购买、参团购买，以及支付后的订单流转查看。
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href={`/products/${FEATURED_PRODUCT.productId}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                查看商品详情
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/orders"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
              >
                我的订单
                <ShoppingBag className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
                <div className="text-2xl font-black">¥{FEATURED_PRODUCT.groupPrice}</div>
                <div className="mt-1 text-sm text-slate-300">拼团价，联调链路已可用</div>
              </div>
              <div className="rounded-3xl bg-white px-5 py-4 ring-1 ring-slate-200">
                <div className="text-2xl font-black text-slate-900">{FEATURED_PRODUCT.discountLabel}</div>
                <div className="mt-1 text-sm text-slate-500">来自拼团交易活动折扣</div>
              </div>
              <div className="rounded-3xl bg-white px-5 py-4 ring-1 ring-slate-200">
                <div className="text-2xl font-black text-slate-900">{FEATURED_PRODUCT.activityId}</div>
                <div className="mt-1 text-sm text-slate-500">活动 ID，前端已预置</div>
              </div>
            </div>
          </div>

          <BookShowcase />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[32px] border border-slate-300/60 bg-slate-950 p-6 text-white shadow-[0_24px_90px_-45px_rgba(15,23,42,0.8)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm">
              <PartyPopper className="h-4 w-4 text-orange-300" />
              当前可联调流程
            </div>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
              <p>1. 登录页支持邮箱/手机号验证码登录。</p>
              <p>2. 商品详情支持单买、开团、输入团 ID 参团。</p>
              <p>3. 支付弹层直接调用 mock 支付成功接口。</p>
              <p>4. 订单页展示拼团单的优惠、状态和退款入口。</p>
            </div>
          </div>

          <ProductSpotlightCard product={FEATURED_PRODUCT} />
        </section>
      </main>
    </div>
  );
}
