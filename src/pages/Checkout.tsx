import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle,
  Copy,
  Upload,
  X,
  CreditCard,
  Truck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileCheck,
  AlertCircle,
  QrCode,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useShop } from '../context/ShopContext';
import { useTranslation } from '../i18n';
import { CustomerInfo } from '../types';
import { createOrder, uploadImageFile } from '../services/db';
import toast from 'react-hot-toast';

const INDIAN_STATES = [
  'Gujarat',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Chandigarh',
];

export const Checkout: React.FC = () => {
  const { cart, subtotal, deliveryCharge, totalAmount, clearCart } = useCart();
  const { settings } = useShop();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Gujarat',
    pincode: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Payment State
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="font-serif-brand text-2xl font-bold text-[#7B1E3A]">
          Your bag is empty
        </h2>
        <p className="text-xs text-stone-600 mt-2">
          Please add items to your cart before proceeding to checkout.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block bg-[#7B1E3A] text-white px-6 py-2.5 rounded-full text-xs font-bold"
        >
          Explore Shop
        </Link>
      </div>
    );
  }

  // Validation
  const validateStep1 = () => {
    const errors: Record<string, string> = {};

    if (!customer.name.trim()) {
      errors.name = 'Full name is required';
    }

    const cleanPhone = customer.phone.trim();
    if (!cleanPhone) {
      errors.phone = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = t('checkout.invalidPhone');
    }

    if (!customer.address.trim()) {
      errors.address = 'Delivery address is required';
    }

    if (!customer.city.trim()) {
      errors.city = 'City/town is required';
    }

    const cleanPin = customer.pincode.trim();
    if (!cleanPin) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(cleanPin)) {
      errors.pincode = t('checkout.invalidPincode');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStep2Submit = () => {
    if (!policyAccepted) {
      toast.error(t('checkout.policyError'), { duration: 4000 });
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG or PNG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Screenshot file must be less than 5MB');
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = ev => {
      setScreenshotPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview('');
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(settings.upiId);
    setCopiedUpi(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleFinalSubmit = async () => {
    if (!policyAccepted) {
      toast.error(t('checkout.policyError'));
      return;
    }

    if (!screenshotFile && !screenshotPreview) {
      toast.error(t('checkout.screenshotRequired'));
      return;
    }

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      toast.error('Please enter the 12-digit UPI UTR number');
      return;
    }
    if (!/^\d{12}$/.test(cleanUtr)) {
      toast.error(t('checkout.invalidUtr'));
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload screenshot
      let uploadedUrl = screenshotPreview;
      if (screenshotFile) {
        uploadedUrl = await uploadImageFile(screenshotFile, 'screenshots', `utr_${cleanUtr}`);
      }

      // 2. Create Order in Database
      const order = await createOrder({
        customer,
        items: cart.map(c => ({
          productId: c.productId,
          name: c.name,
          image: c.image,
          size: c.size,
          quantity: c.quantity,
          price: c.price,
        })),
        subtotal,
        deliveryCharge,
        totalAmount,
        paymentScreenshotUrl: uploadedUrl,
        utrNumber: cleanUtr,
        policyAccepted: true,
        orderStatus: 'Payment Pending',
      });

      // 3. Clear cart and redirect to success
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-success/${order.orderId}`);
    } catch (err: any) {
      console.error('Failed to submit order', err);
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // UPI deep link for mobile apps
  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(
    settings.upiId
  )}&pn=${encodeURIComponent(
    settings.upiHolderName || 'Dhruv Chavda'
  )}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('Chamunda Fashion Order')}`;

  // Dynamic QR code URL (uses uploaded QR image if set, otherwise Google Chart QR generator)
  const qrCodeUrl =
    settings.upiQrImageUrl && settings.upiQrImageUrl !== '/logo.png'
      ? settings.upiQrImageUrl
      : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
          upiDeepLink
        )}`;

  const isGujarat = customer.state.toLowerCase() === 'gujarat';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      {/* Title & Progress Bar */}
      <div className="mb-8 text-center">
        <h1 className="font-serif-brand text-2xl md:text-3xl font-bold text-[#7B1E3A]">
          {t('checkout.title')}
        </h1>

        <div className="mt-6 flex items-center justify-center max-w-md mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= 1
                  ? 'bg-[#7B1E3A] text-white shadow-md'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              1
            </div>
            <span className="text-[11px] mt-1 font-semibold text-stone-700">Details</span>
          </div>

          <div
            className={`flex-1 h-1 mx-2 transition-all ${
              currentStep >= 2 ? 'bg-[#7B1E3A]' : 'bg-stone-200'
            }`}
          ></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep >= 2
                  ? 'bg-[#7B1E3A] text-white shadow-md'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              2
            </div>
            <span className="text-[11px] mt-1 font-semibold text-stone-700">Review</span>
          </div>

          <div
            className={`flex-1 h-1 mx-2 transition-all ${
              currentStep >= 3 ? 'bg-[#7B1E3A]' : 'bg-stone-200'
            }`}
          ></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === 3
                  ? 'bg-[#7B1E3A] text-white shadow-md'
                  : 'bg-stone-200 text-stone-600'
              }`}
            >
              3
            </div>
            <span className="text-[11px] mt-1 font-semibold text-stone-700">Payment</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* STEP 1: DELIVERY DETAILS */}
      {/* ============================================================== */}
      {currentStep === 1 && (
        <form
          onSubmit={handleStep1Submit}
          className="bg-white rounded-3xl p-6 md:p-8 border border-[#C9A24B]/30 shadow-md space-y-5"
        >
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Truck className="w-5 h-5 text-[#7B1E3A]" />
            <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
              {t('checkout.step1')}
            </h2>
          </div>

          {/* Delivery Estimation Notice based on State */}
          <div className="p-3 bg-[#FFF8F0] border border-[#C9A24B]/40 rounded-2xl flex items-center gap-2.5 text-xs text-[#7B1E3A]">
            <Truck className="w-4 h-4 text-[#C9A24B] shrink-0" />
            <span className="font-semibold">
              {isGujarat
                ? t('checkout.deliveryEstGujarat')
                : t('checkout.deliveryEstOther')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t('checkout.fullName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                placeholder="e.g. Priya Sharma"
                className={`w-full bg-[#FFF8F0]/40 border rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] ${
                  formErrors.name ? 'border-red-500' : 'border-stone-300'
                }`}
              />
              {formErrors.name && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t('checkout.phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                value={customer.phone}
                onChange={e =>
                  setCustomer({ ...customer, phone: e.target.value.replace(/\D/g, '') })
                }
                placeholder="e.g. 9876543210"
                className={`w-full bg-[#FFF8F0]/40 border rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] ${
                  formErrors.phone ? 'border-red-500' : 'border-stone-300'
                }`}
              />
              {formErrors.phone && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>
              )}
            </div>

            {/* Email (Optional) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t('checkout.email')}
              </label>
              <input
                type="email"
                value={customer.email || ''}
                onChange={e => setCustomer({ ...customer, email: e.target.value })}
                placeholder="e.g. priya@gmail.com (For order receipt)"
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
            </div>

            {/* Full Street Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t('checkout.address')} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={customer.address}
                onChange={e => setCustomer({ ...customer, address: e.target.value })}
                placeholder="House No, Building, Street, Near landmark..."
                className={`w-full bg-[#FFF8F0]/40 border rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] ${
                  formErrors.address ? 'border-red-500' : 'border-stone-300'
                }`}
              />
              {formErrors.address && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.address}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t('checkout.city')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={customer.city}
                onChange={e => setCustomer({ ...customer, city: e.target.value })}
                placeholder="e.g. Ahmedabad, Botad, Surat"
                className={`w-full bg-[#FFF8F0]/40 border rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] ${
                  formErrors.city ? 'border-red-500' : 'border-stone-300'
                }`}
              />
              {formErrors.city && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.city}</p>
              )}
            </div>

            {/* State Dropdown */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t('checkout.state')} <span className="text-red-500">*</span>
              </label>
              <select
                value={customer.state}
                onChange={e => setCustomer({ ...customer, state: e.target.value })}
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] font-semibold"
              >
                {INDIAN_STATES.map(st => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t('checkout.pincode')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                value={customer.pincode}
                onChange={e =>
                  setCustomer({ ...customer, pincode: e.target.value.replace(/\D/g, '') })
                }
                placeholder="e.g. 364710"
                className={`w-full bg-[#FFF8F0]/40 border rounded-xl py-2.5 px-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] ${
                  formErrors.pincode ? 'border-red-500' : 'border-stone-300'
                }`}
              />
              {formErrors.pincode && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.pincode}</p>
              )}
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Link
              to="/cart"
              className="text-xs font-semibold text-stone-600 hover:text-[#7B1E3A] flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cart</span>
            </Link>

            <button
              type="submit"
              className="bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <span>{t('checkout.nextToReview')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* STEP 2: ORDER REVIEW & MANDATORY NO RETURN POLICY CHECKBOX */}
      {/* ============================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#C9A24B]/30 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
              {t('checkout.step2')}
            </h2>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-semibold text-[#7B1E3A] hover:underline"
            >
              {t('checkout.edit')} Address
            </button>
          </div>

          {/* Delivery Address Review */}
          <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">{customer.name}</span>
              <span className="font-semibold text-[#7B1E3A]">{customer.phone}</span>
            </div>
            <p>{customer.address}</p>
            <p>
              {customer.city}, {customer.state} - <strong>{customer.pincode}</strong>
            </p>
            <p className="text-[11px] text-[#C9A24B] font-semibold pt-1">
              Estimated Delivery:{' '}
              {isGujarat ? '1-2 business days (Gujarat Express)' : '2-3 business days (National)'}
            </p>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('checkout.orderItems')} ({cart.length})
            </h3>
            <div className="divide-y divide-stone-100">
              {cart.map(item => (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-16 object-cover rounded-lg bg-stone-100"
                    />
                    <div>
                      <p className="font-semibold text-stone-800">{item.name}</p>
                      <p className="text-stone-500">
                        Size: <span className="font-bold text-[#7B1E3A]">{item.size}</span> • Qty:{' '}
                        {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-800">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="pt-4 border-t border-stone-200 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>{t('cart.subtotal')}</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>{t('cart.delivery')}</span>
              <span className="font-bold text-emerald-600">
                {deliveryCharge === 0 ? t('cart.freeDelivery') : `₹${deliveryCharge}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#7B1E3A] pt-1 border-t border-stone-100">
              <span>Total Payable</span>
              <span>₹{totalAmount}</span>
            </div>
          </div>

          {/* MANDATORY CHECKBOX: NO RETURN / NO EXCHANGE */}
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={e => setPolicyAccepted(e.target.checked)}
                className="w-5 h-5 mt-0.5 accent-[#7B1E3A] rounded shrink-0 cursor-pointer"
              />
              <span className="text-xs font-semibold text-red-900 leading-relaxed">
                {t('checkout.policyCheckbox')}
              </span>
            </label>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-xs font-semibold text-stone-600 hover:text-[#7B1E3A] flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('checkout.backToDetails')}</span>
            </button>

            <button
              type="button"
              onClick={handleStep2Submit}
              disabled={!policyAccepted}
              className="bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{t('checkout.nextToPayment')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: MANUAL PREPAID UPI PAYMENT & SCREENSHOT UPLOAD */}
      {/* ============================================================== */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border-2 border-[#C9A24B]/50 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#7B1E3A]" />
              <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
                {t('checkout.step3')}
              </h2>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-xs font-semibold text-stone-500 hover:underline"
            >
              Change Review
            </button>
          </div>

          {/* Amount to pay banner */}
          <div className="bg-gradient-to-r from-[#7B1E3A] to-[#5e162c] text-white p-5 rounded-2xl text-center shadow-md">
            <span className="text-xs uppercase tracking-widest text-[#C9A24B] font-bold">
              {t('checkout.amountToPay')}
            </span>
            <div className="text-3xl md:text-4xl font-extrabold mt-0.5 tracking-tight">
              ₹{totalAmount}
            </div>
            <p className="text-[11px] text-stone-200 mt-1">
              Account Holder: <strong>{settings.upiHolderName || 'Dhruv Chavda'}</strong>
            </p>
          </div>

          {/* QR Code and UPI ID Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* QR Code Display */}
            <div className="flex flex-col items-center bg-[#FFF8F0] p-5 rounded-2xl border border-[#C9A24B]/30">
              <div className="w-48 h-48 md:w-56 md:h-56 bg-white p-3 rounded-2xl shadow-inner border border-stone-200 flex items-center justify-center">
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[11px] text-stone-600 mt-2 font-medium">
                Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
              </span>
            </div>

            {/* UPI ID Info & Mobile App Button */}
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
                  {t('checkout.upiId')}
                </span>
                <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-stone-300">
                  <span className="font-mono font-bold text-xs sm:text-sm text-stone-800 truncate">
                    {settings.upiId}
                  </span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#7B1E3A] hover:bg-[#7B1E3A]/10 px-2 py-1 rounded-lg transition-colors shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedUpi ? t('checkout.copied') : t('checkout.copy')}</span>
                  </button>
                </div>
              </div>

              {/* Mobile "Pay using UPI App" button */}
              <a
                href={upiDeepLink}
                className="w-full bg-[#25D366] hover:bg-[#20b859] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all md:hidden"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t('checkout.payViaApp')}</span>
              </a>

              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 leading-relaxed whitespace-pre-line">
                {t('checkout.paymentInstruction')}
              </div>
            </div>
          </div>

          {/* Form Fields: Screenshot Upload & UTR */}
          <div className="pt-4 border-t border-stone-200 space-y-5">
            
            {/* Payment Screenshot Upload */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                {t('checkout.uploadScreenshot')} <span className="text-red-500">*</span>
              </label>

              {!screenshotPreview ? (
                <label className="border-2 border-dashed border-[#C9A24B] hover:border-[#7B1E3A] bg-[#FFF8F0]/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <Upload className="w-8 h-8 text-[#7B1E3A] group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-xs font-bold text-stone-800">
                    Click to select payment screenshot from phone/PC
                  </span>
                  <span className="text-[11px] text-stone-500 mt-1">
                    {t('checkout.uploadHint')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative inline-block border-2 border-emerald-500 rounded-2xl overflow-hidden bg-stone-50 p-2 shadow-md">
                  <img
                    src={screenshotPreview}
                    alt="Payment Screenshot Preview"
                    className="max-h-48 rounded-xl object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeScreenshot}
                    className="absolute top-3 right-3 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700"
                    title="Remove Screenshot"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-emerald-700 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Screenshot selected</span>
                  </div>
                </div>
              )}
            </div>

            {/* 12-digit UTR Input */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                {t('checkout.utrNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={12}
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                placeholder={t('checkout.utrPlaceholder')}
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 px-3.5 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-[#7B1E3A] font-bold text-stone-800"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                {t('checkout.utrHelp')}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="text-xs font-semibold text-stone-600 hover:text-[#7B1E3A] flex items-center gap-1 order-2 sm:order-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Review</span>
            </button>

            <button
              type="button"
              disabled={submitting || !screenshotPreview || utrNumber.length !== 12}
              onClick={handleFinalSubmit}
              className="w-full sm:w-auto bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-10 py-4 rounded-full font-bold text-xs uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed order-1 sm:order-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('checkout.processing')}</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>{t('checkout.completeOrder')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
