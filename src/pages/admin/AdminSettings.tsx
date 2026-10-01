import React, { useState } from 'react';
import {
  Save,
  QrCode,
  Upload,
  Phone,
  Mail,
  Shield,
  Truck,
  Sparkles,
  Lock,
  Ruler,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { compressImage } from '../../services/db';
import { ShopSettings } from '../../types';
import toast from 'react-hot-toast';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings } = useShop();
  const { resetPassword, changeLocalPassword, user } = useAuth();

  const [form, setForm] = useState<ShopSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  // Password reset & update state
  const [newPassword, setNewPassword] = useState('');
  const [sendingReset, setSendingReset] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const success = changeLocalPassword(newPassword.trim());
    if (success) {
      setNewPassword('');
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingQr(true);
    try {
      const compressed = await compressImage(file, 800, 0.9);
      setForm(prev => ({ ...prev, upiQrImageUrl: compressed }));
      toast.success('New UPI QR code image loaded. Click "Save All Settings" to commit.');
    } catch {
      toast.error('Failed to process QR image');
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.upiId.trim()) {
      toast.error('UPI ID is required');
      return;
    }

    setSaving(true);
    try {
      await updateSettings(form);
    } catch {
      // toast shown in context
    } finally {
      setSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setSendingReset(true);
    const email = user?.email || 'dhruvchavda7383@gmail.com';
    await resetPassword(email);
    setSendingReset(false);
  };

  const updateSizeChartField = (
    size: string,
    field: 'bust' | 'waist' | 'hip' | 'length',
    val: string
  ) => {
    setForm(prev => ({
      ...prev,
      sizeChart: {
        ...prev.sizeChart,
        [size]: {
          ...prev.sizeChart[size],
          [field]: val,
        },
      },
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <span className="text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
            Store Configuration
          </span>
          <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#7B1E3A]">
            Admin Settings
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure your manual UPI payment details, delivery rules, announcement bar, and size chart.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* UPI PAYMENT DETAILS & QR CODE */}
        <div className="bg-white rounded-3xl p-6 border-2 border-[#C9A24B]/40 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <QrCode className="w-5 h-5 text-[#7B1E3A]" />
            <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
              Manual UPI Payment Settings
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  UPI ID (VPA) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.upiId}
                  onChange={e => setForm({ ...form, upiId: e.target.value.trim() })}
                  placeholder="e.g. dhruvchavda7383@okaxis or 917383868926@ybl"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Customers scan this or click to pay directly on their UPI app.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.upiHolderName}
                  onChange={e => setForm({ ...form, upiHolderName: e.target.value })}
                  placeholder="Dhruv Chavda"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Owner WhatsApp Number (Without + or spaces)
                </label>
                <input
                  type="text"
                  value={form.shopWhatsapp}
                  onChange={e =>
                    setForm({ ...form, shopWhatsapp: e.target.value.replace(/\D/g, '') })
                  }
                  placeholder="917383868926"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Shop Email Address
                </label>
                <input
                  type="email"
                  value={form.shopEmail}
                  onChange={e => setForm({ ...form, shopEmail: e.target.value })}
                  placeholder="dhruvchavda7383@gmail.com"
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>
            </div>

            {/* QR Code Upload & Preview */}
            <div className="bg-[#FFF8F0] p-5 rounded-2xl border border-[#C9A24B]/30 flex flex-col items-center text-center">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                Your UPI QR Code Image
              </span>

              <div className="w-44 h-44 bg-white p-2 rounded-2xl shadow-inner border border-stone-200 flex items-center justify-center overflow-hidden mb-3">
                <img
                  src={form.upiQrImageUrl || '/logo.png'}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <label className="bg-white hover:bg-stone-50 border border-stone-300 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
                <Upload className="w-3.5 h-3.5 inline-block mr-1 text-[#7B1E3A]" />
                <span>{uploadingQr ? 'Processing...' : 'Upload My QR Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQrUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[10px] text-stone-500 mt-2">
                Take a screenshot of your GPay/PhonePe QR and upload here.
              </span>
            </div>

          </div>
        </div>

        {/* DELIVERY & SHIPPING RULES */}
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <Truck className="w-5 h-5 text-[#7B1E3A]" />
            <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
              Delivery Charges & Thresholds
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Standard Delivery Charge (₹)
              </label>
              <input
                type="number"
                min={0}
                value={form.deliveryCharge}
                onChange={e =>
                  setForm({ ...form, deliveryCharge: Number(e.target.value) })
                }
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Current store policy is ₹0 (100% Free delivery across India).
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Free Delivery Above (₹)
              </label>
              <input
                type="number"
                min={0}
                value={form.freeDeliveryAbove}
                onChange={e =>
                  setForm({ ...form, freeDeliveryAbove: Number(e.target.value) })
                }
                className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Set 0 for free delivery on every order without minimum amount.
              </span>
            </div>
          </div>
        </div>

        {/* ANNOUNCEMENT BANNER TOGGLE */}
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A24B]" />
              <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
                Top Announcement Bar
              </h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-bold text-stone-600">
                {form.announcementEnabled ? 'Enabled (ON)' : 'Disabled (OFF)'}
              </span>
              <input
                type="checkbox"
                checked={form.announcementEnabled}
                onChange={e =>
                  setForm({ ...form, announcementEnabled: e.target.checked })
                }
                className="w-5 h-5 accent-[#7B1E3A] rounded cursor-pointer"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Banner Text
            </label>
            <input
              type="text"
              value={form.bannerText}
              onChange={e => setForm({ ...form, bannerText: e.target.value })}
              placeholder="e.g. Special Festive Offer: Flat 20% OFF on all Co-ord Sets! Use prepaid UPI."
              className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
            />
            <span className="text-[11px] text-stone-500 mt-1 block">
              Default is OFF as requested. Turn ON whenever you run festive offers.
            </span>
          </div>
        </div>

        {/* SIZE CHART VALUES MANAGER */}
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <Ruler className="w-5 h-5 text-[#7B1E3A]" />
            <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
              Size Chart Measurements (Inches)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#FFF8F0] text-[#7B1E3A] font-bold border-b border-stone-200">
                  <th className="py-2 px-3">Size</th>
                  <th className="py-2 px-3">Bust (in)</th>
                  <th className="py-2 px-3">Waist (in)</th>
                  <th className="py-2 px-3">Hip (in)</th>
                  <th className="py-2 px-3">Length (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {Object.entries(form.sizeChart || {}).map(([sz, meas]) => (
                  <tr key={sz}>
                    <td className="py-2 px-3 font-bold text-stone-900">{sz}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={meas.bust}
                        onChange={e => updateSizeChartField(sz, 'bust', e.target.value)}
                        className="w-16 bg-[#FFF8F0]/40 border border-stone-300 rounded-lg p-1 text-center font-semibold"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={meas.waist}
                        onChange={e => updateSizeChartField(sz, 'waist', e.target.value)}
                        className="w-16 bg-[#FFF8F0]/40 border border-stone-300 rounded-lg p-1 text-center font-semibold"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={meas.hip}
                        onChange={e => updateSizeChartField(sz, 'hip', e.target.value)}
                        className="w-16 bg-[#FFF8F0]/40 border border-stone-300 rounded-lg p-1 text-center font-semibold"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={meas.length}
                        onChange={e => updateSizeChartField(sz, 'length', e.target.value)}
                        className="w-16 bg-[#FFF8F0]/40 border border-stone-300 rounded-lg p-1 text-center font-semibold"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECURITY: ADMIN PASSWORD */}
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
            <Lock className="w-5 h-5 text-[#7B1E3A]" />
            <h2 className="font-serif-brand text-base font-bold text-[#7B1E3A]">
              Admin Security & Password
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-[#FFF8F0] border border-[#C9A24B]/30 rounded-2xl text-xs text-stone-700">
              <span className="font-bold text-[#7B1E3A] block mb-0.5">
                Current Admin Account: dhruvchavda7383@gmail.com
              </span>
              <span>
                Default Password: <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-[#7B1E3A]">Dhruv@Botad2025</code>
              </span>
            </div>

            {/* Change Local Password Input */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Set New Secret Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters..."
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
              </div>
              <button
                type="button"
                onClick={handleUpdatePassword}
                className="bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-5 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
              >
                Update Password Now
              </button>
            </div>

            {/* Firebase Reset Email Option */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <span className="text-stone-500">
                Or trigger a password reset email to dhruvchavda7383@gmail.com via Firebase:
              </span>
              <button
                type="button"
                disabled={sendingReset}
                onClick={handleSendPasswordReset}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0"
              >
                {sendingReset ? 'Sending...' : 'Send Reset Email'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-10 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
