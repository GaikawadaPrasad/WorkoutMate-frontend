import React from 'react';
import { Dumbbell } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo & Copyright */}
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-emerald-500" />
            <span className="font-bold text-slate-200 tracking-wide">
              Workout<span className="text-emerald-500">Mate</span>
            </span>
            <span className="text-sm">© {new Date().getFullYear()} All Rights Reserved.</span>
          </div>

          {/* Slogan */}
          <div className="text-center md:text-right text-xs text-slate-500">
            Powered by MERN & Google Gemini API. Dynamic AI Fitness & Meal Planner.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
