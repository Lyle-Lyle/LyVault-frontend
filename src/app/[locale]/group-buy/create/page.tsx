"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  Bell,
  CalendarClock,
  ChevronRight,
  CircleAlert,
  Copy,
  ImagePlus,
  Layers3,
  LoaderCircle,
  Minus,
  MoreHorizontal,
  PackagePlus,
  Plus,
  Search,
  Settings2,
  Trash2,
  Truck,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppPageShell } from "@/components/app-page-shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createGroupBuy, queryGroupBuyProductLibrary } from "@/lib/api/mall";
import type { GroupBuyProduct, GroupBuySku, GroupBuySkuSpecValue, GroupBuySpecGroup } from "@/lib/api/types";
import { useSessionStore } from "@/store/session-store";

const priceRuleSchema = z.object({
  thresholdPeople: z.coerce.number().int().min(1, "人数门槛至少为 1"),
  price: z.coerce.number().positive("价格必须大于 0"),
});

const schema = z.object({
  title: z.string().min(2, "请输入团购标题"),
  introText: z.string().min(4, "请输入团购说明"),
  pricingMode: z.coerce.number().refine((value) => [1, 2, 3].includes(value), "请选择正确的定价模式"),
  requiredParticipantCount: z.coerce.number().int().min(2, "成团人数至少为 2"),
  maxParticipantCount: z.coerce.number().int().min(2, "最大人数至少为 2"),
  fulfillmentType: z.enum(["DELIVERY", "SELF_PICKUP"]),
  logisticsMethod: z.enum(["EXPRESS", "LOCAL_DELIVERY", "SELF_PICKUP"]),
  freightTemplate: z.enum(["BASE", "FREE_BY_AMOUNT", "FREE_BY_QUANTITY"]),
  freightPayScope: z.enum(["EVERY_ORDER", "FIRST_ORDER"]),
  freightAmountMode: z.enum(["FIXED", "BY_QUANTITY"]),
  baseFreightAmount: z.string(),
  freightBaseQuantity: z.string(),
  freeShippingAmount: z.string(),
  freeShippingQuantity: z.string(),
  freightQuantityStep: z.string(),
  freightStepAmount: z.string(),
  deliveryNote: z.string(),
  receiverFields: z.array(z.enum(["CONTACT", "PHONE", "ADDRESS"])),
  customReceiverFields: z.array(z.string()),
  pickupAddress: z.string(),
  deliveryRemark: z.string(),
  autoConfirmDays: z.coerce.number().int().min(1, "自动确认天数至少为 1"),
  shipmentTime: z.string(),
  groupStartTime: z.string(),
  groupEndTime: z.string(),
  notifyTarget: z.enum(["ALL_SUBSCRIBERS", "JOINED_USERS", "NONE"]),
  couponEnabled: z.boolean(),
  assistSaleEnabled: z.boolean(),
  privacyMode: z.enum(["PUBLIC", "LINK_ONLY"]),
  priceRules: z.array(priceRuleSchema).min(1, "至少添加一条价格规则"),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

type ProductDraft = GroupBuyProduct & {
  localId: string;
  bulkPrice: string;
  bulkCostPrice: string;
  bulkStock: string;
};

type UploadedImage = {
  id: string;
  url: string;
  name: string;
  localOnly?: boolean;
};

type BulkSpecSelection = Record<string, string[]>;

type CommonSpecGroup = {
  name: string;
  values: string[];
};

type CreateGroupBuyTranslator = ReturnType<typeof useTranslations>;

type LogisticsMethod = "EXPRESS" | "LOCAL_DELIVERY" | "SELF_PICKUP";
type FreightTemplate = "BASE" | "FREE_BY_AMOUNT" | "FREE_BY_QUANTITY";
type FreightPayScope = "EVERY_ORDER" | "FIRST_ORDER";
type FreightAmountMode = "FIXED" | "BY_QUANTITY";
type ReceiverField = "CONTACT" | "PHONE" | "ADDRESS";

const DEFAULT_COMMON_SPEC_GROUPS_ZH: CommonSpecGroup[] = [
  { name: "小料", values: ["血糯米", "芋泥"] },
  { name: "奶酪口味", values: ["杨枝甘露", "茉莉青提", "香草", "蓝莓"] },
  { name: "重量", values: ["100g", "200g", "300g"] },
  { name: "尺码", values: ["S", "M", "L"] },
];

const DEFAULT_COMMON_SPEC_GROUPS_EN: CommonSpecGroup[] = [
  { name: "Add-ons", values: ["Sticky rice", "Taro paste"] },
  { name: "Cheese flavor", values: ["Mango pomelo", "Jasmine grape", "Vanilla", "Blueberry"] },
  { name: "Weight", values: ["100g", "200g", "300g"] },
  { name: "Size", values: ["S", "M", "L"] },
];

function createDefaultCommonSpecGroups(locale: string): CommonSpecGroup[] {
  const source = locale === "en" ? DEFAULT_COMMON_SPEC_GROUPS_EN : DEFAULT_COMMON_SPEC_GROUPS_ZH;

  return source.map((group) => ({ ...group, values: [...group.values] }));
}

const PRODUCT_SOFT_LIMIT = 10;
const PRODUCT_HARD_LIMIT = 30;
const PRODUCT_IMAGE_LIMIT = 5;
const PRODUCT_NAME_LIMIT = 120;
const PRODUCT_DESC_LIMIT = 2000;

const PRODUCT_CATEGORY_OPTIONS = [
  { id: "cat-more", name: "更多好货", nameEn: "More Picks" },
  { id: "cat-food", name: "零食", nameEn: "Snacks" },
  { id: "cat-fast-food", name: "速食粮油", nameEn: "Instant & Pantry" },
  { id: "cat-drink", name: "饮料", nameEn: "Drinks" },
  { id: "cat-beauty", name: "美妆个护", nameEn: "Beauty & Personal Care" },
  { id: "cat-home", name: "家居生活", nameEn: "Home" },
  { id: "cat-health", name: "健康保健", nameEn: "Health" },
  { id: "cat-gift", name: "礼盒指南", nameEn: "Gift Guide" },
];

const DEFAULT_INTRO_TEXT = `⭐预定团，下一次老板出摊后配送
晚餐 21点老板给货后开始配送，预计10-60分钟到达宿舍楼下
👍订阅团长和快团团，配送到达后会快团团私信照片并微信通知噢，一定要订阅了才能收到哈。
（南三有两位同学餐被偷了，所以建议大家收货地址填立马能取餐的地方，留意电话通知并立马取餐）

⭕同一栋楼有多个订单，取餐的同学看好团号，千万别拿错了！

❤️若计划有变不想要了，必须提前电话告知再申请退款，出餐后无法退款！

裹粉柠檬薄脆已下架`;

const LOGISTICS_METHOD_OPTIONS: Array<{
  value: LogisticsMethod;
  label: string;
  labelEn: string;
  description: string;
  descriptionEn: string;
}> = [
  {
    value: "EXPRESS",
    label: "快递",
    labelEn: "Express",
    description: "适合跨区域发货，可单独设置运费",
    descriptionEn: "Best for cross-area shipping with a separate freight fee.",
  },
  {
    value: "LOCAL_DELIVERY",
    label: "同城配送",
    labelEn: "Local delivery",
    description: "团长配送时引导团员扫码核销或确认收货",
    descriptionEn: "Use local delivery and guide members to confirm receipt.",
  },
  {
    value: "SELF_PICKUP",
    label: "顾客自提",
    labelEn: "Self pickup",
    description: "适合固定自提点、宿舍楼下或门店取货",
    descriptionEn: "Best for pickup points, dorm lobbies, or store pickup.",
  },
];

const FREIGHT_TEMPLATE_OPTIONS: Array<{ value: FreightTemplate; label: string; labelEn: string }> = [
  { value: "BASE", label: "基础运费", labelEn: "Base freight" },
  { value: "FREE_BY_AMOUNT", label: "满额包配送", labelEn: "Free by amount" },
  { value: "FREE_BY_QUANTITY", label: "满多件包配送", labelEn: "Free by quantity" },
];

const FREIGHT_PAY_SCOPE_OPTIONS: Array<{ value: FreightPayScope; label: string; labelEn: string }> = [
  { value: "EVERY_ORDER", label: "每笔订单均需支付", labelEn: "Every order pays" },
  { value: "FIRST_ORDER", label: "仅首笔订单需支付", labelEn: "First order only" },
];

const FREIGHT_AMOUNT_MODE_OPTIONS: Array<{ value: FreightAmountMode; label: string; labelEn: string }> = [
  { value: "FIXED", label: "固定运费", labelEn: "Fixed freight" },
  { value: "BY_QUANTITY", label: "按件计费", labelEn: "By quantity" },
];

const RECEIVER_FIELD_OPTIONS: Array<{ value: ReceiverField; label: string; labelEn: string }> = [
  { value: "CONTACT", label: "联系人", labelEn: "Contact" },
  { value: "PHONE", label: "电话", labelEn: "Phone" },
  { value: "ADDRESS", label: "地址", labelEn: "Address" },
];

function createSampleProduct(t: CreateGroupBuyTranslator): ProductDraft {
  return {
    localId: "product-1",
    productId: "",
    sourceProductId: null,
    productName: t("sampleProduct.name"),
    productImages: ["/mock-products/family-pantry.png"],
    coverImageUrl: "/mock-products/family-pantry.png",
    price: 8,
    costPrice: 5,
    categoryId: "cat-more",
    categoryName: t("sampleProduct.category"),
    productDesc: t("sampleProduct.description"),
    videoUrl: "",
    displayOrder: 1,
    status: "ACTIVE",
    specGroups: [
      {
        specGroupName: t("sampleProduct.specGroupOne"),
        imageRequired: false,
        displayOrder: 1,
        specValues: [
          { valueName: t("sampleProduct.specValueOne"), displayOrder: 1 },
          { valueName: t("sampleProduct.specValueTwo"), displayOrder: 2 },
        ],
      },
      {
        specGroupName: t("sampleProduct.specGroupTwo"),
        imageRequired: false,
        displayOrder: 2,
        specValues: [
          { valueName: t("sampleProduct.specValueThree"), displayOrder: 1 },
          { valueName: t("sampleProduct.specValueFour"), displayOrder: 2 },
        ],
      },
    ],
    skus: [],
    bulkPrice: "8",
    bulkCostPrice: "5",
    bulkStock: "100",
  };
}

export default function GroupBuyCreatePage() {
  const t = useTranslations("CreateGroupBuy");
  const locale = useLocale();
  const router = useRouter();
  const session = useSessionStore((state) => state.session);
  const [introImages, setIntroImages] = useState<UploadedImage[]>([]);
  const [products, setProducts] = useState<ProductDraft[]>(() => [withGeneratedSkus(createSampleProduct(t))]);
  const [activeProductId, setActiveProductId] = useState("product-1");
  const [libraryKeyword, setLibraryKeyword] = useState("");
  const [libraryItems, setLibraryItems] = useState<GroupBuyProduct[]>([]);
  const [showProductLibrary, setShowProductLibrary] = useState(false);
  const [showLogisticsDialog, setShowLogisticsDialog] = useState(false);
  const [commonSpecGroups, setCommonSpecGroups] = useState<CommonSpecGroup[]>(() => createDefaultCommonSpecGroups(locale));

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: t("defaults.title"),
      introText: locale === "en" ? t("defaults.introText") : DEFAULT_INTRO_TEXT,
      pricingMode: 3,
      requiredParticipantCount: 2,
      maxParticipantCount: 50,
      fulfillmentType: "DELIVERY",
      logisticsMethod: "LOCAL_DELIVERY",
      freightTemplate: "BASE",
      freightPayScope: "EVERY_ORDER",
      freightAmountMode: "BY_QUANTITY",
      baseFreightAmount: "2",
      freightBaseQuantity: "1",
      freeShippingAmount: "",
      freeShippingQuantity: "",
      freightQuantityStep: "1",
      freightStepAmount: "2",
      deliveryNote: t("defaults.deliveryNote"),
      receiverFields: ["CONTACT", "PHONE", "ADDRESS"],
      customReceiverFields: [],
      pickupAddress: t("defaults.pickupAddress"),
      deliveryRemark: t("defaults.deliveryRemark"),
      autoConfirmDays: 3,
      shipmentTime: "",
      groupStartTime: toDatetimeLocalInput(new Date()),
      groupEndTime: toDatetimeLocalInput(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
      notifyTarget: "ALL_SUBSCRIBERS",
      couponEnabled: false,
      assistSaleEnabled: false,
      privacyMode: "PUBLIC",
      priceRules: [{ thresholdPeople: 2, price: 8 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "priceRules",
  });

  const createMutation = useMutation({
    mutationFn: createGroupBuy,
    onSuccess: (response) => {
      if (response.code !== "0000" || !response.data) {
        toast.error(response.info || "创建拼团失败");
        return;
      }

      toast.success(`拼团已创建，活动 ID：${response.data.activityId}`);
      router.push(`/group-buy/manage/${response.data.activityId}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "创建拼团失败");
    },
  });

  const libraryMutation = useMutation({
    mutationFn: queryGroupBuyProductLibrary,
    onSuccess: (response) => {
      if (response.code !== "0000" || !response.data) {
        toast.error(response.info || "搜索商品库失败");
        return;
      }
      setLibraryItems(response.data.productList);
      if (response.data.productList.length === 0) {
        toast.message("商品库里暂时没有匹配商品");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "搜索商品库失败");
    },
  });

  const pricingMode = useWatch({
    control: form.control,
    name: "pricingMode",
  }) as number | undefined;
  const introText = useWatch({
    control: form.control,
    name: "introText",
  }) as string | undefined;
  const introTextIsTemplate = introText === DEFAULT_INTRO_TEXT;
  const fulfillmentType = useWatch({
    control: form.control,
    name: "fulfillmentType",
  }) as "DELIVERY" | "SELF_PICKUP" | undefined;
  const logisticsMethod = useWatch({
    control: form.control,
    name: "logisticsMethod",
  }) as LogisticsMethod | undefined;
  const freightTemplate = useWatch({
    control: form.control,
    name: "freightTemplate",
  }) as FreightTemplate | undefined;
  const freightPayScope = useWatch({
    control: form.control,
    name: "freightPayScope",
  }) as FreightPayScope | undefined;
  const freightAmountMode = useWatch({
    control: form.control,
    name: "freightAmountMode",
  }) as FreightAmountMode | undefined;
  const receiverFields = useWatch({
    control: form.control,
    name: "receiverFields",
  }) as ReceiverField[] | undefined;
  const customReceiverFields = useWatch({
    control: form.control,
    name: "customReceiverFields",
  }) as string[] | undefined;
  const logisticsSummary =
    logisticsMethod === "SELF_PICKUP"
      ? t("labels.logisticsSelfPickup")
      : logisticsMethod === "EXPRESS"
        ? t("labels.logisticsExpress")
        : t("labels.logisticsLocalBase");
  const notifyTargetOptions = [
    { value: "ALL_SUBSCRIBERS", label: t("options.notifyAll") },
    { value: "JOINED_USERS", label: t("options.notifyJoined") },
    { value: "NONE", label: t("options.notifyNone") },
  ];
  const privacyModeOptions = [
    { value: "PUBLIC", label: t("options.privacyPublic") },
    { value: "LINK_ONLY", label: t("options.privacyLinkOnly") },
  ];
  const pricingModeLabel =
    pricingMode === 1
      ? t("labels.pricingEarlyBird")
      : pricingMode === 2
        ? t("labels.pricingTiered")
        : t("labels.pricingSuccessOnly");
  const fulfillmentLabel =
    fulfillmentType === "DELIVERY" ? t("labels.fulfillmentDelivery") : t("labels.fulfillmentSelfPickup");

  const activeProduct = useMemo(
    () => products.find((product) => product.localId === activeProductId) ?? products[0],
    [activeProductId, products],
  );

  const onSubmit = form.handleSubmit((values) => {
    if (!session?.account) {
      toast.error("请先登录后再创建拼团");
      router.push("/login");
      return;
    }

    if (values.maxParticipantCount < values.requiredParticipantCount) {
      toast.error("最大人数不能小于成团人数");
      return;
    }

    const normalizedProducts = products.map(stripProductDraft);
    const invalidProduct = normalizedProducts.find((product) => !product.productName.trim() || product.price <= 0);
    if (invalidProduct) {
      toast.error("请补全商品名称和价格");
      return;
    }

    if (normalizedProducts.some((product) => product.specGroups.length > 0 && product.skus.length === 0)) {
      toast.error("多规格商品需要先生成 SKU");
      return;
    }

    createMutation.mutate({
      userId: session.account,
      title: values.title,
      activityName: values.title,
      activityDesc: values.introText,
      introImages: introImages.map((image) => image.url),
      introText: values.introText,
      mediaList: [
        ...introImages.map((image, index) => ({
          mediaType: "IMAGE" as const,
          mediaUrl: image.url,
          displayOrder: index + 1,
        })),
        {
          mediaType: "TEXT" as const,
          content: values.introText,
          displayOrder: introImages.length + 1,
        },
      ],
      productId: normalizedProducts[0]?.productId || undefined,
      productList: normalizedProducts,
      pricingMode: values.pricingMode as 1 | 2 | 3,
      requiredParticipantCount: values.requiredParticipantCount,
      maxParticipantCount: values.maxParticipantCount,
      fulfillmentType: values.fulfillmentType,
      logisticsMethod: values.logisticsMethod,
      freightTemplate: values.freightTemplate,
      freightPayScope: values.freightPayScope,
      freightAmountMode: values.freightAmountMode,
      baseFreightAmount: parseOptionalNumber(values.baseFreightAmount),
      freightBaseQuantity: parseOptionalInteger(values.freightBaseQuantity),
      freeShippingAmount: parseOptionalNumber(values.freeShippingAmount),
      freeShippingQuantity: parseOptionalInteger(values.freeShippingQuantity),
      freightQuantityStep: parseOptionalInteger(values.freightQuantityStep),
      freightStepAmount: parseOptionalNumber(values.freightStepAmount),
      deliveryNote: values.deliveryNote,
      receiverFields: values.receiverFields,
      customReceiverFields: values.customReceiverFields.filter(Boolean),
      pickupAddress: values.pickupAddress,
      deliveryRemark: values.deliveryRemark,
      autoConfirmDays: values.autoConfirmDays,
      shipmentTime: values.shipmentTime || undefined,
      groupStartTime: values.groupStartTime || undefined,
      groupEndTime: values.groupEndTime || undefined,
      notifyTarget: values.notifyTarget,
      couponEnabled: values.couponEnabled,
      assistSaleEnabled: values.assistSaleEnabled,
      privacyMode: values.privacyMode,
      priceRules: values.priceRules.map((rule) => ({
        thresholdPeople: rule.thresholdPeople,
        price: Number(rule.price),
      })),
    });
  });

  function searchLibrary() {
    if (!session?.account) {
      toast.error("请先登录后再搜索商品库");
      router.push("/login");
      return;
    }
    libraryMutation.mutate({
      userId: session.account,
      keyword: libraryKeyword,
      lastId: null,
      pageSize: 20,
    });
  }

  function setLogisticsMethod(method: LogisticsMethod) {
    form.setValue("logisticsMethod", method, { shouldDirty: true });
    form.setValue("fulfillmentType", method === "SELF_PICKUP" ? "SELF_PICKUP" : "DELIVERY", { shouldDirty: true });
  }

  function toggleReceiverField(field: ReceiverField) {
    const current = (form.getValues("receiverFields") ?? []) as ReceiverField[];
    const next = current.includes(field) ? current.filter((item) => item !== field) : [...current, field];
    form.setValue("receiverFields", next, { shouldDirty: true });
  }

  function addCustomReceiverField() {
    const current = (form.getValues("customReceiverFields") ?? []) as string[];
    form.setValue("customReceiverFields", [...current, locale === "en" ? `Custom field ${current.length + 1}` : `自定义项${current.length + 1}`], { shouldDirty: true });
  }

  function updateCustomReceiverField(index: number, value: string) {
    const current = (form.getValues("customReceiverFields") ?? []) as string[];
    form.setValue(
      "customReceiverFields",
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
      { shouldDirty: true },
    );
  }

  function removeCustomReceiverField(index: number) {
    const current = (form.getValues("customReceiverFields") ?? []) as string[];
    form.setValue(
      "customReceiverFields",
      current.filter((_, itemIndex) => itemIndex !== index),
      { shouldDirty: true },
    );
  }

  function resetReceiverFields() {
    form.setValue("receiverFields", ["CONTACT", "PHONE", "ADDRESS"], { shouldDirty: true });
    form.setValue("customReceiverFields", [], { shouldDirty: true });
  }

  function addProduct(product?: GroupBuyProduct) {
    if (products.length >= PRODUCT_HARD_LIMIT) {
      toast.error(`单个团购最多添加 ${PRODUCT_HARD_LIMIT} 个商品`);
      return;
    }
    if (products.length + 1 > PRODUCT_SOFT_LIMIT) {
      toast.message(`已超过 ${PRODUCT_SOFT_LIMIT} 个商品，建议按品类拆成多个团购`);
    }
    const nextOrder = products.length + 1;
    const nextProduct = withGeneratedSkus({
      localId: `product-${Date.now()}`,
      productId: product?.productId ?? "",
      sourceProductId: product?.productId ?? null,
      productName: product?.productName ?? (locale === "en" ? "New group-buy product" : "新团购商品"),
      productImages: product?.productImages?.length ? product.productImages.slice(0, PRODUCT_IMAGE_LIMIT) : [],
      coverImageUrl: product?.coverImageUrl ?? product?.productImages?.[0] ?? "",
      price: product?.price ?? 1,
      costPrice: product?.costPrice ?? 0,
      categoryId: product?.categoryId ?? "",
      categoryName: product?.categoryName ?? "",
      productDesc: product?.productDesc ?? "",
      videoUrl: product?.videoUrl ?? "",
      displayOrder: nextOrder,
      status: "ACTIVE",
      specGroups: product?.specGroups?.length ? product.specGroups : [],
      skus: product?.skus?.length ? product.skus : [],
      bulkPrice: String(product?.price ?? 1),
      bulkCostPrice: String(product?.costPrice ?? 0),
      bulkStock: product?.skus?.[0]?.stock == null ? "" : String(product.skus[0].stock),
    });
    setProducts((current) => [...current, nextProduct]);
    setActiveProductId(nextProduct.localId);
  }

  function duplicateProduct(localId: string) {
    if (products.length >= PRODUCT_HARD_LIMIT) {
      toast.error(`单个团购最多添加 ${PRODUCT_HARD_LIMIT} 个商品`);
      return;
    }
    const target = products.find((product) => product.localId === localId);
    if (!target) {
      return;
    }
    const nextProduct = withGeneratedSkus({
      ...target,
      localId: `product-copy-${Date.now()}`,
      productId: "",
      sourceProductId: target.sourceProductId ?? target.productId ?? null,
      productName: `${target.productName || t("products.unnamed")} ${locale === "en" ? "copy" : "副本"}`,
      displayOrder: products.length + 1,
      skus: target.skus.map((sku, index) => ({
        ...sku,
        skuId: "",
        skuCode: sku.skuCode ? `${sku.skuCode}-copy-${index + 1}` : "",
      })),
    });
    setProducts((current) => [...current, nextProduct]);
    setActiveProductId(nextProduct.localId);
  }

  function moveProduct(localId: string, direction: -1 | 1) {
    setProducts((current) => {
      const currentIndex = current.findIndex((product) => product.localId === localId);
      const nextIndex = currentIndex + direction;
      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }
      const nextProducts = [...current];
      const [target] = nextProducts.splice(currentIndex, 1);
      nextProducts.splice(nextIndex, 0, target);
      return nextProducts.map((product, index) => ({ ...product, displayOrder: index + 1 }));
    });
  }

  function updateProduct(localId: string, patch: Partial<ProductDraft>) {
    setProducts((current) =>
      current.map((product) => {
        if (product.localId !== localId) {
          return product;
        }
        return withGeneratedSkus({ ...product, ...patch });
      }),
    );
  }

  function removeProduct(localId: string) {
    if (products.length === 1) {
      toast.error("至少保留一个团购商品");
      return;
    }
    const nextProducts = products.filter((product) => product.localId !== localId);
    setProducts(nextProducts);
    if (activeProductId === localId) {
      setActiveProductId(nextProducts[0]?.localId ?? "");
    }
  }

  function addCommonSpec(localId: string, groupName: string) {
    const preset = commonSpecGroups.find((group) => group.name === groupName);
    if (!preset) {
      return;
    }
    const target = products.find((product) => product.localId === localId);
    if (!target || target.specGroups.some((group) => group.specGroupName === preset.name)) {
      return;
    }
    updateProduct(localId, {
      specGroups: [
        ...target.specGroups,
        {
          specGroupName: preset.name,
          imageRequired: false,
          displayOrder: target.specGroups.length + 1,
          specValues: preset.values.map((value, index) => ({
            valueName: value,
            displayOrder: index + 1,
          })),
        },
      ],
    });
  }

  function addCommonSpecPreset() {
    setCommonSpecGroups((current) => [
      ...current,
      { name: locale === "en" ? "New variant" : "新规格", values: [locale === "en" ? "Option 1" : "规格1"] },
    ]);
  }

  function updateCommonSpecPreset(index: number, patch: Partial<CommonSpecGroup>) {
    setCommonSpecGroups((current) =>
      current.map((group, groupIndex) => (groupIndex === index ? { ...group, ...patch } : group)),
    );
  }

  function removeCommonSpecPreset(index: number) {
    setCommonSpecGroups((current) => current.filter((_, groupIndex) => groupIndex !== index));
  }

  function addCommonSpecPresetValue(index: number) {
    setCommonSpecGroups((current) =>
      current.map((group, groupIndex) =>
        groupIndex === index
          ? { ...group, values: [...group.values, locale === "en" ? `Option ${group.values.length + 1}` : `规格${group.values.length + 1}`] }
          : group,
      ),
    );
  }

  function updateCommonSpecPresetValue(index: number, valueIndex: number, value: string) {
    setCommonSpecGroups((current) =>
      current.map((group, groupIndex) => {
        if (groupIndex !== index) {
          return group;
        }
        return {
          ...group,
          values: group.values.map((item, itemIndex) => (itemIndex === valueIndex ? value : item)),
        };
      }),
    );
  }

  function removeCommonSpecPresetValue(index: number, valueIndex: number) {
    setCommonSpecGroups((current) =>
      current.map((group, groupIndex) => {
        if (groupIndex !== index) {
          return group;
        }
        return {
          ...group,
          values: group.values.filter((_, itemIndex) => itemIndex !== valueIndex),
        };
      }),
    );
  }

  function updateSpecGroup(localId: string, groupIndex: number, patch: Partial<GroupBuySpecGroup>) {
    const target = products.find((product) => product.localId === localId);
    if (!target) {
      return;
    }
    const nextGroups = target.specGroups.map((group, index) => (index === groupIndex ? { ...group, ...patch } : group));
    updateProduct(localId, { specGroups: nextGroups });
  }

  function addSpecGroup(localId: string) {
    const target = products.find((product) => product.localId === localId);
    if (!target) {
      return;
    }
    updateProduct(localId, {
      specGroups: [
        ...target.specGroups,
        {
          specGroupName: locale === "en" ? "Custom variant" : "自定义规格",
          imageRequired: false,
          displayOrder: target.specGroups.length + 1,
          specValues: [{ valueName: locale === "en" ? "Option 1" : "规格1", displayOrder: 1 }],
        },
      ],
    });
  }

  function removeSpecGroup(localId: string, groupIndex: number) {
    const target = products.find((product) => product.localId === localId);
    if (!target) {
      return;
    }
    updateProduct(localId, {
      specGroups: target.specGroups.filter((_, index) => index !== groupIndex),
    });
  }

  function updateSpecValue(
    localId: string,
    groupIndex: number,
    valueIndex: number,
    patch: Partial<GroupBuySpecGroup["specValues"][number]>,
  ) {
    const target = products.find((product) => product.localId === localId);
    if (!target) {
      return;
    }
    const nextGroups = target.specGroups.map((group, index) => {
      if (index !== groupIndex) {
        return group;
      }
      return {
        ...group,
        specValues: group.specValues.map((value, itemIndex) => (itemIndex === valueIndex ? { ...value, ...patch } : value)),
      };
    });
    updateProduct(localId, { specGroups: nextGroups });
  }

  function addSpecValue(localId: string, groupIndex: number) {
    const target = products.find((product) => product.localId === localId);
    if (!target) {
      return;
    }
    const nextGroups = target.specGroups.map((group, index) => {
      if (index !== groupIndex) {
        return group;
      }
      return {
        ...group,
        specValues: [
          ...group.specValues,
          {
            valueName: locale === "en" ? `Option ${group.specValues.length + 1}` : `规格${group.specValues.length + 1}`,
            displayOrder: group.specValues.length + 1,
          },
        ],
      };
    });
    updateProduct(localId, { specGroups: nextGroups });
  }

  function removeSpecValue(localId: string, groupIndex: number, valueIndex: number) {
    const target = products.find((product) => product.localId === localId);
    if (!target) {
      return;
    }
    const nextGroups = target.specGroups.map((group, index) => {
      if (index !== groupIndex) {
        return group;
      }
      return {
        ...group,
        specValues: group.specValues.filter((_, itemIndex) => itemIndex !== valueIndex),
      };
    });
    updateProduct(localId, { specGroups: nextGroups });
  }

  function updateSku(localId: string, skuIndex: number, patch: Partial<GroupBuySku>) {
    const target = products.find((product) => product.localId === localId);
    if (!target) {
      return;
    }
    updateProduct(localId, {
      skus: target.skus.map((sku, index) => (index === skuIndex ? { ...sku, ...patch } : sku)),
    });
  }

  function applyBulk(localId: string, specSelection: BulkSpecSelection = {}) {
    const target = products.find((product) => product.localId === localId);
    if (!target) {
      return;
    }
    const bulkPrice = parseOptionalNumber(target.bulkPrice);
    const bulkCostPrice = parseOptionalNumber(target.bulkCostPrice);
    const bulkStock = parseOptionalInteger(target.bulkStock);
    const hasSelection = hasBulkSpecSelection(specSelection);
    let appliedCount = 0;
    updateProduct(localId, {
      price: hasSelection ? target.price : bulkPrice ?? target.price,
      costPrice: hasSelection ? target.costPrice : bulkCostPrice ?? target.costPrice,
      skus: target.skus.map((sku) => ({
        ...sku,
        ...(skuMatchesBulkSelection(sku, specSelection)
          ? {
              price: bulkPrice ?? sku.price,
              costPrice: bulkCostPrice ?? sku.costPrice,
              stock: bulkStock ?? sku.stock,
            }
          : {}),
      })).map((sku) => {
        if (skuMatchesBulkSelection(sku, specSelection)) {
          appliedCount += 1;
        }
        return sku;
      }),
    });
    toast.success(`已批量更新 ${appliedCount} 个规格组合`);
  }

  return (
    <AppPageShell backgroundClassName="bg-[#fff7f0]" maxWidthClassName="max-w-7xl" hideTopCategories>
      <section className="grid gap-5 xl:grid-cols-[300px_1fr]">
        <aside className="h-fit overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_18px_45px_-34px_rgba(15,23,42,0.65)] ring-1 ring-white/80 xl:sticky xl:top-24">
          <div className="border-b border-[#FFD3C2] bg-[#FFE7D9] p-4 text-[#7A2E1D]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D94D2A]">{t("sidebar.eyebrow")}</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{t("sidebar.title")}</h1>
            <p className="mt-3 text-sm leading-6 text-[#8A4A37]">{t("sidebar.description")}</p>
          </div>

          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-center">
            <div className="px-2 py-3">
              <div className="text-lg font-black text-slate-950">{introImages.length}</div>
              <div className="mt-0.5 text-[11px] font-semibold text-slate-500">{t("sidebar.introImages")}</div>
            </div>
            <div className="border-x border-slate-200 px-2 py-3">
              <div className="text-lg font-black text-slate-950">{products.length}</div>
              <div className="mt-0.5 text-[11px] font-semibold text-slate-500">{t("sidebar.products")}</div>
            </div>
            <div className="px-2 py-3">
              <div className="text-lg font-black text-slate-950">{activeProduct?.skus.length ?? 0}</div>
              <div className="mt-0.5 text-[11px] font-semibold text-slate-500">{t("sidebar.currentSku")}</div>
            </div>
          </div>

          <div className="grid gap-2 p-4">
            <InfoCard label={t("sidebar.pricingMode")} value={pricingModeLabel} />
            <InfoCard label={t("sidebar.fulfillment")} value={fulfillmentLabel} />
            <InfoCard label={t("sidebar.account")} value={session?.account ?? t("sidebar.notLoggedIn")} />
          </div>
        </aside>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="rounded-lg border border-[#FFD3C2] bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-950">{t("status.title")}</div>
                <div className="mt-1 text-xs leading-5 text-slate-500">{t("status.description")}</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-lg bg-[#FFF0E7] px-3 py-1.5 text-[#B83A1C] ring-1 ring-[#FFD3C2]">{t("status.introReady")}</span>
                <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">{t("status.productCount", { count: products.length, limit: PRODUCT_HARD_LIMIT })}</span>
                <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-slate-600 ring-1 ring-slate-200">{t("status.ruleCount", { count: fields.length })}</span>
              </div>
            </div>
          </div>

          <section className={sectionClassName}>
            <SectionTitle icon={<ImagePlus className="h-5 w-5" />} title={t("intro.title")} action={t("intro.action")} />
            <div className="mt-4 space-y-4">
              <Field label={t("intro.titleLabel")} error={form.formState.errors.title?.message}>
                <Input {...form.register("title")} className={inputClassName} />
              </Field>
              <IntroImageUploader
                images={introImages}
                onChange={setIntroImages}
                label={t("intro.imagesLabel")}
                countText={t("intro.imageCount", { count: introImages.length })}
                uploadText={t("intro.upload")}
                localPreviewText={t("intro.localPreview")}
                emptyText={t("intro.empty")}
              />
              <Field label={t("intro.descriptionLabel")} hint={introTextIsTemplate ? t("intro.defaultTemplate") : undefined} error={form.formState.errors.introText?.message}>
                <Textarea
                  {...form.register("introText")}
                  rows={10}
                  className={`${inputClassName} resize-y leading-7 ${introTextIsTemplate ? "text-slate-400" : "text-slate-900"}`}
                />
              </Field>
            </div>
          </section>

          <section className={sectionClassName}>
            <SectionTitle icon={<Layers3 className="h-5 w-5" />} title={t("groupRules.title")} action={t("groupRules.action")} />
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Field label={t("groupRules.pricingMode")} error={form.formState.errors.pricingMode?.message}>
                <select {...form.register("pricingMode")} className={compactInputClassName}>
                  <option value={1}>{t("labels.pricingEarlyBird")}</option>
                  <option value={2}>{t("labels.pricingTiered")}</option>
                  <option value={3}>{t("labels.pricingSuccessOnly")}</option>
                </select>
              </Field>
              <Field label={t("groupRules.requiredParticipants")} error={form.formState.errors.requiredParticipantCount?.message}>
                <Input type="number" {...form.register("requiredParticipantCount")} className={compactInputClassName} />
              </Field>
              <Field label={t("groupRules.maxParticipants")} error={form.formState.errors.maxParticipantCount?.message}>
                <Input type="number" {...form.register("maxParticipantCount")} className={compactInputClassName} />
              </Field>
            </div>
          </section>

          <section className={sectionClassName}>
            <SectionTitle icon={<Settings2 className="h-5 w-5" />} title={t("settings.title")} action={t("settings.action")} />
            <div className="mt-4 overflow-hidden rounded-lg border border-[#FFD3C2] bg-white">
              <SettingRow
                icon={<Truck className="h-4 w-4" />}
                label={t("settings.logisticsMethod")}
                description={t("settings.logisticsDescription")}
              >
                <button
                  type="button"
                  onClick={() => setShowLogisticsDialog(true)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm transition hover:border-[#FF724C] hover:bg-white"
                >
                  <span>
                    <span className="font-bold text-slate-900">{logisticsSummary}</span>
                    <span className="mt-0.5 block text-xs text-slate-500">{t("settings.logisticsHint")}</span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-[#D94D2A]">{t("settings.set")}</span>
                </button>
              </SettingRow>

              <SettingRow
                icon={<CalendarClock className="h-4 w-4" />}
                label={t("settings.shipmentTime")}
                description={t("settings.shipmentDescription")}
              >
                <input type="datetime-local" {...form.register("shipmentTime")} className={settingInputClassName} />
              </SettingRow>

              <SettingRow
                icon={<CalendarClock className="h-4 w-4" />}
                label={t("settings.groupTime")}
                description={t("settings.groupTimeDescription")}
              >
                <div className="grid gap-2 sm:grid-cols-2">
                  <input type="datetime-local" {...form.register("groupStartTime")} className={settingInputClassName} />
                  <input type="datetime-local" {...form.register("groupEndTime")} className={settingInputClassName} />
                </div>
              </SettingRow>

              <SettingRow
                icon={<Bell className="h-4 w-4" />}
                label={t("settings.notifyTarget")}
                description={t("settings.notifyDescription")}
              >
                <select {...form.register("notifyTarget")} className={settingSelectClassName}>
                  {notifyTargetOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </SettingRow>

              <SettingRow
                icon={<Settings2 className="h-4 w-4" />}
                label={t("settings.moreSettings")}
                description={t("settings.moreSettingsDescription")}
              >
                <div className="grid gap-2 sm:grid-cols-3">
                  <label className={settingToggleClassName}>
                    <input type="checkbox" {...form.register("couponEnabled")} className="h-3.5 w-3.5 accent-[#FF724C]" />
                    {t("settings.coupon")}
                  </label>
                  <label className={settingToggleClassName}>
                    <input type="checkbox" {...form.register("assistSaleEnabled")} className="h-3.5 w-3.5 accent-[#FF724C]" />
                    {t("settings.assistSale")}
                  </label>
                  <select {...form.register("privacyMode")} className={settingSelectClassName}>
                    {privacyModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </SettingRow>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <Field label={t("settings.pickupAddress")}>
                <Input {...form.register("pickupAddress")} className={compactInputClassName} />
              </Field>
              <Field label={t("settings.autoConfirmDays")} error={form.formState.errors.autoConfirmDays?.message}>
                <Input type="number" {...form.register("autoConfirmDays")} className={compactInputClassName} />
              </Field>
              <Field label={t("settings.deliveryRemark")}>
                <Input {...form.register("deliveryRemark")} className={compactInputClassName} />
              </Field>
            </div>
          </section>

          <section className={sectionClassName}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle
                icon={<PackagePlus className="h-5 w-5" />}
                title={t("products.title")}
                action={t("products.action", { count: products.length, limit: PRODUCT_HARD_LIMIT })}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 rounded-lg px-3"
                  onClick={() => setShowProductLibrary((current) => !current)}
                >
                  <Search className="h-4 w-4" />
                  {t("products.library")}
                </Button>
                <button type="button" onClick={() => addProduct()} disabled={products.length >= PRODUCT_HARD_LIMIT} className={compactSecondaryButtonClassName}>
                  <Plus className="h-4 w-4" />
                  {t("products.addProduct")}
                </button>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
              {t("products.description", { softLimit: PRODUCT_SOFT_LIMIT, hardLimit: PRODUCT_HARD_LIMIT })}
            </p>

            {showProductLibrary ? (
              <div className="mt-4 rounded-lg border border-[#FFD3C2] bg-[#FFF0E7] p-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-slate-950">{t("products.libraryTitle")}</div>
                    <div className="mt-1 text-xs text-slate-500">{t("products.libraryDescription")}</div>
                  </div>
                  <span className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#D94D2A] ring-1 ring-[#FFD3C2]">{t("products.libraryBatch")}</span>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-[1fr_auto]">
                  <Input
                    value={libraryKeyword}
                    onChange={(event) => setLibraryKeyword(event.target.value)}
                    placeholder={t("products.libraryPlaceholder")}
                    className={compactInputClassName}
                  />
                  <Button type="button" onClick={searchLibrary} variant="dark" className="h-10 rounded-lg px-4">
                    {libraryMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {t("products.search")}
                  </Button>
                </div>
                {libraryItems.length ? (
                  <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {libraryItems.map((item) => (
                      <button
                        key={item.productId ?? item.productName}
                        type="button"
                        onClick={() => addProduct(item)}
                        className="rounded-lg bg-white p-3 text-left text-sm shadow-sm ring-1 ring-slate-200 transition hover:bg-[#FFF0E7] hover:ring-[#FFD3C2]"
                      >
                        <div className="font-bold text-slate-950">{item.productName}</div>
                        <div className="mt-1 text-slate-500">¥{item.price} · {item.categoryName || t("products.uncategorized")}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-4 grid gap-4 xl:grid-cols-[280px_1fr]">
              <aside className="self-start overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm xl:sticky xl:top-24">
                <div className="border-b border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3 px-1">
                    <div>
                      <div className="text-sm font-black text-slate-950">{t("products.productList")}</div>
                      <div className="mt-1 text-xs text-slate-500">{t("products.productListHelp")}</div>
                    </div>
                    <span className="rounded-lg bg-white px-2 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                      {products.length}/{PRODUCT_HARD_LIMIT}
                    </span>
                  </div>
                </div>
                <div className="max-h-[calc(100vh-220px)] space-y-2 overflow-y-auto p-3">
                  {products.map((product, index) => {
                    const status = getProductStatus(product, t);
                    const selected = activeProduct?.localId === product.localId;
                    return (
                      <div
                        key={product.localId}
                        className={`flex items-start gap-2 rounded-lg p-2 shadow-sm ring-1 transition ${
                          selected ? "bg-[#FFF0E7] ring-[#FF8A52]" : "bg-white ring-slate-200 hover:-translate-y-0.5 hover:ring-slate-300"
                        }`}
                      >
                        <button type="button" onClick={() => setActiveProductId(product.localId)} className="flex min-w-0 flex-1 gap-3 text-left">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                            {product.coverImageUrl || product.productImages[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.coverImageUrl || product.productImages[0]} alt={product.productName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-slate-400">
                                <ImagePlus className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-slate-500">{t("products.productIndex", { index: index + 1 })}</div>
                            <div className={`mt-1 truncate text-sm font-black ${selected ? "text-[#B83A1C]" : "text-slate-900"}`}>
                              {product.productName || t("products.unnamed")}
                            </div>
                            <div className="mt-1 truncate text-xs text-slate-500">
                              ¥{product.price || 0} · {product.categoryName || t("products.uncategorized")} · {t("products.specCount", { count: product.skus.length || 1 })}
                            </div>
                            <div className={`mt-2 inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${status.className}`}>{status.label}</div>
                          </div>
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-lg">
                            <DropdownMenuItem onSelect={() => duplicateProduct(product.localId)}>
                              <Copy className="h-4 w-4" />
                              {t("products.copy")}
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={index === 0} onSelect={() => moveProduct(product.localId, -1)}>
                              <ArrowUp className="h-4 w-4" />
                              {t("products.moveUp")}
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={index === products.length - 1} onSelect={() => moveProduct(product.localId, 1)}>
                              <ArrowDown className="h-4 w-4" />
                              {t("products.moveDown")}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={products.length === 1} onSelect={() => removeProduct(product.localId)} className="text-red-600 focus:text-red-700">
                              <Trash2 className="h-4 w-4" />
                              {t("products.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </aside>

              <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_40px_-34px_rgba(15,23,42,0.75)]">
                {activeProduct ? (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#FFD3C2] bg-[#FFE7D9] px-4 py-3">
                      <div>
                        <div className="text-xs font-semibold text-[#D94D2A]">
                          {t("products.currentEditing", { index: products.findIndex((product) => product.localId === activeProduct.localId) + 1 })}
                        </div>
                        <div className="mt-1 text-lg font-black text-slate-950">{activeProduct.productName || t("products.unnamed")}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" className="h-8 rounded-lg border-[#FFD3C2] bg-white px-3 text-xs text-[#7A2E1D] hover:border-[#FF724C] hover:text-[#D94D2A]" onClick={() => duplicateProduct(activeProduct.localId)}>
                          <Copy className="h-4 w-4" />
                          {t("products.copy")}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="h-8 rounded-lg border-[#FFD3C2] bg-white px-3 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                          onClick={() => removeProduct(activeProduct.localId)}
                          disabled={products.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                          {t("products.delete")}
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <ProductEditor
                        product={activeProduct}
                        commonSpecGroups={commonSpecGroups}
                        onChange={(patch) => updateProduct(activeProduct.localId, patch)}
                        onAddCommonSpec={(name) => addCommonSpec(activeProduct.localId, name)}
                        onAddCommonSpecPreset={addCommonSpecPreset}
                        onUpdateCommonSpecPreset={updateCommonSpecPreset}
                        onRemoveCommonSpecPreset={removeCommonSpecPreset}
                        onAddCommonSpecPresetValue={addCommonSpecPresetValue}
                        onUpdateCommonSpecPresetValue={updateCommonSpecPresetValue}
                        onRemoveCommonSpecPresetValue={removeCommonSpecPresetValue}
                        onAddSpecGroup={() => addSpecGroup(activeProduct.localId)}
                        onUpdateSpecGroup={(groupIndex, patch) => updateSpecGroup(activeProduct.localId, groupIndex, patch)}
                        onRemoveSpecGroup={(groupIndex) => removeSpecGroup(activeProduct.localId, groupIndex)}
                        onUpdateSpecValue={(groupIndex, valueIndex, patch) => updateSpecValue(activeProduct.localId, groupIndex, valueIndex, patch)}
                        onAddSpecValue={(groupIndex) => addSpecValue(activeProduct.localId, groupIndex)}
                        onRemoveSpecValue={(groupIndex, valueIndex) => removeSpecValue(activeProduct.localId, groupIndex, valueIndex)}
                        onUpdateSku={(skuIndex, patch) => updateSku(activeProduct.localId, skuIndex, patch)}
                        onApplyBulk={(selection) => applyBulk(activeProduct.localId, selection)}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </section>

          <section className={sectionClassName}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle icon={<Wand2 className="h-5 w-5" />} title={t("priceRules.title")} action={t("priceRules.action")} />
              <button
                type="button"
                onClick={() => append({ thresholdPeople: fields.length + 2, price: products[0]?.price ?? 1 })}
                className={compactSecondaryButtonClassName}
              >
                <Plus className="h-4 w-4" />
                {t("priceRules.add")}
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm sm:grid-cols-[72px_1fr_1fr_auto]">
                  <div className="flex h-full min-h-16 flex-col justify-center rounded-lg bg-white px-3 text-center ring-1 ring-slate-200">
                    <div className="text-xs font-bold text-slate-500">{t("priceRules.rule")}</div>
                    <div className="text-xl font-black text-slate-950">{index + 1}</div>
                  </div>
                  <Field label={t("priceRules.threshold")} error={form.formState.errors.priceRules?.[index]?.thresholdPeople?.message}>
                    <input type="number" {...form.register(`priceRules.${index}.thresholdPeople`)} className={compactInputClassName} />
                  </Field>
                  <Field label={t("priceRules.price")} error={form.formState.errors.priceRules?.[index]?.price?.message}>
                    <input type="number" step="0.01" {...form.register(`priceRules.${index}.price`)} className={compactInputClassName} />
                  </Field>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="mt-7 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="sticky bottom-4 z-20 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <button type="submit" disabled={createMutation.isPending} className={primaryButtonClassName}>
              {createMutation.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              {t("actions.submit")}
            </button>
            <Link href="/group-buy/mine" className={linkButtonClassName}>
              {t("actions.viewMine")}
            </Link>
          </div>

          <LogisticsSettingsDialog
            open={showLogisticsDialog}
            onOpenChange={setShowLogisticsDialog}
            method={logisticsMethod ?? "LOCAL_DELIVERY"}
            freightTemplate={freightTemplate ?? "BASE"}
            freightPayScope={freightPayScope ?? "EVERY_ORDER"}
            freightAmountMode={freightAmountMode ?? "BY_QUANTITY"}
            baseFreightAmount={form.watch("baseFreightAmount")}
            freightBaseQuantity={form.watch("freightBaseQuantity")}
            freeShippingAmount={form.watch("freeShippingAmount")}
            freeShippingQuantity={form.watch("freeShippingQuantity")}
            freightQuantityStep={form.watch("freightQuantityStep")}
            freightStepAmount={form.watch("freightStepAmount")}
            deliveryNote={form.watch("deliveryNote")}
            receiverFields={receiverFields ?? []}
            customReceiverFields={customReceiverFields ?? []}
            onSetMethod={setLogisticsMethod}
            onSetFreightTemplate={(template) => form.setValue("freightTemplate", template, { shouldDirty: true })}
            onSetFreightPayScope={(scope) => form.setValue("freightPayScope", scope, { shouldDirty: true })}
            onSetFreightAmountMode={(mode) => form.setValue("freightAmountMode", mode, { shouldDirty: true })}
            onSetBaseFreightAmount={(value) => form.setValue("baseFreightAmount", value, { shouldDirty: true })}
            onSetFreightBaseQuantity={(value) => form.setValue("freightBaseQuantity", value, { shouldDirty: true })}
            onSetFreeShippingAmount={(value) => form.setValue("freeShippingAmount", value, { shouldDirty: true })}
            onSetFreeShippingQuantity={(value) => form.setValue("freeShippingQuantity", value, { shouldDirty: true })}
            onSetFreightQuantityStep={(value) => form.setValue("freightQuantityStep", value, { shouldDirty: true })}
            onSetFreightStepAmount={(value) => form.setValue("freightStepAmount", value, { shouldDirty: true })}
            onSetDeliveryNote={(value) => form.setValue("deliveryNote", value, { shouldDirty: true })}
            onToggleReceiverField={toggleReceiverField}
            onAddCustomReceiverField={addCustomReceiverField}
            onUpdateCustomReceiverField={updateCustomReceiverField}
            onRemoveCustomReceiverField={removeCustomReceiverField}
            onResetReceiverFields={resetReceiverFields}
          />
        </form>
      </section>
    </AppPageShell>
  );
}

function ProductEditor({
  product,
  commonSpecGroups,
  onChange,
  onAddCommonSpec,
  onAddCommonSpecPreset,
  onUpdateCommonSpecPreset,
  onRemoveCommonSpecPreset,
  onAddCommonSpecPresetValue,
  onUpdateCommonSpecPresetValue,
  onRemoveCommonSpecPresetValue,
  onAddSpecGroup,
  onUpdateSpecGroup,
  onRemoveSpecGroup,
  onUpdateSpecValue,
  onAddSpecValue,
  onRemoveSpecValue,
  onUpdateSku,
  onApplyBulk,
}: {
  product: ProductDraft;
  commonSpecGroups: CommonSpecGroup[];
  onChange: (patch: Partial<ProductDraft>) => void;
  onAddCommonSpec: (name: string) => void;
  onAddCommonSpecPreset: () => void;
  onUpdateCommonSpecPreset: (index: number, patch: Partial<CommonSpecGroup>) => void;
  onRemoveCommonSpecPreset: (index: number) => void;
  onAddCommonSpecPresetValue: (index: number) => void;
  onUpdateCommonSpecPresetValue: (index: number, valueIndex: number, value: string) => void;
  onRemoveCommonSpecPresetValue: (index: number, valueIndex: number) => void;
  onAddSpecGroup: () => void;
  onUpdateSpecGroup: (groupIndex: number, patch: Partial<GroupBuySpecGroup>) => void;
  onRemoveSpecGroup: (groupIndex: number) => void;
  onUpdateSpecValue: (groupIndex: number, valueIndex: number, patch: Partial<GroupBuySpecGroup["specValues"][number]>) => void;
  onAddSpecValue: (groupIndex: number) => void;
  onRemoveSpecValue: (groupIndex: number, valueIndex: number) => void;
  onUpdateSku: (skuIndex: number, patch: Partial<GroupBuySku>) => void;
  onApplyBulk: (selection: BulkSpecSelection) => void;
}) {
  const t = useTranslations("CreateGroupBuy");
  const locale = useLocale();
  const [showCommonSpecManager, setShowCommonSpecManager] = useState(false);
  const [selectedCommonSpecIndex, setSelectedCommonSpecIndex] = useState(0);
  const [showBulkSkuPanel, setShowBulkSkuPanel] = useState(false);
  const [showSkuCode, setShowSkuCode] = useState(false);
  const [bulkSpecSelection, setBulkSpecSelection] = useState<BulkSpecSelection>({});
  const skuSpecPath = product.specGroups.length ? product.specGroups.map((group) => group.specGroupName).join(" / ") : t("variants.defaultPath");
  const categoryOptions = PRODUCT_CATEGORY_OPTIONS.map((category) => ({
    ...category,
    label: locale === "en" ? category.nameEn : category.name,
  }));

  function setBulkGroupSelection(groupName: string, valueName?: string) {
    setBulkSpecSelection((current) => {
      if (!valueName) {
        return { ...current, [groupName]: [] };
      }
      const currentValues = current[groupName] ?? [];
      const nextValues = currentValues.includes(valueName)
        ? currentValues.filter((item) => item !== valueName)
        : [...currentValues, valueName];
      return { ...current, [groupName]: nextValues };
    });
  }

  function uploadSpecValueImage(groupIndex: number, valueIndex: number, files: FileList | null) {
    const file = files?.[0];
    if (!file) {
      return;
    }
    onUpdateSpecValue(groupIndex, valueIndex, { imageUrl: URL.createObjectURL(file) });
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="text-base font-black text-slate-950">{t("productEditor.details")}</div>
            <p className="mt-1 text-xs leading-5 text-slate-500">{t("productEditor.detailsHelp")}</p>
          </div>
          <span className="rounded-lg bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
            {t("productEditor.imageCount", { count: product.productImages.length, limit: PRODUCT_IMAGE_LIMIT })}
          </span>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label={t("productEditor.name")} hint={t("productEditor.nameHint", { count: product.productName.length, limit: PRODUCT_NAME_LIMIT })}>
            <Input
              value={product.productName}
              maxLength={PRODUCT_NAME_LIMIT}
              onChange={(event) => onChange({ productName: event.target.value.slice(0, PRODUCT_NAME_LIMIT) })}
              className={inputClassName}
            />
          </Field>

          <Field label={t("productEditor.category")} tip={t("productEditor.categoryTip")}>
            <select
              value={product.categoryName ?? ""}
              onChange={(event) => {
                const option = categoryOptions.find((item) => item.label === event.target.value);
                onChange({ categoryId: option?.id ?? "", categoryName: event.target.value });
              }}
              className={inputClassName}
            >
              <option value="">{t("productEditor.selectCategory")}</option>
              {product.categoryName && !categoryOptions.some((item) => item.label === product.categoryName) ? (
                <option value={product.categoryName}>{product.categoryName}</option>
              ) : null}
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.label}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="lg:col-span-2">
            <ProductImageUploader
              images={product.productImages}
              onChange={(images) => onChange({ productImages: images, coverImageUrl: images[0] ?? "" })}
            />
          </div>

          <Field label={t("productEditor.price")} tip={t("productEditor.priceTip")}>
            <Input
              type="number"
              step="0.01"
              value={product.price}
              onChange={(event) => onChange({ price: Number(event.target.value) })}
              className={inputClassName}
            />
          </Field>
          <Field label={t("productEditor.costPrice")} tip={t("productEditor.costPriceTip")}>
            <Input
              type="number"
              step="0.01"
              value={product.costPrice ?? ""}
              onChange={(event) => onChange({ costPrice: parseOptionalNumber(event.target.value) ?? 0 })}
              className={inputClassName}
            />
          </Field>

          <div className="lg:col-span-2">
            <Field label={t("productEditor.description")} hint={`${product.productDesc?.length ?? 0}/${PRODUCT_DESC_LIMIT}`}>
              <Textarea
                rows={5}
                value={product.productDesc ?? ""}
                maxLength={PRODUCT_DESC_LIMIT}
                onChange={(event) => onChange({ productDesc: event.target.value.slice(0, PRODUCT_DESC_LIMIT) })}
                placeholder={t("productEditor.descriptionPlaceholder")}
                className={inputClassName}
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-[#FFD3C2] bg-[#FFF8F2] p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-lg font-black text-slate-950">{t("variants.title")}</div>
            <p className="mt-1 text-sm text-slate-500">{t("variants.description")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setShowCommonSpecManager((current) => !current)} className="inline-flex h-8 items-center justify-center rounded-lg bg-[#FF724C] px-3 text-xs font-bold text-white transition hover:bg-[#FF8A52]">
              {t("variants.manage")}
            </button>
            <button type="button" onClick={onAddSpecGroup} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-[#FF724C] hover:text-[#D94D2A]" aria-label={t("variants.addType")}>
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-[#FFE0D2] bg-white/85 p-3">
          <div className="text-sm font-semibold text-slate-700">{t("variants.commonTypes")}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {commonSpecGroups.map((group) => (
              <button key={group.name} type="button" onClick={() => onAddCommonSpec(group.name)} className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-[#FFF0E7] hover:text-[#B83A1C] hover:ring-[#FFD3C2]">
                {group.name}
              </button>
            ))}
          </div>
        </div>

        <CommonSpecManagerDialog
          open={showCommonSpecManager}
          onOpenChange={setShowCommonSpecManager}
          groups={commonSpecGroups}
          selectedIndex={selectedCommonSpecIndex}
          onSelect={setSelectedCommonSpecIndex}
          onAddGroup={() => {
            onAddCommonSpecPreset();
            setSelectedCommonSpecIndex(commonSpecGroups.length);
          }}
          onUpdateGroup={onUpdateCommonSpecPreset}
          onRemoveGroup={(index) => {
            onRemoveCommonSpecPreset(index);
            setSelectedCommonSpecIndex((current) => {
              if (current === index) {
                return Math.max(0, current - 1);
              }
              if (current > index) {
                return current - 1;
              }
              return current;
            });
          }}
          onAddValue={onAddCommonSpecPresetValue}
          onUpdateValue={onUpdateCommonSpecPresetValue}
          onRemoveValue={onRemoveCommonSpecPresetValue}
        />

        <div className="mt-4 grid gap-3">
          {product.specGroups.map((group, groupIndex) => (
            <div key={`${group.specGroupName}-${groupIndex}`} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[130px_1fr_auto]">
                <Field label={t("variants.type")}>
                  <input
                    value={group.specGroupName}
                    onChange={(event) => onUpdateSpecGroup(groupIndex, { specGroupName: event.target.value })}
                    className={compactInputClassName}
                  />
                  <label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <input
                      type="checkbox"
                      checked={Boolean(group.imageRequired)}
                      onChange={(event) => onUpdateSpecGroup(groupIndex, { imageRequired: event.target.checked })}
                      className="h-3.5 w-3.5 accent-[#FF724C]"
                    />
                    {t("variants.valueImages")}
                  </label>
                </Field>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{t("variants.values")}</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.specValues.map((value, valueIndex) => (
                      <span key={`${value.valueName}-${valueIndex}`} className="inline-flex items-center gap-2 rounded-lg bg-[#FFF0E7] px-3 py-1.5 text-sm font-semibold text-[#B83A1C] ring-1 ring-[#FFD3C2]">
                        {group.imageRequired ? (
                          <label className="grid h-8 w-8 cursor-pointer place-items-center overflow-hidden rounded-md border border-[#FFD3C2] bg-white text-[#D94D2A]">
                            {value.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={value.imageUrl} alt={`${value.valueName} image`} className="h-full w-full object-cover" />
                            ) : (
                              <ImagePlus className="h-4 w-4" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(event) => uploadSpecValueImage(groupIndex, valueIndex, event.target.files)}
                            />
                          </label>
                        ) : null}
                        <input
                          value={value.valueName}
                          onChange={(event) => onUpdateSpecValue(groupIndex, valueIndex, { valueName: event.target.value })}
                          className="w-24 bg-transparent outline-none"
                        />
                        <button type="button" onClick={() => onRemoveSpecValue(groupIndex, valueIndex)} className="text-slate-400 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                    <button type="button" onClick={() => onAddSpecValue(groupIndex)} className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-[#FFB49D] hover:text-[#D94D2A]">
                      + {t("variants.add")}
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => onRemoveSpecGroup(groupIndex)} className="mt-7 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-slate-600 hover:border-red-200 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-black text-slate-950">{t("variants.details")}</div>
              <p className="mt-1 text-sm text-slate-500">{skuSpecPath}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-8 items-center gap-2 rounded-lg bg-slate-50 px-3 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                <input
                  type="checkbox"
                  checked={showSkuCode}
                  onChange={(event) => setShowSkuCode(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[#FF724C]"
                />
                {t("variants.showSkuCode")}
              </label>
              <button
                type="button"
                onClick={() => setShowBulkSkuPanel((current) => !current)}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-[#FF724C] px-3 text-xs font-bold text-white transition hover:bg-[#FF8A52]"
              >
                {t("variants.bulkSetup")}
              </button>
            </div>
          </div>
        </div>

        {showBulkSkuPanel ? (
          <div className="m-4 space-y-3 rounded-lg border border-[#FFD3C2] bg-[#FFF0E7] p-4">
            <div>
              <div className="text-sm font-black text-slate-950">{t("variants.selectVariants")}</div>
              <div className="mt-2 grid gap-2">
                {product.specGroups.length ? (
                  product.specGroups.map((group) => {
                    const selectedValues = bulkSpecSelection[group.specGroupName] ?? [];
                    return (
                      <div key={`bulk-${group.specGroupName}`} className="grid gap-2 md:grid-cols-[120px_1fr]">
                        <div className="text-sm font-semibold text-slate-600">{group.specGroupName}</div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setBulkGroupSelection(group.specGroupName)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold ring-1 transition ${
                              selectedValues.length === 0
                                ? "bg-[#FF724C] text-white ring-[#FF724C]"
                                : "bg-white text-slate-600 ring-slate-200 hover:ring-[#FFD3C2]"
                            }`}
                          >
                            {t("variants.all")}
                          </button>
                          {group.specValues.map((value) => {
                            const selected = selectedValues.includes(value.valueName);
                            return (
                              <button
                                key={`${group.specGroupName}-${value.valueName}`}
                                type="button"
                                onClick={() => setBulkGroupSelection(group.specGroupName, value.valueName)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold ring-1 transition ${
                                  selected
                                    ? "bg-[#FF724C] text-white ring-[#FF724C]"
                                    : "bg-white text-slate-600 ring-slate-200 hover:bg-[#FFF0E7] hover:text-[#B83A1C] hover:ring-[#FFD3C2]"
                                }`}
                              >
                                {value.valueName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-slate-500">{t("variants.noVariants")}</div>
                )}
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Field label={t("productEditor.price")} tip={t("tips.bulkPrice")}>
                <input value={product.bulkPrice} onChange={(event) => onChange({ bulkPrice: event.target.value })} placeholder={t("variants.bulkPricePlaceholder")} className={compactInputClassName} />
              </Field>
              <Field label={t("productEditor.costPrice")} tip={t("tips.bulkCostPrice")}>
                <input value={product.bulkCostPrice} onChange={(event) => onChange({ bulkCostPrice: event.target.value })} placeholder={t("variants.bulkCostPlaceholder")} className={compactInputClassName} />
              </Field>
              <Field label={t("variants.stock")} tip={t("tips.bulkStock")}>
                <input value={product.bulkStock} onChange={(event) => onChange({ bulkStock: event.target.value })} placeholder={t("variants.bulkStockPlaceholder")} className={compactInputClassName} />
              </Field>
              <button type="button" onClick={() => onApplyBulk(bulkSpecSelection)} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FF724C] px-4 text-sm font-bold text-white transition hover:bg-[#FF8A52]">
                {t("variants.applySelected")}
              </button>
            </div>
          </div>
        ) : null}

        <div className="m-4 overflow-x-auto rounded-lg ring-1 ring-slate-200">
          <table className={`w-full border-collapse text-sm ${showSkuCode ? "min-w-[960px]" : "min-w-[760px]"}`}>
            <thead>
              <tr className="bg-slate-100 text-left text-slate-500">
                <th className="min-w-72 border-b border-slate-200 px-3 py-2">{t("variants.combination")}</th>
                <th className="border-b border-slate-200 px-3 py-2">{t("productEditor.price")} *</th>
                <th className="border-b border-slate-200 px-3 py-2">{t("productEditor.costPrice")}</th>
                <th className="border-b border-slate-200 px-3 py-2">{t("variants.stock")}</th>
                {showSkuCode ? <th className="border-b border-slate-200 px-3 py-2">{t("variants.skuCode")}</th> : null}
              </tr>
            </thead>
            <tbody>
              {product.skus.map((sku, skuIndex) => (
                <tr key={`${sku.skuId ?? skuIndex}-${skuIndex}`} className="odd:bg-white even:bg-slate-50/60">
                  <td className="border-b border-slate-100 px-3 py-2">
                    <div className="whitespace-nowrap font-semibold text-slate-900">
                      {sku.specValues.length ? sku.specValues.map((item) => item.specValueName).join(" / ") : t("variants.default")}
                    </div>
                    {sku.specValues.length ? (
                      <div className="mt-1 whitespace-nowrap text-xs text-slate-500">
                        {sku.specValues.map((item) => item.specGroupName).join(" / ")}
                      </div>
                    ) : null}
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input type="number" step="0.01" value={sku.price} placeholder={t("variants.enter")} onChange={(event) => onUpdateSku(skuIndex, { price: Number(event.target.value) })} className={tableInputClassName} />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input type="number" step="0.01" value={sku.costPrice ?? ""} placeholder={t("variants.enter")} onChange={(event) => onUpdateSku(skuIndex, { costPrice: parseOptionalNumber(event.target.value) ?? null })} className={tableInputClassName} />
                  </td>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input type="number" value={sku.stock ?? ""} placeholder={t("variants.unlimited")} onChange={(event) => onUpdateSku(skuIndex, { stock: parseOptionalInteger(event.target.value) ?? null })} className={tableInputClassName} />
                  </td>
                  {showSkuCode ? (
                    <td className="border-b border-slate-100 px-3 py-2">
                      <input value={sku.skuCode ?? ""} placeholder={t("variants.optional")} onChange={(event) => onUpdateSku(skuIndex, { skuCode: event.target.value })} className={tableInputClassName} />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function CommonSpecManagerDialog({
  open,
  onOpenChange,
  groups,
  selectedIndex,
  onSelect,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
  onAddValue,
  onUpdateValue,
  onRemoveValue,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CommonSpecGroup[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onAddGroup: () => void;
  onUpdateGroup: (index: number, patch: Partial<CommonSpecGroup>) => void;
  onRemoveGroup: (index: number) => void;
  onAddValue: (index: number) => void;
  onUpdateValue: (index: number, valueIndex: number, value: string) => void;
  onRemoveValue: (index: number, valueIndex: number) => void;
}) {
  const t = useTranslations("CreateGroupBuy");

  if (!open) {
    return null;
  }

  const activeIndex = groups[selectedIndex] ? selectedIndex : 0;
  const activeGroup = groups[activeIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#7A2E1D]/20 px-4 py-4" onMouseDown={() => onOpenChange(false)}>
      <section
        className="flex max-h-[84vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <div className="text-lg font-black text-slate-950">{t("commonSpecs.title")}</div>
            <p className="mt-1 text-xs text-slate-500">{t("commonSpecs.description")}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="h-8 rounded-lg px-3 text-xs" onClick={onAddGroup}>
              <Plus className="h-4 w-4" />
              {t("commonSpecs.addGroup")}
            </Button>
            <Button type="button" variant="secondary" className="h-8 rounded-lg px-3 text-xs" onClick={() => onOpenChange(false)}>
              {t("commonSpecs.done")}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[280px_1fr]">
          <aside className="min-h-0 overflow-y-auto border-b border-slate-200 bg-slate-50 p-3 lg:border-b-0 lg:border-r">
            <div className="text-sm font-bold text-slate-700">{t("commonSpecs.list")}</div>
            <div className="mt-2 space-y-2">
              {groups.map((group, index) => (
                <button
                  key={`common-spec-${index}`}
                  type="button"
                  onClick={() => onSelect(index)}
                  className={`w-full border px-3 py-2 text-left transition ${
                    activeIndex === index ? "border-[#FF724C] bg-[#FFF0E7]" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-sm font-black text-slate-950">{group.name || t("commonSpecs.unnamed")}</div>
                    <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-500">{group.values.length}</span>
                  </div>
                  <div className="mt-1 line-clamp-1 text-xs leading-5 text-slate-500">{group.values.filter(Boolean).join(" / ") || t("commonSpecs.noValues")}</div>
                </button>
              ))}
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto p-4">
            {activeGroup ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="min-w-64 flex-1">
                    <Field label={t("commonSpecs.groupName")}>
                      <Input
                        value={activeGroup.name}
                        onChange={(event) => onUpdateGroup(activeIndex, { name: event.target.value })}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" className="h-9 rounded-lg border-dashed px-3 text-xs" onClick={() => onAddValue(activeIndex)}>
                      <Plus className="h-4 w-4" />
                      {t("commonSpecs.addValue")}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-9 rounded-lg border-red-200 px-3 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => onRemoveGroup(activeIndex)}
                      disabled={groups.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("commonSpecs.delete")}
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-700">{t("commonSpecs.defaultValues")}</div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {activeGroup.values.map((value, valueIndex) => (
                      <div key={`common-spec-value-${activeIndex}-${valueIndex}`} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                        <Input
                          value={value}
                          onChange={(event) => onUpdateValue(activeIndex, valueIndex, event.target.value)}
                          className="h-8 min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 focus:border-0 focus:bg-transparent"
                        />
                        <button type="button" onClick={() => onRemoveValue(activeIndex, valueIndex)} className="text-slate-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                {t("commonSpecs.empty")}
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  );
}

function ProductImageUploader({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const t = useTranslations("CreateGroupBuy");
  const currentImages = images.filter(Boolean).slice(0, PRODUCT_IMAGE_LIMIT);
  const remainingSlots = PRODUCT_IMAGE_LIMIT - currentImages.length;

  function commit(nextImages: string[]) {
    onChange(nextImages.filter(Boolean).slice(0, PRODUCT_IMAGE_LIMIT));
  }

  function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }
    if (remainingSlots <= 0) {
      toast.error(t("productImages.maxError", { limit: PRODUCT_IMAGE_LIMIT }));
      return;
    }
    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      toast.message(t("productImages.trimmed", { count: remainingSlots }));
    }
    const nextUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    commit([...currentImages, ...nextUrls]);
  }

  function removeImage(index: number) {
    commit(currentImages.filter((_, imageIndex) => imageIndex !== index));
  }

  function setCover(index: number) {
    if (index === 0) {
      return;
    }
    const nextImages = [...currentImages];
    const [target] = nextImages.splice(index, 1);
    commit([target, ...nextImages]);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>{t("productImages.label")}</Label>
        <span className="text-sm text-slate-500">
          {t("productImages.count", { count: currentImages.length, limit: PRODUCT_IMAGE_LIMIT })}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition hover:border-[#FF724C] hover:text-[#D94D2A]">
          <ImagePlus className="h-4 w-4" />
          {t("productImages.upload")}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => uploadFiles(event.target.files)}
            disabled={remainingSlots <= 0}
          />
        </Label>
        <span className="text-sm text-slate-500">{t("productImages.remaining", { count: remainingSlots })}</span>
      </div>

      {currentImages.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {currentImages.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <button type="button" onClick={() => setCover(index)} className="block aspect-square w-full bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={t("productImages.alt", { index: index + 1 })} className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]" />
              </button>
              {index === 0 ? (
                <span className="absolute bottom-2 left-2 rounded bg-[#D94D2A]/90 px-2 py-1 text-xs font-bold text-white">{t("productImages.cover")}</span>
              ) : null}
              <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 rounded-lg bg-white/90 text-slate-700 shadow-sm hover:bg-white hover:text-red-600" onClick={() => removeImage(index)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex min-h-28 items-center justify-center rounded-lg border border-dashed border-[#FFD3C2] bg-[#FFF0E7] text-sm font-semibold text-[#B83A1C]">
          {t("productImages.empty")}
        </div>
      )}
    </div>
  );
}

function IntroImageUploader({
  images,
  onChange,
  label,
  countText,
  uploadText,
  localPreviewText,
  emptyText,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  label: string;
  countText: string;
  uploadText: string;
  localPreviewText: string;
  emptyText: string;
}) {
  function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }
    const nextImages = Array.from(files).map((file) => ({
      id: `intro-file-${file.name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      url: URL.createObjectURL(file),
      name: file.name,
      localOnly: true,
    }));
    onChange([...images, ...nextImages]);
  }

  function removeImage(id: string) {
    onChange(images.filter((image) => image.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-sm text-slate-500">{countText}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition hover:border-[#FF724C] hover:text-[#D94D2A]">
          <ImagePlus className="h-4 w-4" />
          {uploadText}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => uploadFiles(event.target.files)}
          />
        </Label>
        <div className="text-sm leading-10 text-slate-500">{localPreviewText}</div>
      </div>

      {images.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg bg-slate-50 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="aspect-[4/3] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.name} className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]" />
              </div>
              <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7 rounded-lg bg-white/90 text-slate-700 shadow-sm hover:bg-white hover:text-red-600" onClick={() => removeImage(image.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#FFD3C2] bg-[#FFF0E7] px-4 py-8 text-center text-sm font-semibold text-[#B83A1C]">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  tip,
  error,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  tip?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1.5">
          <Label>{label}</Label>
          {tip ? <InfoTip content={tip} /> : null}
        </div>
        {hint ? <span className="text-sm text-slate-500">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
}

function InfoTip({ content }: { content: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="查看说明"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        className="inline-flex h-5 w-5 items-center justify-center bg-transparent text-slate-500 transition hover:text-[#D94D2A]"
      >
        <CircleAlert className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <span className="absolute left-1/2 top-7 z-40 w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-6 text-slate-700 shadow-lg">
          {content}
        </span>
      ) : null}
    </span>
  );
}

function SectionTitle({ icon, title, action }: { icon: React.ReactNode; title: string; action: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex items-center gap-3 text-lg font-black text-slate-950">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#FF724C] text-white shadow-sm">
          {icon}
        </span>
        <span>{title}</span>
      </div>
      <div className="rounded-lg bg-[#FFF0E7] px-3 py-1 text-xs font-bold text-[#B83A1C] ring-1 ring-[#FFD3C2]">{action}</div>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 border-b border-[#FFE0D2] px-4 py-4 last:border-b-0 lg:grid-cols-[260px_1fr]">
      <div className="flex gap-3">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF0E7] text-[#D94D2A] ring-1 ring-[#FFD3C2]">
          {icon}
        </span>
        <div>
          <div className="text-sm font-black text-slate-950">{label}</div>
          <div className="mt-1 text-xs leading-5 text-slate-500">{description}</div>
        </div>
      </div>
      <div className="grid min-w-0 items-center gap-2 md:grid-cols-[1fr_auto]">
        <div>{children}</div>
        <ChevronRight className="hidden h-4 w-4 text-[#D94D2A] md:block" />
      </div>
    </div>
  );
}

function LogisticsSettingsDialog({
  open,
  onOpenChange,
  method,
  freightTemplate,
  freightPayScope,
  freightAmountMode,
  baseFreightAmount,
  freightBaseQuantity,
  freeShippingAmount,
  freeShippingQuantity,
  freightQuantityStep,
  freightStepAmount,
  deliveryNote,
  receiverFields,
  customReceiverFields,
  onSetMethod,
  onSetFreightTemplate,
  onSetFreightPayScope,
  onSetFreightAmountMode,
  onSetBaseFreightAmount,
  onSetFreightBaseQuantity,
  onSetFreeShippingAmount,
  onSetFreeShippingQuantity,
  onSetFreightQuantityStep,
  onSetFreightStepAmount,
  onSetDeliveryNote,
  onToggleReceiverField,
  onAddCustomReceiverField,
  onUpdateCustomReceiverField,
  onRemoveCustomReceiverField,
  onResetReceiverFields,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  method: LogisticsMethod;
  freightTemplate: FreightTemplate;
  freightPayScope: FreightPayScope;
  freightAmountMode: FreightAmountMode;
  baseFreightAmount: string;
  freightBaseQuantity: string;
  freeShippingAmount: string;
  freeShippingQuantity: string;
  freightQuantityStep: string;
  freightStepAmount: string;
  deliveryNote: string;
  receiverFields: ReceiverField[];
  customReceiverFields: string[];
  onSetMethod: (method: LogisticsMethod) => void;
  onSetFreightTemplate: (template: FreightTemplate) => void;
  onSetFreightPayScope: (scope: FreightPayScope) => void;
  onSetFreightAmountMode: (mode: FreightAmountMode) => void;
  onSetBaseFreightAmount: (value: string) => void;
  onSetFreightBaseQuantity: (value: string) => void;
  onSetFreeShippingAmount: (value: string) => void;
  onSetFreeShippingQuantity: (value: string) => void;
  onSetFreightQuantityStep: (value: string) => void;
  onSetFreightStepAmount: (value: string) => void;
  onSetDeliveryNote: (value: string) => void;
  onToggleReceiverField: (field: ReceiverField) => void;
  onAddCustomReceiverField: () => void;
  onUpdateCustomReceiverField: (index: number, value: string) => void;
  onRemoveCustomReceiverField: (index: number) => void;
  onResetReceiverFields: () => void;
}) {
  const t = useTranslations("CreateGroupBuy");
  const locale = useLocale();
  const isEnglish = locale === "en";

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#7A2E1D]/20 px-4 py-4" onMouseDown={() => onOpenChange(false)}>
      <section
        className="flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[#FFD3C2] bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FFD3C2] bg-[#FFF8F2] px-4 py-3">
          <div>
            <div className="text-lg font-black text-slate-950">{t("logisticsDialog.title")}</div>
            <p className="mt-1 text-xs text-slate-500">{t("logisticsDialog.description")}</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="h-8 rounded-lg px-3 text-xs" onClick={() => onOpenChange(false)}>
              {t("logisticsDialog.confirm")}
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="min-h-0 overflow-y-auto p-4">
          <div className="grid gap-3 md:grid-cols-3">
            {LOGISTICS_METHOD_OPTIONS.map((option) => {
              const selected = method === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSetMethod(option.value)}
                  className={`min-h-36 rounded-lg border p-4 text-left transition ${
                    selected ? "border-[#FF724C] bg-[#FFF0E7] shadow-sm" : "border-slate-200 bg-white hover:border-[#FFD3C2]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-base font-black text-slate-950">{isEnglish ? option.labelEn : option.label}</div>
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full border text-xs font-black ${
                        selected ? "border-[#FF724C] bg-[#FF724C] text-white" : "border-slate-200 bg-white text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{isEnglish ? option.descriptionEn : option.description}</p>
                  {selected ? <div className="mt-4 inline-flex h-8 items-center rounded-lg bg-[#FF724C] px-3 text-xs font-bold text-white">{t("logisticsDialog.selected")}</div> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-wrap border-b border-slate-200">
              {FREIGHT_TEMPLATE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSetFreightTemplate(option.value)}
                  className={`h-12 flex-1 min-w-36 border-b-2 px-3 text-sm font-black transition ${
                    freightTemplate === option.value ? "border-[#FF724C] text-[#D94D2A]" : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {isEnglish ? option.labelEn : option.label}
                </button>
              ))}
            </div>

            <div className="space-y-5 bg-slate-50 p-4">
              <div>
                <div className="text-sm font-black text-slate-950">{t("logisticsDialog.freightSettings")}</div>
                <div className="mt-3 flex flex-wrap gap-3">
                  {FREIGHT_PAY_SCOPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onSetFreightPayScope(option.value)}
                      className={`rounded-lg px-3 py-2 text-sm font-bold ring-1 transition ${
                        freightPayScope === option.value
                          ? "bg-[#FF724C] text-white ring-[#FF724C]"
                          : "bg-white text-slate-700 ring-slate-200 hover:text-[#D94D2A] hover:ring-[#FFD3C2]"
                      }`}
                    >
                      {isEnglish ? option.labelEn : option.label}
                    </button>
                  ))}
                </div>
              </div>

              {freightTemplate === "BASE" ? (
                <div>
                  <div className="text-sm font-black text-slate-950">{t("logisticsDialog.amountSettings")}</div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {FREIGHT_AMOUNT_MODE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onSetFreightAmountMode(option.value)}
                        className={`rounded-lg px-3 py-2 text-sm font-bold ring-1 transition ${
                          freightAmountMode === option.value
                            ? "bg-[#FF724C] text-white ring-[#FF724C]"
                            : "bg-white text-slate-700 ring-slate-200 hover:text-[#D94D2A] hover:ring-[#FFD3C2]"
                        }`}
                      >
                        {isEnglish ? option.labelEn : option.label}
                      </button>
                    ))}
                  </div>
                  {freightAmountMode === "FIXED" ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr_auto]">
                      <div className="self-center text-sm text-slate-500">{t("logisticsDialog.deliveryFreight")}</div>
                      <input value={baseFreightAmount} onChange={(event) => onSetBaseFreightAmount(event.target.value)} className={settingInputClassName} />
                      <div className="self-center text-sm text-slate-500">{t("logisticsDialog.currencyUnit")}</div>
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-3 lg:grid-cols-[auto_96px_auto_96px_auto_96px_auto_96px_auto]">
                      <span className="self-center text-sm text-slate-500">{t("logisticsDialog.orderBelow")}</span>
                      <input value={freightBaseQuantity} onChange={(event) => onSetFreightBaseQuantity(event.target.value)} className={settingInputClassName} />
                      <span className="self-center text-sm text-slate-500">{t("logisticsDialog.itemsFreight")}</span>
                      <input value={baseFreightAmount} onChange={(event) => onSetBaseFreightAmount(event.target.value)} className={settingInputClassName} />
                      <span className="self-center text-sm text-slate-500">{t("logisticsDialog.currencyIncrease")}</span>
                      <input value={freightQuantityStep} onChange={(event) => onSetFreightQuantityStep(event.target.value)} className={settingInputClassName} />
                      <span className="self-center text-sm text-slate-500">{t("logisticsDialog.itemsIncrease")}</span>
                      <input value={freightStepAmount} onChange={(event) => onSetFreightStepAmount(event.target.value)} className={settingInputClassName} />
                      <span className="self-center text-sm text-slate-500">{t("logisticsDialog.currencyUnit")}</span>
                    </div>
                  )}
                </div>
              ) : null}

              {freightTemplate === "FREE_BY_AMOUNT" ? (
                <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
                  <span className="self-center text-sm text-slate-500">{t("logisticsDialog.orderAmountOver")}</span>
                  <input value={freeShippingAmount} onChange={(event) => onSetFreeShippingAmount(event.target.value)} className={settingInputClassName} />
                  <span className="self-center text-sm text-slate-500">{t("logisticsDialog.freeShippingAmountUnit")}</span>
                </div>
              ) : null}

              {freightTemplate === "FREE_BY_QUANTITY" ? (
                <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto]">
                  <span className="self-center text-sm text-slate-500">{t("logisticsDialog.orderItemsOver")}</span>
                  <input value={freeShippingQuantity} onChange={(event) => onSetFreeShippingQuantity(event.target.value)} className={settingInputClassName} />
                  <span className="self-center text-sm text-slate-500">{t("logisticsDialog.freeShippingQuantityUnit")}</span>
                </div>
              ) : null}

              <div>
                <div className="text-sm font-black text-slate-950">{t("logisticsDialog.deliveryNote")}</div>
                <textarea
                  value={deliveryNote}
                  onChange={(event) => onSetDeliveryNote(event.target.value.slice(0, 50))}
                  rows={4}
                  className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#FF724C]"
                  placeholder={t("logisticsDialog.deliveryNotePlaceholder")}
                />
                <div className="mt-1 text-right text-xs text-slate-400">{deliveryNote.length}/50</div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-950">{t("logisticsDialog.receiverInfo")}</div>
                <div className="mt-1 text-xs text-slate-500">{t("logisticsDialog.receiverInfoTip")}</div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={onAddCustomReceiverField} className={compactSecondaryButtonClassName}>
                  <Plus className="h-4 w-4" />
                  {t("logisticsDialog.addCustomField")}
                </button>
                <button type="button" onClick={onResetReceiverFields} className={compactSecondaryButtonClassName}>
                  {t("logisticsDialog.reset")}
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {RECEIVER_FIELD_OPTIONS.map((option) => (
                <label key={option.value} className={settingToggleClassName}>
                  <input
                    type="checkbox"
                    checked={receiverFields.includes(option.value)}
                    onChange={() => onToggleReceiverField(option.value)}
                    className="h-3.5 w-3.5 accent-[#FF724C]"
                  />
                  {isEnglish ? option.labelEn : option.label}
                </label>
              ))}
            </div>
            {customReceiverFields.length ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {customReceiverFields.map((field, index) => (
                  <div key={`custom-receiver-${index}`} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <input
                      value={field}
                      onChange={(event) => onUpdateCustomReceiverField(index, event.target.value)}
                      placeholder={t("logisticsDialog.customFieldPlaceholder")}
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    />
                    <button type="button" onClick={() => onRemoveCustomReceiverField(index)} className="text-slate-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </main>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF724C]" />
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-black text-slate-950">{value}</div>
    </div>
  );
}

function getProductStatus(product: ProductDraft, t: CreateGroupBuyTranslator) {
  if (!product.productName.trim() || product.price <= 0 || (!product.coverImageUrl && product.productImages.length === 0)) {
    return {
      label: t("products.incomplete"),
      className: "bg-red-50 text-red-700",
    };
  }

  if (product.specGroups.length > 0 && product.skus.some((sku) => sku.price <= 0 || sku.stock == null)) {
    return {
      label: t("products.missingVariants"),
      className: "bg-amber-50 text-amber-700",
    };
  }

  return {
    label: t("products.complete"),
    className: "bg-[#FFF0E7] text-[#B83A1C]",
  };
}

function hasBulkSpecSelection(selection: BulkSpecSelection) {
  return Object.values(selection).some((values) => values.length > 0);
}

function skuMatchesBulkSelection(sku: GroupBuySku, selection: BulkSpecSelection) {
  return Object.entries(selection).every(([groupName, selectedValues]) => {
    if (selectedValues.length === 0) {
      return true;
    }
    return sku.specValues.some((value) => value.specGroupName === groupName && selectedValues.includes(value.specValueName ?? ""));
  });
}

function withGeneratedSkus(product: ProductDraft): ProductDraft {
  const specGroups = product.specGroups
    .map((group, groupIndex) => ({
      ...group,
      displayOrder: group.displayOrder ?? groupIndex + 1,
      specValues: group.specValues
        .filter((value) => value.valueName.trim())
        .map((value, valueIndex) => ({ ...value, displayOrder: value.displayOrder ?? valueIndex + 1 })),
    }))
    .filter((group) => group.specGroupName.trim() && group.specValues.length);

  const combinations = buildCombinations(specGroups);
  if (combinations.length === 0) {
    return {
      ...product,
      specGroups,
      skus: product.skus.length
        ? product.skus
        : [
            {
              skuId: `${product.localId}-sku-1`,
              price: product.price,
              costPrice: product.costPrice ?? null,
              stock: parseOptionalInteger(product.bulkStock),
              specValues: [],
            },
          ],
    };
  }

  const previous = new Map(product.skus.map((sku) => [skuSignature(sku.specValues), sku]));
  return {
    ...product,
    specGroups,
    skus: combinations.map((specValues, index) => {
      const key = skuSignature(specValues);
      const oldSku = previous.get(key);
      return {
        skuId: oldSku?.skuId ?? `${product.localId}-sku-${index + 1}`,
        skuCode: oldSku?.skuCode ?? "",
        price: oldSku?.price ?? product.price,
        costPrice: oldSku?.costPrice ?? product.costPrice ?? null,
        stock: oldSku?.stock ?? parseOptionalInteger(product.bulkStock),
        specValues,
      };
    }),
  };
}

function buildCombinations(specGroups: GroupBuySpecGroup[]): GroupBuySkuSpecValue[][];
function buildCombinations(specGroups: GroupBuySpecGroup[]) {
  return specGroups.reduce<GroupBuySkuSpecValue[][]>(
    (current, group) =>
      current.flatMap((items) =>
        group.specValues.map((value) => [
          ...items,
          {
            specGroupName: group.specGroupName,
            specValueName: value.valueName,
          },
        ]),
      ),
    [[]],
  );
}

function skuSignature(values: GroupBuySkuSpecValue[]) {
  return values.map((value) => `${value.specGroupName}:${value.specValueName}`).join("|") || "DEFAULT";
}

function stripProductDraft(product: ProductDraft): GroupBuyProduct {
  return {
    productId: product.productId || undefined,
    sourceProductId: product.sourceProductId || undefined,
    productName: product.productName,
    productImages: product.productImages,
    coverImageUrl: product.coverImageUrl || product.productImages[0] || undefined,
    price: product.price,
    costPrice: product.costPrice ?? null,
    categoryId: product.categoryId || undefined,
    categoryName: product.categoryName || undefined,
    productDesc: product.productDesc || undefined,
    videoUrl: product.videoUrl || undefined,
    displayOrder: product.displayOrder,
    status: "ACTIVE",
    specGroups: product.specGroups,
    skus: product.skus,
  };
}

function splitTextList(value: string) {
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalInteger(value: string) {
  const parsed = parseOptionalNumber(value);
  return parsed == null ? null : Math.max(0, Math.floor(parsed));
}

function toDatetimeLocalInput(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return offsetDate.toISOString().slice(0, 16);
}

const inputClassName =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-[#FF724C] focus:bg-white";
const sectionClassName =
  "rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.7)]";
const compactInputClassName =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-[#FF724C] focus:bg-white";
const tableInputClassName =
  "w-full min-w-20 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm outline-none transition focus:border-[#FF724C]";
const primaryButtonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF724C] px-4 text-sm font-bold text-white transition hover:bg-[#FF8A52] disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClassName =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-[#FF724C] hover:text-[#D94D2A]";
const compactSecondaryButtonClassName =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-800 transition hover:border-[#FF724C] hover:text-[#D94D2A]";
const linkButtonClassName =
  "inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50";
const settingInputClassName =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[#FF724C] focus:bg-white";
const settingSelectClassName =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-[#FF724C] focus:bg-white";
const settingToggleClassName =
  "inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700";
