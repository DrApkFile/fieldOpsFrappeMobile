import { useState } from 'react';
import { CartLine, Product, PromoDiscount } from '../../types';
import { addLine, removeLine, updateLineQty, getCartSubtotal, getCartDiscount, getCartTotal, getCartItemCount } from '../../utils/cart';

export function useCart(initial: CartLine[] = []) {
  const [cart, setCart] = useState<CartLine[]>(initial);

  const addProduct = (product: Product, qty: number, promo: PromoDiscount) =>
    setCart((prev) => addLine(prev, product, qty, promo));

  const updateQty = (productId: string, qty: number) =>
    setCart((prev) => updateLineQty(prev, productId, qty));

  const remove = (productId: string) =>
    setCart((prev) => removeLine(prev, productId));

  const clear = () => setCart([]);

  return {
    cart,
    setCart,
    addProduct,
    updateQty,
    remove,
    clear,
    subtotal: getCartSubtotal(cart),
    discount: getCartDiscount(cart),
    total: getCartTotal(cart),
    itemCount: getCartItemCount(cart),
  };
}
