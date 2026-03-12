"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { BookShowcase } from "@/components/book-showcase";
import { PaymentDialog } from "@/components/payment-dialog";
import { FEATURED_PRODUCT } from "@/lib/catalog";
import { createPayOrder, activePayNotify } from "@/lib/api/mall";
import { parseMockPayForm } from "@/lib/pay-form";
import { useSessionStore } from "@/store/session-store";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams<{ productId: string }>();
  const queryClient = useQueryClient();
  const session = useSessionStore((state) => state.session);
  const product = useMemo(
    () => (params.productId === FEATURED_PRODUCT.productId ? FEATURED_PRODUCT : FEATURED_PRODUCT),
    [params.productId],
  );
  const [teamId, setTeamId] = useState("");
  const [paymentModal, setPaymentModal] = useState<{
    orderId: string;
    payAmount: string;
  } | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: createPayOrder,
    onSuccess: (response, variables) => {
      if (response.code !== "0000" || !response.data) {
        toast.error(response.info || "下单失败");
        return;
      }

      const payMeta = parseMockPayForm(response.data);
      if (!payMeta.orderId) {
        toast.error("支付单解析失败");
        return;
      }

      setPaymentModal({
        orderId: payMeta.orderId,
        payAmount: payMeta.payAmount || `${variables.marketType === 1 ? product.groupPrice : product.originalPrice}`,
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "下单失败");
    },
  });

  const payMutation = useMutation({
    mutationFn: activePayNotify,
    onSuccess: (response) => {
      if (response.code !== "0000") {
        toast.error(response.info || "支付失败");
        return;
      }

      toast.success("模拟支付成功，订单已进入结算流程");
      setPaymentModal(null);
      queryClient.invalidateQueries({ queryKey: ["orders", session?.account] });
      router.push("/orders");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "支付失败");
    },
  });

  const handleCreateOrder = (mode: "single" | "group") => {
    if (!session?.account) {
      toast.error("请先登录后再下单");
      router.push("/login");
      return;
    }

    createOrderMutation.mutate({
      userId: session.account,
      productId: product.productId,
      activityId: mode === "group" ? product.activityId : undefined,
      teamId: mode === "group" && teamId.trim() ? teamId.trim() : undefined,
      marketType: mode === "group" ? 1 : 0,
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f1f5fb_0%,#fdf8f1_50%,#fffdf8_100%)] text-slate-900">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-14 pt-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          返回首页
        </button>

        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <BookShowcase large />

          <section className="overflow-hidden rounded-[36px] border border-slate-300/60 bg-white shadow-[0_24px_90px_-45px_rgba(15,23,42,0.48)]">
            <div className="bg-gradient-to-r from-[#012e52] via-[#0b4b72] to-[#2d7da8] px-8 py-6 text-white">
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-100">Featured Goods</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">{product.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-cyan-50/90">{product.subtitle}</p>
            </div>

            <div className="space-y-6 px-8 py-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-semibold text-white">
                  {product.discountLabel}
                </span>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700">
                  直降 ¥{product.originalPrice - product.groupPrice}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  活动 ID {product.activityId}
                </span>
              </div>

              <div className="rounded-[28px] bg-slate-50 p-6 ring-1 ring-slate-200">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">单独购买</p>
                    <div className="mt-3 text-4xl font-black text-slate-900">¥{product.originalPrice}</div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">不参与拼团，直接生成普通订单并走 mock 支付。</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">开团 / 参团购买</p>
                    <div className="mt-3 text-4xl font-black text-orange-600">¥{product.groupPrice}</div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      已预置拼团活动，支付成功后会调用拼团交易系统结算，并在成团后回推 MQ。
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  拼团活动
                </div>
                <p className="mt-4 text-lg font-bold text-slate-900">{product.campaignTitle}</p>
                <p className="mt-3 text-sm leading-7 text-slate-500">{product.campaignDescription}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-950 px-5 py-4 text-white">
                    <div className="text-sm text-slate-300">目标成团人数</div>
                    <div className="mt-2 text-3xl font-black">{product.targetCount} 人</div>
                  </div>
                  <div className="rounded-3xl bg-orange-50 px-5 py-4 text-orange-900 ring-1 ring-orange-100">
                    <div className="text-sm text-orange-700">商品 ID / 活动 ID</div>
                    <div className="mt-2 text-lg font-black">
                      {product.productId} / {product.activityId}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-6">
                <label className="text-sm font-semibold text-slate-700">已有团号（可选）</label>
                <input
                  value={teamId}
                  onChange={(event) => setTeamId(event.target.value)}
                  placeholder="留空表示我来开团，例如 83333647 表示加入已有团"
                  className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none transition focus:border-orange-400 focus:bg-white"
                />
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  填写团号后，本次下单会加入该团；不填写则自动发起新团。
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleCreateOrder("single")}
                  disabled={createOrderMutation.isPending}
                  className="inline-flex h-16 items-center justify-center rounded-[22px] bg-slate-100 text-lg font-bold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  单独购买（¥{product.originalPrice}）
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateOrder("group")}
                  disabled={createOrderMutation.isPending}
                  className="inline-flex h-16 items-center justify-center gap-2 rounded-[22px] bg-gradient-to-r from-orange-500 to-red-500 text-lg font-bold text-white transition hover:from-orange-400 hover:to-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createOrderMutation.isPending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : null}
                  {teamId.trim() ? `加入团购（¥${product.groupPrice}）` : `开团购买（¥${product.groupPrice}）`}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PaymentDialog
        open={Boolean(paymentModal)}
        orderId={paymentModal?.orderId ?? ""}
        payAmount={paymentModal?.payAmount ?? ""}
        onClose={() => setPaymentModal(null)}
        onConfirm={() => (paymentModal ? payMutation.mutate(paymentModal.orderId) : undefined)}
        isSubmitting={payMutation.isPending}
      />
    </div>
  );
}
