import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Instagram, Flame, Award, Heart } from 'lucide-react';
import { Product } from '../types';
import { getProducts } from '../services/db';
import { ProductCard } from '../components/ProductCard';
import { TrustBadges } from '../components/TrustBadges';
import { useTranslation } from '../i18n';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const list = await getProducts();
        setProducts(list.filter(p => p.isVisible));
      } catch (err) {
        console.warn('Error loading products', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();

    const handleUpdate = () => fetch();
    window.addEventListener('cf_products_updated', handleUpdate);
    return () => window.removeEventListener('cf_products_updated', handleUpdate);
  }, []);

  const newArrivals = products
    .filter(p => {
      if (p.isNewArrival) return true;
      const days = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return days <= 7;
    })
    .slice(0, 4);

  const featured = products
    .filter(p => p.isFeatured)
    .slice(0, 4);

  const categories = [
    {
      title: t('categories.kurti'),
      slug: 'Kurti',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80',
      badge: 'Traditional & Festive',
    },
    {
      title: t('categories.coord'),
      slug: 'Co-ord',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
      badge: 'Trending Now',
    },
    {
      title: t('categories.western'),
      slug: 'Western',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80',
      badge: 'Modern Chic',
    },
    {
      title: t('categories.newArrivals'),
      slug: 'new',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
      badge: 'Just In',
    },
  ];

  return (
    <div className="space-y-12 md:space-y-16 pb-16">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#7B1E3A] to-[#4e1023] text-[#FFF8F0] pt-12 pb-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-[#C9A24B]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C9A24B_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A24B]/20 border border-[#C9A24B]/40 text-[#C9A24B] text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('hero.subtitle')}</span>
          </div>

          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-3 border-[#C9A24B] p-1 mb-5 shadow-2xl bg-white">
            <img
              src="/logo.png"
              alt="Chamunda Fashion Logo"
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="font-serif-brand text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-[#FFF8F0] max-w-3xl leading-tight">
            Chamunda Fashion
          </h1>
          
          <p className="mt-2 text-base md:text-xl font-medium text-[#C9A24B] tracking-widest uppercase">
            Style • Elegance • Tradition
          </p>

          <p className="mt-4 text-sm md:text-base text-stone-200 max-w-2xl leading-relaxed">
            {t('hero.description')}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#C9A24B] hover:bg-[#b58f3b] text-[#7B1E3A] px-7 py-3 rounded-full font-bold text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>{t('hero.shopNow')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/shop?category=Kurti"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-[#FFF8F0] border border-[#C9A24B]/50 px-6 py-3 rounded-full font-semibold text-sm backdrop-blur-xs transition-all"
            >
              <span>{t('hero.exploreKurtis')}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="font-serif-brand text-2xl md:text-3xl font-bold text-[#7B1E3A]">
            {t('categories.title')}
          </h2>
          <p className="text-xs md:text-sm text-stone-600 mt-1">
            {t('categories.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={cat.slug === 'new' ? '/shop?filter=new' : `/shop?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md border border-[#C9A24B]/30 hover:border-[#7B1E3A] transition-all duration-300"
            >
              <img
                src={cat.image}
                alt={cat.title}
                loading="lazy"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C9A24B] bg-black/40 px-2 py-0.5 rounded-sm">
                  {cat.badge}
                </span>
                <h3 className="font-serif-brand text-sm md:text-lg font-bold text-white mt-1 group-hover:text-[#C9A24B] transition-colors">
                  {cat.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 border-b border-[#C9A24B]/30 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Just Added</span>
            </div>
            <h2 className="font-serif-brand text-2xl md:text-3xl font-bold text-[#7B1E3A]">
              {t('home.newArrivalsTitle')}
            </h2>
            <p className="text-xs text-stone-600 hidden sm:block mt-0.5">
              {t('home.newArrivalsSubtitle')}
            </p>
          </div>
          <Link
            to="/shop?filter=new"
            className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-[#7B1E3A] hover:text-[#C9A24B] transition-colors"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl aspect-[3/4] animate-pulse"></div>
            ))}
          </div>
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-stone-500 text-sm">
            Check out our latest collection in the shop.
          </p>
        )}
      </section>

      {/* Featured / Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6 border-b border-[#C9A24B]/30 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#7B1E3A] uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-[#C9A24B]" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif-brand text-2xl md:text-3xl font-bold text-[#7B1E3A]">
              {t('home.featuredTitle')}
            </h2>
            <p className="text-xs text-stone-600 hidden sm:block mt-0.5">
              {t('home.featuredSubtitle')}
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1 text-xs md:text-sm font-bold text-[#7B1E3A] hover:text-[#C9A24B] transition-colors"
          >
            <span>{t('home.viewAll')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-2xl aspect-[3/4] animate-pulse"></div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {products.slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Instagram Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#7B1E3A] via-[#8c2443] to-[#7B1E3A] rounded-3xl p-6 md:p-10 text-white shadow-xl border-2 border-[#C9A24B]/40 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
              <Instagram className="w-4 h-4" />
              <span>Instagram Community</span>
            </div>
            <h3 className="font-serif-brand text-xl md:text-2xl font-bold">
              {t('home.instagramTitle')}
            </h3>
            <p className="text-xs md:text-sm text-stone-200 max-w-xl">
              {t('home.instagramSubtitle')}
            </p>
          </div>

          <a
            href="https://www.instagram.com/chamunda__fashion__/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#C9A24B] hover:bg-[#b38e3a] text-[#7B1E3A] font-bold text-sm px-6 py-3 rounded-full shadow-lg shrink-0 hover:scale-105 active:scale-95 transition-all"
          >
            <Instagram className="w-4 h-4" />
            <span>{t('home.followInstagram')}</span>
          </a>
        </div>
      </section>

    </div>
  );
};
