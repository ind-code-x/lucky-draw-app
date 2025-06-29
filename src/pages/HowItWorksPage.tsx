import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  Trophy, 
  Gift, 
  Users, 
  Zap, 
  Shield, 
  Heart,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const HowItWorksPage: React.FC = () => {
  const participantSteps = [
    {
      icon: Search,
      title: 'Discover Giveaways',
      description: 'Browse through hundreds of active giveaways from your favorite brands and creators.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: UserPlus,
      title: 'Enter to Win',
      description: 'Complete simple entry methods like following social accounts, sharing posts, or referring friends.',
      color: 'from-maroon-500 to-pink-500'
    },
    {
      icon: Trophy,
      title: 'Win Amazing Prizes',
      description: 'Winners are selected fairly and transparently. Get notified instantly if you win!',
      color: 'from-rose-500 to-maroon-500'
    }
  ];

  const organizerSteps = [
    {
      icon: Gift,
      title: 'Create Your Giveaway',
      description: 'Set up your giveaway with custom entry methods, prizes, and rules in minutes.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: Users,
      title: 'Engage Your Audience',
      description: 'Watch as participants engage with your brand through various entry methods.',
      color: 'from-maroon-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Select Winners',
      description: 'Our fair and transparent system automatically selects winners when your giveaway ends.',
      color: 'from-rose-500 to-maroon-500'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Fair & Transparent',
      description: 'All drawings use provably fair algorithms with complete transparency.'
    },
    {
      icon: Zap,
      title: 'Easy Entry Methods',
      description: 'Multiple ways to enter including social follows, email signup, and referrals.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Connect with brands and creators while discovering amazing prizes.'
    },
    {
      icon: Heart,
      title: 'Magical Experience',
      description: 'Beautiful, intuitive interface that makes giveaways fun and engaging.'
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
            <Sparkles className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            How It Works
          </h1>
          
          <p className="text-xl md:text-2xl text-pink-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            Join the magical world of giveaways in just a few simple steps. 
            Whether you're here to win prizes or create amazing experiences, we've got you covered.
          </p>
        </div>
      </section>

      {/* For Participants Section */}
      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-50/30 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              For Participants
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover and enter amazing giveaways from your favorite brands and creators.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            {participantSteps.map((step, index) => (
              <div key={step.title} className="text-center relative">
                <div className={`bg-gradient-to-br ${step.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-105 transition-all duration-300`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-pink-200">
                  <span className="text-sm font-bold text-maroon-600">{index + 1}</span>
                </div>
                <h3 className="text-2xl font-bold text-maroon-800 mb-4">{step.title}</h3>
                <p className="text-gray-700 leading-relaxed">{step.description}</p>
                {index < participantSteps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-pink-400 mx-auto mt-6 hidden md:block" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              as={Link} 
              to="/auth/signup" 
              size="lg"
              className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
          </div>
        </div>
      </section>

      {/* For Organizers Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              For Organizers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Create magical giveaways that engage your audience and grow your community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            {organizerSteps.map((step, index) => (
              <div key={step.title} className="text-center relative">
                <div className={`bg-gradient-to-br ${step.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg transform hover:scale-105 transition-all duration-300`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -left-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-pink-200">
                  <span className="text-sm font-bold text-maroon-600">{index + 1}</span>
                </div>
                <h3 className="text-2xl font-bold text-maroon-800 mb-4">{step.title}</h3>
                <p className="text-gray-700 leading-relaxed">{step.description}</p>
                {index < organizerSteps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-pink-400 mx-auto mt-6 hidden md:block" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button 
              as={Link} 
              to="/auth/signup" 
              size="lg"
              className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Your First Giveaway
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              Why Choose GiveawayHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The most magical platform for giveaways with features that delight both participants and organizers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
                <div className="bg-gradient-to-br from-maroon-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-maroon-800 mb-4">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-rose-maroon"></div>
        <div className="absolute inset-0 bg-pattern-circles-white opacity-20"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-8">
            <Star className="w-12 h-12 text-pink-200 mx-auto" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Experience
            <span className="block text-pink-200">The Magic?</span>
          </h2>
          
          <p className="text-xl text-pink-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of happy users who have discovered the joy of magical giveaways. 
            Start your journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              as={Link}
              to="/auth/signup"
              size="xl"
              className="bg-white text-maroon-700 hover:bg-pink-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <Heart className="w-5 h-5 mr-2" />
              Start Creating Magic Today
            </Button>
            <Button
              as={Link}
              to="/"
              size="xl"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-maroon-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <Search className="w-5 h-5 mr-2" />
              Explore Giveaways
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};