export function parseMockPayForm(payForm: string) {
  return {
    orderId: matchAttr(payForm, "data-order-id"),
    payAmount: matchAttr(payForm, "data-pay-amount"),
    userId: matchAttr(payForm, "data-user-id"),
    productId: matchAttr(payForm, "data-product-id"),
  };
}

function matchAttr(source: string, attr: string) {
  const match = source.match(new RegExp(`${attr}="([^"]+)"`));
  return match?.[1] ?? "";
}
