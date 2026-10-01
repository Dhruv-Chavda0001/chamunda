import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const FloatingWhatsApp: React.FC = () => {
  const location = useLocation();

  // Hide on admin routes to prevent blocking admin controls
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const whatsappUrl = 'https://wa.me/917383868926?text=Hello%20Chamunda%20Fashion!%20I%20would%20like%20to%20know%20more%20about%20your%20collection.';

  return (
    <aside aria-label="WhatsApp Contact" className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Dhruv Chavda on WhatsApp"
        className="group relative flex items-center justify-center w-13 h-13 md:w-14 md:h-14 bg-[#25D366] text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-300"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400"></span>
        </span>
        <MessageCircle className="w-7 h-7 fill-white text-transparent" />
        
        {/* Hover Tooltip on desktop */}
        <span className="hidden md:group-hover:block absolute right-16 bg-[#2B2B2B] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-md">
          Chat with Us on WhatsApp
        </span>
      </a>
    </aside>
  );
};
