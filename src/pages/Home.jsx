import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Dumbbell, Sparkles, Apple, BarChart, ChevronRight } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-gradient-premium min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 flex-grow flex flex-col justify-center items-center text-center space-y-8">
        {/* Decorative Badge */}
        <div className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider animate-pulse">
          <Sparkles size={14} />
          <span>Powered by Gemini 1.5 Flash</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-none max-w-4xl">
          Elevate Your Fitness Journey with <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">AI Intelligence</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl font-light">
          Get custom, dynamically-generated workout and nutrition regimes matched specifically to your biometrics, goals, and lifestyle. Log metrics, explore our workout directory, and track macros.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-md">
          {user ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 group"
            >
              <span>Go To Dashboard</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 group"
              >
                <span>Get Started Free</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-all duration-300"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 w-fit">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100">AI Plan Generator</h3>
            <p className="text-slate-400 text-sm">
              Use Gemini API to generate personalized training cycles and diet goals tailored to your biometrics and medical guidelines.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 w-fit">
              <Dumbbell size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Workout Database</h3>
            <p className="text-slate-400 text-sm">
              Explore dynamic library of exercises. Filter by difficulty, equipment, muscles, and goal styles. Bookmark your favorites.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 w-fit">
              <Apple size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Macro Calculator</h3>
            <p className="text-slate-400 text-sm">
              Log foods dynamically. Check macro-nutrient splits, calories count, and filter diets by food sensitivities.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-6 rounded-2xl flex flex-col space-y-3 hover:translate-y-[-4px] transition-transform duration-300">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 w-fit">
              <BarChart size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Progress Tracker</h3>
            <p className="text-slate-400 text-sm">
              Log weight fluctuations, track daily water hydration metrics, and view long-term performance charts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
