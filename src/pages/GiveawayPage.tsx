// src/pages/GiveawayPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Gift,
  Calendar,
  Users,
  Clock,
  Sparkles,
  Heart,
  CheckCircle,
  AlertCircle,
  Trophy,
  Mail,
  ExternalLink,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Globe,
  Loader2,
  Award,
  Crown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useGiveawayStore } from '../stores/giveawayStore';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export const GiveawayPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, isSubscribed } = useAuthStore();
  const { currentGiveaway, fetchGiveaway, addParticipant } = useGiveawayStore();

  const [loadingGiveaway, setLoadingGiveaway] = useState(true);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [loadingParticipation, setLoadingParticipation] = useState(false);
  const [winners, setWinners] = useState<any[]>([]);
  const [loadingWinners, setLoadingWinners] = useState(false);

  useEffect(() => {
    const loadGiveaway = async () => {
      if (id) {
        setLoadingGiveaway(true);
        try {
          await fetchGiveaway(id);
        } catch (error) {
          console.error('Error fetching giveaway:', error);
          toast.error('Failed to load giveaway details.');
          navigate('/');
        } finally {
          setLoadingGiveaway(false);
        }
      }
    };
    loadGiveaway();
  }, [id, fetchGiveaway, navigate]);

  // Check if current user has participated
  useEffect(() => {
    const checkParticipation = async () => {
      if (user && currentGiveaway?.id) {
        const { data, error } = await supabase
          .from('participants')
          .select('id')
          .eq('giveaway_id', currentGiveaway.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data) {
          setHasParticipated(true);
        } else {
          setHasParticipated(false);
        }
      } else {
        setHasParticipated(false);
      }
    };
    checkParticipation();
  }, [user, currentGiveaway?.id]);

  // Fetch winners for ended giveaways
  useEffect(() => {
    const fetchWinners = async () => {
      if (currentGiveaway?.id && new Date(currentGiveaway.end_time) < new Date()) {
        setLoadingWinners(true);
        try {
          const { data, error } = await supabase
            .from('winners')
            .select(`
              id,
              status,
              drawn_at,
              prizes(name, value, description),
              participants(
                id,
               user_id(username, email)
              )
            `)
            .eq('giveaway_id', currentGiveaway.id);

          if (error) {
            console.error('Error fetching winners:', error);
          } else {
            setWinners(data || []);
          }
        } catch (error) {
          console.error('Error in fetchWinners:', error);
        } finally {
          setLoadingWinners(false);
        }
      }
    };
    fetchWinners();
  }, [currentGiveaway?.id]);

  const handleEnterGiveaway = async () => {
    if (!user) {
      toast.error('Please sign in to participate.');
      navigate('/auth/login');
      return;
    }
    if (hasParticipated) {
      toast.info('You have already entered this giveaway!');
      return;
    }
    if (profile?.role === 'participant' && !isSubscribed) {
      toast.error('You must have an active subscription to enter this giveaway.');
      navigate('/pricing');
      return;
    }
    
    setLoadingParticipation(true);
    
    try {
      await addParticipant(currentGiveaway!.id, user.id);
      setHasParticipated(true);
      toast.success('You have successfully entered this giveaway! Good luck!');
    } catch (error) {
      console.error('Error entering giveaway:', error);
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        toast.error('You have already entered this giveaway.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to enter giveaway.');
      }
    } finally {
      setLoadingParticipation(false);
    }
  };

  const getMethodIcon = (methodType: string) => {
    const Icon = entryMethodOptions.find(option => option.value === methodType)?.icon;
    return Icon ? <Icon className="w-5 h-5 text-pink-600 mr-2" /> : <Globe className="w-5 h-5 text-pink-600 mr-2" />;
  };

  const entryMethodOptions = [
    { value: 'instagram_follow', label: 'Follow on Instagram', icon: Instagram },
    { value: 'twitter_follow', label: 'Follow on Twitter', icon: Twitter },
    { value: 'facebook_like', label: 'Like Facebook Page', icon: Facebook },
    { value: 'youtube_subscribe', label: 'Subscribe on YouTube', icon: Youtube },
    { value: 'email_signup', label: 'Join Email List', icon: Mail },
    { value: 'website_visit', label: 'Visit Website', icon: Globe },
  ];

  if (loadingGiveaway) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
        <Loader2 className="w-16 h-16 text-maroon-600 animate-spin" />
        <p className="text-lg text-gray-600 ml-4">Loading giveaway details...</p>
      </div>
    );
  }

  if (!currentGiveaway) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-maroon-800 mb-2">Giveaway Not Found</h2>
        <p className="text-gray-600 mb-8">The giveaway you are looking for does not exist or an error occurred.</p>
        <Button as={Link} to="/" className="bg-gradient-to-r from-maroon-600 to-pink-600">Back to Giveaways</Button>
      </div>
    );
  }

  const giveawayStatus = currentGiveaway.status;
  const isGiveawayActive = giveawayStatus === 'active';
  const hasEnded = new Date(currentGiveaway.end_time) < new Date();
  const isOrganizer = user?.id === currentGiveaway.organizer_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Giveaway Header */}
        <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl mb-8">
          {currentGiveaway.banner_url && (
            <img src={currentGiveaway.banner_url} alt={currentGiveaway.title} className="w-full h-64 object-cover rounded-t-xl" />
          )}
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-2">
              {currentGiveaway.title}
            </CardTitle>
            <p className="text-lg text-gray-600">by {currentGiveaway.profiles?.username || 'Unknown Organizer'}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-6 text-gray-700">
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-pink-600" />
                {currentGiveaway.total_entries || 0} Entries
              </span>
              <span className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-pink-600" />
                Ends: {new Date(currentGiveaway.end_time).toLocaleString()}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold block w-fit mx-auto ${
              isGiveawayActive && !hasEnded ? 'bg-green-100 text-green-800' :
              hasEnded ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {isGiveawayActive && !hasEnded ? 'Active' : hasEnded ? 'Ended' : currentGiveaway.status}
            </span>

            {/* Action Button */}
            {!isOrganizer && !hasEnded ? (
                <Button
                    onClick={handleEnterGiveaway}
                    loading={loadingParticipation}
                    fullWidth
                    size="lg"
                    icon={Heart}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 shadow-lg"
                    disabled={hasParticipated}
                >
                    {hasParticipated ? 'Already Entered!' : 'Enter Giveaway'}
                </Button>
            ) : isOrganizer ? (
                <Button
                    as={Link}
                    to={`/dashboard/giveaway/${currentGiveaway.slug}`}
                    fullWidth
                    size="lg"
                    icon={Sparkles}
                    className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg"
                >
                    Manage Giveaway
                </Button>
            ) : null }
          </CardContent>
        </Card>

        {/* Winners Section for Ended Giveaways */}
        {hasEnded && (
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Trophy className="w-6 h-6 mr-3 text-pink-600" />
                🎉 Winners
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingWinners ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-maroon-600 animate-spin mr-3" />
                  <span className="text-gray-600">Loading winners...</span>
                </div>
              ) : winners.length > 0 ? (
                <div className="space-y-4">
                  {winners.map((winner, index) => (
                    <div
                      key={winner.id}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Crown className="w-5 h-5 text-yellow-600" />
                            <h3 className="text-xl font-bold text-yellow-800">
                             {winner.participants?.user_id?.username || 'Anonymous Winner'}
                            </h3>
                          </div>
                          
                          {winner.prizes && (
                            <div className="bg-white/60 rounded-lg p-3 mb-3">
                              <h4 className="font-semibold text-amber-800 mb-1">Prize Won:</h4>
                              <p className="text-amber-700 font-medium">{winner.prizes.name}</p>
                              {winner.prizes.description && (
                                <p className="text-sm text-amber-600 mt-1">{winner.prizes.description}</p>
                              )}
                              {winner.prizes.value > 0 && (
                                <p className="text-sm text-amber-600 mt-1">Value: ₹{winner.prizes.value.toLocaleString('en-IN')}</p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Won on {new Date(winner.drawn_at).toLocaleDateString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              winner.status === 'pending_contact' ? 'bg-yellow-100 text-yellow-800' :
                              winner.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                              winner.status === 'responded' ? 'bg-green-100 text-green-800' :
                              winner.status === 'prize_sent' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {winner.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">No Winners Yet</h3>
                  <p className="text-gray-500">
                    Winners haven't been selected for this giveaway yet. 
                    {isOrganizer && ' You can select winners from your dashboard.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl mb-8">
          <CardHeader><CardTitle className="text-xl font-bold text-maroon-800">Description</CardTitle></CardHeader>
          <CardContent><p className="text-gray-700 leading-relaxed">{currentGiveaway.description}</p></CardContent>
        </Card>

        {/* Rules */}
        {currentGiveaway.rules && (
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl mb-8">
            <CardHeader><CardTitle className="text-xl font-bold text-maroon-800">Rules</CardTitle></CardHeader>
            <CardContent><p className="text-gray-700 leading-relaxed">{currentGiveaway.rules}</p></CardContent>
          </Card>
        )}

        {/* Prizes */}
        {currentGiveaway.prizes && currentGiveaway.prizes.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl mb-8">
            <CardHeader><CardTitle className="text-xl font-bold text-maroon-800">Prizes</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {currentGiveaway.prizes.map((prize: any) => (
                <div key={prize.id} className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                  <h3 className="font-bold text-amber-800 text-lg mb-1">{prize.name}</h3>
                  <p className="text-gray-700 text-sm">{prize.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm font-medium text-amber-700">Value: ${prize.value?.toFixed(2)}</span>
                    <span className="text-sm font-medium text-amber-700">Quantity: {prize.quantity}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Entry Methods */}
        {currentGiveaway.entry_config && Object.keys(currentGiveaway.entry_config).length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl mb-8">
            <CardHeader><CardTitle className="text-xl font-bold text-maroon-800">Entry Methods</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(currentGiveaway.entry_config).map(([methodType, methodDetails]: [string, any]) => (
                <div key={methodType} className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 flex items-center justify-between">
                  <div className="flex items-center">
                    {getMethodIcon(methodType)}
                    <span className="font-semibold text-maroon-800">
                      {methodType.replace(/_/g, ' ')}
                      {methodDetails.value && `: ${methodDetails.value}`}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {methodDetails.points} Points
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};