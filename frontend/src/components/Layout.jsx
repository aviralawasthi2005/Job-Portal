import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Stethoscope, HeartPulse, Sparkles, MapPin, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      
      {/* Sticky Premium Navbar with Glassmorphism */}
      <header className="sticky top-0 z-50 glass-nav shadow-sm select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo with formal clinical accent */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-health-600 text-white rounded-lg shadow-sm group-hover:bg-health-700 transition-colors duration-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                CareJobs
              </span>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase -mt-0.5">
                Healthcare Remote Portal
              </span>
            </div>
          </Link>

          {/* Quick Info & Navigation & Theme Toggle */}
          <nav className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span>Verified Remote Medical Positions</span>
            </div>

            <Link
              to="/admin/post"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-health-600 hover:bg-health-700 text-white shadow-sm hover:shadow transition-all duration-200 flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post a Job</span>
            </Link>

            {/* Premium Theme Toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
              aria-label="Toggle Theme"
              id="theme-toggle-btn"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Core Container */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10">
        {children}
      </main>

      {/* Modern, sleek footer */}
      <footer className="z-10 border-t border-slate-200 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 py-8 text-center text-sm text-slate-500 dark:text-slate-400 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-health-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">CareJobs</span>
            <span>&copy; {new Date().getFullYear()} — Made with Care.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
