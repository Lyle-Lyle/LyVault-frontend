"use client";

import { useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

type PaymentDialogProps = {
  open: boolean;
  orderId: string;
  payAmount: string;
  currency: string;
  clientSecret: string;
  publishableKey: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function PaymentDialog({
  open,
  orderId,
  payAmount,
  currency,
  clientSecret,
  publishableKey,
  onClose,
  onSuccess,
}: PaymentDialogProps) {
  const stripePromise = useMemo(() => {
    if (!publishableKey) {
      return null;
    }

    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (!open) {
    return null;
  }

  if (!clientSecret || !publishableKey || !stripePromise) {
    return (
      <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
        <div className="w-full max-w-xl rounded-[32px] bg-white p-8 shadow-[0_24px_100px_-40px_rgba(15,23,42,0.9)]">
          <p className="text-lg font-semibold text-slate-900">支付参数缺失</p>
          <p className="mt-3 text-sm leading-7 text-slate-600">当前订单没有拿到 Stripe 支付参数，请关闭后重新下单。</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 font-semibold text-white"
          >
            关闭
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_24px_100px_-40px_rgba(15,23,42,0.9)]">
        <div className="bg-[linear-gradient(180deg,#01294d_0%,#053f67_100%)] px-8 py-5 text-center text-white">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-100">Stripe Checkout</p>
          <h2 className="mt-2 text-3xl font-black">拼团支付确认</h2>
        </div>

        <div className="grid gap-6 px-8 py-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] bg-slate-100 p-6">
            <div className="space-y-5 text-slate-700">
              <InfoRow label="支付金额" value={formatCurrency(payAmount, currency)} />
              <InfoRow label="货币" value={currency.toUpperCase()} />
              <InfoRow label="订单号" value={orderId} compact />
            </div>
          </div>

          <div className="rounded-[28px] bg-slate-950 p-6 text-white">
            <div className="mb-6">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">说明</p>
              <p className="mt-4 text-base leading-8 text-slate-200">
                支付提交给 Stripe 后，系统会等待 Webhook 更新订单状态，然后继续走拼团成团、发货、确认收货和结算链路。
              </p>
            </div>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "night",
                  variables: {
                    colorPrimary: "#fb923c",
                    borderRadius: "18px",
                  },
                },
              }}
            >
              <CheckoutForm orderId={orderId} onClose={onClose} onSuccess={onSuccess} />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutForm({
  orderId,
  onClose,
  onSuccess,
}: {
  orderId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) {
      toast.error("Stripe 还没准备好");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders?orderId=${encodeURIComponent(orderId)}`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        toast.error(result.error.message || "支付失败");
        return;
      }

      if (result.paymentIntent && ["succeeded", "processing", "requires_capture"].includes(result.paymentIntent.status)) {
        toast.success("支付请求已提交，正在等待订单状态更新");
        onSuccess();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] bg-white p-4 text-slate-900">
        <PaymentElement />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !stripe || !elements}
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
  );
}

function InfoRow({ label, value, compact = false }: { label: string; value: string; compact?: boolean }) {
  return (
    <div className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0">
      <div className="text-sm text-slate-500">{label}</div>
      <div className={`mt-2 font-bold text-slate-900 ${compact ? "break-all text-xl" : "text-3xl"}`}>{value}</div>
    </div>
  );
}
