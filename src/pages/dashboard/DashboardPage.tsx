// DashboardPage.tsx

import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  Plus, 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp,
  Gift,
  Sparkles,
  Heart,
  Star,
  Clock,
  Award,
  Search,
  List,
  CheckCircle,
  AlertCircle,
  Loader2 // For loading spinner
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { useGiveawayStore } from '../../stores/giveawayStore';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const { user, profile, isSubscribed } = useAuthStore();
  const { giveaways, fetchGiveaways, fetchParticipants, selectRandomWinner, statusFilter, setStatusFilter } = useGiveawayStore(); 
  
  const [selectedGiveaway, setSelectedGiveaway] = useState<any>(null); // Use 'any' for now or define a more specific type
  const [participants, setParticipants] = useState<any[]>([]); 
  const [loadingParticipants, setLoadingParticipants] = useState(false); 
  const [loadingWinnerDraw, setLoadingWinnerDraw] = useState(false); 
  const [drawnWinners, setDrawnWinners] = useState<any[]>([]); // Renamed to clearly separate from all participants
  const [showParticipantsSection, setShowParticipantsSection] = useState(false); 

  useEffect(() => {
    if (user) {
      fetchGiveaways();
    }
  }, [user, fetchGiveaways, statusFilter]); 

  const loadParticipants = async (giveawayId: string) => {
    if (!giveawayId) return;
    
    setLoadingParticipants(true);
    try {
      const participantData = await fetchParticipants(giveawayId);
      setParticipants(participantData);
      setDrawnWinners([]); // Clear previous drawn winners when new giveaway is selected
      // TODO: In a real app, you would also fetch existing winners for this giveaway here:
      // const existingWinners = await fetchExistingWinners(giveawayId); // Need to implement this in giveawayStore
      // setDrawnWinners(existingWinners);
    } catch (error) {
      console.error('loadParticipants: Error fetching participants:', error);
      toast.error('Failed to load participants');
    } finally {
      setLoadingParticipants(false);
    }
  };

  const handleSelectGiveaway = (giveaway: any) => {
    setSelectedGiveaway(giveaway);
    loadParticipants(giveaway.id);
    setShowParticipantsSection(true); 
  };

  const handleDrawWinner = async (giveawayId: string) => {
    if (!selectedGiveaway || !selectedGiveaway.prizes || selectedGiveaway.prizes.length === 0) {
      toast.error('No prizes available for this giveaway.');
      return;
    }
    
    // Find a prize that has NOT yet been drawn
    const prizeToDraw = selectedGiveaway.prizes.find((p: any) => 
      !drawnWinners.some(dw => dw.prize.id === p.id) // Check if this prize ID is in the drawnWinners list
    );

    if (!prizeToDraw) {
      toast.error('All prizes for this giveaway have already been drawn.');
      return;
    }

    // Filter participants who haven't won THIS SPECIFIC PRIZE yet
    const eligibleParticipants = participants.filter(p => 
      !drawnWinners.some(dw => dw.profiles?.id === p.profiles?.id && dw.prize.id === prizeToDraw.id)
    );

    if (eligibleParticipants.length === 0) {
      toast.error('No eligible participants left to draw for this prize.');
      return;
    }

    setLoadingWinnerDraw(true); 
    try {
      // Logic to select a random eligible participant
      const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
      const randomParticipant = eligibleParticipants[randomIndex];

      const { winner, winnerRecord } = await selectRandomWinner(giveawayId, prizeToDraw.id);
      
      // Ensure the winner details are found (this winner.participant_id is the participants.id from the DB)
      const winnerWithDetails = participants.find((p: any) => p.id === winnerRecord.participant_id); // Match by participants.id, not user_id here
      
      if (winnerWithDetails) {
        const newWinner = {
          ...winnerWithDetails,
          prize: prizeToDraw, // Attach the specific prize that was won
          winnerRecord // The newly created winner record from DB
        };
        setDrawnWinners(prev => [...prev, newWinner]); // Add to the list of drawn winners
        toast.success(`🎉 ${winnerWithDetails.profiles?.username || 'Someone'} won ${prizeToDraw.name}!`);
      } else {
        toast.error('Selected winner details could not be found after drawing.');
      }
    } catch (error) {
      console.error('handleDrawWinner: Error selecting winner:', error);
      // More specific error handling for constraint violation
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
          toast.error(`Error: This participant has already won this prize.`);
      } else {
          toast.error(error instanceof Error ? error.message : 'Failed to select winner.');
      }
    } finally {
      setLoadingWinnerDraw(false); 
    }
  };

  const handleEnterGiveaway = async (giveaway: any) => {
      if (!user) {
          toast.error("Please sign in to participate in giveaways.");
          navigate('/auth/login'); 
          return;
      }

      if (profile?.role === 'participant' && !isSubscribed) { // Only check subscription for participants
          toast.error("You must have an active subscription to enter this giveaway.");
          // navigate('/subscription'); 
          return;
      }

      setLoadingParticipants(true); 
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
          setLoadingParticipants(false);
      }
  };

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const userGiveaways = giveaways.filter(g => g.organizer_id === user.id);
  const activeGiveaways = userGiveaways.filter(g => g.status === 'active');
  const totalEntries = userGiveaways.reduce((sum, g) => sum + (g.total_entries || 0), 0);
  const totalParticipants = userGiveaways.reduce((sum, g) => sum + (g.unique_participants || 0), 0);

  const stats = [
    {
      title: 'Active Giveaways',
      value: activeGiveaways.length,
      icon: Trophy,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50'
    },
    {
      title: 'Total Entries',
      value: totalEntries.toLocaleString(),
      icon: Users,
      color: 'from-maroon-500 to-pink-500',
      bgColor: 'from-maroon-50 to-pink-50'
    },
    {
      title: 'Participants',
      value: totalParticipants.toLocaleString(),
      icon: Heart,
      color: 'from-rose-500 to-maroon-500',
      bgColor: 'from-rose-50 to-maroon-50'
    },
    {
      title: 'Total Giveaways',
      value: userGiveaways.length,
      icon: Gift,
      color: 'from-pink-600 to-maroon-600',
      bgColor: 'from-pink-50 to-maroon-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-4">
                Welcome back, {profile?.username || 'User'}! ✨
              </h1>
              <p className="text-xl text-gray-600">
                {profile?.role === 'organizer' 
                  ? 'Manage your magical giveaways and engage your audience'
                  : 'Track your entries and discover new giveaways'
                }
              </p>
            </div>
            {profile?.role === 'organizer' && (
              <Button
                as={Link}
                to="/dashboard/create"
                size="lg"
                icon={Plus}
                className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Create Giveaway
              </Button>
            )}
          </div>
        </div>

        {profile?.role === 'organizer' ? (
          <>
            {/* Organizer Dashboard View */}
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {stats.map((stat) => (
                <Card key={stat.title} className={`bg-gradient-to-br ${stat.bgColor} border-pink-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-maroon-800">{stat.value}</p>
                      </div>
                      <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Your Giveaways List (Left Column) & Participants/Winners Section (Right Column) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-1">
                <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                        <Gift className="w-6 h-6 mr-3 text-pink-600" />
                        Your Giveaways
                      </CardTitle>
                      {/* Filter by status (optional) */}
                      <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1 border border-pink-200 rounded-lg text-sm bg-white text-gray-700"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="ended">Ended</option>
                        <option value="paused">Paused</option>
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userGiveaways.length > 0 ? (
                      <div className="space-y-4">
                        {userGiveaways.map((giveaway) => ( 
                          <div 
                            key={giveaway.id} 
                            className={`p-4 rounded-xl transition-all duration-300 
                              ${selectedGiveaway && selectedGiveaway.id === giveaway.id 
                                ? 'bg-gradient-to-r from-maroon-100 to-pink-100 border-l-4 border-maroon-500'
                                : 'bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100'
                              }
                            `}
                            onClick={() => handleSelectGiveaway(giveaway)}
                          >
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="bg-gradient-to-br from-maroon-500 to-pink-500 p-2 rounded-lg">
                                <Gift className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-maroon-800">{giveaway.title}</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {giveaway.total_entries || 0} entries
                                  </span>
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    Ends: {new Date(giveaway.end_time).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    giveaway.status === 'active' ? 'bg-green-100 text-green-800' :
                                    giveaway.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    giveaway.status === 'ended' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {giveaway.status}
                                </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                        <p className="text-gray-600">No giveaways yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Participants & Winners Section (Right Column) */}
              <div className="lg:col-span-2">
                {showParticipantsSection && selectedGiveaway ? (
                  <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                          <Users className="w-6 h-6 mr-3 text-pink-600" />
                          Participants for: {selectedGiveaway.title}
                        </CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowParticipantsSection(false)}
                            className="text-maroon-600 hover:text-pink-600 hover:bg-pink-50"
                          >
                            Back
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDrawWinner(selectedGiveaway.id)} 
                            loading={loadingWinnerDraw} 
                            className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Draw Winner
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingParticipants ? ( 
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-700"></div>
                        </div>
                      ) : (
                        <>
                          {/* Winners Section */}
                          {drawnWinners.length > 0 && ( 
                            <div className="mb-8">
                              <h3 className="text-xl font-bold text-maroon-800 mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-pink-600" />
                                Winners
                              </h3>
                              <div className="space-y-3">
                                {drawnWinners.map((winner, idx) => ( 
                                  <div key={winner.winnerRecord?.id || idx} className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-gradient-to-br from-amber-500 to-yellow-500 p-2 rounded-full">
                                        <Trophy className="w-5 h-5 text-white" />
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-amber-800">
                                          {winner.profiles?.username || 'Anonymous'} 
                                          <span className="text-sm font-normal ml-2 text-amber-700">
                                            (Prize: {winner.prize?.name || 'Unknown'})
                                          </span>
                                        </h4>
                                        <p className="text-sm text-amber-700">
                                          Selected on {new Date(winner.winnerRecord?.drawn_at).toLocaleString()}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-amber-700 hover:bg-amber-100"
                                        onClick={() => alert(`Contact ${winner.profiles?.email || 'the winner'}`)}
                                      >
                                        Contact
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Participants List */}
                          <div>
                            <h3 className="text-xl font-bold text-maroon-800 mb-4 flex items-center">
                              <List className="w-5 h-5 mr-2 text-pink-600" />
                              Participants ({participants.length})
                            </h3>
                            {participants.length > 0 ? (
                              <div className="max-h-80 overflow-y-auto space-y-2">
                                {participants.map((participant) => (
                                  <div key={participant.id} className="p-3 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-200">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-maroon-500 to-pink-500 rounded-full flex items-center justify-center">
                                          <span className="text-white text-xs font-bold">
                                            {participant.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                                          </span>
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-maroon-800">
                                            {participant.profiles?.username || 'Anonymous'}
                                          </h4>
                                          <p className="text-xs text-gray-600">
                                            {participant.profiles?.email || 'No email available'}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-maroon-700">
                                          {participant.total_entries || 1} entries
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-pink-50 rounded-xl">
                                <Users className="w-12 h-12 text-pink-300 mx-auto mb-2" />
                                <p className="text-pink-700">No participants yet</p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  // Default View when no giveaway is selected
                  <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl h-full">
                    <CardContent className="p-8 text-center">
                      <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-full p-8 w-32 h-32 mx-auto mb-6">
                        <Gift className="w-16 h-16 text-maroon-500 mx-auto" />
                      </div>
                      <h3 className="text-2xl font-bold text-maroon-800 mb-4">Select a Giveaway</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                        Choose a giveaway from the list to view participants and manage winners.
                      </p>
                      {userGiveaways.length === 0 && (
                        <Button
                          as={Link}
                          to="/dashboard/create"
                          size="lg"
                          icon={Plus}
                          className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                          Create Your First Giveaway
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Participant Dashboard View */
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-maroon-500 to-pink-500 p-4 rounded-full w-20 h-20 mx-auto mb-6">
                    <Search className="w-12 h-12 text-white mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-maroon-800 mb-4">Explore Giveaways</h3>
                  <p className="text-gray-600 mb-6">Discover amazing giveaways from your favorite brands and creators.</p>
                  <Button
                    as={Link}
                    to="/"
                    className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700"
                  >
                    Browse Giveaways
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-rose-50 to-maroon-50 border-pink-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-rose-500 to-maroon-500 p-4 rounded-full w-20 h-20 mx-auto mb-6">
                    <Award className="w-12 h-12 text-white mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold text-maroon-800 mb-4">My Entries</h3>
                  <p className="text-gray-600 mb-6">Track your entries and see which giveaways you've joined.</p>
                  <Button
                    as={Link}
                    to="/dashboard/entries"
                    className="bg-gradient-to-r from-rose-600 to-maroon-600 hover:from-rose-700 hover:to-maroon-700"
                  >
                    View My Entries
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* This section will display giveaways available for participation for participants */}
            <div className="space-y-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
                    Available Giveaways
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Filter to show only active giveaways not organized by user (though user should be participant here) */}
                    {giveaways.filter(g => g.status === 'active' && g.organizer_id !== user.id).map(giveaway => (
                        <Card key={giveaway.id} className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-maroon-800">{giveaway.title}</CardTitle>
                                <p className="text-sm text-gray-600">by {giveaway.profiles?.username || 'Unknown'}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-gray-700 line-clamp-2">{giveaway.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <span className="flex items-center">
                                        <Users className="w-4 h-4 mr-1" />
                                        {giveaway.total_entries || 0} entries
                                    </span>
                                    <span className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Ends: {new Date(giveaway.end_time).toLocaleDateString()}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    onClick={(event) => { // Use onClick with stopPropagation
                                        event.stopPropagation(); // Prevent parent click handlers if any
                                        handleEnterGiveaway(giveaway);
                                    }}
                                    // Consider a loading state per button for clarity
                                    // loading={loadingEnterGiveaway[giveaway.id]} 
                                    icon={Heart}
                                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 w-full mt-4"
                                >
                                    Enter Giveaway
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                    {giveaways.filter(g => g.status === 'active' && g.organizer_id !== user.id).length === 0 && (
                        <div className="lg:col-span-3 text-center py-8">
                            <AlertCircle className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                            <p className="text-gray-600">No active giveaways to enter right now. Check back later!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upgrade to Organizer */}
            <Card className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-pink-900 text-white border-none shadow-2xl mt-8">
              <CardContent className="p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern-dots-white opacity-10"></div>
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-6">
                    <Star className="w-12 h-12 text-white mx-auto" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">Become an Organizer</h3>
                  <p className="text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                    Ready to create your own magical giveaways? Upgrade to an organizer account and start 
                    engaging your audience with amazing prizes and experiences.
                  </p>
                  <Button
                    size="lg"
                    className="bg-white text-maroon-700 hover:bg-pink-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    // Add an onClick handler to redirect to an upgrade page or open a modal
                    // Example: onClick={() => navigate('/upgrade-to-organizer')}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Upgrade Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
