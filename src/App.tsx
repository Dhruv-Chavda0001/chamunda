/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { LanguageProvider } from './i18n';
import { ShopProvider } from './context/ShopContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Customer Layout & Pages
import { CustomerLayout } from './components/CustomerLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderSuccess } from './pages/OrderSuccess';
import { TrackOrder } from './pages/TrackOrder';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Policies } from './pages/Policies';
import { NotFound } from './pages/NotFound';

// Admin Layout & Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminProductEdit } from './pages/admin/AdminProductEdit';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminOrderDetail } from './pages/admin/AdminOrderDetail';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminSetupGuide } from './pages/admin/AdminSetupGuide';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ShopProvider>
          <CartProvider>
            <AuthProvider>
              {/* Global Toast Notifications */}
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: '#7B1E3A',
                    color: '#FFF8F0',
                    border: '1px solid #C9A24B',
                    borderRadius: '16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#25D366',
                      secondary: '#FFFFFF',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />

              <Routes>
                {/* Customer Store Pages */}
                <Route path="/" element={<CustomerLayout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:slug" element={<ProductDetail />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="order-success/:orderId" element={<OrderSuccess />} />
                  <Route path="track" element={<TrackOrder />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="policies" element={<Policies />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin Auth */}
                <Route path="/admin/login" element={<AdminLogin />} />

                {/* Protected Admin Portal */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminProductEdit />} />
                  <Route path="products/:id" element={<AdminProductEdit />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetail />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="guide" element={<AdminSetupGuide />} />
                </Route>
              </Routes>
            </AuthProvider>
          </CartProvider>
        </ShopProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
