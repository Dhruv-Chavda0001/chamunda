import React from 'react';
import { ShieldCheck, Truck, Zap, QrCode } from 'lucide-react';
import { useTranslation } from '../i18n';

export const TrustBadges: React.FC = () => {
  const { t } = useTranslation();

  const badges = [
    {
      icon: ShieldCheck,
      title: t('badges.quality'),
      desc: t('badges.qualityDesc'),
    },
    {
      icon: Truck,
      title: t('badges.freeDelivery'),
      desc: t('badges.freeDeliveryDesc'),
    },
    {
      icon: Zap,
      title: t('badges.fastDelivery'),
      desc: t('badges.fastDeliveryDesc'),
    },
    {
      icon: QrCode,
      title: t('badges.securePayment'),
      desc: t('badges.securePaymentDesc'),
    },
  ];

  return (
    <section className="py-8 bg-white/70 border-y border-[#C9A24B]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {badges.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center p-3">
                <div className="w-12 h-12 rounded-full bg-[#7B1E3A]/10 text-[#7B1E3A] flex items-center justify-center mb-3 border border-[#C9A24B]/30">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#2B2B2B]">{b.title}</h4>
                <p className="text-xs text-stone-600 mt-1 max-w-[200px] leading-relaxed">
                  {b.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
