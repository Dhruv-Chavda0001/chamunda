import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../i18n';
import { getProducts } from '../services/db';
import { Product } from '../types';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, subtotal, deliveryCharge, totalAmount } = useCart();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [stockWarnings, setStockWarnings] = useState<string[]>([]);

  useEffect(() => {
    const checkStock = async () => {
      const all = await getProducts();
      const map: Record<string, Product> = {};
      all.forEach(p => (map[p.id] = p));
      setProductsMap(map);

      const warnings: string[] = [];
      cart.forEach(item => {
        const prod = map[item.productId];
        if (!prod || !prod.isVisible) {
          warnings.push(`"${item.name}" is no longer available.`);
        } else {
          const sz = prod.sizes?.find(s => s.size === item.size);
          if (!sz || sz.stock <= 0) {
            warnings.push(`"${item.name}" (Size ${item.size}) is now sold out.`);
          } else if (sz.stock < item.quantity) {
            warnings.push(`Only ${sz.stock} pieces of "${item.name}" (Size ${item.size}) remain in stock.`);
          }
        }
      });
      setStockWarnings(warnings);
    };

    if (cart.length > 0) {
      checkStock();
    }
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#7B1E3A]/10 text-[#7B1E3A] flex items-center justify-center mb-5">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif-brand text-2xl font-bold text-[#7B1E3A]">
          {t('cart.emptyTitle')}
        </h2>
        <p className="text-xs md:text-sm text-stone-600 mt-2 leading-relaxed">
          {t('cart.emptyDesc')}
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all"
        >
          <span>{t('cart.startShopping')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <h1 className="font-serif-brand text-2xl md:text-3xl font-bold text-[#7B1E3A] mb-6">
        {t('cart.title')}
      </h1>

      {/* Stock Warnings */}
      {stockWarnings.length > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Stock Notice</span>
          </div>
          {stockWarnings.map((w, idx) => (
            <p key={idx} className="text-xs text-amber-800">
              • {w}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div
              key={`${item.productId}-${item.size}`}
              className="bg-white rounded-2xl p-4 border border-[#C9A24B]/30 shadow-xs flex items-center gap-4"
            >
              {/* Image */}
              <Link
                to={`/product/${item.productId}`}
                className="w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden bg-stone-100 shrink-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-top"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.productId}`}>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#2B2B2B] hover:text-[#7B1E3A] truncate">
                    {item.name}
                  </h3>
                </Link>

                <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-bold text-[#7B1E3A] bg-[#7B1E3A]/5 px-2 py-0.5 rounded">
                    Size: {item.size}
                  </span>
                  <span>₹{item.price} each</span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="p-1.5 text-stone-600 hover:text-[#7B1E3A]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-xs font-bold text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="p-1.5 text-stone-600 hover:text-[#7B1E3A]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.productId, item.size)}
                    className="text-stone-400 hover:text-red-600 p-1.5 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subtotal for line */}
              <div className="text-right shrink-0">
                <span className="text-sm sm:text-base font-bold text-[#7B1E3A]">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            </div>
          ))}

          {/* Policy Reminder */}
          <div className="p-3.5 bg-[#FFF8F0] border border-[#C9A24B]/40 rounded-2xl flex items-start gap-2.5 text-xs text-[#7B1E3A]">
            <ShieldAlert className="w-4 h-4 text-[#7B1E3A] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('cart.reminder')}
            </p>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/40 shadow-md space-y-4 sticky top-24">
            <h3 className="font-serif-brand text-lg font-bold text-[#7B1E3A] border-b border-stone-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-stone-800">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{t('cart.delivery')}</span>
                <span className="font-bold text-emerald-600">
                  {deliveryCharge === 0 ? t('cart.freeDelivery') : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between text-base font-bold text-[#7B1E3A]">
                <span>{t('cart.total')}</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-normal">
              Free Express Delivery all over India. Gujarat: 1-2 days, Other States: 2-3 days.
            </p>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-[#7B1E3A] hover:bg-[#5e162c] text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <span>{t('cart.proceedCheckout')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
