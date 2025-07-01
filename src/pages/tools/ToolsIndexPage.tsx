import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Twitter, 
  Youtube, 
  Facebook,
  Shuffle,
  Users,
  Trophy,
  Sparkles,
  ArrowRight,
  Gift
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  bgColor: string;
  features: string[];
  popular?: boolean;
}

export const ToolsIndexPage: React.FC = () => {
  const tools: Tool[] = [
    {
      id: 'instagram-comment-picker',
      name: 'Instagram Comment Picker',
      description: 'Randomly select winners from Instagram comments with advanced filtering options.',
      icon: Instagram,
      href: '/tools/instagram-comment-picker',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      features: [
        'Parse multiple comment formats',
        'Advanced filtering & validation',
        'Duplicate user detection',
        'Export results to JSON',
        'Copy winners to clipboard'
      ],
      popular: true
    },
    {
      id: 'twitter-retweet-picker',
      name: 'Twitter Retweet Picker',
      description: 'Select random winners from Twitter retweets and replies.',
      icon: Twitter,
      href: '/tools/twitter-retweet-picker',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50',
      features: [
        'Retweet analysis',
        'Reply filtering',
        'Bot detection',
        'Engagement metrics',
        'Winner verification'
      ]
    },
    {
      id: 'youtube-comment-picker',
      name: 'YouTube Comment Picker',
      description: 'Pick winners from YouTube video comments with spam filtering.',
      icon: Youtube,
      href: '/tools/youtube-comment-picker',
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50',
      features: [
        'Video comment extraction',
        'Spam comment filtering',
        'Subscriber verification',
        'Engagement analysis',
        'Multi-video support'
      ]
    },
    {
      id: 'facebook-comment-picker',
      name: 'Facebook Comment Picker',
      description: 'Randomly select winners from Facebook post comments.',
      icon: Facebook,
      href: '/tools/facebook-comment-picker',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'from-blue-50 to-indigo-50',
      features: [
        'Post comment analysis',
        'Reaction filtering',
        'Profile verification',
        'Tag detection',
        'Share tracking'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-maroon-pink opacity-95"></div>
        <div className="absolute inset-0 bg-pattern-dots-white opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-8">
            <Shuffle className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Giveaway Tools
          </h1>
          
          <p className="text-xl md:text-2xl text-pink-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            Professional tools to help you run fair and transparent giveaways across all social media platforms.
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              Choose Your Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Select the perfect tool for your social media giveaway. Each tool is designed for specific platforms with unique features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tools.map((tool) => (
              <Card 
                key={tool.id} 
                className={`relative overflow-hidden bg-gradient-to-br ${tool.bgColor} border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                  tool.popular ? 'ring-2 ring-maroon-500 shadow-2xl scale-105' : ''
                }`}
              >
                {tool.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-maroon-600 to-pink-600 text-white text-center py-2 text-sm font-semibold">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </div>
                )}
                
                <CardContent className={`p-8 ${tool.popular ? 'pt-12' : ''}`}>
                  <div className="flex items-start justify-between mb-6">
                    <div className={`bg-gradient-to-br ${tool.color} w-16 h-16 rounded-xl flex items-center justify-center shadow-lg`}>
                      <tool.icon className="w-8 h-8 text-white" />
                    </div>
                    {tool.id === 'instagram-comment-picker' && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                        Available Now
                      </span>
                    )}
                    {tool.id !== 'instagram-comment-picker' && (
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-maroon-800 mb-4">{tool.name}</h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">{tool.description}</p>

                  <div className="space-y-3 mb-8">
                    <h4 className="font-semibold text-maroon-700 text-sm uppercase tracking-wide">Features</h4>
                    {tool.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="bg-green-100 rounded-full p-1">
                          <Trophy className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {tool.id === 'instagram-comment-picker' ? (
                    <Button
                      as={Link}
                      to={tool.href}
                      fullWidth
                      size="lg"
                      icon={ArrowRight}
                      className={`bg-gradient-to-r ${tool.color} hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                    >
                      Use Tool Now
                    </Button>
                  ) : (
                    <Button
                      disabled
                      fullWidth
                      size="lg"
                      className="bg-gray-300 text-gray-500 cursor-not-allowed"
                    >
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              Why Use Our Tools?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Professional-grade features that ensure fair, transparent, and efficient giveaway management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/90 backdrop-blur-sm border-pink-200">
              <div className="bg-gradient-to-br from-maroon-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shuffle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-maroon-800 mb-4">Fair & Random</h3>
              <p className="text-gray-700 leading-relaxed">
                Provably fair random selection algorithms ensure every participant has an equal chance of winning.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/90 backdrop-blur-sm border-pink-200">
              <div className="bg-gradient-to-br from-rose-500 to-maroon-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-maroon-800 mb-4">Advanced Filtering</h3>
              <p className="text-gray-700 leading-relaxed">
                Sophisticated filtering options to exclude spam, bots, and invalid entries automatically.
              </p>
            </Card>

            <Card className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/90 backdrop-blur-sm border-pink-200">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-maroon-800 mb-4">Export Results</h3>
              <p className="text-gray-700 leading-relaxed">
                Export winner lists, generate reports, and maintain records for transparency and compliance.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-rose-maroon"></div>
        <div className="absolute inset-0 bg-pattern-circles-white opacity-20"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-8">
            <Gift className="w-12 h-12 text-pink-200 mx-auto" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Run Your
            <span className="block text-pink-200">Perfect Giveaway?</span>
          </h2>
          
          <p className="text-xl text-pink-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Start with our Instagram Comment Picker and experience the magic of fair, transparent giveaway management.
          </p>
          
          <Button
            as={Link}
            to="/tools/instagram-comment-picker"
            size="xl"
            className="bg-white text-maroon-700 hover:bg-pink-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12"
          >
            <Instagram className="w-5 h-5 mr-2" />
            Try Instagram Tool
          </Button>
        </div>
      </section>
    </div>
  );
};