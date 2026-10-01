import React from 'react';
import { useShop } from '../context/ShopContext';
import { Sparkles } from 'lucide-react';

export const AnnouncementBanner: React.FC = () => {
  const { settings } = useShop();

  if (!settings.announcementEnabled || !settings.bannerText) {
    return null;
  }

  return (
    <div className="bg-[#7B1E3A] text-[#FFF8F0] px-4 py-2 text-xs md:text-sm font-medium text-center flex items-center justify-center gap-2 border-b border-[#C9A24B]/30 transition-all">
      <Sparkles className="w-3.5 h-3.5 text-[#C9A24B] shrink-0 animate-pulse" />
      <span>{settings.bannerText}</span>
    </div>
  );
};
