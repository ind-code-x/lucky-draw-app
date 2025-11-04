import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Mail, LogIn, Gift, Sparkles, Heart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export const EmailConfirmedPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    toast.success('Email confirmed successfully!');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-50"></div>

      <div className="relative max-w-md w-full">
        <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-2xl">
          <div className="p-8 text-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-pink-600 bg-clip-text text-transparent mb-4">
              Email Confirmed
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              Your email has been successfully confirmed! You can now sign in to your account
              and start your giveaway journey.
            </p>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-6 mb-8 border border-pink-200">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Gift className="w-8 h-8 text-red-600" />
                <Heart className="w-6 h-6 text-pink-500 animate-pulse" />
                <Sparkles className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-red-800 mb-2">Welcome to GiveawayHub</h3>
              <p className="text-sm text-gray-700">
                Your account is now active and ready to use. Sign in to explore amazing giveaways
                or create your own experiences.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                as={Link}
                to="/auth/login"
                fullWidth
                size="lg"
                icon={LogIn}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Sign In to Your Account
              </Button>

              <Button
                as={Link}
                to="/"
                fullWidth
                size="lg"
                variant="outline"
                icon={Gift}
                className="border-2 border-red-600 text-red-600 hover:bg-red-50"
              >
                Explore Giveaways
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-pink-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>Confirmation email sent to your inbox</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
