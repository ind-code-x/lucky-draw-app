import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, Twitter, Github, Mail, Heart, Sparkles, Crown } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-pink-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern-dots-white opacity-30"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-pink-500 to-rose-400 p-3 rounded-xl shadow-lg">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-200 to-rose-200 bg-clip-text text-transparent">
                GiveawayHub
              </span>
            </div>
            <p className="text-pink-200 text-sm leading-relaxed">
              The most enchanting platform for creating and managing online giveaways. 
              Engage your audience and grow your community with magical experiences.
            </p>
            <div className="flex items-center space-x-2 text-pink-300">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Made with love for dreamers</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-pink-200 mb-6 text-lg">Quick Links</h3>
            <div className="space-y-4">
              <Link 
                to="/" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Browse Giveaways
              </Link>
              <Link 
                to="/how-it-works" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                How it Works
              </Link>
              <Link 
                to="/subscription" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                <Crown className="w-4 h-4 inline mr-1" />
                Pricing Plans
              </Link>
              <Link 
                to="/auth/signup" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* For Organizers */}
          <div>
            <h3 className="font-bold text-pink-200 mb-6 text-lg">For Organizers</h3>
            <div className="space-y-4">
              <Link 
                to="/dashboard/create" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Create Giveaway
              </Link>
              <Link 
                to="/dashboard" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Dashboard
              </Link>
              <Link 
                to="/subscription" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Premium Plans
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-pink-200 mb-6 text-lg">Support</h3>
            <div className="space-y-4">
              <Link 
                to="/help" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Help Center
              </Link>
              <Link 
                to="/contact" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Contact Us
              </Link>
              <Link 
                to="/privacy" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className="block text-pink-300 hover:text-white transition-colors duration-300 hover:translate-x-1 transform"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-pink-800/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <p className="text-pink-300 text-sm">
              © 2025 GiveawayHub. All rights reserved. Spreading magic worldwide.
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-300 hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-300 hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:support@giveawayhub.com"
              className="text-pink-300 hover:text-white transition-all duration-300 transform hover:scale-110"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};