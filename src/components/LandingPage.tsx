import React, { useState, useEffect } from 'react';
import { Gift, Users, Trophy, Heart, MessageCircle, Share2, ExternalLink, Calendar, Home, Search, Filter, TrendingUp, Clock, Star } from 'lucide-react';
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
      {/* Header - Social Media Style */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-full">
                  <Gift size={24} className="text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  GiveawayHub
                </span>
              </div>
              
              {/* Search Bar */}
              <div className="hidden md:flex relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search giveaways..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort Filter */}
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="newest">Newest</option>
                  <option value="popular">Most Popular</option>
                  <option value="ending">Ending Soon</option>
                </select>
              </div>

              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Giveaway
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search giveaways..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Trophy size={16} className="text-purple-600" />
              <span><strong>{allGiveaways.length}</strong> Active Giveaways</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users size={16} className="text-blue-600" />
              <span><strong>{totalEntries.toLocaleString()}</strong> Total Entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-green-600" />
              <span><strong>98%</strong> Success Rate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Social Feed Style */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-64 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedGiveaways.length === 0 ? (
          <div className="text-center py-16">
            <Gift size={64} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              {searchTerm ? 'No giveaways found' : 'No active giveaways yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms or browse all giveaways'
                : 'Be the first to create an amazing giveaway and start building your community!'
              }
            </p>
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors mr-4"
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
          <div className="space-y-6">
            {filteredAndSortedGiveaways.map((giveaway) => (
              <div
                key={giveaway.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {giveaway.organizer?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{giveaway.organizer}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{formatDate(giveaway.createdAt)}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span className="text-orange-600 font-medium">{getTimeRemaining(giveaway.endDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-6 pb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{giveaway.title}</h2>
                  <p className="text-gray-700 mb-4 leading-relaxed">{giveaway.description}</p>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <Trophy size={20} className="text-yellow-600" />
                    <span className="font-semibold text-gray-900">Prize: {giveaway.prize}</span>
                  </div>
                </div>

                {/* Post Image */}
                {giveaway.posterUrl && (
                  <div 
                    className="cursor-pointer"
                    onClick={() => handleGiveawayClick(giveaway.id)}
                  >
                    <img
                      src={giveaway.posterUrl}
                      alt={giveaway.title}
                      className="w-full h-80 object-cover hover:opacity-95 transition-opacity"
                    />
                  </div>
                )}

                {/* Engagement Bar */}
                <div className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={(e) => handleLike(giveaway.id, e)}
                        className={`flex items-center space-x-2 transition-colors ${
                          likedGiveaways.has(giveaway.id)
                            ? 'text-red-600'
                            : 'text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <Heart 
                          size={20} 
                          className={likedGiveaways.has(giveaway.id) ? 'fill-current' : ''} 
                        />
                        <span className="text-sm font-medium">
                          {likedGiveaways.has(giveaway.id) ? 'Liked' : 'Like'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleGiveawayClick(giveaway.id)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle size={20} />
                        <span className="text-sm font-medium">Enter</span>
                      </button>

                      <button
                        onClick={(e) => handleShare(giveaway, e)}
                        className="flex items-center space-x-2 text-gray-500 hover:text-green-600 transition-colors"
                      >
                        <Share2 size={20} />
                        <span className="text-sm font-medium">Share</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users size={16} />
                        <span>{giveaway.entries.length} entries</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={16} />
                        <span>Ends {new Date(giveaway.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Entry Methods Preview */}
                <div className="px-6 pb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">How to enter:</h4>
                    <div className="flex flex-wrap gap-2">
                      {giveaway.entryMethods.slice(0, 3).map((method, index) => (
                        <span
                          key={method.id}
                          className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full"
                        >
                          {method.description}
                        </span>
                      ))}
                      {giveaway.entryMethods.length > 3 && (
                        <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                          +{giveaway.entryMethods.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleGiveawayClick(giveaway.id)}
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                      <Trophy size={16} />
                      <span>Enter Giveaway</span>
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More / Pagination could go here */}
        {filteredAndSortedGiveaways.length > 0 && (
          <div className="text-center mt-12 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <Star size={48} className="mx-auto text-yellow-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to create your own giveaway?
              </h3>
              <p className="text-gray-600 mb-6">
                Join the community and start engaging with your audience today!
              </p>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Create Your Giveaway
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Gift size={24} className="text-purple-400" />
              <span className="text-lg font-bold">GiveawayHub</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>&copy; 2024 GiveawayHub. All rights reserved.</p>
              <p className="text-sm mt-1">The social platform for amazing giveaways</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}