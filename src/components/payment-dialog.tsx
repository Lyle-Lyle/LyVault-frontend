"use client";

import { LoaderCircle } from "lucide-react";

type PaymentDialogProps = {
  open: boolean;
  orderId: string;
  payAmount: string;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
};

export function PaymentDialog({
  open,
  orderId,
  payAmount,
  onClose,
  onConfirm,
  isSubmitting,
}: PaymentDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_24px_100px_-40px_rgba(15,23,42,0.9)]">
        <div className="bg-[linear-gradient(180deg,#01294d_0%,#053f67_100%)] px-8 py-5 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-100">Mock Checkout</p>
          <h2 className="mt-2 text-3xl font-black">支付确认</h2>
        </div>

        <div className="grid gap-6 px-8 py-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] bg-slate-100 p-6">
            <div className="space-y-5 text-slate-700">
              <InfoRow label="商品金额" value={`¥ ${payAmount}`} />
              <InfoRow label="订单号" value={orderId} />
              <InfoRow label="买家账号" value="mock-buyer@sandbox.local" />
              <InfoRow label="登录密码" value="123456" />
              <InfoRow label="支付密码" value="123456" />
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[28px] bg-slate-950 p-6 text-white">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">说明</p>
              <p className="mt-5 text-base leading-8 text-slate-200">
                确认支付后，前端会调用商城的 mock 支付成功接口，再触发拼团交易系统结算与 MQ 回推。
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onConfirm}
                disabled={isSubmitting}
                className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#2962ff] font-semibold text-white transition hover:bg-[#2457e8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                确认支付
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="inline-flex h-14 items-center justify-center rounded-2xl bg-white/10 font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                取消支付
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
