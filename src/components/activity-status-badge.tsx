import { getActivityStatusLabel } from "@/lib/group-buy";

const STATUS_CLASS_MAP: Record<string, string> = {
  WAITING_JOIN: "bg-amber-100 text-amber-700",
  GROUP_SUCCESS: "bg-emerald-100 text-emerald-700",
  SELLER_SHIPPED: "bg-sky-100 text-sky-700",
  WAIT_RECEIPT_CONFIRM: "bg-violet-100 text-violet-700",
  DONE: "bg-slate-950 text-white",
  CLOSED: "bg-rose-100 text-rose-700",
};

export function ActivityStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-2 text-sm font-bold ${STATUS_CLASS_MAP[status] ?? "bg-slate-100 text-slate-700"}`}
    >
      {getActivityStatusLabel(status)}
    </span>
  );
}
