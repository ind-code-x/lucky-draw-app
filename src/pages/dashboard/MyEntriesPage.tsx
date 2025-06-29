import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Clock,
  Gift,
  Sparkles,
  Award,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';

// Mock data for demonstration
const mockEntries = [
  {
    id: '1',
    giveaway: {
      id: '1',
      title: 'Amazing Tech Giveaway',
      banner_url: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg',
      end_time: '2025-01-15T23:59:59Z',
      status: 'active',
      organizer: { username: 'TechBrand' }
    },
    entries: 15,
    methods: ['email_signup', 'social_follow', 'referral'],
    status: 'active',
    joined_at: '2024-12-20T10:00:00Z'
  },
  {
    id: '2',
    giveaway: {
      id: '2',
      title: 'Holiday Shopping Spree',
      banner_url: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg',
      end_time: '2024-12-31T23:59:59Z',
      status: 'ended',
      organizer: { username: 'ShopMart' }
    },
    entries: 8,
    methods: ['email_signup', 'social_follow'],
    status: 'ended',
    joined_at: '2024-12-15T14:30:00Z'
  },
  {
    id: '3',
    giveaway: {
      id: '3',
      title: 'Gaming Setup Giveaway',
      banner_url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
      end_time: '2025-02-01T23:59:59Z',
      status: 'active',
      organizer: { username: 'GameZone' }
    },
    entries: 22,
    methods: ['email_signup', 'social_follow', 'referral', 'daily_visit'],
    status: 'active',
    joined_at: '2024-12-18T09:15:00Z'
  }
];

export const MyEntriesPage: React.FC = () => {
  const { user, profile } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  const activeEntries = mockEntries.filter(entry => entry.status === 'active');
  const endedEntries = mockEntries.filter(entry => entry.status === 'ended');
  const totalEntries = mockEntries.reduce((sum, entry) => sum + entry.entries, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'email_signup':
        return '📧';
      case 'social_follow':
        return '👥';
      case 'referral':
        return '🔗';
      case 'daily_visit':
        return '📅';
      default:
        return '✨';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-4">
            My Giveaway Entries ✨
          </h1>
          <p className="text-xl text-gray-600">
            Track all your giveaway participations and see your chances of winning!
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Entries</p>
                  <p className="text-3xl font-bold text-maroon-800">{totalEntries}</p>
                </div>
                <div className="bg-gradient-to-br from-maroon-500 to-pink-500 p-3 rounded-xl shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-rose-50 to-maroon-50 border-pink-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Giveaways</p>
                  <p className="text-3xl font-bold text-maroon-800">{activeEntries.length}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-maroon-500 p-3 rounded-xl shadow-lg">
                  <Gift className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-maroon-50 to-pink-50 border-pink-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-maroon-800">{endedEntries.length}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-xl shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-maroon-50 border-pink-200 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Win Rate</p>
                  <p className="text-3xl font-bold text-maroon-800">0%</p>
                </div>
                <div className="bg-gradient-to-br from-maroon-600 to-pink-600 p-3 rounded-xl shadow-lg">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Entries */}
        <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
              <Clock className="w-6 h-6 mr-3 text-pink-600" />
              Active Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeEntries.length > 0 ? (
              <div className="space-y-6">
                {activeEntries.map((entry) => (
                  <div key={entry.id} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6 hover:from-pink-100 hover:to-rose-100 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-maroon-500 to-pink-500 flex items-center justify-center">
                          {entry.giveaway.banner_url ? (
                            <img
                              src={entry.giveaway.banner_url}
                              alt={entry.giveaway.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Gift className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-maroon-800 mb-2">{entry.giveaway.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              by {entry.giveaway.organizer.username}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              Ends {new Date(entry.giveaway.end_time).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(entry.status)}`}>
                              {entry.status === 'active' ? 'Active' : 'Ended'}
                            </span>
                            <span className="text-sm text-gray-600">
                              Joined {new Date(entry.joined_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col lg:items-end space-y-3">
                        <div className="text-center lg:text-right">
                          <div className="text-2xl font-bold text-maroon-800">{entry.entries}</div>
                          <div className="text-sm text-gray-600">entries</div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {entry.methods.map((method) => (
                            <span
                              key={method}
                              className="inline-flex items-center px-2 py-1 rounded-lg bg-white text-xs font-medium text-maroon-700 border border-pink-200"
                            >
                              <span className="mr-1">{getMethodIcon(method)}</span>
                              {method.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                        
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700"
                        >
                          View Giveaway
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-full p-8 w-32 h-32 mx-auto mb-6">
                  <Clock className="w-16 h-16 text-pink-500 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-maroon-800 mb-4">No Active Entries</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                  You're not currently participating in any active giveaways. 
                  Discover amazing giveaways and start entering to win!
                </p>
                <Button
                  as="a"
                  href="/"
                  size="lg"
                  icon={Sparkles}
                  className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Explore Giveaways
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Entries */}
        {endedEntries.length > 0 && (
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-maroon-800 flex items-center">
                <Award className="w-6 h-6 mr-3 text-pink-600" />
                Completed Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endedEntries.map((entry) => (
                  <div key={entry.id} className="bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl p-4 hover:from-gray-100 hover:to-pink-100 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                          {entry.giveaway.banner_url ? (
                            <img
                              src={entry.giveaway.banner_url}
                              alt={entry.giveaway.title}
                              className="w-full h-full object-cover opacity-75"
                            />
                          ) : (
                            <Gift className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-maroon-800">{entry.giveaway.title}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>{entry.entries} entries</span>
                            <span>•</span>
                            <span>by {entry.giveaway.organizer.username}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(entry.status)}`}>
                          Ended
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:text-maroon-600 hover:bg-pink-50"
                        >
                          View Results
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};