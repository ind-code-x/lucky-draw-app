import React from 'react';
import { Gift, Users, Trophy, BarChart3, Zap, Shield, Globe, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Gift size={32} className="text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GiveawayHub
              </span>
            </div>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full shadow-2xl animate-pulse">
                <Gift size={48} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Create Amazing{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Giveaways
              </span>
              <br />
              Across All Platforms
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Launch engaging giveaways on Instagram, Facebook, Twitter, TikTok, and more. 
              Grow your audience, boost engagement, and manage everything from one powerful dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Creating Free
              </button>
              <button className="border-2 border-purple-200 text-purple-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-50 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-bounce">
          <div className="bg-yellow-400 p-3 rounded-full shadow-lg">
            <Trophy size={24} className="text-white" />
          </div>
        </div>
        <div className="absolute top-32 right-20 animate-bounce delay-300">
          <div className="bg-green-400 p-3 rounded-full shadow-lg">
            <Users size={24} className="text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce delay-700">
          <div className="bg-pink-400 p-3 rounded-full shadow-lg">
            <Sparkles size={24} className="text-white" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Successful Giveaways
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From creation to winner selection, we've got you covered with powerful tools and analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Multi-Platform Support',
                description: 'Create giveaways for Instagram, Facebook, Twitter, TikTok, YouTube, and WhatsApp all in one place.',
                color: 'bg-blue-500'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Lightning Fast Setup',
                description: 'Launch your giveaway in minutes with our intuitive wizard and pre-built templates.',
                color: 'bg-yellow-500'
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Advanced Analytics',
                description: 'Track engagement, entries, and performance with detailed insights and reporting.',
                color: 'bg-green-500'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Entry Management',
                description: 'Automatically collect and verify entries with smart validation and fraud detection.',
                color: 'bg-purple-500'
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: 'Fair Winner Selection',
                description: 'Transparent random winner selection with verification and announcement tools.',
                color: 'bg-pink-500'
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Compliance & Security',
                description: 'Built-in legal compliance features and secure data handling for peace of mind.',
                color: 'bg-indigo-500'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
              >
                <div className={`${feature.color} p-3 rounded-full w-fit mb-4`}>
                  {React.cloneElement(feature.icon, { className: 'w-8 h-8 text-white' })}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '10,000+', label: 'Giveaways Created' },
              { number: '1M+', label: 'Participants Engaged' },
              { number: '98%', label: 'Success Rate' }
            ].map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl text-purple-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Boost Your Engagement?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators and businesses who trust GiveawayHub for their social media growth.
          </p>
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Your First Giveaway
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Gift size={24} className="text-purple-400" />
              <span className="text-lg font-bold">GiveawayHub</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 GiveawayHub. All rights reserved.</p>
              <p className="text-sm mt-1">satikajagath.co.in</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}