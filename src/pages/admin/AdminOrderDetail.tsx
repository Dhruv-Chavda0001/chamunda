import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Copy,
  CheckCircle,
  Truck,
  Download,
  ZoomIn,
  MessageCircle,
  Printer,
  Save,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';
import { getOrderById, updateOrderStatus, markOrderAsSeen } from '../../services/db';
import { Order, OrderStatus } from '../../types';
import toast from 'react-hot-toast';

export const AdminOrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [status, setStatus] = useState<OrderStatus>('Payment Pending');
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [restoreStockOnCancel, setRestoreStockOnCancel] = useState(true);

  // Screenshot modal
  const [zoomScreenshot, setZoomScreenshot] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const found = await getOrderById(id);
        if (found) {
          setOrder(found);
          setStatus(found.orderStatus);
          setCourierName(found.courierName || '');
          setTrackingNumber(found.trackingNumber || '');
          setAdminNote(found.adminNote || '');

          if (!found.isSeenByAdmin) {
            markOrderAsSeen(found.id);
          }
        } else {
          toast.error('Order not found');
          navigate('/admin/orders');
        }
      } catch (e) {
        console.warn('Error fetching order', e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7B1E3A] mx-auto"></div>
      </div>
    );
  }

  if (!order) return null;

  const copyAddress = () => {
    const fullText = `${order.customer.name}\n${order.customer.address}\n${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}\nPhone: ${order.customer.phone}`;
    navigator.clipboard.writeText(fullText);
    toast.success('Full shipping address copied!');
  };

  const handleSaveStatus = async () => {
    setSaving(true);
    try {
      await updateOrderStatus(
        order.id,
        status,
        courierName.trim(),
        trackingNumber.trim(),
        adminNote.trim(),
        status === 'Cancelled' ? restoreStockOnCancel : false
      );
      toast.success('Order updated successfully');
      setOrder(prev =>
        prev
          ? {
              ...prev,
              orderStatus: status,
              courierName: courierName.trim(),
              trackingNumber: trackingNumber.trim(),
              adminNote: adminNote.trim(),
            }
          : null
      );
    } catch {
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  // WhatsApp Message Generator
  const getWhatsAppMessage = () => {
    const name = order.customer.name;
    const orderId = order.orderId;
    const amount = order.totalAmount;

    switch (status) {
      case 'Payment Received':
        return `Hi ${name}, your payment of ₹${amount} for order ${orderId} has been verified and received! We are now packing your lovely outfits. Thank you for choosing Chamunda Fashion, Botad!`;
      case 'Packed':
        return `Hi ${name}, your order ${orderId} from Chamunda Fashion has been checked and packed with care. It will be dispatched with our courier partner shortly.`;
      case 'Shipped':
        return `Hi ${name}, your order ${orderId} has been shipped! Courier Partner: ${courierName || 'Express Courier'}, Tracking Number: ${trackingNumber || 'Available shortly'}. You can track it at ${window.location.origin}/track`;
      case 'Delivered':
        return `Hi ${name}, your order ${orderId} has been delivered! We hope you love your new outfit. Please share your feedback and tag us on Instagram @chamunda__fashion__!`;
      case 'Cancelled':
        return `Hi ${name}, your order ${orderId} from Chamunda Fashion has been cancelled. Please contact us if you have any questions.`;
      default:
        return `Hi ${name}, regarding your order ${orderId} on Chamunda Fashion, please share your payment screenshot and 12-digit UTR for verification.`;
    }
  };

  const openWhatsAppToCustomer = () => {
    const text = encodeURIComponent(getWhatsAppMessage());
    let cleanPhone = order.customer.phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('91') && cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 text-stone-600 hover:text-[#7B1E3A] rounded-xl hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-xl sm:text-2xl font-bold text-[#7B1E3A]">
                {order.orderId}
              </h1>
              <span className="bg-[#7B1E3A]/10 text-[#7B1E3A] text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                {order.orderStatus}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print Packing Slip */}
          <button
            onClick={handlePrintSlip}
            className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label / Slip</span>
          </button>

          {/* WhatsApp Customer */}
          <button
            onClick={openWhatsAppToCustomer}
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20b859] text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp Customer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Customer & Items */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Customer Address Details */}
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
                Customer & Delivery Address
              </h2>
              <button
                onClick={copyAddress}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#7B1E3A] hover:bg-[#7B1E3A]/5 px-2.5 py-1 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                  Customer Name
                </span>
                <span className="text-stone-900 font-bold text-sm block mt-0.5">
                  {order.customer.name}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                  Mobile Number (Tap to call)
                </span>
                <a
                  href={`tel:${order.customer.phone}`}
                  className="text-emerald-700 font-bold text-sm flex items-center gap-1.5 hover:underline mt-0.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>{order.customer.phone}</span>
                </a>
              </div>

              <div className="sm:col-span-2">
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                  Street Address
                </span>
                <span className="text-stone-800 font-medium block mt-0.5 leading-relaxed">
                  {order.customer.address}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                  City & State
                </span>
                <span className="text-stone-800 font-semibold block mt-0.5">
                  {order.customer.city}, {order.customer.state}
                </span>
              </div>

              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                  Pincode
                </span>
                <span className="font-mono font-bold text-stone-900 text-sm block mt-0.5">
                  {order.customer.pincode}
                </span>
              </div>
            </div>
          </div>

          {/* Ordered Items Table */}
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
            <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A] border-b border-stone-100 pb-2">
              Ordered Items ({order.items.length})
            </h2>

            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-16 object-cover rounded-lg bg-stone-100 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-stone-900">{item.name}</h3>
                      <p className="text-stone-500 mt-0.5">
                        Size: <strong className="text-[#7B1E3A]">{item.size}</strong> • Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-stone-400 block text-[11px]">₹{item.price} x {item.quantity}</span>
                    <span className="font-bold text-stone-900 text-sm">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Delivery Charge:</span>
                <span className="font-bold text-emerald-600">
                  {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#7B1E3A] pt-2 border-t border-stone-100">
                <span>Total Paid via UPI:</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Internal Private Admin Note */}
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-3">
            <h2 className="font-serif-brand text-base font-bold text-stone-800">
              Private Admin Notes
            </h2>
            <textarea
              rows={2}
              value={adminNote}
              onChange={e => setAdminNote(e.target.value)}
              placeholder="e.g. Verified with HDFC Bank statement, customer requested extra packing..."
              className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
            />
          </div>

        </div>

        {/* Right Column: Payment Screenshot & Dispatch Control */}
        <div className="space-y-6">
          
          {/* Payment Verification Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#C9A24B]/40 shadow-xs space-y-4">
            <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A] border-b border-stone-100 pb-2">
              Payment Verification
            </h2>

            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider">
                12-digit UTR Number
              </span>
              <span className="font-mono font-extrabold text-stone-900 text-base block mt-0.5 tracking-wider bg-[#FFF8F0] px-3 py-1.5 rounded-xl border border-stone-200">
                {order.utrNumber}
              </span>
            </div>

            {/* Payment Screenshot */}
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold tracking-wider mb-2">
                Customer Screenshot
              </span>

              {order.paymentScreenshotUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-50 group">
                  <img
                    src={order.paymentScreenshotUrl}
                    alt="Payment Receipt"
                    className="w-full max-h-64 object-contain mx-auto cursor-zoom-in"
                    onClick={() => setZoomScreenshot(true)}
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 flex items-center justify-between text-white text-xs">
                    <button
                      type="button"
                      onClick={() => setZoomScreenshot(true)}
                      className="flex items-center gap-1 hover:text-[#C9A24B]"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>Zoom</span>
                    </button>
                    <a
                      href={order.paymentScreenshotUrl}
                      download={`CF_Payment_${order.utrNumber}.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-[#C9A24B]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">No screenshot uploaded.</p>
              )}
            </div>
          </div>

          {/* Status & Courier Update Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
            <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A] border-b border-stone-100 pb-2">
              Order Status & Dispatch
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Order Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as OrderStatus)}
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs font-bold text-[#7B1E3A] focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              >
                <option value="Payment Pending">Payment Pending</option>
                <option value="Payment Received">Payment Received</option>
                <option value="Packed">Packed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {status === 'Cancelled' && (
              <label className="flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50 p-2.5 rounded-xl border border-red-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreStockOnCancel}
                  onChange={e => setRestoreStockOnCancel(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded"
                />
                <span>Restore item stock back into inventory</span>
              </label>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Courier Partner Name
              </label>
              <input
                type="text"
                value={courierName}
                onChange={e => setCourierName(e.target.value)}
                placeholder="e.g. DTDC, Delhivery, Tirupati, Maruti"
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Tracking AWB / Consignment Number
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={e => setTrackingNumber(e.target.value)}
                placeholder="e.g. 1928374652"
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSaveStatus}
              className="w-full bg-[#7B1E3A] hover:bg-[#5e162c] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Fullscreen Screenshot Zoom Modal */}
      {zoomScreenshot && order.paymentScreenshotUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setZoomScreenshot(false)}
            className="absolute top-4 right-4 text-white hover:text-stone-300 p-2 rounded-full bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={order.paymentScreenshotUrl}
            alt="Payment Receipt Zoom"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
          />
        </div>
      )}

      {/* Hidden Printable Shipping Label / Packing Slip (Visible only in Print preview) */}
      <div id="printable-slip" className="hidden print:block p-8 bg-white text-black font-sans">
        <div className="border-4 border-black p-6 space-y-6">
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider">Chamunda Fashion</h1>
              <p className="text-sm font-semibold">Style • Elegance • Tradition</p>
              <p className="text-xs">Botad, Gujarat - 364710, India</p>
              <p className="text-xs">WhatsApp: +91 917383868926</p>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase font-bold block">Prepaid Shipping Slip</span>
              <span className="text-lg font-mono font-bold">{order.orderId}</span>
              <p className="text-xs mt-1">Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-b-2 border-black pb-4 text-xs">
            <div>
              <span className="font-bold uppercase text-[11px] block text-stone-500">DELIVER TO:</span>
              <h2 className="text-base font-bold mt-1">{order.customer.name}</h2>
              <p className="mt-1 leading-relaxed whitespace-pre-line font-medium text-sm">
                {order.customer.address}
              </p>
              <p className="mt-1 font-bold text-sm">
                {order.customer.city}, {order.customer.state} - {order.customer.pincode}
              </p>
              <p className="mt-2 font-bold text-base">Phone: {order.customer.phone}</p>
            </div>

            <div className="border-l-2 border-black pl-6 space-y-2">
              <span className="font-bold uppercase text-[11px] block text-stone-500">DISPATCH FROM:</span>
              <p className="font-bold text-sm">CHAMUNDA FASHION</p>
              <p className="text-xs">Proprietor: Dhruv Chavda</p>
              <p className="text-xs">Botad, Gujarat 364710</p>
              <p className="text-xs">Phone: +91 917383868926</p>
              <div className="pt-2 text-xs">
                <span className="font-bold">Courier: </span> {order.courierName || 'Express Parcel'}<br />
                <span className="font-bold">Tracking: </span> {order.trackingNumber || 'N/A'}<br />
                <span className="font-bold">Payment: </span> PREPAID UPI (₹{order.totalAmount})
              </div>
            </div>
          </div>

          <div className="text-xs">
            <h3 className="font-bold uppercase mb-2">Package Contents:</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black">
                  <th className="py-1">Item Description</th>
                  <th className="py-1">Size</th>
                  <th className="py-1 text-center">Qty</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((i, idx) => (
                  <tr key={idx} className="border-b border-stone-300">
                    <td className="py-1 font-semibold">{i.name}</td>
                    <td className="py-1 font-bold">{i.size}</td>
                    <td className="py-1 text-center">{i.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center pt-2 text-[11px] border-t border-black font-semibold">
            Thank you for shopping with Chamunda Fashion, Botad, Gujarat!
          </div>
        </div>
      </div>

    </div>
  );
};
