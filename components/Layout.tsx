import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Wallet, ShoppingBag, Menu, X } from 'lucide-react';
import { Logo } from './Logo';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background text-slate-100 font-sans">
      {/* Navbar */}
      <nav className="border-b border-slate-700 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-3 group">
                <Logo className="w-10 h-10 transition-transform group-hover:scale-110" />
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  A CARDER
                </span>
              </Link>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'bg-primary text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}>
                  Store
                </Link>
                {user && (
                  <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard') ? 'bg-primary text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}>
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-primary text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700'}`}>
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>

            {/* Right Side Info */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                    <Wallet size={16} className="text-secondary" />
                    <span className="font-mono text-secondary font-bold">₹{user.walletBalance.toLocaleString()}</span>
                  </div>
                  <button onClick={handleLogout} className="text-slate-400 hover:text-white p-2">
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-primary hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-all">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
               <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300 hover:text-white p-2">
                 {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-b border-slate-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700">Store</Link>
              {user && <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700">Dashboard</Link>}
              {isAdmin && <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700">Admin Panel</Link>}
              {user ? (
                 <button onClick={() => {handleLogout(); setMobileMenuOpen(false)}} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-slate-700">Logout</button>
              ) : (
                 <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-slate-700">Login</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t border-slate-800 mt-12 py-8 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} A Carder. All rights reserved.</p>
          <p className="mt-2">Premium Digital Services</p>
        </div>
      </footer>
    </div>
  );
};