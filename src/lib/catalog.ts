export type FeaturedProduct = {
  productId: string;
  activityId: number;
  title: string;
  subtitle: string;
  originalPrice: number;
  groupPrice: number;
  discountLabel: string;
  campaignTitle: string;
  campaignDescription: string;
  targetCount: number;
  tagline: string;
  description: string;
};

export const APP_COPY = {
  brand: "LyVault",
};

export const FEATURED_PRODUCT: FeaturedProduct = {
  productId: "9890001",
  activityId: 100123,
  title: "手写 MyBatis：渐进式源码实践（全彩）",
  subtitle: "提供项目配套源码及详细解读，适合拿来做拼团、支付、锁单、MQ 联调。",
  originalPrice: 100,
  groupPrice: 90,
  discountLabel: "大促优惠",
  campaignTitle: "直降 ¥10，3 人成团，抢完即止",
  campaignDescription:
    "这里预置了你当前联调用的商品与活动数据。开团时会走商城下单、拼团交易锁单、mock 支付成功、成团后 MQ 回推订单结算的完整链路。",
  targetCount: 3,
  tagline: "小伙伴，赶紧去开团吧，做村里最靓的仔。",
  description: "默认展示后端现有的商品与拼团活动配置。",
};
