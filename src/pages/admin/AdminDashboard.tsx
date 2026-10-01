import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  Eye,
  CheckCircle,
  Truck,
  IndianRupee,
  Package,
} from 'lucide-react';
import { getOrders, getProducts, updateOrderStatus } from '../../services/db';
import { Order, Product, OrderStatus } from '../../types';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [ordList, prodList] = await Promise.all([getOrders(), getProducts()]);
      setOrders(ordList);
      setProducts(prodList);
    } catch (e) {
      console.warn('Dashboard fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cf_orders_updated', loadData);
    window.addEventListener('cf_products_updated', loadData);
    return () => {
      window.removeEventListener('cf_orders_updated', loadData);
      window.removeEventListener('cf_products_updated', loadData);
    };
  }, []);

  // Compute Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.createdAt.startsWith(todayStr));

  const pendingPayments = orders.filter(o => o.orderStatus === 'Payment Pending');

  // Total sales: calculate confirmed orders (exclude Cancelled)
  const totalSales = orders
    .filter(o => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Low stock products: products where total stock across all sizes is <= 3
  const lowStockProducts = products.filter(p => {
    const total = p.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? 0;
    return total <= 3;
  });

  const latestOrders = orders.slice(0, 5);

  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      loadData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
            Overview & Daily Operations
          </span>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#7B1E3A]">
            Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Welcome, Dhruv Chavda. Manage orders and products from Botad.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 bg-[#FFF8F0] border border-[#7B1E3A] text-[#7B1E3A] hover:bg-[#7B1E3A]/10 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Orders</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Today's Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#C9A24B]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Orders</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-800">
              {todayOrders.length}
            </div>
            <span className="text-[10px] text-stone-500">From midnight today</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#C9A24B]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
            <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-stone-800">
              {orders.length}
            </div>
            <span className="text-[10px] text-stone-500">All time</span>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-xs flex flex-col justify-between bg-amber-50/30">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pending UTR</span>
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-900">
              {pendingPayments.length}
            </div>
            <span className="text-[10px] text-amber-700 font-semibold">Needs verification</span>
          </div>
        </div>

        {/* Total Sales (₹) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#C9A24B]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#7B1E3A]">
              ₹{totalSales.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-stone-500">Excluding cancelled</span>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#C9A24B]/30 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600">
              {lowStockProducts.length}
            </div>
            <span className="text-[10px] text-stone-500">≤ 3 pieces left</span>
          </div>
        </div>

      </div>

      {/* Latest 5 Orders Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#7B1E3A]" />
            <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
              Latest Orders
            </h2>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-[#7B1E3A] hover:text-[#C9A24B] flex items-center gap-1"
          >
            <span>View All ({orders.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-14 bg-stone-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : latestOrders.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {latestOrders.map(order => (
              <div
                key={order.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="font-mono font-bold text-stone-900 hover:text-[#7B1E3A]"
                    >
                      {order.orderId}
                    </Link>
                    {!order.isSeenByAdmin && (
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase animate-pulse">
                        NEW
                      </span>
                    )}
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-500">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-stone-600 mt-0.5">
                    <strong>{order.customer.name}</strong> ({order.customer.phone}) •{' '}
                    {order.customer.city}, {order.customer.state}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-[#7B1E3A]">
                    ₹{order.totalAmount}
                  </span>

                  {/* Status badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.orderStatus === 'Payment Received'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.orderStatus === 'Shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : order.orderStatus === 'Cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.orderStatus}
                  </span>

                  {/* Quick Action: if pending, button to verify */}
                  {order.orderStatus === 'Payment Pending' && (
                    <button
                      onClick={() =>
                        handleQuickStatusChange(order.id, 'Payment Received')
                      }
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
                      title="Quick mark payment as received"
                    >
                      Mark Paid
                    </button>
                  )}

                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="p-1.5 text-stone-400 hover:text-[#7B1E3A] rounded-lg hover:bg-stone-100"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-stone-500 text-xs">
            No orders placed yet. Test the store by placing an order!
          </div>
        )}
      </div>

      {/* Low Stock Warning Box */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border-2 border-rose-200 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="font-serif-brand text-base font-bold">
              Low Stock Alert ({lowStockProducts.length} items)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            {lowStockProducts.slice(0, 6).map(prod => {
              const total = prod.sizes?.reduce((sum, s) => sum + s.stock, 0) ?? 0;
              return (
                <div
                  key={prod.id}
                  className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-stone-800 truncate">{prod.name}</p>
                    <span className="text-[11px] text-rose-600 font-bold">
                      {total === 0 ? 'SOLD OUT' : `${total} items left`}
                    </span>
                  </div>
                  <Link
                    to={`/admin/products/${prod.id}`}
                    className="text-[11px] font-bold text-[#7B1E3A] hover:underline shrink-0"
                  >
                    Edit Stock
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
