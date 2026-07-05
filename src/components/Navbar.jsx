import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Dumbbell, Sun, Moon, Menu, X, User as UserIcon, LogOut, LayoutDashboard, Calendar, Heart, Shield, Apple, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navLinks = user
    ? [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
        { name: 'Workouts', path: '/workouts', icon: <Dumbbell size={18} /> },
        { name: 'Diet DB', path: '/diet', icon: <Apple size={18} /> },
        { name: 'AI Planner', path: '/generate-plan', icon: <Sparkles size={18} /> },
        { name: 'History', path: '/history', icon: <Calendar size={18} /> },
        { name: 'Favorites', path: '/favorites', icon: <Heart size={18} /> },
      ]
    : [];

  return (
    <nav className="sticky top-0 z-50 glass-card bg-slate-900/90 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? '/dashboard' : '/'} className="flex items-center space-x-2 text-emerald-500 hover:text-emerald-400 transition-colors">
            <Dumbbell className="h-8 w-8 animate-bounce" />
            <span className="font-extrabold text-xl tracking-wider text-slate-100">
              Workout<span className="text-emerald-500">Mate</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:text-emerald-500 hover:bg-slate-800 transition-all duration-200"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-amber-500 hover:text-amber-400 hover:bg-slate-800 transition-all duration-200"
              >
                <Shield size={18} />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* Actions (Auth / Theme / User) */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-400" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 text-sm font-semibold hover:text-emerald-500 transition-colors"
                >
                  <UserIcon size={18} className="text-emerald-500" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-all duration-200 shadow-sm"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold hover:text-emerald-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-all duration-200"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-400" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-800 hover:text-emerald-500 focus:outline-none transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-card bg-slate-900 border-t border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:text-emerald-500 hover:bg-slate-800 transition-colors"
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-amber-500 hover:bg-slate-800 transition-colors"
              >
                <Shield size={18} />
                <span>Admin Panel</span>
              </Link>
            )}

            {user && (
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium hover:text-emerald-500 hover:bg-slate-800 transition-colors"
              >
                <UserIcon size={18} />
                <span>Profile ({user.name})</span>
              </Link>
            )}

            <div className="pt-4 pb-2 border-t border-slate-800 px-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2 text-base font-medium hover:text-emerald-500 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full text-center py-2 rounded-md text-base font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
