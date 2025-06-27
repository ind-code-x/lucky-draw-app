import React from 'react';
import { Gift, Users, Trophy, BarChart3, Zap, Shield, Globe, Sparkles, ExternalLink } from 'lucide-react';

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
            <div className="flex items-center space-x-4">
              <a
                href="?giveaway=demo"
                className="text-purple-600 hover:text-purple-700 transition-colors flex items-center space-x-1"
              >
                <span>View Demo Giveaway</span>
                <ExternalLink size={16} />
              </a>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
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
              That Run on Your Website
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Build engaging giveaways that participants enter directly on your website. 
              Get a shareable URL to promote across all social media platforms and track everything from one dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Creating Free
              </button>
              <a
                href="?giveaway=demo"
                className="border-2 border-purple-200 text-purple-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2"
              >
                <span>View Demo</span>
                <ExternalLink size={20} />
              </a>
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
              Complete End-to-End Giveaway Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything runs on your website. Create, share, and manage giveaways with a single shareable URL.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Hosted Giveaway Pages',
                description: 'Each giveaway gets a beautiful, mobile-friendly page that participants can access directly.',
                color: 'bg-blue-500'
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'One-Click Sharing',
                description: 'Get a shareable URL to promote on Instagram, Facebook, Twitter, TikTok, and anywhere else.',
                color: 'bg-yellow-500'
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: 'Direct Entry Collection',
                description: 'Participants enter directly on your website. No third-party redirects or complicated flows.',
                color: 'bg-green-500'
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: 'Real-Time Analytics',
                description: 'Track entries, engagement, and performance with detailed insights and reporting.',
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
                title: 'Built-in Fraud Protection',
                description: 'Automatic duplicate detection and entry validation to ensure fair participation.',
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

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple 3-step process to launch your giveaway
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Create Your Giveaway',
                description: 'Set up your prize, entry requirements, and upload an eye-catching poster.',
                color: 'bg-purple-500'
              },
              {
                step: '2',
                title: 'Get Your Shareable URL',
                description: 'Receive a beautiful giveaway page URL that you can share anywhere.',
                color: 'bg-blue-500'
              },
              {
                step: '3',
                title: 'Share & Track',
                description: 'Promote your giveaway URL on social media and watch entries roll in.',
                color: 'bg-green-500'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6`}>
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
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
            Ready to Launch Your First Giveaway?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of creators and businesses who use GiveawayHub to grow their audience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Your First Giveaway
            </button>
            <a
              href="?giveaway=demo"
              className="border-2 border-purple-200 text-purple-600 px-8 py-4 rounded-full text-lg font-medium hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Try the Demo</span>
              <ExternalLink size={20} />
            </a>
          </div>
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
              <p className="text-sm mt-1">Complete giveaway platform for creators and businesses</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}