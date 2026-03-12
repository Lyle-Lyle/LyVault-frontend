import clsx from "clsx";
import { FEATURED_PRODUCT } from "@/lib/catalog";

export function BookShowcase({ large = false }: { large?: boolean }) {
  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[36px] border border-slate-300/60 bg-[linear-gradient(180deg,#d4ebff_0%,#eff6ff_38%,#ffffff_100%)] shadow-[0_24px_90px_-45px_rgba(15,23,42,0.5)]",
        large ? "p-6 sm:p-8" : "p-5 sm:p-6",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.85),_transparent_70%)]" />
      <div className="relative mx-auto max-w-xl">
        <div className="mx-auto w-full max-w-[380px] rounded-[26px] border border-slate-300/60 bg-[#87c6ee] p-5 shadow-[0_30px_70px_-35px_rgba(15,23,42,0.6)]">
          <div className="flex gap-4">
            <div className="w-8 rounded-full bg-red-600 shadow-[inset_-3px_0_0_rgba(0,0,0,0.14)]" />
            <div className="flex-1">
              <div className="text-right text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-800/70">Broadview</div>
              <div className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
                手写MyBatis
                <br />
                渐进式源码实践
              </div>
              <div className="mt-6 rounded-[24px] bg-[linear-gradient(180deg,#6ea42a_0%,#3c6d1f_100%)] p-4 text-sm text-white shadow-inner">
                从零手写源码级复杂项目，提升架构思维与设计控制、锁账等落地能力。
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {["锁单", "支付", "MQ", "退款"].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/60 px-3 py-2 text-center text-xs font-bold text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] bg-white/80 p-5 text-center text-slate-700 ring-1 ring-slate-200">
          <div className="text-lg font-bold">{FEATURED_PRODUCT.tagline}</div>
          <div className="mt-2 text-sm leading-6 text-slate-500">{FEATURED_PRODUCT.description}</div>
        </div>
      </div>
    </div>
  );
}
