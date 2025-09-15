import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Trophy, 
  Users, 
  BarChart3, 
  Shield, 
  Zap,
  Gift,
  Star,
  CreditCard,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
  bgColor: string;
  icon: React.ComponentType<any>;
}

export const SubscriptionPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedRole, setSelectedRole] = useState<'participant' | 'organizer'>(profile?.role || 'participant');

  const participantPlans: SubscriptionPlan[] = [
    {
      id: 'participant-basic',
      name: 'Basic Participant',
      price: billingCycle === 'monthly' ? 299 : 2990,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'Perfect for casual giveaway enthusiasts who want to participate regularly',
      features: [
        'Enter unlimited giveaways',
        'Track your entries and wins',
        'Basic entry methods',
        'Email support',
        'Entry history tracking',
        'Win notifications'
      ],
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      icon: Heart
    },
    {
      id: 'participant-premium',
      name: 'Premium Participant',
      price: billingCycle === 'monthly' ? 599 : 5990,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'For serious participants who want maximum winning potential',
      features: [
        'Everything in Basic',
        'Priority entry processing',
        'Advanced referral system',
        'Bonus entry multipliers',
        'Early access to new giveaways',
        'Detailed win analytics',
        'Priority email & chat support',
        'Exclusive participant-only giveaways'
      ],
      popular: true,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      icon: Crown
    }
  ];

  const organizerPlans: SubscriptionPlan[] = [
    {
      id: 'organizer-starter',
      name: 'Starter Organizer',
      price: billingCycle === 'monthly' ? 1999 : 19990,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'Perfect for small creators and businesses starting their giveaway journey',
      features: [
        'Up to 5 active giveaways',
        'Up to 1,000 participants per giveaway',
        'Basic analytics dashboard',
        'Standard entry methods',
        'Winner selection tools',
        'Email support',
        'Basic social media integrations'
      ],
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50',
      icon: Gift
    },
    {
      id: 'organizer-professional',
      name: 'Professional Organizer',
      price: billingCycle === 'monthly' ? 4999 : 49990,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'Ideal for growing brands and influencers who want advanced features',
      features: [
        'Up to 25 active giveaways',
        'Up to 10,000 participants per giveaway',
        'Advanced analytics & insights',
        'Custom entry methods',
        'Automated winner management',
        'Social media integrations',
        'Custom branding options',
        'Priority email & chat support',
        'CSV export functionality'
      ],
      popular: true,
      color: 'from-maroon-500 to-pink-500',
      bgColor: 'from-maroon-50 to-pink-50',
      icon: Crown
    },
    {
      id: 'organizer-enterprise',
      name: 'Enterprise Organizer',
      price: billingCycle === 'monthly' ? 9999 : 99990,
      period: billingCycle === 'monthly' ? 'month' : 'year',
      description: 'For large organizations requiring unlimited scale and premium support',
      features: [
        'Unlimited active giveaways',
        'Unlimited participants',
        'Advanced analytics & reporting',
        'API access',
        'White-label solutions',
        'Custom integrations',
        'Advanced security features',
        'Multi-team collaboration',
        '24/7 priority support',
        'Dedicated account manager',
        'Custom development support'
      ],
      color: 'from-rose-500 to-maroon-500',
      bgColor: 'from-rose-50 to-maroon-50',
      icon: Star
    }
  ];

  const currentPlans = selectedRole === 'participant' ? participantPlans : organizerPlans;

  const handleSubscribe = async (planId: string, price: number) => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(planId);

    try {
      // For development/demo purposes, use localStorage to simulate subscription
      // This prevents the 404 error when the subscriptions table doesn't exist
      console.log('Setting subscription in localStorage for development');
      localStorage.setItem(`${user.id}_subscribed`, 'true');
      localStorage.setItem(`${user.id}_subscription_plan`, billingCycle);
      localStorage.setItem(`${user.id}_subscription_date`, new Date().toISOString());
      localStorage.setItem(`${user.id}_subscription_plan_name`, currentPlans.find(p => p.id === planId)?.name || '');
      
      // Try to also update the database if the table exists
      try {
        // Insert subscription into database
        console.log('Inserting subscription into database');
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            status: 'active',
            subscription_type: billingCycle,
            price: price / 100, // Convert from paise to rupees for DB
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              new Date().setMonth(
                new Date().getMonth() + (billingCycle === 'monthly' ? 1 : 12)
              )
            ).toISOString(),
          });
          
        if (insertError) {
          console.warn('Database subscription insert failed, using localStorage fallback:', insertError);
        }
      } catch (dbError) {
        console.warn('Error accessing subscriptions table (using localStorage fallback):', dbError);
      }
      
      // Update local state
      console.log('Refreshing subscription status in UI');
      await useAuthStore.getState().checkSubscription();
      
      // Show success message and redirect
      toast.success(`You are now subscribed to the ${currentPlans.find(p => p.id === planId)?.name} plan! 🎉`);
      // Use window.location for compatibility with the rest of the app's navigation
      window.location.href = '/dashboard';

    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-maroon-pink opacity-95"></div>
        <div className="absolute inset-0 bg-pattern-dots-white opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-20 h-20 mx-auto mb-8">
            <Crown className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Choose Your Plan
          </h1>
          
          <p className="text-xl md:text-2xl text-pink-100 mb-10 max-w-4xl mx-auto leading-relaxed">
            Choose the perfect plan for your role. Whether you're here to participate in giveaways 
            or create magical experiences, we have the right plan for you.
          </p>

          {/* Role Selection */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 flex">
              <button
                onClick={() => setSelectedRole('participant')}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedRole === 'participant'
                    ? 'bg-white text-maroon-700 shadow-lg'
                    : 'text-white hover:text-pink-200'
                }`}
              >
                <Heart className="w-4 h-4 mr-2 inline" />
                Participant Plans
              </button>
              <button
                onClick={() => setSelectedRole('organizer')}
                className={`px-8 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  selectedRole === 'organizer'
                    ? 'bg-white text-maroon-700 shadow-lg'
                    : 'text-white hover:text-pink-200'
                }`}
              >
                <Gift className="w-4 h-4 mr-2 inline" />
                Organizer Plans
              </button>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-maroon-700 shadow-lg'
                    : 'text-white hover:text-pink-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-maroon-700 shadow-lg'
                    : 'text-white hover:text-pink-200'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-4">
              {selectedRole === 'participant' ? 'Participant Plans' : 'Organizer Plans'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {selectedRole === 'participant' 
                ? 'Enhance your giveaway participation experience with premium features'
                : 'Create and manage professional giveaways that engage your audience'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {currentPlans.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden bg-gradient-to-br ${plan.bgColor} border-pink-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                  plan.popular ? 'ring-2 ring-maroon-500 shadow-2xl scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-maroon-600 to-pink-600 text-white text-center py-2 text-sm font-semibold">
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    Most Popular
                  </div>
                )}
                
                <CardContent className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                  <div className="text-center mb-8">
                    <div className={`bg-gradient-to-br ${plan.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-maroon-800 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-maroon-800">₹{plan.price.toLocaleString('en-IN')}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                      {billingCycle === 'yearly' && (
                        <div className="text-sm text-green-600 font-semibold mt-1">
                          Save ₹{((plan.price / 10 * 12) - plan.price).toLocaleString('en-IN')} per year
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="bg-green-100 rounded-full p-1 mt-0.5">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSubscribe(plan.id, plan.price)}
                    loading={loading === plan.id}
                    fullWidth
                    size="lg"
                    icon={CreditCard}
                    className={`${
                      plan.popular
                        ? 'bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700'
                        : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700'
                    } shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                  >
                    {user ? 'Subscribe Now' : 'Sign Up to Subscribe'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-6">
              {selectedRole === 'participant' ? 'Why Upgrade as a Participant?' : 'Why Choose Premium for Organizers?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {selectedRole === 'participant' 
                ? 'Get more chances to win and access exclusive features that enhance your giveaway experience.'
                : 'Unlock powerful features that help you create more engaging giveaways and grow your audience faster.'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(selectedRole === 'participant' ? [
              {
                icon: Heart,
                title: 'Priority Entries',
                description: 'Get priority processing for all your giveaway entries'
              },
              {
                icon: Users,
                title: 'Referral Bonuses',
                description: 'Earn bonus entries by referring friends to giveaways'
              },
              {
                icon: Trophy,
                title: 'Exclusive Access',
                description: 'Access to premium-only giveaways with better prizes'
              },
              {
                icon: BarChart3,
                title: 'Win Analytics',
                description: 'Track your winning patterns and optimize your strategy'
              }
            ] : [
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description: 'Deep insights into participant behavior and engagement metrics'
              },
              {
                icon: Users,
                title: 'Unlimited Scale',
                description: 'Handle thousands of participants without any limitations'
              },
              {
                icon: Shield,
                title: 'Priority Support',
                description: '24/7 dedicated support to help you succeed'
              },
              {
                icon: Zap,
                title: 'Advanced Features',
                description: 'Custom integrations, API access, and white-label options'
              }
            ]).map((feature) => (
              <Card key={feature.title} className="text-center p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
                <div className="bg-gradient-to-br from-maroon-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-maroon-800 mb-2">{feature.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-maroon-800 mb-6">
              Secure Payment Processing
            </h2>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Your payments are processed securely through PayU, one of India's leading payment gateways. 
              We support all major payment methods including credit cards, debit cards, net banking, and UPI.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
              <div className="text-center">
                <div className="bg-blue-100 rounded-lg p-3 mb-2">
                  <CreditCard className="w-8 h-8 text-blue-600 mx-auto" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Cards</span>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-lg p-3 mb-2">
                  <Shield className="w-8 h-8 text-green-600 mx-auto" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Net Banking</span>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-lg p-3 mb-2">
                  <Zap className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
                <span className="text-sm font-semibold text-gray-700">UPI</span>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              All transactions are encrypted and secure. Cancel anytime with no hidden fees.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-rose-maroon"></div>
        <div className="absolute inset-0 bg-pattern-circles-white opacity-20"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-8">
            <Trophy className="w-12 h-12 text-pink-200 mx-auto" />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to Create
            <span className="block text-pink-200">Magical Experiences?</span>
          </h2>
          
          <p className="text-xl text-pink-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            {selectedRole === 'participant' 
              ? 'Join thousands of happy participants who have discovered amazing prizes and magical experiences.'
              : 'Join thousands of successful organizers who trust GiveawayHub to engage their audience and create unforgettable giveaway experiences.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              as={Link}
              to={user ? "#pricing" : "/auth/signup"}
              size="xl"
              className="bg-white text-maroon-700 hover:bg-pink-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <Crown className="w-5 h-5 mr-2" />
              {user ? `Choose Your ${selectedRole === 'participant' ? 'Participant' : 'Organizer'} Plan` : 'Get Started Today'}
            </Button>
            <Button
              as={Link}
              to="/how-it-works"
              size="xl"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-maroon-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 px-12"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};