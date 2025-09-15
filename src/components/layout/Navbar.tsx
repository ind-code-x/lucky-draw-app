import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gift, Menu, X, Plus, LogIn, LogOut, User, Heart, Crown, Instagram, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const { user, profile, signOut } = useAuthStore();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsToolsOpen(false);
    };
    
    if (isToolsOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isToolsOpen]);

  const navigation = [
    { name: 'Giveaways', href: '/' },
    { name: 'How it Works', href: '/how-it-works' },
    { name: 'Pricing', href: '/subscription' },
  ];

  const toolsDropdown = [
    { name: 'All Tools', href: '/tools' },
    { name: 'Instagram Comment Picker', href: '/tools/instagram-comment-picker', icon: Instagram },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isToolsActive = () => location.pathname.startsWith('/tools');

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-pink-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-br from-maroon-600 to-pink-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent">
              GiveawayHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive(item.href)
                    ? 'text-maroon-700 bg-pink-100 shadow-md'
                    : 'text-gray-700 hover:text-maroon-600 hover:bg-pink-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsToolsOpen(!isToolsOpen);
                }}
                className={`flex items-center space-x-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isToolsActive()
                    ? 'text-maroon-700 bg-pink-100 shadow-md'
                    : 'text-gray-700 hover:text-maroon-600 hover:bg-pink-50'
                }`}
              >
                <span>Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isToolsOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-pink-200 py-2 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {toolsDropdown.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-pink-50 hover:text-maroon-600 transition-colors duration-200"
                      onClick={() => setIsToolsOpen(false)}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {profile?.role === 'organizer' && (
                  <Button
                    as={Link}
                    to="/dashboard/create"
                    size="sm"
                    icon={Plus}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    Create Giveaway
                  </Button>
                )}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-pink-50 transition-all duration-300 group"
                >
                  <div className="bg-gradient-to-br from-maroon-500 to-pink-500 p-1.5 rounded-lg">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-maroon-700">
                    {profile?.username}
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  onClick={signOut}
                  className="text-gray-600 hover:text-maroon-600 hover:bg-pink-50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  as={Link}
                  to="/auth/login"
                  variant="ghost"
                  size="sm"
                  icon={LogIn}
                  className="text-gray-600 hover:text-maroon-600 hover:bg-pink-50"
                >
                  Sign In
                </Button>
                <Button
                  as={Link}
                  to="/auth/signup"
                  size="sm"
                  icon={Heart}
                  className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-pink-50 hover:text-maroon-600 focus:outline-none focus:ring-2 focus:ring-maroon-500 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-pink-200 bg-white/95 backdrop-blur-sm">
            <div className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-maroon-700 bg-pink-100 shadow-md'
                      : 'text-gray-700 hover:bg-pink-50 hover:text-maroon-600'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Tools */}
              <div className="px-4 py-2">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Tools</div>
                {toolsDropdown.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-2 py-2 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-maroon-600 rounded-lg transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-maroon-600 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {profile?.role === 'organizer' && (
                    <Link
                      to="/dashboard/create"
                      className="block px-4 py-3 text-base font-medium text-pink-600 hover:bg-pink-50 hover:text-maroon-600 rounded-xl transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Create Giveaway
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-maroon-600 rounded-xl transition-all duration-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:bg-pink-50 hover:text-maroon-600 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/signup"
                    className="block px-4 py-3 text-base font-medium text-maroon-600 hover:bg-pink-100 rounded-xl transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};