import React from 'react';
import { Heart, Sparkles, MapPin, Award, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

export const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      
      {/* Hero Intro */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full p-1 border-2 border-[#C9A24B] shadow-md bg-white">
          <img
            src="/logo.png"
            alt="Chamunda Fashion Logo"
            className="w-full h-full rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <span className="text-xs uppercase font-bold text-[#C9A24B] tracking-widest block">
          Style • Elegance • Tradition
        </span>
        <h1 className="font-serif-brand text-3xl md:text-5xl font-bold text-[#7B1E3A]">
          About Chamunda Fashion
        </h1>
        <p className="text-sm md:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Rooted in Botad, Gujarat, Chamunda Fashion brings the timeless grace of Indian ethnic wear combined with fresh western cuts directly to your doorstep.
        </p>
      </div>

      {/* Story Card */}
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#C9A24B]/30 shadow-md space-y-6">
        <div className="border-l-4 border-[#7B1E3A] pl-4">
          <h2 className="font-serif-brand text-xl md:text-2xl font-bold text-[#7B1E3A]">
            Our Story & Heritage
          </h2>
          <p className="text-xs text-[#C9A24B] uppercase font-semibold tracking-wider mt-0.5">
            Founded & Curated by Dhruv Chavda
          </p>
        </div>

        <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
          Chamunda Fashion started with a single, heartfelt vision: to provide women across India with premium, handpicked ethnic kurtis, co-ords, and western wear that combine royal aesthetics with everyday comfort, without exorbitant designer price tags.
        </p>

        <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
          Operating directly from <strong>Botad, Gujarat</strong>, we curate our apparel straight from trusted artisans and master weavers. Every piece undergoes thorough quality inspection before packaging to guarantee pristine seams, colorfastness, and accurate sizing.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
          <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-stone-200 text-center">
            <span className="block text-2xl font-serif-brand font-bold text-[#7B1E3A]">100%</span>
            <span className="text-xs font-semibold text-stone-600">Free Express Delivery</span>
          </div>
          <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-stone-200 text-center">
            <span className="block text-2xl font-serif-brand font-bold text-[#7B1E3A]">Direct</span>
            <span className="text-xs font-semibold text-stone-600">UPI Verified Checkout</span>
          </div>
          <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-stone-200 text-center">
            <span className="block text-2xl font-serif-brand font-bold text-[#7B1E3A]">Botad</span>
            <span className="text-xs font-semibold text-stone-600">Gujarat, India</span>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#7B1E3A]/10 text-[#7B1E3A] flex items-center justify-center mb-2">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
            Finest Fabric Standards
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We prioritize breathable Jaipuri pure cottons, rich Chanderi silks, lightweight rayons, and stretch knit fabrics suited to India's climate.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#7B1E3A]/10 text-[#7B1E3A] flex items-center justify-center mb-2">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
            Personalized Customer Care
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Whenever you message on WhatsApp, you speak directly with our boutique owner, Dhruv Chavda, ensuring instant answers and tailored sizing guidance.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link
          to="/shop"
          className="inline-block bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all"
        >
          Explore Our Collection
        </Link>
      </div>

    </div>
  );
};
