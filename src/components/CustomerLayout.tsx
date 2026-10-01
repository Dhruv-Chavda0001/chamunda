import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBanner } from './AnnouncementBanner';
import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { Footer } from './Footer';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] text-[#2B2B2B]">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <FloatingWhatsApp />
      <MobileBottomNav />
      <Footer />
    </div>
  );
};
