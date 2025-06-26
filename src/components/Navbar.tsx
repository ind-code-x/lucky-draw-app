import React from 'react';
import { Gift, User, LogOut, Menu, X, CreditCard, Home } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  if (!user) return null;

  const getSubscriptionBadge = () => {
    const status = user.subscriptionStatus;
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      premium: 'bg-purple-100 text-purple-800',
      pro: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation('dashboard')}
              className="flex items-center space-x-3 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Gift size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GiveawayHub
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('landing')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                currentPage === 'landing'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Home size={16} />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleNavigation('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavigation('create')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'create'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Create Giveaway
            </button>
            <button
              onClick={() => handleNavigation('analytics')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentPage === 'analytics'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => handleNavigation('subscription')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                currentPage === 'subscription'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <CreditCard size={16} />
              <span>Plans</span>
            </button>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <User size={16} className="text-purple-600" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                {getSubscriptionBadge()}
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => handleNavigation('landing')}
              className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentPage === 'landing'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <Home size={16} />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleNavigation('dashboard')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => handleNavigation('create')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentPage === 'create'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Create Giveaway
            </button>
            <button
              onClick={() => handleNavigation('analytics')}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentPage === 'analytics'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => handleNavigation('subscription')}
              className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                currentPage === 'subscription'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <CreditCard size={16} />
              <span>Plans</span>
            </button>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-100">
            <div className="flex items-center px-5 space-x-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-purple-600" />
                </div>
              )}
              <div>
                <div className="text-base font-medium text-gray-800">{user.name}</div>
                <div className="text-sm text-gray-500 flex items-center space-x-2">
                  <span>{user.email}</span>
                  {getSubscriptionBadge()}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2">
              <button
                onClick={logout}
                className="flex items-center space-x-2 w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}