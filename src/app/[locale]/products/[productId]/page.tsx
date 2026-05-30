"use client";

import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f1f5fb_0%,#fdf8f1_50%,#fffdf8_100%)] text-slate-900">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <section className="rounded-[36px] border border-slate-300/60 bg-white p-8 shadow-[0_24px_90px_-45px_rgba(15,23,42,0.48)]">
          <p className="text-sm uppercase tracking-[0.25em] text-orange-600">Legacy Route</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">商品详情页已迁移到拼团路由</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
            当前商品 ID 为 {params.productId}。这套前端已经改成以拼团活动为核心的联调结构，建议从“我创建的团购”或活动详情页进入业务流程。
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/group-buy/mine"
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              去我创建的团购
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/group-buy/create"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              去创建拼团
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
