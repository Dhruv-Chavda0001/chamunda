import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, ShieldCheck, Heart, Shield } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#1f070e] text-[#FFF8F0] pt-14 pb-24 md:pb-12 border-t-2 border-[#C9A24B]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Chamunda Fashion"
                className="w-12 h-12 rounded-full object-cover border-2 border-[#C9A24B]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h3 className="font-serif-brand text-xl font-bold text-[#FFF8F0] tracking-wide">
                  Chamunda Fashion
                </h3>
                <p className="text-xs text-[#C9A24B] tracking-wider uppercase font-semibold">
                  Style • Elegance • Tradition
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {t('footer.about')}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/chamunda__fashion__/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#C9A24B] hover:text-[#7B1E3A] flex items-center justify-center transition-all duration-300"
                aria-label="Instagram Profile"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/917383868926?text=Hello%20Chamunda%20Fashion"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-serif-brand text-base font-bold text-[#C9A24B] uppercase tracking-wider mb-4">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link to="/" className="hover:text-[#C9A24B] transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#C9A24B] transition-colors">
                  {t('categories.all')}
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Kurti" className="hover:text-[#C9A24B] transition-colors">
                  {t('categories.kurti')}
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Co-ord" className="hover:text-[#C9A24B] transition-colors">
                  {t('categories.coord')}
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Western" className="hover:text-[#C9A24B] transition-colors">
                  {t('categories.western')}
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-[#C9A24B] transition-colors">
                  {t('nav.track')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Policies */}
          <div>
            <h4 className="font-serif-brand text-base font-bold text-[#C9A24B] uppercase tracking-wider mb-4">
              {t('footer.customerCare')}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-300">
              <li>
                <Link to="/policies" className="hover:text-[#C9A24B] transition-colors">
                  Shipping & Free Delivery Policy
                </Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-[#C9A24B] transition-colors">
                  Strict No Return / No Exchange
                </Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-[#C9A24B] transition-colors">
                  Prepaid UPI Payment Guide
                </Link>
              </li>
              <li>
                <Link to="/policies" className="hover:text-[#C9A24B] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C9A24B] transition-colors">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C9A24B] transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Boutique Contact Info */}
          <div>
            <h4 className="font-serif-brand text-base font-bold text-[#C9A24B] uppercase tracking-wider mb-4">
              Store Location
            </h4>
            <div className="space-y-3 text-xs text-stone-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C9A24B] shrink-0 mt-0.5" />
                <span>
                  <strong>Chamunda Fashion Boutique</strong><br />
                  Dhruv Chavda<br />
                  Botad, Gujarat 364710, India
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#25D366] shrink-0" />
                <a href="tel:+917383868926" className="hover:underline">
                  +91 917383868926
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C9A24B] shrink-0" />
                <a href="mailto:dhruvchavda7383@gmail.com" className="hover:underline">
                  dhruvchavda7383@gmail.com
                </a>
              </div>
              <p className="text-[11px] text-stone-400 pt-1">
                {t('footer.businessHours')}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} {t('footer.rights')}</p>
          <div className="flex items-center gap-4">
            <span className="text-[#C9A24B] flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Free Express Delivery All India
            </span>
            <Link
              to="/admin"
              className="text-stone-500 hover:text-stone-300 flex items-center gap-1 text-[11px]"
            >
              <Shield className="w-3 h-3" /> Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
