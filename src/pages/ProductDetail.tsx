import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  Ruler,
  MessageCircle,
  Truck,
  ShieldAlert,
  CheckCircle,
  Plus,
  Minus,
  ZoomIn,
  ArrowLeft,
  X,
} from 'lucide-react';
import { Product } from '../types';
import { getProductBySlug, getProducts } from '../services/db';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../i18n';
import { ProductCard } from '../components/ProductCard';
import { SizeChartModal } from '../components/SizeChartModal';
import toast from 'react-hot-toast';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t, getLocalizedName, getLocalizedDesc } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  // Selection state
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [sizeModalOpen, setSizeModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetch = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const item = await getProductBySlug(slug);
        if (item) {
          setProduct(item);
          setSelectedImageIndex(0);
          setSelectedSize('');
          setQuantity(1);

          // Fetch related
          const all = await getProducts();
          const related = all
            .filter(p => p.id !== item.id && p.category === item.category && p.isVisible)
            .slice(0, 4);
          setRelatedProducts(related);
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.warn('Error fetching product', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-[3/4] bg-stone-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded-lg w-3/4"></div>
            <div className="h-6 bg-stone-200 rounded-lg w-1/3"></div>
            <div className="h-24 bg-stone-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-4">
        <h2 className="font-serif-brand text-2xl font-bold text-[#7B1E3A]">
          Product Not Found
        </h2>
        <p className="text-xs text-stone-600 mt-2">
          The requested fashion item might be out of stock or removed.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block bg-[#7B1E3A] text-white px-6 py-2.5 rounded-full text-xs font-bold"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const localizedName = getLocalizedName(product);
  const localizedDesc = getLocalizedDesc(product);

  const discountPercent =
    product.discountPrice && product.discountPrice > product.price
      ? Math.round(((product.discountPrice - product.price) / product.discountPrice) * 100)
      : 0;

  const currentSizeObj = product.sizes?.find(s => s.size === selectedSize);
  const maxStockForSize = currentSizeObj?.stock ?? 0;
  const isOutOfStockTotal = product.sizes?.every(s => s.stock <= 0);

  const handleAddToCart = (redirectAfter = false) => {
    if (!selectedSize) {
      toast.error(t('product.sizeRequired'), { icon: '⚠️' });
      return;
    }
    if (maxStockForSize <= 0) {
      toast.error('Selected size is out of stock');
      return;
    }

    addToCart({
      productId: product.id,
      name: localizedName,
      image: product.images?.[0] || '',
      size: selectedSize,
      quantity,
      price: product.price,
      originalPrice: product.discountPrice,
      maxStock: maxStockForSize,
    });

    if (redirectAfter) {
      navigate('/checkout');
    }
  };

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80'];

  const whatsappMessage = encodeURIComponent(
    `Hello Chamunda Fashion! I am interested in ordering "${product.name}" (₹${product.price}). Link: ${window.location.href}. Is it available?`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#7B1E3A] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Collection</span>
      </button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
        
        {/* Gallery Column */}
        <div className="space-y-4">
          {/* Active Image */}
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-stone-100 border border-[#C9A24B]/30 shadow-md group">
            <img
              src={images[selectedImageIndex]}
              alt={localizedName}
              className="w-full h-full object-cover object-top cursor-zoom-in transition-transform duration-500 hover:scale-105"
              onClick={() => setZoomModalOpen(true)}
            />

            <button
              onClick={() => setZoomModalOpen(true)}
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs p-2 rounded-full text-stone-700 shadow-md hover:text-[#7B1E3A] transition-colors"
              title="Click to Zoom"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-[#C9A24B] text-[#7B1E3A] text-xs font-extrabold px-3 py-1 rounded-md shadow-md uppercase tracking-wider">
                {discountPercent}% {t('product.off')}
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-[#7B1E3A] shadow-md scale-105'
                      : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="flex flex-col space-y-5">
          <div>
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#C9A24B] bg-[#C9A24B]/10 px-2.5 py-0.5 rounded-full mb-2">
              {product.category}
            </span>
            <h1 className="font-serif-brand text-2xl sm:text-3xl md:text-4xl font-bold text-[#7B1E3A] leading-tight">
              {localizedName}
            </h1>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#7B1E3A]">
              ₹{product.price}
            </span>
            {product.discountPrice && product.discountPrice > product.price && (
              <>
                <span className="text-base text-stone-400 line-through">
                  ₹{product.discountPrice}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Save ₹{product.discountPrice - product.price}
                </span>
              </>
            )}
          </div>

          {/* Mandatory Strict Store Policy Notice */}
          <div className="p-3.5 bg-[#FFF8F0] border-2 border-[#C9A24B]/50 rounded-2xl flex items-start gap-2.5 text-xs text-[#7B1E3A] shadow-xs">
            <ShieldAlert className="w-5 h-5 text-[#7B1E3A] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block text-sm">
                {t('product.policyNotice')}
              </span>
              <span className="text-[11px] text-stone-600 mt-0.5 block">
                Estimated Delivery: 1-2 days Gujarat, 2-3 days Rest of India. Prepaid UPI payment only.
              </span>
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                {t('product.selectSize')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setSizeModalOpen(true)}
                className="text-xs font-semibold text-[#7B1E3A] hover:text-[#C9A24B] flex items-center gap-1 transition-colors"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>{t('product.sizeChart')}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {product.sizes?.map(s => {
                const isSelected = selectedSize === s.size;
                const isOutOfStock = s.stock <= 0;

                return (
                  <button
                    key={s.size}
                    type="button"
                    disabled={isOutOfStock}
                    onClick={() => {
                      setSelectedSize(s.size);
                      setQuantity(1);
                    }}
                    className={`relative min-w-[50px] h-12 rounded-xl text-sm font-bold border-2 transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? 'border-[#7B1E3A] bg-[#7B1E3A] text-white shadow-md'
                        : isOutOfStock
                        ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed line-through'
                        : 'border-stone-300 bg-white text-stone-800 hover:border-[#7B1E3A]'
                    }`}
                  >
                    <span>{s.size}</span>
                    <span className="text-[9px] font-normal">
                      {isOutOfStock ? 'Sold' : `${s.stock} left`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          {selectedSize && maxStockForSize > 0 && (
            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                {t('product.quantity')}:
              </span>
              <div className="flex items-center border border-stone-300 rounded-xl bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 text-stone-600 hover:text-[#7B1E3A] disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-stone-800">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maxStockForSize, quantity + 1))}
                  disabled={quantity >= maxStockForSize}
                  className="p-2 text-stone-600 hover:text-[#7B1E3A] disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-stone-500">
                (Max {maxStockForSize})
              </span>
            </div>
          )}

          {/* Add to Cart & Buy Now Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isOutOfStockTotal}
                onClick={() => handleAddToCart(false)}
                className="w-full bg-[#FFF8F0] border-2 border-[#7B1E3A] text-[#7B1E3A] hover:bg-[#7B1E3A]/10 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{t('product.addToCart')}</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStockTotal}
                onClick={() => handleAddToCart(true)}
                className="w-full bg-[#7B1E3A] hover:bg-[#5e162c] text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <span>{t('product.buyNow')}</span>
              </button>
            </div>

            {/* Direct WhatsApp Consultation Button */}
            <a
              href={`https://wa.me/917383868926?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20b859] text-white py-3 rounded-full font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{t('product.askWhatsApp')}</span>
            </a>
          </div>

          {/* Fabric, Colours & Specs Table */}
          <div className="pt-4 border-t border-stone-200 space-y-2.5 text-xs">
            <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-stone-100">
              <span className="text-stone-500 font-medium">{t('product.fabric')}</span>
              <span className="col-span-2 text-stone-800 font-semibold">{product.fabric}</span>
            </div>
            {product.colours && product.colours.length > 0 && (
              <div className="grid grid-cols-3 gap-2 py-1.5 border-b border-stone-100">
                <span className="text-stone-500 font-medium">{t('product.colours')}</span>
                <span className="col-span-2 text-stone-800 font-semibold">
                  {product.colours.join(', ')}
                </span>
              </div>
            )}
            <div className="py-2">
              <span className="text-stone-500 font-medium block mb-1">
                {t('product.description')}
              </span>
              <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                {localizedDesc}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* You May Also Like Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-[#C9A24B]/30">
          <h2 className="font-serif-brand text-2xl font-bold text-[#7B1E3A] mb-6">
            {t('product.relatedTitle')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* Size Chart Modal */}
      <SizeChartModal
        isOpen={sizeModalOpen}
        onClose={() => setSizeModalOpen(false)}
      />

      {/* Fullscreen Image Zoom Modal */}
      {zoomModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setZoomModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-stone-300 p-2 rounded-full bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={images[selectedImageIndex]}
            alt={localizedName}
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );
};
