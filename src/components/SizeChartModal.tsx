import React from 'react';
import { X, Ruler, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose }) => {
  const { settings } = useShop();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const chart = settings.sizeChart || {
    M: { bust: '38', waist: '34', hip: '40', length: '44' },
    L: { bust: '40', waist: '36', hip: '42', length: '44' },
    XL: { bust: '42', waist: '38', hip: '44', length: '45' },
    XXL: { bust: '44', waist: '40', hip: '46', length: '45' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FFF8F0] w-full max-w-lg rounded-3xl border-2 border-[#C9A24B]/40 shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#7B1E3A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ruler className="w-5 h-5 text-[#C9A24B]" />
            <h3 className="font-serif-brand text-lg font-bold text-[#FFF8F0]">
              {t('product.sizeChart')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm border-collapse">
              <thead>
                <tr className="bg-[#7B1E3A]/10 text-[#7B1E3A] border-b border-[#C9A24B]/30 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Bust (in)</th>
                  <th className="py-2.5 px-3">Waist (in)</th>
                  <th className="py-2.5 px-3">Hip (in)</th>
                  <th className="py-2.5 px-3">Length (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {Object.entries(chart).map(([size, measurements]) => (
                  <tr key={size} className="hover:bg-white/60 transition-colors">
                    <td className="py-2.5 px-3 font-extrabold text-[#7B1E3A]">{size}</td>
                    <td className="py-2.5 px-3 font-medium text-stone-700">{measurements.bust}"</td>
                    <td className="py-2.5 px-3 font-medium text-stone-700">{measurements.waist}"</td>
                    <td className="py-2.5 px-3 font-medium text-stone-700">{measurements.hip || '-'}"</td>
                    <td className="py-2.5 px-3 font-medium text-stone-700">{measurements.length || '-'}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Strict Reminder Banner */}
          <div className="mt-5 p-3.5 bg-amber-50 border border-amber-300/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Important Notice:</p>
              <p className="mt-0.5 leading-relaxed">
                Chamunda Fashion has a strict <strong>No Return & No Exchange</strong> policy. Please measure yourself with a tailoring tape before placing your order.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="w-full bg-[#7B1E3A] text-white py-2.5 rounded-xl font-semibold hover:bg-[#5e162c] transition-colors"
            >
              Understood & Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
