import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('dhruvchavda7383@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const { login, resetPassword, isAdmin } = useAuth();
  const navigate = useNavigate();

  // If already logged in
  if (isAdmin) {
    navigate('/admin');
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/admin');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your admin email');
      return;
    }
    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setForgotMode(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-[#C9A24B]/40 shadow-xl space-y-6">
        
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#7B1E3A] text-[#FFF8F0] flex items-center justify-center p-1 border-2 border-[#C9A24B] shadow-md">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <h1 className="font-serif-brand text-2xl font-bold text-[#7B1E3A]">
            Owner Portal Login
          </h1>
          <p className="text-xs text-stone-500">
            Chamunda Fashion • Dhruv Chavda
          </p>
        </div>

        {!forgotMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 pl-10 pr-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-[11px] font-semibold text-[#7B1E3A] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 pl-10 pr-10 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7B1E3A] hover:bg-[#5e162c] text-white py-3 rounded-full font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              Enter your admin email to receive a password reset link from Firebase Auth.
            </p>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#FFF8F0]/40 border border-stone-300 rounded-xl py-2.5 pl-10 pr-3.5 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E3A]"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="w-1/2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 rounded-full font-semibold text-xs transition-colors"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 bg-[#7B1E3A] hover:bg-[#5e162c] text-white py-2.5 rounded-full font-bold text-xs transition-colors"
              >
                Send Reset Link
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 border-t border-stone-100 text-center">
          <Link
            to="/"
            className="text-xs text-stone-500 hover:text-[#7B1E3A] transition-colors"
          >
            ← Return to Customer Store
          </Link>
        </div>

      </div>
    </div>
  );
};
