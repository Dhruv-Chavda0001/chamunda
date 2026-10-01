import React from 'react';
import { ShieldAlert, Truck, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n';

export const Policies: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-bold text-[#C9A24B] tracking-widest">
          Chamunda Fashion • Botad, Gujarat
        </span>
        <h1 className="font-serif-brand text-3xl md:text-4xl font-bold text-[#7B1E3A]">
          {t('policies.title')}
        </h1>
        <p className="text-xs md:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          Please review our boutique guidelines before placing your order. We maintain complete transparency with our valued customers.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Shipping & Delivery */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#C9A24B]/30 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7B1E3A]/10 text-[#7B1E3A] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="font-serif-brand text-xl font-bold text-[#7B1E3A]">
              {t('policies.deliveryTitle')}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
            {t('policies.deliveryText')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 bg-[#FFF8F0] rounded-xl border border-stone-200">
              <strong className="text-[#7B1E3A] block">Gujarat Deliveries:</strong>
              <span>1 to 2 business days express transit</span>
            </div>
            <div className="p-3 bg-[#FFF8F0] rounded-xl border border-stone-200">
              <strong className="text-[#7B1E3A] block">Rest of India:</strong>
              <span>2 to 3 business days express transit</span>
            </div>
          </div>
        </div>

        {/* STRICT NO RETURN / NO EXCHANGE */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-red-300 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h2 className="font-serif-brand text-xl font-bold text-red-800">
              {t('policies.returnsTitle')}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
            {t('policies.returnsText')}
          </p>
          <div className="p-3 bg-red-50 rounded-xl text-xs text-red-900 leading-relaxed font-medium">
            ⚠️ <strong>Notice:</strong> We do not offer returns, replacements, or size exchanges after dispatch. Please consult the size chart before placing your order.
          </div>
        </div>

        {/* Prepaid UPI Only (No COD) */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#C9A24B]/30 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7B1E3A]/10 text-[#7B1E3A] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="font-serif-brand text-xl font-bold text-[#7B1E3A]">
              {t('policies.paymentTitle')}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
            {t('policies.paymentText')}
          </p>
          <div className="flex items-center gap-2 text-xs text-stone-600 font-semibold pt-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Accepted via Google Pay, PhonePe, Paytm, BHIM, and all UPI apps</span>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#C9A24B]/30 shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#7B1E3A]/10 text-[#7B1E3A] flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="font-serif-brand text-xl font-bold text-[#7B1E3A]">
              {t('policies.privacyTitle')}
            </h2>
          </div>
          <p className="text-xs md:text-sm text-stone-700 leading-relaxed">
            {t('policies.privacyText')}
          </p>
        </div>

      </div>
    </div>
  );
};
