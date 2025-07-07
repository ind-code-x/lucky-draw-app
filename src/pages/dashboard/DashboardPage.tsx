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
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { useGiveawayStore } from '../../stores/giveawayStore';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const { giveaways, fetchGiveaways, fetchParticipants, selectRandomWinner } = useGiveawayStore();
  const [selectedGiveaway, setSelectedGiveaway] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [winners, setWinners] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGiveaways();
    }
  }, [user, fetchGiveaways]);

  const loadParticipants = async (giveawayId) => {
    if (giveawayId) {
      setLoading(true);
      try {
        const participantData = await fetchParticipants(giveawayId);
        setParticipants(participantData);
      } catch (error) {
        console.error('Error fetching participants:', error);
        toast.error('Failed to load participants');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectGiveaway = (giveaway) => {
    setSelectedGiveaway(giveaway);
    loadParticipants(giveaway.id);
    setWinners([]);
    setShowParticipants(true);
  };

  const handleSelectWinner = async (giveawayId) => {
    if (!selectedGiveaway || !selectedGiveaway.prizes || selectedGiveaway.prizes.length === 0) {
      toast.error('No prizes available for this giveaway');
      return;
    }
    
    if (participants.length === 0) {
      toast.error('No participants available to select a winner');
      return;
    }

    setLoading(true);
    try {
      // For simplicity, we'll use the first prize
      const prizeId = selectedGiveaway.prizes[0].id;
      const { winner, winnerRecord } = await selectRandomWinner(giveawayId, prizeId);
      
      // Find the winner's details from participants
      const winnerWithDetails = participants.find(p => p.id === winner.id);
      
      // Add to winners list
      if (winnerWithDetails) {
        const newWinner = {
          ...winnerWithDetails,
          prize: selectedGiveaway.prizes[0],
          winnerRecord
        };
        setWinners(prev => [...prev, newWinner]);
        toast.success('Winner selected successfully!');
      }
    } catch (error) {
      console.error('Error selecting winner:', error);
      toast.error(error.message || 'Failed to select winner');
    } finally {
      setLoading(false);
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
        {/* Header */}
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

            {/* Recent Giveaways */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-1">
                <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                        <Trophy className="w-6 h-6 mr-3 text-pink-600" />
                        Your Giveaways
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {userGiveaways.length > 0 ? (
                      <div className="space-y-4">
                        {userGiveaways.slice(0, 10).map((giveaway) => (
                          <div 
                            key={giveaway.id} 
                            className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 cursor-pointer
                              ${selectedGiveaway && selectedGiveaway.id === giveaway.id 
                                ? 'bg-gradient-to-r from-maroon-100 to-pink-100 border-l-4 border-maroon-500'
                                : 'bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100'
                              }
                            `}
                            onClick={() => handleSelectGiveaway(giveaway)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="bg-gradient-to-br from-maroon-500 to-pink-500 p-2 rounded-lg">
                                <Gift className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-maroon-800">{giveaway.title}</h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {giveaway.total_entries || 0} entries
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              giveaway.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {giveaway.status}
                            </span>
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

              <div className="lg:col-span-2">
                {showParticipants && selectedGiveaway ? (
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
                            onClick={() => setShowParticipants(false)}
                            className="text-maroon-600 hover:text-pink-600 hover:bg-pink-50"
                          >
                            Back
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSelectWinner(selectedGiveaway.id)}
                            loading={loading}
                            className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700"
                          >
                            <Trophy className="w-4 h-4 mr-2" />
                            Draw Winner
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-maroon-700"></div>
                        </div>
                      ) : (
                        <>
                          {/* Winners Section */}
                          {winners.length > 0 && (
                            <div className="mb-8">
                              <h3 className="text-xl font-bold text-maroon-800 mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-pink-600" />
                                Winners
                              </h3>
                              <div className="space-y-3">
                                {winners.map((winner, idx) => (
                                  <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
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
          /* Participant Dashboard */
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

            {/* Upgrade to Organizer */}
            <Card className="bg-gradient-to-br from-maroon-900 via-maroon-800 to-pink-900 text-white border-none shadow-2xl">
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