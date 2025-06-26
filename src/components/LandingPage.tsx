import React, { useState, useEffect } from 'react';
import { Gift, Users, Trophy, Heart, Share2, ExternalLink, Calendar, Home, Search, Filter, TrendingUp, Clock, Star, MapPin, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Giveaway } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [allGiveaways, setAllGiveaways] = useState<Giveaway[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'ending'>('newest');
  const [likedGiveaways, setLikedGiveaways] = useState<Set<string>>(new Set());

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

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return 'Ending soon';
  };

  const handleGiveawayClick = (giveawayId: string) => {
    window.open(`?giveaway=${giveawayId}`, '_blank');
  };

  const handleLike = (giveawayId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedGiveaways(prev => {
      const newSet = new Set(prev);
      if (newSet.has(giveawayId)) {
        newSet.delete(giveawayId);
      } else {
        newSet.add(giveawayId);
      }
      return newSet;
    });
  };

  const handleShare = (giveaway: Giveaway, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}?giveaway=${giveaway.id}`;
    const text = `🎉 Check out this amazing giveaway: ${giveaway.title}! Win ${giveaway.prize}! 🏆`;
    
    if (navigator.share) {
      navigator.share({
        title: giveaway.title,
        text: text,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('Giveaway link copied to clipboard!');
    }
  };

  const filteredAndSortedGiveaways = React.useMemo(() => {
    let filtered = allGiveaways.filter(giveaway =>
      giveaway.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giveaway.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giveaway.prize.toLowerCase().includes(searchTerm.toLowerCase()) ||
      giveaway.organizer?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.entries.length - a.entries.length);
        break;
      case 'ending':
        filtered.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return filtered;
  }, [allGiveaways, searchTerm, sortBy]);

  const totalEntries = allGiveaways.reduce((sum, g) => sum + g.entries.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Gleam.io Style */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                  <Gift size={24} className="text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  GiveawayHub
                </span>
              </div>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">Giveaways</a>
                <a href="#" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">Browse</a>
                <a href="#" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">How it Works</a>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Giveaway
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Gleam.io Style */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing
            <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Giveaways
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Enter exciting giveaways from creators and brands worldwide. Win amazing prizes and discover new communities.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for giveaways, prizes, or creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 text-lg rounded-xl border-0 focus:ring-4 focus:ring-white/20 focus:outline-none text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">{allGiveaways.length}+</div>
              <div className="text-purple-100">Active Giveaways</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">{totalEntries.toLocaleString()}+</div>
              <div className="text-purple-100">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400">98%</div>
              <div className="text-purple-100">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredAndSortedGiveaways.length} Giveaways Found
              </h2>
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="ending">Ending Soon</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Showing all active giveaways</span>
            </div>
          </div>
        </div>
      </section>

      {/* Giveaways Grid - Gleam.io Style */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedGiveaways.length === 0 ? (
            <div className="text-center py-20">
              <Gift size={80} className="mx-auto text-gray-300 mb-6" />
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {searchTerm ? 'No giveaways found' : 'No active giveaways yet'}
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms or browse all giveaways'
                  : 'Be the first to create an amazing giveaway and start building your community!'
                }
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors mr-4"
                >
                  Clear Search
                </button>
              ) : null}
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Create First Giveaway
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedGiveaways.map((giveaway) => (
                <div
                  key={giveaway.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
                  onClick={() => handleGiveawayClick(giveaway.id)}
                >
                  {/* Giveaway Image */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100">
                    {giveaway.posterUrl ? (
                      <img
                        src={giveaway.posterUrl}
                        alt={giveaway.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Trophy size={48} className="text-purple-400" />
                      </div>
                    )}
                    
                    {/* Time Remaining Badge */}
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      <Clock size={14} className="inline mr-1" />
                      {getTimeRemaining(giveaway.endDate)}
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={(e) => handleLike(giveaway.id, e)}
                      className={`absolute top-4 left-4 p-2 rounded-full transition-colors ${
                        likedGiveaways.has(giveaway.id)
                          ? 'bg-red-500 text-white'
                          : 'bg-white/80 text-gray-600 hover:bg-red-500 hover:text-white'
                      }`}
                    >
                      <Heart size={16} className={likedGiveaways.has(giveaway.id) ? 'fill-current' : ''} />
                    </button>
                  </div>

                  {/* Giveaway Content */}
                  <div className="p-6">
                    {/* Organizer */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {giveaway.organizer?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{giveaway.organizer}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {giveaway.title}
                    </h3>

                    {/* Prize */}
                    <div className="flex items-center space-x-2 mb-4">
                      <Trophy size={16} className="text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-900 line-clamp-1">{giveaway.prize}</span>
                    </div>

                    {/* Entry Methods */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {giveaway.entryMethods.slice(0, 2).map((method) => (
                        <span
                          key={method.id}
                          className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full"
                        >
                          {method.description.split(' ')[0]}
                        </span>
                      ))}
                      {giveaway.entryMethods.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                          +{giveaway.entryMethods.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{giveaway.entries.length} entries</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Ends {new Date(giveaway.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGiveawayClick(giveaway.id);
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                      >
                        <Trophy size={16} />
                        <span>Enter Now</span>
                      </button>
                      <button
                        onClick={(e) => handleShare(giveaway, e)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Share2 size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More / CTA */}
          {filteredAndSortedGiveaways.length > 0 && (
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-12 border border-purple-200">
                <Star size={64} className="mx-auto text-yellow-500 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Ready to create your own giveaway?
                </h3>
                <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Join thousands of creators and businesses who use GiveawayHub to grow their audience and engage their community.
                </p>
                <button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 text-lg"
                >
                  Start Your Giveaway
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Gift size={32} className="text-purple-400" />
                <span className="text-2xl font-bold">GiveawayHub</span>
              </div>
              <p className="text-gray-400 text-lg mb-6 max-w-md">
                The ultimate platform for discovering and creating amazing giveaways. Connect with your audience and grow your community.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Facebook</span>
                  👥
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Instagram</span>
                  📷
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Browse Giveaways</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Create Giveaway</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 GiveawayHub. All rights reserved.</p>
            <p className="text-gray-400 mt-4 md:mt-0">Made with ❤️ for creators worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  );
}