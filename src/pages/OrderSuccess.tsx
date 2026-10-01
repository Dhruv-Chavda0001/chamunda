import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Truck, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { getOrderById } from '../services/db';
import { useTranslation } from '../i18n';

export const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { t } = useTranslation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const fetch = async () => {
      if (!orderId) return;
      try {
        const found = await getOrderById(orderId);
        setOrder(found);
      } catch (e) {
        console.warn('Error fetching order', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId]);

  const itemsSummary = order
    ? order.items.map(i => `• ${i.name} (${i.size}) x${i.quantity} = ₹${i.price * i.quantity}`).join('\n')
    : '';

  const whatsappText = order
    ? encodeURIComponent(
        `Hello Chamunda Fashion! I have placed an order.\n\n` +
        `Order ID: ${order.orderId}\n` +
        `Name: ${order.customer.name}\n` +
        `Phone: ${order.customer.phone}\n` +
        `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}\n\n` +
        `Items:\n${itemsSummary}\n\n` +
        `Total Paid: ₹${order.totalAmount}\n` +
        `UTR Number: ${order.utrNumber}\n\n` +
        `Please verify my payment and confirm dispatch. Thank you!`
      )
    : '';

  const whatsappUrl = `https://wa.me/917383868926?text=${whatsappText}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#C9A24B]/40 shadow-xl text-center space-y-6">
        
        {/* Animated Success Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-[#25D366] flex items-center justify-center border-2 border-emerald-200 shadow-inner">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold text-[#C9A24B] tracking-widest block mb-1">
            Chamunda Fashion • Botad
          </span>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#7B1E3A]">
            {t('orderSuccess.title')}
          </h1>
          <div className="mt-2 inline-block bg-[#FFF8F0] border border-[#C9A24B]/40 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-[#7B1E3A]">
            {t('orderSuccess.orderNumber')}: {orderId}
          </div>
        </div>

        {/* Verification Notice */}
        <div className="p-4 bg-[#FFF8F0] border border-[#C9A24B]/30 rounded-2xl text-xs md:text-sm text-stone-700 leading-relaxed text-left">
          <p className="font-semibold text-[#7B1E3A] mb-1">
            {t('orderSuccess.verificationNotice')}
          </p>
          <p className="text-stone-500 text-xs">
            Our owner, Dhruv Chavda, personally checks the payment screenshot and matches the UTR against our bank statement before packing your package.
          </p>
        </div>

        {/* Order Items Summary */}
        {order && (
          <div className="text-left border-t border-b border-stone-100 py-4 space-y-2 text-xs">
            <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
              {t('orderSuccess.summaryTitle')}
            </h3>
            <div className="divide-y divide-stone-100">
              {order.items.map(item => (
                <div key={item.productId} className="py-2 flex justify-between">
                  <span>
                    {item.name} ({item.size}) × {item.quantity}
                  </span>
                  <span className="font-bold text-stone-800">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 flex justify-between font-bold text-[#7B1E3A] text-sm">
              <span>Total Paid via UPI</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="text-[11px] text-stone-500">
              UTR / Transaction ID: <strong className="font-mono">{order.utrNumber}</strong>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Send on WhatsApp Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20b859] text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>{t('orderSuccess.sendOnWhatsApp')}</span>
          </a>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Track My Order */}
            <Link
              to="/track"
              className="w-full bg-[#FFF8F0] border-2 border-[#7B1E3A] text-[#7B1E3A] hover:bg-[#7B1E3A]/10 py-3 rounded-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>{t('orderSuccess.trackOrder')}</span>
            </Link>

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="w-full bg-[#7B1E3A] hover:bg-[#5e162c] text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('orderSuccess.continueShopping')}</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
