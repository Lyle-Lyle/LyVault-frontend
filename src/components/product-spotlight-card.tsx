import Link from "next/link";
import { ArrowRight, TimerReset } from "lucide-react";
import type { FeaturedProduct } from "@/lib/catalog";

export function ProductSpotlightCard({ product }: { product: FeaturedProduct }) {
  return (
    <article className="overflow-hidden rounded-[32px] border border-slate-300/60 bg-white shadow-[0_24px_90px_-45px_rgba(15,23,42,0.5)]">
      <div className="p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold text-white">{product.discountLabel}</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            <TimerReset className="h-4 w-4" />
            限时拼团活动
          </span>
        </div>

        <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">{product.title}</h2>
        <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] bg-slate-50 p-5 ring-1 ring-slate-200">
            <div className="text-sm text-slate-500">单买</div>
            <div className="mt-2 text-4xl font-black text-slate-900">¥{product.originalPrice}</div>
          </div>
          <div className="rounded-[24px] bg-orange-50 p-5 ring-1 ring-orange-100">
            <div className="text-sm text-orange-700">开团购买</div>
            <div className="mt-2 text-4xl font-black text-orange-600">¥{product.groupPrice}</div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-6">
        <Link
          href={`/products/${product.productId}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          去商品页下单
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
