import React, { useState } from 'react';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { subscriptionPlans, PayUManager } from '../lib/payments';
import { useAuth } from '../contexts/AuthContext';

export function SubscriptionPlans() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const payuManager = new PayUManager({
    merchantKey: import.meta.env.VITE_PAYU_MERCHANT_KEY || 'test_key',
    salt: import.meta.env.VITE_PAYU_SALT || 'test_salt',
    baseUrl: import.meta.env.VITE_PAYU_BASE_URL || 'https://test.payu.in/_payment',
  });

  const handleSubscribe = async (planId: string) => {
    if (!user) return;

    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan || plan.price === 0) return;

    setSelectedPlan(planId);
    setProcessing(true);

    try {
      const txnid = payuManager.generateTransactionId();
      
      payuManager.initiatePayment({
        txnid,
        amount: plan.price,
        productinfo: `${plan.name} Subscription - GiveawayHub`,
        firstname: user.name,
        email: user.email,
        phone: '9999999999', // You should collect this from user
        surl: `${window.location.origin}/payment/success`,
        furl: `${window.location.origin}/payment/failure`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="w-6 h-6" />;
      case 'premium':
        return <Zap className="w-6 h-6" />;
      case 'pro':
        return <Crown className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'border-gray-200';
      case 'premium':
        return 'border-purple-500 ring-2 ring-purple-200';
      case 'pro':
        return 'border-yellow-500 ring-2 ring-yellow-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-xl text-gray-600">
          Select the perfect plan to grow your social media presence
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl shadow-lg border-2 ${getPlanColor(plan.id)} p-8 ${
              plan.id === 'premium' ? 'transform scale-105' : ''
            }`}
          >
            {plan.id === 'premium' && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <div className={`inline-flex p-3 rounded-full mb-4 ${
                plan.id === 'free' ? 'bg-gray-100 text-gray-600' :
                plan.id === 'premium' ? 'bg-purple-100 text-purple-600' :
                'bg-yellow-100 text-yellow-600'
              }`}>
                {getPlanIcon(plan.id)}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-600 ml-2">/month</span>
                )}
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <Check size={20} className="text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 mb-8 text-sm text-gray-600">
              <p>• {plan.giveawayLimit === -1 ? 'Unlimited' : plan.giveawayLimit} active giveaways</p>
              <p>• {plan.socialPlatforms.length} social platforms</p>
            </div>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={processing && selectedPlan === plan.id}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                plan.id === 'free'
                  ? 'bg-gray-100 text-gray-600 cursor-default'
                  : plan.id === 'premium'
                  ? 'bg-purple-600 text-white hover:bg-purple-700 transform hover:scale-105'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700 transform hover:scale-105'
              } ${processing && selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {processing && selectedPlan === plan.id ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : plan.id === 'free' ? (
                'Current Plan'
              ) : (
                'Subscribe Now'
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 All Plans Include
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
                <Check size={32} className="mx-auto text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900">Fair Winner Selection</h4>
              <p className="text-sm text-gray-600">Transparent random selection</p>
            </div>
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
                <Zap size={32} className="mx-auto text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900">Real-time Analytics</h4>
              <p className="text-sm text-gray-600">Track performance instantly</p>
            </div>
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm mb-3">
                <Crown size={32} className="mx-auto text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900">24/7 Support</h4>
              <p className="text-sm text-gray-600">Get help when you need it</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}