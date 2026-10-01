import React, { useState } from 'react';
import { Search, Package, CheckCircle, Clock, Truck, Home, AlertCircle } from 'lucide-react';
import { trackOrder } from '../services/db';
import { OrderStatus } from '../types';
import { useTranslation } from '../i18n';
import toast from 'react-hot-toast';

export const TrackOrder: React.FC = () => {
  const { t } = useTranslation();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !phone.trim()) {
      toast.error('Please enter both Order ID and Mobile Number');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const data = await trackOrder(orderId, phone);
      setResult(data);
      if (!data) {
        toast.error('No matching order found. Please check details.');
      }
    } catch (err) {
      console.warn('Track order lookup failed', err);
      toast.error('Failed to lookup order');
    } finally {
      setLoading(false);
    }
  };

  const steps: OrderStatus[] = [
    'Payment Pending',
    'Payment Received',
    'Packed',
    'Shipped',
    'Delivered',
  ];

  const getStepIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    return steps.indexOf(status);
  };

  const currentIdx = result ? getStepIndex(result.orderStatus as OrderStatus) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-serif-brand text-2xl md:text-3xl font-bold text-[#7B1E3A]">
          {t('track.title')}
        </h1>
        <p className="text-xs md:text-sm text-stone-600 mt-1 max-w-md mx-auto">
          {t('track.subtitle')}
        </p>
      </div>

      {/* Lookup Form */}
      <form
        onSubmit={handleTrack}
        className="bg-white rounded-3xl p-6 md:p-8 border border-[#C9A24B]/30 shadow-md space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              {t('track.orderId')}
            </label>
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. CF-20261001-1234"
              className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              {t('track.phone')}
            </label>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="10-digit mobile number"
              className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#7B1E3A] hover:bg-[#5e162c] text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Searching...' : t('track.button')}</span>
        </button>
      </form>

      {/* Result Display */}
      {searched && (
        <div className="mt-8">
          {result ? (
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#C9A24B]/40 shadow-lg space-y-8 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs uppercase font-bold text-[#C9A24B] tracking-wider">
                    Order Found
                  </span>
                  <h3 className="font-mono text-base md:text-lg font-bold text-[#7B1E3A]">
                    {result.orderId}
                  </h3>
                </div>
                <div className="inline-block bg-[#7B1E3A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto">
                  {result.orderStatus}
                </div>
              </div>

              {/* Status Timeline */}
              {result.orderStatus === 'Cancelled' ? (
                <div className="p-4 bg-red-50 border border-red-300 rounded-2xl flex items-center gap-3 text-red-900 text-xs">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <span className="font-bold block">This order has been cancelled.</span>
                    <span>Please contact our WhatsApp support for assistance.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {t('track.timelineTitle')}
                  </h4>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#C9A24B]/30">
                    {steps.map((st, idx) => {
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={st} className="relative flex items-start gap-4">
                          <div
                            className={`absolute -left-6 w-4 h-4 rounded-full border-2 transition-all ${
                              isCompleted
                                ? 'bg-[#7B1E3A] border-[#C9A24B]'
                                : 'bg-white border-stone-300'
                            }`}
                          ></div>
                          <div>
                            <span
                              className={`text-xs font-bold block ${
                                isCurrent
                                  ? 'text-[#7B1E3A]'
                                  : isCompleted
                                  ? 'text-stone-800'
                                  : 'text-stone-400'
                              }`}
                            >
                              {st}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              {idx === 0 && 'Prepaid order submitted, awaiting UTR match'}
                              {idx === 1 && 'Payment verified by Dhruv Chavda'}
                              {idx === 2 && 'Inspected, folded and sealed for courier'}
                              {idx === 3 && 'Dispatched via Express Courier'}
                              {idx === 4 && 'Successfully handed over to customer'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Courier and Dispatch details if shipped */}
              {(result.courierName || result.trackingNumber) && (
                <div className="p-4 bg-[#FFF8F0] border border-[#C9A24B]/40 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#7B1E3A]">
                    <Truck className="w-4 h-4 text-[#C9A24B]" />
                    <span>{t('track.courierInfo')}</span>
                  </div>
                  {result.courierName && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">{t('track.courier')}:</span>
                      <span className="font-bold text-stone-800">{result.courierName}</span>
                    </div>
                  )}
                  {result.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-stone-500">{t('track.trackingNo')}:</span>
                      <span className="font-mono font-bold text-[#7B1E3A]">
                        {result.trackingNumber}
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-stone-200 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
              <p className="text-xs md:text-sm font-semibold text-stone-800">
                {t('track.notFound')}
              </p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Need help? Tap the floating WhatsApp button to chat directly with Dhruv Chavda.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
