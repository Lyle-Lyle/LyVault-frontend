import { getOrderStatusLabel } from "@/lib/group-buy";

const STATUS_CLASS_MAP: Record<string, string> = {
  CREATE: "bg-slate-100 text-slate-700",
  PAY_WAIT: "bg-amber-100 text-amber-700",
  PAY_SUCCESS: "bg-sky-100 text-sky-700",
  MARKET: "bg-violet-100 text-violet-700",
  DEAL_DONE: "bg-emerald-100 text-emerald-700",
  CLOSE: "bg-rose-100 text-rose-700",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-2 text-sm font-bold ${STATUS_CLASS_MAP[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {getOrderStatusLabel(status)}
    </span>
  );
}
