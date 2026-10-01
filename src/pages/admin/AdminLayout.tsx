import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Settings,
  LogOut,
  Bell,
  Volume2,
  VolumeX,
  ExternalLink,
  BookOpen,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { subscribeOrders } from '../../services/db';
import { playOrderNotificationSound } from '../../services/audio';
import { Order } from '../../types';
import toast from 'react-hot-toast';

export const AdminLayout: React.FC = () => {
  const { isAdmin, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastKnownOrderCount, setLastKnownOrderCount] = useState<number | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, loading, navigate]);

  // Real-time order listener for sound alert and tab title updates
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = subscribeOrders(updatedOrders => {
      setOrders(updatedOrders);

      // Check if a new order arrived while viewing
      if (lastKnownOrderCount !== null && updatedOrders.length > lastKnownOrderCount) {
        const latest = updatedOrders[0];
        if (soundEnabled) {
          playOrderNotificationSound();
        }
        toast.custom(
          t => (
            <div
              className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-[#7B1E3A] shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 text-white p-4 border border-[#C9A24B]`}
            >
              <div className="flex-1 w-0">
                <div className="flex items-start">
                  <div className="shrink-0 pt-0.5">
                    <span className="w-10 h-10 rounded-full bg-[#C9A24B] text-[#7B1E3A] flex items-center justify-center font-bold">
                      NEW
                    </span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-[#FFF8F0]">
                      New Order Received! ({latest.orderId})
                    </p>
                    <p className="mt-1 text-xs text-stone-200">
                      {latest.customer.name} • ₹{latest.totalAmount}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-white/20 pl-3">
                <button
                  onClick={() => {
                    toast.dismiss(t.id);
                    navigate(`/admin/orders/${latest.id}`);
                  }}
                  className="text-xs font-bold text-[#C9A24B] hover:text-white"
                >
                  View
                </button>
              </div>
            </div>
          ),
          { duration: 7000 }
        );
      }
      setLastKnownOrderCount(updatedOrders.length);
    });

    return () => unsubscribe();
  }, [isAdmin, lastKnownOrderCount, soundEnabled, navigate]);

  // Update tab title with unread/new order count
  const unseenCount = orders.filter(o => !o.isSeenByAdmin).length;

  useEffect(() => {
    const originalTitle = document.title;
    if (unseenCount > 0) {
      document.title = `(${unseenCount}) New Orders! - Chamunda Fashion Admin`;
    } else {
      document.title = 'Admin Panel - Chamunda Fashion';
    }
    return () => {
      document.title = originalTitle;
    };
  }, [unseenCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7B1E3A]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    {
      to: '/admin/orders',
      label: 'Orders',
      icon: ShoppingBag,
      badge: unseenCount > 0 ? unseenCount : undefined,
    },
    { to: '/admin/products', label: 'Products', icon: Package, end: true },
    { to: '/admin/products/new', label: 'Add Product', icon: PlusCircle },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
    { to: '/admin/guide', label: 'Setup Guide', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col md:flex-row">
      
      {/* Top Header for Mobile */}
      <header className="md:hidden bg-[#7B1E3A] text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-lg hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-[#C9A24B]" />
            <span className="font-serif-brand text-base font-bold">CF Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#C9A24B]"
            title={soundEnabled ? 'Order sound ON' : 'Order sound OFF'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-60" />}
          </button>
          <Link
            to="/admin/orders"
            className="relative p-1.5 rounded-full hover:bg-white/10"
          >
            <Bell className="w-5 h-5" />
            {unseenCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unseenCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Sidebar for Desktop & Mobile Drawer */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#7B1E3A] text-white flex flex-col justify-between p-5 z-40 transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r-2 border-[#C9A24B]/30 shadow-xl`}
      >
        <div className="space-y-6">
          
          {/* Brand Logo & Owner Info */}
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-11 h-11 rounded-full object-cover border-2 border-[#C9A24B]"
            />
            <div>
              <h2 className="font-serif-brand text-lg font-bold text-[#FFF8F0] leading-tight">
                Chamunda Fashion
              </h2>
              <span className="text-[11px] text-[#C9A24B] font-semibold block">
                Dhruv Chavda (Admin)
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#C9A24B] text-[#7B1E3A] shadow-md font-bold'
                        : 'text-stone-200 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-stone-300 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#C9A24B]" /> : <VolumeX className="w-4 h-4" />}
              <span>Chime Alert</span>
            </div>
            <span className="text-[10px] font-bold text-[#C9A24B]">
              {soundEnabled ? 'ON' : 'MUTED'}
            </span>
          </button>

          {/* Open Store */}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-stone-300 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              <span>View Customer Store</span>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <Outlet />
      </main>

      {/* Overlay backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        ></div>
      )}
    </div>
  );
};
