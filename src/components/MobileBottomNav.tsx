import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../i18n';

export const MobileBottomNav: React.FC = () => {
  const { totalCount } = useCart();
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF8F0]/95 backdrop-blur-md border-t border-[#C9A24B]/30 shadow-lg px-2 py-1.5 safe-area-pb">
      <div className="grid grid-cols-4 items-center justify-items-center">
        
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-[#7B1E3A] font-semibold' : 'text-stone-600 hover:text-[#7B1E3A]'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] mt-0.5">{t('nav.home')}</span>
        </NavLink>

        {/* Shop */}
        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-[#7B1E3A] font-semibold' : 'text-stone-600 hover:text-[#7B1E3A]'
            }`
          }
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px] mt-0.5">{t('nav.shop')}</span>
        </NavLink>

        {/* Cart */}
        <NavLink
          to="/cart"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 rounded-xl relative transition-all ${
              isActive ? 'text-[#7B1E3A] font-semibold' : 'text-stone-600 hover:text-[#7B1E3A]'
            }`
          }
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#7B1E3A] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#FFF8F0]">
                {totalCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5">{t('nav.cart')}</span>
        </NavLink>

        {/* WhatsApp */}
        <a
          href="https://wa.me/917383868926?text=Hello%20Chamunda%20Fashion!%20I%20have%20an%20inquiry."
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center py-1 px-2 rounded-xl text-[#25D366] hover:opacity-80 transition-all"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="text-[11px] mt-0.5 font-medium">{t('nav.whatsapp')}</span>
        </a>
      </div>
    </nav>
  );
};
