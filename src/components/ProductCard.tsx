import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useTranslation } from '../i18n';
import { Sparkles, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t, getLocalizedName } = useTranslation();

  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? 0;
  const isSoldOut = totalStock <= 0;

  // New tag if created in the last 7 days or isNewArrival
  const isRecent =
    product.isNewArrival ||
    (product.createdAt &&
      Date.now() - new Date(product.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000);

  const discountPercent =
    product.discountPrice && product.discountPrice > product.price
      ? Math.round(((product.discountPrice - product.price) / product.discountPrice) * 100)
      : 0;

  const displayImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';

  const localizedName = getLocalizedName(product);

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-[#C9A24B]/20 shadow-xs hover:shadow-md hover:border-[#C9A24B]/60 transition-all duration-300">
      
      {/* 3:4 Portrait Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className="relative block w-full aspect-[3/4] overflow-hidden bg-stone-100"
      >
        <img
          src={displayImage}
          alt={localizedName}
          loading="lazy"
          className={`w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
            isSoldOut ? 'grayscale contrast-75' : ''
          }`}
        />

        {/* Badges on Image */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isRecent && !isSoldOut && (
            <span className="bg-[#7B1E3A] text-white text-[10px] md:text-xs font-bold tracking-wider px-2 py-0.5 rounded-md shadow-xs uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#C9A24B]" />
              {t('product.newTag')}
            </span>
          )}
          {discountPercent > 0 && !isSoldOut && (
            <span className="bg-[#C9A24B] text-[#7B1E3A] text-[10px] md:text-xs font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              {discountPercent}% {t('product.off')}
            </span>
          )}
        </div>

        {/* Sold Out Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-3">
            <span className="bg-red-600 text-white font-bold text-xs md:text-sm px-3 py-1.5 rounded-lg tracking-wider uppercase shadow-md">
              {t('product.soldOut')}
            </span>
          </div>
        )}

        {/* Quick View Hover Button */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:block">
          <div className="w-full bg-[#FFF8F0]/90 backdrop-blur-xs text-[#7B1E3A] font-semibold text-xs py-2 rounded-xl text-center shadow-sm hover:bg-white flex items-center justify-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </div>
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#C9A24B]">
            {product.category}
          </span>
          <Link to={`/product/${product.slug}`}>
            <h3 className="text-xs md:text-sm font-semibold text-[#2B2B2B] hover:text-[#7B1E3A] transition-colors line-clamp-2 mt-0.5 min-h-[2rem]">
              {localizedName}
            </h3>
          </Link>
          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
            {product.fabric}
          </p>
        </div>

        {/* Price & Sizes */}
        <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm md:text-base font-bold text-[#7B1E3A]">
              ₹{product.price}
            </span>
            {product.discountPrice && product.discountPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.discountPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {product.sizes?.map(s => (
              <span
                key={s.size}
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  s.stock > 0
                    ? 'bg-[#7B1E3A]/5 text-[#7B1E3A]'
                    : 'bg-stone-100 text-stone-400 line-through'
                }`}
                title={s.stock > 0 ? `${s.stock} in stock` : 'Out of stock'}
              >
                {s.size}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
