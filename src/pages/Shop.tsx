import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Product, ProductCategory } from '../types';
import { getProducts } from '../services/db';
import { ProductCard } from '../components/ProductCard';
import { useTranslation } from '../i18n';

export const Shop: React.FC = () => {
  const { t, getLocalizedName } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || 'All'
  );
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Sync URL search params
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    const q = searchParams.get('q');
    if (q) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const list = await getProducts();
        setProducts(list.filter(p => p.isVisible));
      } catch (e) {
        console.warn('Error fetching shop products', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();

    const handleUpdate = () => fetch();
    window.addEventListener('cf_products_updated', handleUpdate);
    return () => window.removeEventListener('cf_products_updated', handleUpdate);
  }, []);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Kurti',
    'Co-ord',
    'Western',
    'Dress',
    'Other',
  ];

  const sizes = ['All', 'M', 'L', 'XL', 'XXL'];

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Category filter
        if (selectedCategory !== 'All' && product.category !== selectedCategory) {
          return false;
        }

        // Size filter
        if (selectedSize !== 'All') {
          const matchSize = product.sizes?.find(
            s => s.size === selectedSize && s.stock > 0
          );
          if (!matchSize) return false;
        }

        // In Stock Only
        if (inStockOnly) {
          const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? 0;
          if (totalStock <= 0) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const localizedName = getLocalizedName(product).toLowerCase();
          const matches =
            product.name.toLowerCase().includes(q) ||
            localizedName.includes(q) ||
            product.fabric?.toLowerCase().includes(q) ||
            product.colours?.some(c => c.toLowerCase().includes(q)) ||
            product.category.toLowerCase().includes(q);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') {
          return a.price - b.price;
        }
        if (sortBy === 'price-high') {
          return b.price - a.price;
        }
        // newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, selectedCategory, selectedSize, inStockOnly, searchQuery, sortBy, getLocalizedName]);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedSize('All');
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedSize !== 'All' ||
    inStockOnly ||
    searchQuery.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif-brand text-2xl md:text-3xl font-bold text-[#7B1E3A]">
            {t('shop.pageTitle')}
          </h1>
          <p className="text-xs md:text-sm text-stone-600 mt-1">
            {t('shop.productsCount', { count: filteredProducts.length })}
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('shop.searchPlaceholder')}
            className="w-full bg-white border border-[#C9A24B]/40 rounded-full py-2 pl-10 pr-9 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] text-[#2B2B2B]"
          />
          <Search className="w-4 h-4 text-[#7B1E3A] absolute left-3.5 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Sort Action Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#C9A24B]/30 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
        
        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#7B1E3A] text-white shadow-xs'
                  : 'bg-[#FFF8F0] text-stone-700 hover:bg-[#7B1E3A]/10'
              }`}
            >
              {cat === 'All' ? t('categories.all') : cat}
            </button>
          ))}
        </div>

        {/* Controls: Size, In Stock, Sort, Mobile Filter Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Size Filter Dropdown */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs">
            <span className="text-stone-500 font-medium">{t('shop.sizeFilter')}:</span>
            <select
              value={selectedSize}
              onChange={e => setSelectedSize(e.target.value)}
              className="bg-[#FFF8F0] border border-stone-200 rounded-lg px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#7B1E3A]"
            >
              {sizes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* In Stock Only Checkbox */}
          <label className="hidden sm:flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none text-stone-700">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => setInStockOnly(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#7B1E3A] rounded"
            />
            <span>{t('shop.inStockOnly')}</span>
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#7B1E3A] hidden sm:block" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-[#FFF8F0] border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#7B1E3A]"
            >
              <option value="newest">{t('shop.sortNewest')}</option>
              <option value="price-low">{t('shop.sortPriceLow')}</option>
              <option value="price-high">{t('shop.sortPriceHigh')}</option>
            </select>
          </div>

          {/* Mobile Filter Drawer Button */}
          <button
            onClick={() => setFilterDrawerOpen(true)}
            className="sm:hidden flex items-center gap-1 bg-[#7B1E3A]/10 text-[#7B1E3A] px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{t('shop.filter')}</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-red-600 hover:underline font-medium"
            >
              {t('shop.clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in sm:hidden">
          <div className="w-4/5 max-w-xs bg-[#FFF8F0] h-full p-5 space-y-5 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-[#C9A24B]/30 pb-3">
              <h3 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
                {t('shop.filter')}
              </h3>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="p-1 rounded-full text-stone-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category selection */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                {t('shop.categoryFilter')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      selectedCategory === cat
                        ? 'bg-[#7B1E3A] text-white'
                        : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                {t('shop.sizeFilter')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold ${
                      selectedSize === s
                        ? 'bg-[#7B1E3A] text-white shadow-xs'
                        : 'bg-white text-stone-700 border border-stone-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* In stock toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#7B1E3A] rounded"
                />
                <span>{t('shop.inStockOnly')}</span>
              </label>
            </div>

            <div className="pt-6 border-t border-[#C9A24B]/30 flex flex-col gap-2">
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-full bg-[#7B1E3A] text-white py-2.5 rounded-xl font-bold text-xs"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  clearAllFilters();
                  setFilterDrawerOpen(false);
                }}
                className="w-full bg-stone-200 text-stone-700 py-2 rounded-xl font-semibold text-xs"
              >
                {t('shop.clearFilters')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Grid: 2 columns mobile, 4 desktop */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div
              key={n}
              className="bg-white rounded-2xl aspect-[3/4] animate-pulse border border-stone-200"
            ></div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#C9A24B]/20 p-8 shadow-xs">
          <p className="text-base font-semibold text-stone-700">
            {t('shop.noProductsFound')}
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-4 bg-[#7B1E3A] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-[#5e162c] transition-colors"
          >
            {t('shop.resetFilters')}
          </button>
        </div>
      )}
    </div>
  );
};
