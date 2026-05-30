"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Baby,
  ChevronDown,
  CupSoda,
  Gift,
  Globe,
  Grid2x2,
  HandPlatter,
  HeartPulse,
  Home,
  LogOut,
  MapPin,
  Search,
  ShieldPlus,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ACCOUNT_MENU_ITEMS, PRIMARY_ACTION_ITEM } from "@/lib/navigation";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useSessionStore } from "@/store/session-store";

const TOP_CATEGORIES = [
  { labelKey: "all", icon: Grid2x2, href: "/#explore-more" },
  { labelKey: "snacks", icon: HandPlatter, href: "/#explore-more" },
  { labelKey: "pantry", icon: UtensilsCrossed, href: "/#explore-more" },
  { labelKey: "drinks", icon: CupSoda, href: "/#explore-more" },
  { labelKey: "beauty", icon: Sparkles, href: "/#explore-more" },
  { labelKey: "personalCare", icon: ShieldPlus, href: "/#explore-more" },
  { labelKey: "home", icon: Home, href: "/#explore-more" },
  { labelKey: "health", icon: HeartPulse, href: "/#explore-more" },
  { labelKey: "baby", icon: Baby, href: "/#explore-more" },
  { labelKey: "gifts", icon: Gift, href: "/#explore-more" },
  { labelKey: "leaders", icon: Store, href: "/#explore-more" },
];

const HOT_TAG_KEYS = ["weeklyHot", "newUser", "limitedGroup", "localPickup"];

const GROUP_BUY_MANAGEMENT_ITEMS = ACCOUNT_MENU_ITEMS.filter((item) => item.href.startsWith("/group-buy/"));
const ORDER_MENU_ITEM = ACCOUNT_MENU_ITEMS.find((item) => item.href === "/orders");
const GroupBuyManagementIcon = GROUP_BUY_MANAGEMENT_ITEMS[0].icon;
type Locale = (typeof routing.locales)[number];

export function SiteHeader({ hideCategories = false }: { hideCategories?: boolean }) {
  const t = useTranslations("Header");
  const localeT = useTranslations("Locale");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const session = useSessionStore((state) => state.session);
  const clearSession = useSessionStore((state) => state.clearSession);
  const handleLanguageChange = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale as Locale });
  };
  const getNavLabel = (labelKey: string) => t(`nav.${labelKey}`);
  const getNavNote = (noteKey?: string) => (noteKey ? t(`nav.${noteKey}`) : "");

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1920px] items-center gap-5 px-4 py-3 sm:px-5 lg:px-6">
        <div className="flex shrink-0 items-center gap-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-[16px] shadow-[0_18px_34px_-18px_rgba(15,23,42,0.55)]">
              <Image
                src="/logo-spark-mascot.svg"
                alt="LyVault logo"
                width={48}
                height={48}
                className="h-12 w-12"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-[22px] font-black text-slate-950">LyVault</div>
                <span className="hidden rounded-md border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[11px] font-black text-orange-700 sm:inline-flex">
                  来哇团购
                </span>
              </div>
              <div className="text-[10px] font-bold uppercase text-slate-400">GTA 本地团购</div>
            </div>
          </Link>

          <Button
            type="button"
            variant="ghost"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            <MapPin className="h-4 w-4" />
            {t("location")}
          </Button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex h-12 items-center overflow-hidden rounded-full border-2 border-slate-950 bg-white shadow-sm">
            <div className="inline-flex h-full shrink-0 items-center gap-2 border-r border-slate-200 px-5 text-sm font-semibold text-slate-900">
              {t("discover")}
              <ChevronDown className="h-4 w-4" />
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2 px-4">
              <Sparkles className="h-4 w-4 shrink-0 text-slate-400" />
              <div className="truncate text-sm text-slate-400">{t("searchPlaceholder")}</div>
            </div>

            <div className="hidden items-center gap-2 px-3 lg:flex">
              {HOT_TAG_KEYS.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                >
                  {t(`hotTags.${item}`)}
                </span>
              ))}
            </div>

            <Button type="button" variant="dark" size="icon" className="mr-1 h-10 w-12 rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {session?.account ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    className="h-11 gap-3 rounded-full border border-slate-200 bg-white px-2.5 pr-4 shadow-sm"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 text-[11px] font-black text-white ring-2 ring-orange-100">
                      LY
                    </div>
                    <div className="hidden max-w-[148px] truncate sm:block">{session.account}</div>
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[320px] rounded-[28px] p-3">
                  <div className="rounded-[22px] bg-[linear-gradient(135deg,#fff2e5_0%,#eef4ff_52%,#fdfcff_100%)] p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-amber-400 text-sm font-black text-white ring-4 ring-white/80">
                        LY
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xl font-black text-slate-950">{session.account}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-500">
                          GroupBuy Console
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[18px] bg-slate-950 px-4 py-3 text-white">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("workspaceLabel")}</div>
                      <div className="mt-2 text-sm font-semibold">{t("workspaceSummary")}</div>
                    </div>
                  </div>

                  <DropdownMenuLabel className="mt-3">{t("commonFeatures")}</DropdownMenuLabel>
                  <DropdownMenuItem asChild className="rounded-2xl px-4 py-3">
                    <Link href={`/group-buy/home/${encodeURIComponent(session.account)}`} className="flex items-center gap-3">
                      <Store className="h-4 w-4 text-slate-700" />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-800">{t("myHome")}</div>
                        <div className="truncate text-xs text-slate-500">{t("myHomeNote")}</div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                  {ACCOUNT_MENU_ITEMS.map((item) => (
                    <DropdownMenuItem key={item.href} asChild className="rounded-2xl px-4 py-3">
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-slate-700" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800">{getNavLabel(item.labelKey)}</div>
                          <div className="truncate text-xs text-slate-500">{getNavNote(item.noteKey)}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t("account")}</DropdownMenuLabel>
                  <DropdownMenuItem
                    className="rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700"
                    onSelect={() => clearSession()}
                  >
                    <LogOut className="h-4 w-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-11 gap-2 rounded-full px-3 text-slate-700">
                    <Globe className="h-4 w-4" />
                    {localeT(locale)}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={locale} onValueChange={handleLanguageChange}>
                    <DropdownMenuRadioItem value="zh">{localeT("zh")}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="en">{localeT("en")}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

            </>
          ) : (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-11 gap-2 rounded-full px-3 text-slate-700">
                    <Globe className="h-4 w-4" />
                    {localeT(locale)}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={locale} onValueChange={handleLanguageChange}>
                    <DropdownMenuRadioItem value="zh">{localeT("zh")}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="en">{localeT("en")}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button asChild>
                <Link href="/login">{t("login")}</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {!hideCategories ? (
        <div className="border-t border-slate-200/80 bg-white/92">
          <div className="mx-auto flex max-w-[1920px] items-center justify-between gap-4 px-4 py-2.5 sm:px-5 lg:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
              {TOP_CATEGORIES.map((category) => (
                <Link
                  key={category.labelKey}
                  href={category.href}
                  className="group inline-flex min-w-fit flex-col items-center gap-1 rounded-lg px-4 py-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  <category.icon className="h-5 w-5" />
                  <span className="whitespace-nowrap text-xs font-medium">{t(`categories.${category.labelKey}`)}</span>
                </Link>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-2 md:flex">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                  >
                    <GroupBuyManagementIcon className="h-4 w-4" />
                    {getNavLabel("myCreatedGroupBuys")}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
                  <DropdownMenuLabel>{getNavLabel("myCreatedGroupBuys")}</DropdownMenuLabel>
                  {GROUP_BUY_MANAGEMENT_ITEMS.map((item) => (
                    <DropdownMenuItem key={item.href} asChild className="rounded-xl px-3 py-3">
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4 text-slate-700" />
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-800">{getNavLabel(item.labelKey)}</div>
                          <div className="truncate text-xs text-slate-500">{getNavNote(item.noteKey)}</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {ORDER_MENU_ITEM ? (
                <Link
                  href={ORDER_MENU_ITEM.href}
                  className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                >
                  <ORDER_MENU_ITEM.icon className="h-4 w-4" />
                  {getNavLabel(ORDER_MENU_ITEM.labelKey)}
                </Link>
              ) : null}

              <Link
                href={PRIMARY_ACTION_ITEM.href}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#FF724C] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#FF8A52]"
              >
                <PRIMARY_ACTION_ITEM.icon className="h-4 w-4" />
                {getNavLabel(PRIMARY_ACTION_ITEM.labelKey)}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
