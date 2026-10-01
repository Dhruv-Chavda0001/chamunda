import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Globe, Shield, Phone, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTranslation } from '../i18n';
import { Language } from '../types';

export const Navbar: React.FC = () => {
  const { totalCount } = useCart();
  const { language, setLanguage, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const languages: { code: Language; label: string; short: string }[] = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'हिं' },
    { code: 'gu', label: 'ગુજરાતી', short: 'ગુ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFF8F0]/95 backdrop-blur-md border-b border-[#C9A24B]/20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Left: Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#7B1E3A] hover:bg-[#7B1E3A]/5 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              {!logoFailed ? (
                <img
                  src="/logo.png"
                  alt="Chamunda Fashion"
                  onError={() => setLogoFailed(true)}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-[#C9A24B] shadow-xs group-hover:scale-105 transition-transform"
                />
              ) : null}
              <div className="flex flex-col">
                <span className="font-serif-brand text-lg md:text-2xl font-bold tracking-tight text-[#7B1E3A] leading-tight">
                  Chamunda Fashion
                </span>
                <span className="text-[10px] md:text-xs tracking-wider text-[#C9A24B] font-medium uppercase">
                  Style • Elegance • Tradition
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-sm font-medium text-[#2B2B2B] hover:text-[#7B1E3A] transition-colors"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/shop"
              className="text-sm font-medium text-[#2B2B2B] hover:text-[#7B1E3A] transition-colors"
            >
              {t('nav.shop')}
            </Link>
            <Link
              to="/track"
              className="text-sm font-medium text-[#2B2B2B] hover:text-[#7B1E3A] transition-colors"
            >
              {t('nav.track')}
            </Link>
            <Link
              to="/policies"
              className="text-sm font-medium text-[#2B2B2B] hover:text-[#7B1E3A] transition-colors"
            >
              {t('nav.policies')}
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-[#2B2B2B] hover:text-[#7B1E3A] transition-colors"
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-[#2B2B2B] hover:text-[#7B1E3A] transition-colors"
            >
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Right Actions: Language Switcher, Search, Cart, Admin */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#7B1E3A]/5 border border-[#C9A24B]/30 rounded-full p-0.5">
              {languages.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full transition-all ${
                    language === l.code
                      ? 'bg-[#7B1E3A] text-white shadow-xs'
                      : 'text-[#7B1E3A] hover:bg-[#7B1E3A]/10'
                  }`}
                  title={l.label}
                >
                  {l.short}
                </button>
              ))}
            </div>

            {/* Search Icon / Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#7B1E3A] hover:bg-[#7B1E3A]/10 rounded-full transition-colors"
              aria-label="Search Products"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-[#7B1E3A] hover:bg-[#7B1E3A]/10 rounded-full transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#7B1E3A] text-[#FFF8F0] text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#FFF8F0] animate-in zoom-in-50">
                  {totalCount}
                </span>
              )}
            </Link>

            {/* Admin Portal Icon (Discrete) */}
            <Link
              to="/admin"
              className="hidden lg:flex items-center gap-1 text-xs font-medium text-[#7B1E3A]/70 hover:text-[#7B1E3A] border border-[#7B1E3A]/20 hover:border-[#7B1E3A] px-2.5 py-1.5 rounded-full transition-all"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>

        {/* Expandable Search Input Bar */}
        {searchOpen && (
          <form
            onSubmit={handleSearchSubmit}
            className="pb-3 pt-1 border-t border-[#C9A24B]/20 animate-in fade-in slide-in-from-top-1"
          >
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('shop.searchPlaceholder')}
                autoFocus
                className="w-full bg-white border border-[#C9A24B]/40 rounded-full py-2.5 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] text-[#2B2B2B]"
              />
              <Search className="w-4 h-4 text-[#7B1E3A] absolute left-4 top-3.5" />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FFF8F0] border-b border-[#C9A24B]/20 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#2B2B2B] hover:bg-[#7B1E3A]/10 hover:text-[#7B1E3A]"
            >
              {t('nav.home')}
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#2B2B2B] hover:bg-[#7B1E3A]/10 hover:text-[#7B1E3A]"
            >
              {t('nav.shop')}
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#2B2B2B] hover:bg-[#7B1E3A]/10 hover:text-[#7B1E3A]"
            >
              {t('nav.track')}
            </Link>
            <Link
              to="/policies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#2B2B2B] hover:bg-[#7B1E3A]/10 hover:text-[#7B1E3A]"
            >
              {t('nav.policies')}
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#2B2B2B] hover:bg-[#7B1E3A]/10 hover:text-[#7B1E3A]"
            >
              {t('nav.about')}
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#2B2B2B] hover:bg-[#7B1E3A]/10 hover:text-[#7B1E3A]"
            >
              {t('nav.contact')}
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg text-sm font-semibold text-[#7B1E3A] hover:bg-[#7B1E3A]/10 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-[#C9A24B]/20 flex items-center justify-between text-xs text-stone-600">
            <span>📍 Botad, Gujarat, India</span>
            <a
              href="https://wa.me/917383868926"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] font-semibold flex items-center gap-1"
            >
              <Phone className="w-3.5 h-3.5" /> WhatsApp Support
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
