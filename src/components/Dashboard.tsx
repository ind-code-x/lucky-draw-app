import React, { useEffect } from 'react';
import { Plus, Calendar, Users, Trophy, BarChart3, Eye, Edit, Trash2, PlayCircle, PauseCircle, Home } from 'lucide-react';
import { useGiveaways } from '../contexts/GiveawayContext';
import { Giveaway } from '../types';

interface DashboardProps {
  onNavigate: (page: string, giveawayId?: string) => void;
  onNavigateHome: () => void;
}

export function Dashboard({ onNavigate, onNavigateHome }: DashboardProps) {
  const { giveaways, analytics, deleteGiveaway, updateGiveaway, loading } = useGiveaways();

  // Calculate real-time analytics using entriesCount
  const realTimeAnalytics = React.useMemo(() => {
    const totalGiveaways = giveaways.length;
    const activeGiveaways = giveaways.filter(g => {
      const now = new Date();
      const endDate = new Date(g.endDate);
      return g.status === 'active' && endDate > now;
    }).length;
    
    const totalEntries = giveaways.reduce((sum, g) => sum + (g.entriesCount || 0), 0);
    const averageEngagement = totalGiveaways > 0 ? Math.round((totalEntries / totalGiveaways) * 10) / 10 : 0;

    return {
      totalGiveaways,
      activeGiveaways,
      totalEntries,
      averageEngagement,
    };
  }, [giveaways]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (giveaway: Giveaway) => {
    const now = new Date();
    const endDate = new Date(giveaway.endDate);
    
    if (giveaway.status === 'completed' || endDate <= now) {
      return 'bg-gray-100 text-gray-800';
    } else if (giveaway.status === 'active') {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (giveaway: Giveaway) => {
    const now = new Date();
    const endDate = new Date(giveaway.endDate);
    
    if (endDate <= now) {
      return 'Ended';
    } else if (giveaway.status === 'active') {
      return 'Active';
    } else {
      return 'Draft';
    }
  };

  const getPlatformIcon = (platform: string) => {
    return '🎁'; // Generic giveaway icon since we're not platform-specific
  };

  const handleStatusToggle = (giveaway: Giveaway) => {
    const now = new Date();
    const endDate = new Date(giveaway.endDate);
    
    // Don't allow toggling if giveaway has ended
    if (endDate <= now) {
      alert('Cannot modify ended giveaways');
      return;
    }

    if (giveaway.status === 'active') {
      updateGiveaway(giveaway.id, { status: 'draft' });
    } else if (giveaway.status === 'draft') {
      updateGiveaway(giveaway.id, { status: 'active' });
    }
  };

  const handleViewGiveaway = (giveaway: Giveaway) => {
    const giveawayUrl = `${window.location.origin}?giveaway=${giveaway.id}`;
    window.open(giveawayUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your giveaways...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Manage your giveaways and track performance</p>
            </div>
            <button
              onClick={onNavigateHome}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors"
            >
              <Home size={20} />
              <span>Home</span>
            </button>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>New Giveaway</span>
          </button>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Giveaways',
              value: realTimeAnalytics.totalGiveaways,
              icon: <Trophy className="w-6 h-6" />,
              color: 'bg-purple-500',
            },
            {
              label: 'Active Campaigns',
              value: realTimeAnalytics.activeGiveaways,
              icon: <PlayCircle className="w-6 h-6" />,
              color: 'bg-green-500',
            },
            {
              label: 'Total Entries',
              value: realTimeAnalytics.totalEntries.toLocaleString(),
              icon: <Users className="w-6 h-6" />,
              color: 'bg-blue-500',
            },
            {
              label: 'Avg. Engagement',
              value: `${realTimeAnalytics.averageEngagement}`,
              icon: <BarChart3 className="w-6 h-6" />,
              color: 'bg-orange-500',
            },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  {React.cloneElement(stat.icon, { className: 'w-6 h-6 text-white' })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Giveaways List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Your Giveaways</h2>
          </div>

          {giveaways.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No giveaways yet</h3>
              <p className="text-gray-600 mb-6">Create your first giveaway to get started</p>
              <button
                onClick={() => onNavigate('create')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Giveaway
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {giveaways.map((giveaway) => {
                const now = new Date();
                const endDate = new Date(giveaway.endDate);
                const isEnded = endDate <= now;
                
                return (
                  <div key={giveaway.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {getPlatformIcon(giveaway.platform)}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{giveaway.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(giveaway)}`}>
                            {getStatusText(giveaway)}
                          </span>
                          {isEnded && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Ended
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2 line-clamp-2">{giveaway.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Trophy size={16} />
                            <span>{giveaway.prize}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>{formatDate(giveaway.startDate)} - {formatDate(giveaway.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users size={16} />
                            <span>{giveaway.entriesCount || 0} entries</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewGiveaway(giveaway)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Public Page"
                        >
                          <Eye size={18} />
                        </button>
                        {!isEnded && (
                          <>
                            <button
                              onClick={() => onNavigate('edit', giveaway.id)}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleStatusToggle(giveaway)}
                              className={`p-2 rounded-lg transition-colors ${
                                giveaway.status === 'active'
                                  ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50'
                                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                              }`}
                              title={giveaway.status === 'active' ? 'Pause' : 'Start'}
                            >
                              {giveaway.status === 'active' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this giveaway? This action cannot be undone.')) {
                              deleteGiveaway(giveaway.id);
                            }
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {giveaways.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Quick Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {giveaways.filter(g => g.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active Giveaways</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.max(...giveaways.map(g => g.entriesCount || 0), 0)}
                </div>
                <div className="text-sm text-gray-600">Most Entries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {giveaways.filter(g => {
                    const endDate = new Date(g.endDate);
                    const now = new Date();
                    return endDate > now;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Upcoming Endings</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}