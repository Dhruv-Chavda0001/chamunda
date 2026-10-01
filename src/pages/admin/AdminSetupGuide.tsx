import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Copy,
  ExternalLink,
  Flame,
  Mail,
  Shield,
  Upload,
  Globe,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSetupGuide: React.FC = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const emailJsTemplateText = `Subject: New Chamunda Fashion Order {{order_id}} (₹{{total_amount}})

Hello Dhruv,

You have received a new order on Chamunda Fashion!

ORDER DETAILS:
Order ID: {{order_id}}
Date: {{date}}
Total Paid: {{total_amount}}
12-Digit UTR: {{utr_number}}

CUSTOMER INFORMATION:
Name: {{customer_name}}
Phone: {{customer_phone}}
Email: {{customer_email}}
Delivery Address: {{delivery_address}}

ORDER ITEMS:
{{items_summary}}

VIEW & VERIFY ORDER IN ADMIN:
{{admin_order_url}}

Please verify the payment in your bank app and pack the order!
- Chamunda Fashion Botad`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <span className="text-xs font-bold text-[#C9A24B] uppercase tracking-wider">
          Owner Handbook
        </span>
        <h1 className="font-serif-brand text-2xl sm:text-3xl font-bold text-[#7B1E3A]">
          Step-by-Step Store Setup Guide
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Everything Dhruv Chavda needs to know to manage, connect live cloud services, and launch Chamunda Fashion for ₹0 hosting cost.
        </p>
      </div>

      {/* Guide Content */}
      <div className="space-y-6 text-xs md:text-sm">
        
        {/* Step 1: Firebase Free Tier Setup */}
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#7B1E3A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              1
            </span>
            <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
              Firebase Setup (Spark Free Plan - ₹0 Cost)
            </h2>
          </div>

          <p className="text-stone-600 leading-relaxed">
            Firebase gives you a 100% free database (Firestore), user authentication, and image storage that easily handles 50,000 reads/day and 10+ orders daily on the free Spark plan.
          </p>

          <ol className="list-decimal pl-5 space-y-2 text-stone-700 leading-relaxed">
            <li>
              Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-[#7B1E3A] font-bold underline inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3" /></a> and sign in with your Google account.
            </li>
            <li>Click <strong>Add Project</strong>, name it <strong>chamunda-fashion</strong>, and disable Google Analytics for simplicity.</li>
            <li>
              <strong>Enable Authentication:</strong> Go to <em>Build → Authentication</em>, click <em>Get Started</em>, enable <strong>Email/Password</strong>, then click <em>Add User</em> and enter your admin email: <code>dhruvchavda7383@gmail.com</code> and your secure password.
            </li>
            <li>
              <strong>Enable Firestore Database:</strong> Go to <em>Build → Firestore Database</em>, click <em>Create database</em>, choose region <code>asia-south1 (Mumbai)</code> for fastest speed in Gujarat, and start in production mode.
            </li>
            <li>
              <strong>Deploy Firestore Rules:</strong> Copy the provided <code>firestore.rules</code> file from this repository and paste it into the <em>Firestore → Rules</em> tab, then click <strong>Publish</strong>.
            </li>
            <li>
              <strong>Enable Storage:</strong> Go to <em>Build → Storage</em>, click <em>Get started</em>, select Mumbai region, and publish the provided <code>storage.rules</code>.
            </li>
            <li>
              <strong>Get API Keys:</strong> Go to <em>Project Settings (Gear icon) → General → Your apps</em>, click the Web icon (<code>&lt;/&gt;</code>), copy the configuration values, and paste them into your <code>.env</code> file.
            </li>
          </ol>
        </div>

        {/* Step 2: EmailJS Free Order Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#7B1E3A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              2
            </span>
            <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
              EmailJS Setup (Free Order Email to dhruvchavda7383@gmail.com)
            </h2>
          </div>

          <p className="text-stone-600 leading-relaxed">
            EmailJS lets your website send order alert emails directly from the browser without needing paid backend servers or Cloud Functions. The free plan gives you 200 emails/month (plenty for 10 orders/day).
          </p>

          <ol className="list-decimal pl-5 space-y-2 text-stone-700 leading-relaxed">
            <li>
              Sign up for free at <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-[#7B1E3A] font-bold underline inline-flex items-center gap-0.5">EmailJS.com <ExternalLink className="w-3 h-3" /></a>.
            </li>
            <li>Click <strong>Email Services → Add New Service</strong>, choose <strong>Gmail</strong>, and connect your <code>dhruvchavda7383@gmail.com</code> account. Copy your <strong>Service ID</strong>.</li>
            <li>
              Click <strong>Email Templates → Create New Template</strong>. In the template editor, paste the template below:
            </li>
          </ol>

          <div className="relative bg-[#FFF8F0] p-4 rounded-2xl border border-stone-300 font-mono text-xs">
            <button
              onClick={() => copyToClipboard(emailJsTemplateText, 'emailjs')}
              className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-lg border text-[#7B1E3A] font-bold flex items-center gap-1 shadow-xs hover:bg-stone-50"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey === 'emailjs' ? 'Copied!' : 'Copy Template'}</span>
            </button>
            <pre className="whitespace-pre-wrap text-stone-800 pr-20">{emailJsTemplateText}</pre>
          </div>

          <p className="text-stone-600">
            Finally, go to <em>Account → API Keys</em> and copy your <strong>Public Key</strong>. Add the Service ID, Template ID, and Public Key to your <code>.env</code> file.
          </p>
        </div>

        {/* Step 3: Deploy to Vercel or Netlify */}
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#7B1E3A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              3
            </span>
            <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
              Free Deployment on Vercel or Netlify
            </h2>
          </div>

          <ol className="list-decimal pl-5 space-y-2 text-stone-700 leading-relaxed">
            <li>Push this code to your GitHub repository (private or public).</li>
            <li>Go to <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-[#7B1E3A] font-bold underline">Vercel.com</a>, log in with GitHub, and click <strong>Add New Project</strong>.</li>
            <li>Select your repository. Under <strong>Environment Variables</strong>, paste your Firebase and EmailJS environment variables from your <code>.env</code> file.</li>
            <li>Click <strong>Deploy</strong>! In about 45 seconds, your boutique website will be live.</li>
            <li>
              <strong>Custom Domain:</strong> In Vercel Project Settings → Domains, enter your domain name like <code>chamundafashion.in</code> and add the 2 DNS records (A Record: <code>76.76.21.21</code>) in your domain registrar (GoDaddy, Namecheap, or Hostinger).
            </li>
          </ol>
        </div>

        {/* Step 4: Testing Checklist */}
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#7B1E3A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              4
            </span>
            <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
              Testing Checklist Before Launch
            </h2>
          </div>

          <div className="space-y-2 text-stone-700">
            <label className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Enter your UPI ID and upload your QR code in <strong>Admin → Settings</strong></span>
            </label>
            <label className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Browse the shop in all 3 languages (English, Hindi, Gujarati) using the header switcher</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Pick a kurti, select size, add to cart, and test the checkout flow</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verify that checkout blocks order submission if the no return/exchange checkbox is unticked</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Upload a sample payment screenshot, enter 12-digit UTR, and place the test order</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Open <strong>Admin → Orders</strong>: listen for the sound chime, check the red NEW badge, inspect the screenshot, and print a test packing slip</span>
            </label>
            <label className="flex items-center gap-2.5 p-2 bg-stone-50 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Click "Delete Demo Products" in <strong>Admin → Products</strong> when ready to list your real items</span>
            </label>
          </div>
        </div>

        {/* Step 5: Limitations and Future Upgrades */}
        <div className="bg-white rounded-3xl p-6 border border-[#C9A24B]/30 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#7B1E3A] text-white flex items-center justify-center font-bold text-xs shrink-0">
              5
            </span>
            <h2 className="font-serif-brand text-lg font-bold text-[#7B1E3A]">
              Limitations & Future Upgrades Roadmap
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-stone-700">
            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-stone-200 space-y-1">
              <strong className="text-stone-900 block font-bold">1. Razorpay / Cashfree Automated UPI</strong>
              <p className="text-xs text-stone-600 leading-relaxed">
                Currently, payments are verified manually with screenshots and UTR numbers. Later, when you register a GST/Current account, you can plug in Razorpay to automatically mark orders as paid without inspecting screenshots.
              </p>
            </div>

            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-stone-200 space-y-1">
              <strong className="text-stone-900 block font-bold">2. WhatsApp Cloud API / Twilio</strong>
              <p className="text-xs text-stone-600 leading-relaxed">
                Currently, the success page generates a prefilled WhatsApp link for the customer to send. An automated WhatsApp bot requires Meta WhatsApp Cloud API credentials and a business verification badge.
              </p>
            </div>

            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-stone-200 space-y-1">
              <strong className="text-stone-900 block font-bold">3. Discount Coupon Codes</strong>
              <p className="text-xs text-stone-600 leading-relaxed">
                The codebase architecture in <code>/src/context/CartContext.tsx</code> is modular, making it simple to add a promo code coupon box (e.g. <code>FESTIVE10</code>) when you wish to run influencer campaigns.
              </p>
            </div>

            <div className="p-4 bg-[#FFF8F0] rounded-2xl border border-stone-200 space-y-1">
              <strong className="text-stone-900 block font-bold">4. Customer Login & Wishlist</strong>
              <p className="text-xs text-stone-600 leading-relaxed">
                Customers currently enjoy frictionless guest checkout without remembering passwords. You can enable Firebase Phone Auth for one-click OTP login in the future.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
