import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
      <div className="font-serif-brand text-7xl font-extrabold text-[#7B1E3A]">
        404
      </div>
      <h1 className="font-serif-brand text-2xl font-bold text-stone-800">
        Page Not Found
      </h1>
      <p className="text-xs text-stone-600 leading-relaxed">
        The page you are looking for doesn't exist or has been moved. Explore our latest women's fashion collection.
      </p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#7B1E3A] hover:bg-[#5e162c] text-white px-7 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};
