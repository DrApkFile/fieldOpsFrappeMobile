import { CartLine, Product, PromoDiscount } from '../types';

export function addLine(cart: CartLine[], product: Product, qty: number, promo: PromoDiscount): CartLine[] {
  const existing = cart.find((l) => l.productId === product.id);
  const discount = (unitPrice: number, quantity: number) => Math.round(unitPrice * quantity * (promo.pct / 100));

  if (existing) {
    const nextQty = existing.quantity + qty;
    return cart.map((l) =>
      l.productId === product.id
        ? { ...l, quantity: nextQty, discount: discount(l.unitPrice, nextQty), promoLabel: promo.pct > 0 ? promo.label : undefined }
        : l
    );
  }

  return [
    ...cart,
    {
      productId: product.id,
      productName: product.name,
      unitPrice: product.price,
      quantity: qty,
      discount: discount(product.price, qty),
      promoLabel: promo.pct > 0 ? promo.label : undefined,
    },
  ];
}

export function removeLine(cart: CartLine[], productId: string): CartLine[] {
  return cart.filter((l) => l.productId !== productId);
}

export function updateLineQty(cart: CartLine[], productId: string, qty: number): CartLine[] {
  if (qty <= 0) return removeLine(cart, productId);
  return cart.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l));
}

export function getCartSubtotal(cart: CartLine[]): number {
  return cart.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
}

export function getCartDiscount(cart: CartLine[]): number {
  return cart.reduce((acc, l) => acc + l.discount, 0);
}

export function getCartTotal(cart: CartLine[]): number {
  return getCartSubtotal(cart) - getCartDiscount(cart);
}

export function getCartItemCount(cart: CartLine[]): number {
  return cart.reduce((acc, l) => acc + l.quantity, 0);
}

export interface StockShortfall {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

/** Sale-mode-only check: a cart line may not exceed the product's live stock. */
export function getStockShortfalls(cart: CartLine[], products: Product[]): StockShortfall[] {
  const shortfalls: StockShortfall[] = [];
  cart.forEach((line) => {
    const product = products.find((p) => p.id === line.productId);
    const available = product?.stock ?? 0;
    if (line.quantity > available) {
      shortfalls.push({ productId: line.productId, productName: line.productName, requested: line.quantity, available });
    }
  });
  return shortfalls;
}
