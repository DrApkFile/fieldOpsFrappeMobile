import { useState } from 'react';
import { CartLine, Product, PromoDiscount } from '../../types';
import { addLine, removeLine, updateLineQty, getCartSubtotal, getCartDiscount, getCartTotal, getCartItemCount } from '../../utils/cart';

export function useCart(initial: CartLine[] = []) {
  const [cart, setCart] = useState<CartLine[]>(initial);

  const addProduct = (product: Product, qty: number, promo: PromoDiscount) =>
    setCart((prev) => addLine(prev, product, qty, promo));

  const updateQty = (productId: string, qty: number) =>
    setCart((prev) => updateLineQty(prev, productId, qty));

  // Sets a line's total quantity outright (adding the line if it doesn't
  // exist yet) — used by the per-product Cases/Units steppers, which know
  // the absolute quantity they want rather than a delta to add.
  const setQty = (product: Product, qty: number) =>
    setCart((prev) => {
      if (qty <= 0) return removeLine(prev, product.id);
      const existing = prev.find((l) => l.productId === product.id);
      return existing ? updateLineQty(prev, product.id, qty) : addLine(prev, product, qty, { label: '', pct: 0 });
    });

  const remove = (productId: string) =>
    setCart((prev) => removeLine(prev, productId));

  const clear = () => setCart([]);

  return {
    cart,
    setCart,
    addProduct,
    updateQty,
    setQty,
    remove,
    clear,
    subtotal: getCartSubtotal(cart),
    discount: getCartDiscount(cart),
    total: getCartTotal(cart),
    itemCount: getCartItemCount(cart),
  };
}
