// HomePage.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Trophy, Users, Zap, Shield, Sparkles, Heart, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GiveawayCard } from '../components/giveaway/GiveawayCard'; // Assuming GiveawayCard is a separate component
import { useGiveawayStore } from '../stores/giveawayStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const { giveaways, loading, searchQuery, statusFilter, fetchGiveaways, setSearchQuery, setStatusFilter, addParticipant } = useGiveawayStore();
  const { user, isSubscribed, profile } = useAuthStore();

  const navigate = useNavigate();
  const [loadingEnterGiveaway, setLoadingEnterGiveaway] = useState<Record<string, boolean>>({}); 

  useEffect(() => {
    fetchGiveaways();
  }, [fetchGiveaways]);

  const filteredGiveaways = giveaways.filter(giveaway => {
    const matchesSearch = searchQuery === '' || 
      giveaway.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      giveaway.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || giveaway.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const scrollToGiveaways = () => {
    const element = document.getElementById('giveaways');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleEnterGiveaway = async (event: React.MouseEvent, giveaway: any) => {
      event.stopPropagation(); 
      if (!user) {
          toast.error("Please sign in to participate in giveaways.");
          navigate('/auth/login'); 
          return;
      }
      if (profile?.role === 'participant' && !isSubscribed) { 
          toast.error("You must have an active subscription to enter this giveaway.");
          navigate('/pricing'); 
          return;
      }

      setLoadingEnterGiveaway(prev => ({ ...prev, [giveaway.id]: true }));
      try {
          await addParticipant(giveaway.id, user.id);
          toast.success(`You have successfully entered "${giveaway.title}"! Good luck!`);
          await fetchGiveaways(); 
      } catch (error) {
          console.error('handleEnterGiveaway: Error adding participant:', error);
          if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
              toast.error('You have already entered this giveaway.'); 
          } else {
              toast.error(error instanceof Error ? error.message : 'Failed to enter giveaway.');
          }
      } finally {
          setLoadingEnterGiveaway(prev => ({ ...prev, [giveaway.id]: false }));
      }
  };

  const handleViewResults = (event: React.MouseEvent, giveawaySlug: string) => {
      event.stopPropagation(); 
      navigate(`/giveaway/${giveawaySlug}/results`); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-maroon-600 via-pink-600 to-rose-500 opacity-95"></div>
        <div className="absolute inset-0 bg-pattern-dots-white opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Sparkles className="w-12 h-12 text-white animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
              Discover Magical 
              <span className="block bg-gradient-to-r from-pink-200 to-rose-200 bg-clip-text text-transparent">
                Giveaways
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-pink-100 mb-10 max-w-4xl mx-auto leading-relaxed">
              Join thousands of dreamers in enchanting giveaways. Win incredible prizes 
              and connect with your favorite brands in a world of endless possibilities.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={scrollToGiveaways}
                size="xl" 
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-10"
              >
                <Heart className="w-5 h-5 mr-2" />
                Explore Giveaways
              </Button>
              <Button
                as={Link}
                to="/auth/signup"
                size="xl"
                variant="outline"
                className="border-2 border-pink-200 text-pink-100 hover:bg-pink-100 hover:text-maroon-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-10"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              Why Choose GiveawayHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The most enchanting platform for giveaways with magical features and seamless experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="bg-gradient-to-br from-maroon-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-maroon-800 mb-4">Magical Prizes</h3>
              <p className="text-gray-700 leading-relaxed">
                Discover giveaways with enchanting prizes from beloved brands and creators worldwide.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="bg-gradient-to-br from-rose-500 to-maroon-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-maroon-800 mb-4">Fair & Transparent</h3>
              <p className="text-gray-700 leading-relaxed">
                All drawings are conducted with complete fairness, transparency, and magical verification.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-maroon-50 to-rose-50 hover:from-maroon-100 hover:to-rose-100 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-maroon-800 mb-4">Effortless Entry</h3>
              <p className="text-gray-700 leading-relaxed">
                Simple, magical entry methods that take seconds. More entries, better chances of winning!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Giveaways Section */}
      <section id="giveaways" className="py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
            <div className="mb-8 lg:mb-0">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-4">
                All Available Giveaways
              </h2>
              <p className="text-xl text-gray-600">Join these magical giveaways before they end!</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Input
                  placeholder="Search magical giveaways..."
                  icon={Search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full lg:w-80 border-pink-200 focus:border-maroon-400 focus:ring-maroon-400 bg-white/80 backdrop-blur-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-pink-200 rounded-lg focus:border-maroon-400 focus:ring-maroon-400 bg-white/80 backdrop-blur-sm text-gray-700"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl h-96 animate-pulse shadow-lg">
                  <div className="h-48 bg-gradient-to-br from-pink-200 to-maroon-200 rounded-t-2xl"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-pink-200 rounded w-3/4"></div>
                    <div className="h-3 bg-pink-200 rounded w-full"></div>
                    <div className="h-3 bg-pink-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredGiveaways.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGiveaways.map((giveaway) => (
                // Changed this div to Link to make the whole card clickable for viewing details
                // Added a guard for giveaway.slug here.
                giveaway.slug ? ( // Only render Link if slug exists
                    <Link to={`/giveaway/${giveaway.id}`} key={giveaway.id} className="block"> {/* Changed to giveaway.id */}
                      <GiveawayCard giveaway={giveaway}> {/* Pass giveaway to card */}
                          {/* Pass specific buttons as children or props to GiveawayCard */}
                          <div className="flex flex-col space-y-2 mt-4">
                              {giveaway.status === 'active' ? ( // Check if active only
                                  <Button
                                      type="button"
                                      onClick={(event) => { // Use onClick with stopPropagation
                                          event.stopPropagation(); // Prevents Link's default navigation
                                          handleEnterGiveaway(event, giveaway);
                                      }}
                                      loading={loadingEnterGiveaway[giveaway.id]}
                                      icon={Heart}
                                      className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 w-full"
                                  >
                                      Enter Giveaway
                                  </Button>
                              ) : (
                                  // If giveaway is ended or any other status (not active), show "View Results"
                                  <Button
                                      type="button"
                                      onClick={(event) => {
                                          event.stopPropagation(); // Prevents Link's default navigation
                                          // Changed handleViewResults to use giveaway.id
                                          handleViewResults(event, giveaway.id); 
                                      }}
                                      icon={Trophy} // Use Trophy icon for View Results
                                      variant="outline"
                                      className="w-full border-maroon-600 text-maroon-600 hover:bg-maroon-50"
                                  >
                                      View Results
                                  </Button>
                              )}
                          </div>
                      </GiveawayCard>
                    </Link>
                ) : ( // Fallback if slug is missing, prevent Link from crashing
                    <div key={giveaway.id} className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
                        Error: Missing slug for giveaway (ID: {giveaway.id}). Cannot link.
                    </div>
                )
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gradient-to-br from-pink-100 to-rose-100 backdrop-blur-sm rounded-3xl p-12 shadow-xl max-w-md mx-auto">
                <Trophy className="w-20 h-20 text-pink-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-maroon-800 mb-4">No Giveaways Found</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters to find more magical giveaways.'
                    : 'Be the first to create an enchanting giveaway!'}
                </p>
                <Button 
                  as={Link} 
                  to="/auth/signup" 
                  className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Your Journey
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600 via-maroon-600 to-pink-700"></div>
        <div className="absolute inset-0 bg-pattern-circles-white opacity-20"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-8">
            <Shield className="w-12 h-12 text-pink-200 mx-auto" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Create Your Own
            <span className="block text-pink-200">Magical Giveaway?</span>
          </h2>
          
          <p className="text-xl text-pink-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of successful organizers who trust GiveawayHub to enchant their audience 
            and create unforgettable experiences.
          </p>
          
          <Button
            as={Link}
            to="/auth/signup"
            size="xl"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12"
          >
            <Heart className="w-5 h-5 mr-2" />
            Start Creating Magic Today
          </Button>
        </div>
      </section>
    </div>
  );
};
