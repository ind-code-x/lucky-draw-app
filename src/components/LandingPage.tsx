import React, { useState, useEffect } from 'react';
import { Gift, Users, Trophy, BarChart3, Zap, Shield, Globe, Sparkles, ExternalLink, Calendar, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Giveaway } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [allGiveaways, setAllGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllGiveaways();
  }, []);

  const loadAllGiveaways = async () => {
    try {
      const { data, error } = await supabase
        .from('giveaways')
        .select(`
          *,
          entries (*),
          users (name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedGiveaways: Giveaway[] = (data || []).map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        prize: g.prize,
        platform: g.platform as any,
        status: g.status as any,
        startDate: g.start_date,
        endDate: g.end_date,
        entryMethods: g.entry_methods || [],
        entries: (g.entries || []).map((e: any) => ({
          id: e.id,
          giveawayId: e.giveaway_id,
          participantName: e.participant_name,
          participantEmail: e.participant_email,
          participantHandle: e.participant_handle,
          platform: e.platform as any,
          verified: e.verified,
          entryDate: e.entry_date,
        })),
        posterUrl: g.poster_url,
        socialPostId: g.social_post_id,
        userId: g.user_id,
        createdAt: g.created_at,
        updatedAt: g.updated_at,
        organizer: g.users?.name || 'Anonymous',
      }));

      // Filter out expired giveaways
      const activeGiveaways = transformedGiveaways.filter(g => {
        const endDate = new Date(g.endDate);
        const now = new Date();
        return endDate > now;
      });

      setAllGiveaways(activeGiveaways);
    } catch (error) {
      console.error('Error loading giveaways:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon';
  };

  const handleGiveawayClick = (giveawayId: string) => {
    window.open(`?giveaway=${giveawayId}`, '_blank');
  };

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

      {/* Live Giveaways Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              🔥 Live Giveaways
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join these amazing giveaways created by our community members
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading giveaways...</p>
            </div>
          ) : allGiveaways.length === 0 ? (
            <div className="text-center py-12">
              <Gift size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active giveaways yet</h3>
              <p className="text-gray-600 mb-6">Be the first to create an amazing giveaway!</p>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Create First Giveaway
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allGiveaways.slice(0, 6).map((giveaway) => (
                <div
                  key={giveaway.id}
                  onClick={() => handleGiveawayClick(giveaway.id)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 cursor-pointer overflow-hidden"
                >
                  {giveaway.posterUrl ? (
                    <img
                      src={giveaway.posterUrl}
                      alt={giveaway.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                      <Gift size={48} className="text-white" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        {getTimeRemaining(giveaway.endDate)}
                      </span>
                      <span className="text-sm text-gray-500">
                        by {giveaway.organizer}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {giveaway.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {giveaway.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Trophy size={16} />
                        <span className="font-medium">{giveaway.prize}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Users size={16} />
                        <span>{giveaway.entries.length} entries</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar size={12} />
                          <span>Ends {formatDate(giveaway.endDate)}</span>
                        </div>
                        <span className="text-purple-600 font-medium">Enter Now →</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {allGiveaways.length > 6 && (
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-4">
                {allGiveaways.length - 6} more giveaways available
              </p>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                View All Giveaways
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
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
      <section className="py-20 bg-white">
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
              { number: `${allGiveaways.length}+`, label: 'Active Giveaways' },
              { number: `${allGiveaways.reduce((sum, g) => sum + g.entries.length, 0)}+`, label: 'Participants Engaged' },
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