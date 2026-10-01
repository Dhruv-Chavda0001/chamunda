import React, { useState } from 'react';
import { Phone, Mail, MapPin, Instagram, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../i18n';
import toast from 'react-hot-toast';

export const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      toast.error('Please enter your name and message');
      return;
    }

    // Direct WhatsApp message prefill
    const waText = encodeURIComponent(
      `Hello Chamunda Fashion!\nName: ${name}\nPhone: ${phone || 'N/A'}\nMessage: ${message}`
    );
    window.open(`https://wa.me/917383868926?text=${waText}`, '_blank');
    setSubmitted(true);
    toast.success('Opening WhatsApp to send your inquiry...');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-bold text-[#C9A24B] tracking-widest">
          We Are Here For You
        </span>
        <h1 className="font-serif-brand text-3xl md:text-4xl font-bold text-[#7B1E3A]">
          Contact Chamunda Fashion
        </h1>
        <p className="text-xs md:text-sm text-stone-600 max-w-lg mx-auto leading-relaxed">
          Have queries regarding sizes, styling, or existing orders? Dhruv Chavda is readily available to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Contact Info Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#C9A24B]/30 shadow-md space-y-6">
          <h2 className="font-serif-brand text-xl font-bold text-[#7B1E3A] border-b border-stone-100 pb-3">
            Boutique Information
          </h2>

          <div className="space-y-4 text-xs md:text-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#7B1E3A]/10 text-[#7B1E3A] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-stone-800">Store Address</strong>
                <span className="text-stone-600">
                  Chamunda Fashion<br />
                  Dhruv Chavda<br />
                  Botad, Gujarat - 364710, India
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <div>
                <strong className="block text-stone-800">Direct WhatsApp</strong>
                <a
                  href="https://wa.me/917383868926?text=Hello%20Chamunda%20Fashion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] font-bold hover:underline"
                >
                  +91 917383868926 (Instant Chat)
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#7B1E3A]/10 text-[#7B1E3A] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-stone-800">Official Email</strong>
                <a
                  href="mailto:dhruvchavda7383@gmail.com"
                  className="text-stone-700 hover:text-[#7B1E3A] hover:underline"
                >
                  dhruvchavda7383@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-stone-800">Instagram Profile</strong>
                <a
                  href="https://www.instagram.com/chamunda__fashion__/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 font-semibold hover:underline"
                >
                  @chamunda__fashion__
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C9A24B]/15 text-[#C9A24B] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <strong className="block text-stone-800">Working Hours</strong>
                <span className="text-stone-600">
                  Monday to Sunday: 10:00 AM – 8:00 PM IST
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Inquiry Form */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#C9A24B]/30 shadow-md space-y-5">
          <h2 className="font-serif-brand text-xl font-bold text-[#7B1E3A] border-b border-stone-100 pb-3">
            Send an Inquiry
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ananya Patel"
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit phone number"
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Message or Question <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Ask about kurti sizes, fabric feel, or delivery status..."
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#25D366] hover:bg-[#20b859] text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Send via WhatsApp</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
