"use client";

import Link from "next/link";
import { LogOut, Package, ShoppingCart } from "lucide-react";
import { useSessionStore } from "@/store/session-store";

export function SiteHeader() {
  const session = useSessionStore((state) => state.session);
  const clearSession = useSessionStore((state) => state.clearSession);

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/65 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-red-600 to-orange-500 text-xl font-black text-white">
            拼
          </div>
          <div>
            <div className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-slate-950">LyVault</div>
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Next.js Demo</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm md:flex">
          <NavLink href="/" icon={<Package className="h-4 w-4" />} label="首页" />
          <NavLink href="/products/9890001" icon={<ShoppingCart className="h-4 w-4" />} label="商品详情" />
          <NavLink href="/orders" icon={<ShoppingCart className="h-4 w-4" />} label="我的订单" />
        </nav>

        <div className="flex items-center gap-3">
          {session?.account ? (
            <>
              <div className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white sm:block">
                {session.account}
              </div>
              <button
                type="button"
                onClick={clearSession}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <LogOut className="h-4 w-4" />
                退出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-full bg-orange-600 px-5 text-sm font-semibold text-white transition hover:bg-orange-500"
            >
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
    >
      {icon}
      {label}
    </Link>
  );
}
