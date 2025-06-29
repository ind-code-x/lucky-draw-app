import React, { useEffect } from 'react';
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
  Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { useGiveawayStore } from '../../stores/giveawayStore';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const { giveaways, fetchGiveaways } = useGiveawayStore();

  useEffect(() => {
    if (user) {
      fetchGiveaways();
    }
  }, [user, fetchGiveaways]);

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
                Welcome back, {profile?.username}! ✨
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
            <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                    <Trophy className="w-6 h-6 mr-3 text-pink-600" />
                    Your Giveaways
                  </CardTitle>
                  {userGiveaways.length > 0 && (
                    <Button
                      as={Link}
                      to="/dashboard/giveaways"
                      variant="ghost"
                      size="sm"
                      className="text-maroon-600 hover:text-pink-600 hover:bg-pink-50"
                    >
                      View All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {userGiveaways.length > 0 ? (
                  <div className="space-y-4">
                    {userGiveaways.slice(0, 5).map((giveaway) => (
                      <div key={giveaway.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-300">
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
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Ends {new Date(giveaway.end_time).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            giveaway.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {giveaway.status}
                          </span>
                          <Button
                            as={Link}
                            to={`/dashboard/giveaway/${giveaway.id}`}
                            size="sm"
                            variant="ghost"
                            className="text-maroon-600 hover:text-pink-600 hover:bg-pink-50"
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-full p-8 w-32 h-32 mx-auto mb-6">
                      <Sparkles className="w-16 h-16 text-pink-500 mx-auto" />
                    </div>
                    <h3 className="text-2xl font-bold text-maroon-800 mb-4">Create Your First Giveaway</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                      Start engaging your audience with magical giveaways that create lasting connections.
                    </p>
                    <Button
                      as={Link}
                      to="/dashboard/create"
                      size="lg"
                      icon={Plus}
                      className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                    >
                      Create Your First Giveaway
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
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