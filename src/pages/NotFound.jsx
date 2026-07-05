import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="bg-gradient-premium min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 text-center">
      <div className="glass-card max-w-md w-full p-8 rounded-3xl space-y-6 shadow-2xl border-slate-800">
        <div className="inline-flex p-4 bg-red-950/30 text-red-500 border border-red-900/40 rounded-full animate-bounce">
          <ShieldAlert size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-100">404 - Not Found</h2>
          <p className="text-slate-400 text-sm">The training routine or profile page you are requesting does not exist.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors w-full shadow shadow-emerald-600/10"
        >
          <Home size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
