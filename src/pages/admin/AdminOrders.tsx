import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Phone,
  Calendar,
} from 'lucide-react';
import { getOrders, markOrderAsSeen, subscribeOrders } from '../../services/db';
import { Order, OrderStatus } from '../../types';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('All');

  useEffect(() => {
    const unsubscribe = subscribeOrders(list => {
      setOrders(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status filter
      if (statusFilter !== 'All' && order.orderStatus !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'All') {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        if (dateFilter === 'today') {
          if (orderDate.toDateString() !== now.toDateString()) return false;
        } else if (dateFilter === '7days') {
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < sevenDaysAgo) return false;
        } else if (dateFilter === '30days') {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (orderDate < thirtyDaysAgo) return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          order.orderId.toLowerCase().includes(q) ||
          order.customer.name.toLowerCase().includes(q) ||
          order.customer.phone.includes(q) ||
          order.utrNumber.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [orders, statusFilter, dateFilter, searchQuery]);

  // Export to CSV
  const exportToCSV = () => {
    if (orders.length === 0) return;

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Address',
      'City',
      'State',
      'Pincode',
      'Items',
      'Total Amount',
      'UTR Number',
      'Status',
      'Courier',
      'Tracking Number',
    ];

    const rows = orders.map(o => [
      `"${o.orderId}"`,
      `"${new Date(o.createdAt).toLocaleString('en-IN')}"`,
      `"${o.customer.name}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.address.replace(/"/g, '""')}"`,
      `"${o.customer.city}"`,
      `"${o.customer.state}"`,
      `"${o.customer.pincode}"`,
      `"${o.items.map(i => `${i.name} (${i.size}) x${i.quantity}`).join('; ')}"`,
      o.totalAmount,
      `"${o.utrNumber}"`,
      `"${o.orderStatus}"`,
      `"${o.courierName || ''}"`,
      `"${o.trackingNumber || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Chamunda_Fashion_Orders_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'Payment Received':
        return 'bg-emerald-100 text-emerald-800';
      case 'Packed':
        return 'bg-purple-100 text-purple-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-teal-100 text-teal-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
            Live Order Management
          </span>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#7B1E3A]">
            Customer Orders ({orders.length})
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time updates enabled. New orders appear instantly without refreshing.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 bg-[#FFF8F0] border-2 border-[#7B1E3A] text-[#7B1E3A] hover:bg-[#7B1E3A]/10 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-xs transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl p-4 border border-[#C9A24B]/30 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by order ID, name, phone, UTR..."
            className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-full py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#FFF8F0]/40 border border-stone-300 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-[#7B1E3A]"
          >
            <option value="All">All Statuses</option>
            <option value="Payment Pending">Payment Pending</option>
            <option value="Payment Received">Payment Received</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="bg-[#FFF8F0]/40 border border-stone-300 rounded-lg px-2.5 py-1.5 font-semibold focus:outline-none focus:ring-1 focus:ring-[#7B1E3A]"
          >
            <option value="All">All Time</option>
            <option value="today">Today Only</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#C9A24B]/30 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FFF8F0] border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.map(order => (
                <tr
                  key={order.id}
                  className={`hover:bg-stone-50/80 transition-colors ${
                    !order.isSeenByAdmin ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        onClick={() => markOrderAsSeen(order.id)}
                        className="hover:text-[#7B1E3A] underline decoration-stone-300 hover:decoration-[#7B1E3A]"
                      >
                        {order.orderId}
                      </Link>
                      {!order.isSeenByAdmin && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase animate-pulse shrink-0">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-400 block font-normal">
                      UTR: {order.utrNumber}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-stone-600">
                    <span className="block font-medium">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-stone-800 block">
                      {order.customer.name}
                    </span>
                    <a
                      href={`tel:${order.customer.phone}`}
                      className="text-[11px] text-[#7B1E3A] hover:underline font-semibold"
                    >
                      {order.customer.phone}
                    </a>
                    <span className="text-[10px] text-stone-500 block truncate max-w-[160px]">
                      {order.customer.city}, {order.customer.state}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-stone-700">
                    <span className="font-semibold block">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] text-stone-500 line-clamp-1 max-w-[180px]">
                      {order.items.map(i => `${i.name} (${i.size})`).join(', ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-sm text-[#7B1E3A]">
                    ₹{order.totalAmount}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeClass(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/orders/${order.id}`}
                      onClick={() => markOrderAsSeen(order.id)}
                      className="inline-flex items-center gap-1 bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center text-stone-500 text-xs">
            No orders match the selected filters.
          </div>
        )}
      </div>

    </div>
  );
};
