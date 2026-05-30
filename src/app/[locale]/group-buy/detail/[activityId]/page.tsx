"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  BellPlus,
  ChevronRight,
  Clock3,
  Headphones,
  Heart,
  ImagePlus,
  LoaderCircle,
  MapPin,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ActivityStatusBadge } from "@/components/activity-status-badge";
import { AppPageShell } from "@/components/app-page-shell";
import { PaymentDialog } from "@/components/payment-dialog";
import type { GroupBuyActivityDetail, GroupBuyProduct } from "@/lib/api/types";
import { joinGroupBuy, queryGroupBuyDetail } from "@/lib/api/mall";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getFulfillmentLabel, getPricingModeLabel } from "@/lib/group-buy";
import { useSessionStore } from "@/store/session-store";

const FALLBACK_IMAGES = ["/hero-spring-bundle.svg", "/banner-weekly-hot.svg", "/hero-newcomer.svg", "/banner-flash-sale.svg"];

export default function GroupBuyDetailPage() {
  const router = useRouter();
  const params = useParams<{ activityId: string }>();
  const session = useSessionStore((state) => state.session);
  const queryClient = useQueryClient();
  const activityId = Number(params.activityId);
  const requestUserId = session?.account ?? "guest_preview";

  const [paymentModal, setPaymentModal] = useState<{
    orderId: string;
    payAmount: string;
    currency: string;
    clientSecret: string;
    publishableKey: string;
  } | null>(null);

  const detailQuery = useQuery({
    queryKey: ["group-buy", "detail", activityId, requestUserId],
    queryFn: () =>
      queryGroupBuyDetail({
        userId: requestUserId,
        activityId,
      }),
    enabled: Number.isFinite(activityId),
    refetchInterval: 5000,
  });

  const joinMutation = useMutation({
    mutationFn: joinGroupBuy,
    onSuccess: (response) => {
      if (response.code !== "0000" || !response.data) {
        toast.error(response.info || "参团失败");
        return;
      }

      if (!response.data.clientSecret || !response.data.publishableKey) {
        toast.error("支付参数缺失");
        return;
      }

      setPaymentModal({
        orderId: response.data.orderId,
        payAmount: `${response.data.payAmount}`,
        currency: response.data.currency || "usd",
        clientSecret: response.data.clientSecret,
        publishableKey: response.data.publishableKey,
      });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "参团失败");
    },
  });

  const detail = detailQuery.data?.data;
  const isOwner = Boolean(detail && session?.account === detail.creatorUserId);

  const images = useMemo(() => (detail ? collectActivityImages(detail) : FALLBACK_IMAGES), [detail]);
  const introTextBlocks = useMemo(() => (detail ? collectTextBlocks(detail) : []), [detail]);
  const products = detail?.productList ?? [];
  const priceRange = getActivityPriceRange(products, detail?.priceRules ?? []);
  const views = Math.max(102, (detail?.currentParticipantCount ?? 0) * 12 + products.length * 18);
  const followerCount = Math.max(125, (detail?.currentParticipantCount ?? 0) * 5 + 80);

  const handleJoin = () => {
    if (!session?.account) {
      toast.error("请先登录后再参团");
      router.push("/login");
      return;
    }

    joinMutation.mutate({
      userId: session.account,
      activityId,
    });
  };

  return (
    <AppPageShell
      backgroundClassName="bg-[linear-gradient(180deg,#fff4ed_0%,#f3f8f4_46%,#fffdf8_100%)]"
      maxWidthClassName="max-w-6xl"
      contentClassName="gap-5 pb-28 pt-5"
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex w-fit items-center gap-2 rounded-full bg-white/88 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        返回
      </button>

      {detailQuery.isLoading ? (
        <div className="grid min-h-[360px] place-items-center rounded-[32px] border border-slate-200 bg-white">
          <LoaderCircle className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : !detail ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/80 p-10 text-center text-slate-500">
          未查询到该拼团活动。
        </div>
      ) : (
        <>
          <section className="overflow-hidden rounded-[36px] border border-orange-100 bg-white shadow-[0_30px_95px_-70px_rgba(255,114,76,0.8)]">
            <div className="relative">
              <div className="grid h-[360px] grid-cols-2 grid-rows-2 gap-1 bg-slate-100 md:h-[440px] md:grid-cols-[1.2fr_0.8fr]">
                <HeroImage src={images[0]} alt={detail.activityName} className="row-span-2" />
                <HeroImage src={images[1] ?? images[0]} alt={detail.activityName} />
                <HeroImage src={images[2] ?? images[0]} alt={detail.activityName} />
              </div>

              <div className="absolute left-4 top-4 flex gap-2">
                <FloatingIcon icon={Heart} label="收藏" />
                <FloatingIcon icon={Share2} label="分享" />
              </div>

              {isOwner ? (
                <Link
                  href={`/group-buy/manage/${detail.activityId}`}
                  className="absolute bottom-5 right-5 inline-flex items-center gap-2 rounded-2xl bg-white/90 px-4 py-3 text-sm font-black text-slate-800 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-white"
                >
                  编辑主页
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="relative px-5 pb-6 sm:px-7">
              <div className="-mt-14 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-62px_rgba(15,23,42,0.55)]">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <Link href={`/group-buy/home/${encodeURIComponent(detail.creatorUserId)}`} className="flex min-w-0 gap-4">
                    <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[22px] border-4 border-white bg-orange-50 shadow-md">
                      <img src="/logo-spark-mascot.svg" alt="团长头像" className="h-14 w-14" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate text-2xl font-black text-slate-950">{shortName(detail.creatorUserId)}</h2>
                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold text-slate-500">
                        <span>成员 {Math.max(60, detail.currentParticipantCount * 8)}+</span>
                        <span>跟团人次 {detail.currentParticipantCount}</span>
                        <span>关注 {followerCount}</span>
                      </div>
                      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-[#D94D2A]">
                        <ShoppingBag className="h-4 w-4" />
                        {Math.max(100, detail.currentParticipantCount + 98)}+ 人跟 TA 买
                      </div>
                    </div>
                  </Link>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:w-[270px]">
                    <SmallAction icon={Headphones} label="客服" onClick={() => toast.message("客服入口待接入")} />
                    <SmallAction icon={BellPlus} label="订阅邀请" onClick={() => toast.success("已模拟订阅团长")} />
                    <SmallAction icon={Store} label="主页" href={`/group-buy/home/${encodeURIComponent(detail.creatorUserId)}`} />
                  </div>
                </div>

                <div className="mt-5 flex gap-3 overflow-x-auto rounded-[24px] bg-slate-50 p-3">
                  {images.slice(0, 8).map((image, index) => (
                    <div key={`${image}-${index}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
                      <img src={image} alt={`本团商品 ${index + 1}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-white px-2 text-center text-xs font-black text-slate-500 ring-1 ring-slate-200">
                    本团商品
                    <ChevronRight className="mt-1 h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <main className="space-y-5">
              <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <ActivityStatusBadge status={detail.status} />
                  <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">
                    {getFulfillmentLabel(detail.fulfillmentType)}
                  </span>
                  <span className="rounded-full bg-orange-50 px-3 py-2 text-sm font-black text-[#D94D2A]">
                    {getPricingModeLabel(detail.pricingMode)}
                  </span>
                </div>

                <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950">{detail.activityName}</h1>

                <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-500 sm:grid-cols-3">
                  <MetaItem icon={Clock3} text={`${formatDateTime(detail.createTime ?? null)} 发布`} />
                  <MetaItem icon={Users} text={`${views} 人查看`} />
                  <MetaItem icon={PackageCheck} text={`${detail.currentParticipantCount} 次跟团`} />
                </div>

                <div className="mt-6 rounded-[28px] border border-dashed border-orange-200 bg-orange-50/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-lg font-black text-slate-950">
                      <ImagePlus className="h-5 w-5 text-[#D94D2A]" />
                      添加精选素材
                    </div>
                    <span className="text-sm font-semibold text-slate-500">可将素材批量分享社群及朋友圈</span>
                  </div>
                </div>
              </section>

              <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">团购说明</h2>
                <div className="mt-5 space-y-4 text-lg leading-9 text-slate-700">
                  {introTextBlocks.length ? (
                    introTextBlocks.map((block, index) => <p key={index} className="whitespace-pre-line">{block}</p>)
                  ) : (
                    <p className="whitespace-pre-line">{detail.activityDesc || "团长还没有填写详细说明。"}</p>
                  )}
                </div>
              </section>

              <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-950">本团商品</h2>
                    <p className="mt-2 text-sm text-slate-500">不同商品和规格可以分别选择，下单时按 SKU 价格结算。</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-black text-slate-600">{products.length || 1} 个商品</span>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {(products.length ? products : [createFallbackProduct(detail)]).map((product, index) => (
                    <ProductCard key={product.productId ?? `${product.productName}-${index}`} product={product} fallbackImage={images[index % images.length]} />
                  ))}
                </div>
              </section>

              <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-950">配送与取货</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoCard icon={Truck} label="履约方式" value={getFulfillmentLabel(detail.fulfillmentType)} />
                  <InfoCard icon={MapPin} label={detail.fulfillmentType === "SELF_PICKUP" ? "自提地址" : "配送备注"} value={detail.fulfillmentType === "SELF_PICKUP" ? detail.pickupAddress || "未配置" : detail.deliveryRemark || "暂无备注"} />
                </div>
              </section>
            </main>

            <aside className="space-y-5 lg:sticky lg:top-36 lg:self-start">
              <section className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-[0_24px_75px_-60px_rgba(255,114,76,0.75)]">
                <div className="text-sm font-black text-slate-500">本团价</div>
                <div className="mt-2 text-4xl font-black tracking-tight text-[#D94D2A]">{priceRange}</div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <Stat label="已跟团" value={`${detail.currentParticipantCount}`} />
                  <Stat label="成团人数" value={`${detail.requiredParticipantCount}`} />
                  <Stat label="人数上限" value={`${detail.maxParticipantCount}`} />
                </div>

                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={joinMutation.isPending}
                  className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#FF724C] text-base font-black text-white transition hover:bg-[#FF8A52] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {joinMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
                  立即跟团
                </button>

                {isOwner ? (
                  <Link
                    href={`/group-buy/manage/${detail.activityId}`}
                    className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 text-sm font-black text-slate-800 transition hover:bg-slate-50"
                  >
                    <ReceiptText className="h-4 w-4" />
                    团管理
                  </Link>
                ) : null}
              </section>

              <section className="rounded-[34px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-lg font-black text-slate-950">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  价格规则
                </div>
                <div className="mt-4 grid gap-3">
                  {detail.priceRules.length ? (
                    detail.priceRules.map((rule) => (
                      <div key={`${rule.stepNo ?? rule.thresholdPeople}-${rule.price}`} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                        <span className="text-sm font-bold text-slate-500">满 {rule.thresholdPeople} 人</span>
                        <span className="text-lg font-black text-[#D94D2A]">{formatCurrency(rule.price)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">暂无阶梯价规则。</div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </>
      )}

      {detail ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/94 px-4 py-3 shadow-[0_-18px_50px_-35px_rgba(15,23,42,0.55)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            {isOwner ? (
              <div className="flex min-w-0 gap-2">
                <BottomLink href="/orders" icon={ReceiptText} label="订单管理" />
                <BottomLink href={`/group-buy/manage/${detail.activityId}`} icon={Store} label="团管理" />
              </div>
            ) : (
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-500">{detail.currentParticipantCount} 人来过</div>
                <div className="text-2xl font-black text-[#D94D2A]">{priceRange}</div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toast.success("已模拟分享，后续可接分享组件")}
                className="inline-flex h-12 items-center gap-2 rounded-2xl border border-emerald-200 px-4 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
              >
                <Share2 className="h-4 w-4" />
                分享
              </button>
              {!isOwner ? (
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={joinMutation.isPending}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#FF724C] px-6 text-sm font-black text-white transition hover:bg-[#FF8A52] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  跟团购买
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <PaymentDialog
        open={Boolean(paymentModal)}
        orderId={paymentModal?.orderId ?? ""}
        payAmount={paymentModal?.payAmount ?? ""}
        currency={paymentModal?.currency ?? "usd"}
        clientSecret={paymentModal?.clientSecret ?? ""}
        publishableKey={paymentModal?.publishableKey ?? ""}
        onClose={() => setPaymentModal(null)}
        onSuccess={() => {
          toast.success("支付请求已提交，正在等待订单状态刷新");
          setPaymentModal(null);
          queryClient.invalidateQueries({ queryKey: ["orders", session?.account] });
          queryClient.invalidateQueries({ queryKey: ["group-buy", "detail", activityId] });
          router.push("/orders");
        }}
      />
    </AppPageShell>
  );
}

function HeroImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function FloatingIcon({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full bg-white/88 text-slate-800 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:bg-white"
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

function SmallAction({ icon: Icon, label, href, onClick }: { icon: LucideIcon; label: string; href?: string; onClick?: () => void }) {
  const className =
    "grid place-items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-black text-slate-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700";

  if (href) {
    return (
      <Link href={href} className={className}>
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}

function MetaItem({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <Icon className="h-4 w-4 text-[#D94D2A]" />
      <span>{text}</span>
    </div>
  );
}

function ProductCard({ product, fallbackImage }: { product: GroupBuyProduct; fallbackImage: string }) {
  const image = product.coverImageUrl || product.productImages[0] || fallbackImage;
  const specs = product.specGroups.flatMap((group) => group.specValues.map((value) => value.valueName)).slice(0, 6);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <img src={image} alt={product.productName} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <div className="line-clamp-2 text-lg font-black text-slate-950">{product.productName}</div>
        <div className="mt-2 text-2xl font-black text-[#D94D2A]">{formatCurrency(product.price)}</div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{product.productDesc || "团长暂未填写商品描述。"}</p>
        {specs.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {specs.map((spec) => (
              <span key={spec} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                {spec}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[26px] bg-slate-50 p-5 ring-1 ring-slate-200">
      <div className="flex items-center gap-2 text-sm font-black text-slate-500">
        <Icon className="h-4 w-4 text-[#D94D2A]" />
        {label}
      </div>
      <div className="mt-3 text-lg font-black leading-7 text-slate-950">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-orange-50 px-3 py-3 text-center">
      <div className="text-xs font-bold text-orange-700">{label}</div>
      <div className="mt-1 text-lg font-black text-slate-950">{value}</div>
    </div>
  );
}

function BottomLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} className="grid place-items-center gap-1 rounded-2xl px-3 py-2 text-xs font-black text-slate-600 transition hover:bg-slate-100">
      <Icon className="h-5 w-5 text-emerald-600" />
      {label}
    </Link>
  );
}

function collectActivityImages(detail: GroupBuyActivityDetail) {
  const mediaImages = (detail.mediaList ?? [])
    .filter((media) => media.mediaType === "IMAGE" && media.mediaUrl)
    .map((media) => media.mediaUrl as string);
  const productImages = (detail.productList ?? []).flatMap((product) => [
    product.coverImageUrl,
    ...product.productImages,
    ...product.specGroups.flatMap((group) => group.specValues.map((value) => value.imageUrl)),
  ]);
  const images = [...mediaImages, ...productImages].filter((image): image is string => Boolean(image));
  return images.length ? Array.from(new Set(images)) : FALLBACK_IMAGES;
}

function collectTextBlocks(detail: GroupBuyActivityDetail) {
  const mediaTexts = (detail.mediaList ?? [])
    .filter((media) => media.mediaType === "TEXT" && media.content?.trim())
    .map((media) => media.content?.trim() ?? "");
  return mediaTexts.length ? mediaTexts : [detail.activityDesc].filter(Boolean);
}

function getActivityPriceRange(products: GroupBuyProduct[], priceRules: GroupBuyActivityDetail["priceRules"]) {
  const prices = [
    ...products.flatMap((product) => [product.price, ...product.skus.map((sku) => sku.price)]),
    ...priceRules.map((rule) => rule.price),
  ].filter((price) => Number.isFinite(Number(price)) && Number(price) > 0);

  if (!prices.length) {
    return formatCurrency(0);
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatCurrency(min) : `${formatCurrency(min)}-${formatCurrency(max)}`;
}

function createFallbackProduct(detail: GroupBuyActivityDetail): GroupBuyProduct {
  return {
    productId: detail.productId,
    productName: detail.activityName,
    productImages: [],
    price: detail.priceRules[0]?.price ?? 0,
    productDesc: detail.activityDesc,
    specGroups: [],
    skus: [],
  };
}

function shortName(value: string) {
  return value.length > 20 ? `${value.slice(0, 20)}...` : value;
}
