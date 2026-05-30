export function formatCurrency(value: number | string | null | undefined, currency = "CNY") {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatPercent(value: number | string | null | undefined) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) {
    return "0%";
  }

  if (amount > 0 && amount < 1) {
    return `${(amount * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
  }

  return `${amount.toFixed(2).replace(/\.?0+$/, "")}%`;
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "暂未更新";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
