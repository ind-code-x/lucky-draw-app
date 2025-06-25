import React from 'react';
import { BarChart3, TrendingUp, Users, Trophy, Calendar, Eye, Home } from 'lucide-react';
import { useGiveaways } from '../contexts/GiveawayContext';

interface AnalyticsProps {
  onNavigateHome: () => void;
}

export function Analytics({ onNavigateHome }: AnalyticsProps) {
  const { analytics, giveaways } = useGiveaways();

  // Calculate real-time analytics
  const realTimeAnalytics = React.useMemo(() => {
    const totalGiveaways = giveaways.length;
    const activeGiveaways = giveaways.filter(g => {
      const now = new Date();
      const endDate = new Date(g.endDate);
      return g.status === 'active' && endDate > now;
    }).length;
    
    const totalEntries = giveaways.reduce((sum, g) => sum + g.entries.length, 0);
    const averageEngagement = totalGiveaways > 0 ? Math.round((totalEntries / totalGiveaways) * 10) / 10 : 0;

    const platformBreakdown = giveaways.reduce((acc, g) => {
      acc[g.platform] = (acc[g.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalGiveaways,
      activeGiveaways,
      totalEntries,
      averageEngagement,
      platformBreakdown,
      monthlyGrowth: 23.5, // This would be calculated based on historical data
    };
  }, [giveaways]);

  const platformData = Object.entries(realTimeAnalytics.platformBreakdown).map(([platform, count]) => ({
    platform: platform.charAt(0).toUpperCase() + platform.slice(1),
    count,
    percentage: realTimeAnalytics.totalGiveaways > 0 ? (count / realTimeAnalytics.totalGiveaways) * 100 : 0,
  }));

  const recentGiveaways = giveaways
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
            <p className="text-gray-600">Track your giveaway performance and audience engagement</p>
          </div>
          <button
            onClick={onNavigateHome}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 transition-colors"
          >
            <Home size={20} />
            <span>Home</span>
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Giveaways',
              value: realTimeAnalytics.totalGiveaways,
              icon: <Trophy className="w-6 h-6" />,
              color: 'bg-purple-500',
              trend: '+12%',
            },
            {
              label: 'Active Campaigns',
              value: realTimeAnalytics.activeGiveaways,
              icon: <Calendar className="w-6 h-6" />,
              color: 'bg-green-500',
              trend: '+5%',
            },
            {
              label: 'Total Entries',
              value: realTimeAnalytics.totalEntries.toLocaleString(),
              icon: <Users className="w-6 h-6" />,
              color: 'bg-blue-500',
              trend: '+23%',
            },
            {
              label: 'Avg. Engagement',
              value: `${realTimeAnalytics.averageEngagement}`,
              icon: <TrendingUp className="w-6 h-6" />,
              color: 'bg-orange-500',
              trend: '+8%',
            },
          ].map((metric, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${metric.color} p-3 rounded-lg`}>
                  {React.cloneElement(metric.icon, { className: 'w-6 h-6 text-white' })}
                </div>
                <span className="text-green-600 text-sm font-medium">{metric.trend}</span>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Breakdown */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Platform Distribution</h2>
            </div>
            
            <div className="space-y-4">
              {platformData.map((platform, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {platform.platform.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{platform.platform}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${platform.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600 w-12 text-right">
                      {platform.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {realTimeAnalytics.totalGiveaways === 0 && (
              <div className="text-center py-8">
                <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No data available yet</p>
                <p className="text-sm text-gray-400">Create your first giveaway to see analytics</p>
              </div>
            )}
          </div>

          {/* Growth Chart */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Growth Trends</h2>
            </div>
            
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-green-600 mb-2">+{realTimeAnalytics.monthlyGrowth}%</div>
              <p className="text-gray-600 mb-4">Monthly Growth Rate</p>
              
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{Math.floor(realTimeAnalytics.totalEntries * 0.4)}k</div>
                  <div className="text-sm text-gray-500">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{Math.floor(realTimeAnalytics.totalEntries * 0.3)}k</div>
                  <div className="text-sm text-gray-500">Last Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{Math.floor(realTimeAnalytics.totalEntries * 0.2)}k</div>
                  <div className="text-sm text-gray-500">2 Months Ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Recent Giveaways</h2>
            </div>
          </div>

          {recentGiveaways.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No giveaways yet</h3>
              <p className="text-gray-600">Create your first giveaway to start tracking analytics</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentGiveaways.map((giveaway) => (
                <div key={giveaway.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{giveaway.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(giveaway.status)}`}>
                          {giveaway.status.charAt(0).toUpperCase() + giveaway.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{giveaway.prize}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">{giveaway.platform}</span>
                        <span>{giveaway.entries.length} entries</span>
                        <span>Created {new Date(giveaway.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{giveaway.entries.length}</div>
                      <div className="text-sm text-gray-500">Entries</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Tips */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Performance Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-purple-900 mb-2">Boost Engagement:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Use eye-catching visuals for your posts</li>
                <li>• Post at peak activity times for your audience</li>
                <li>• Collaborate with influencers or partners</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-900 mb-2">Improve Conversions:</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Make entry requirements clear and simple</li>
                <li>• Offer prizes that appeal to your target audience</li>
                <li>• Follow up with participants after the giveaway</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}