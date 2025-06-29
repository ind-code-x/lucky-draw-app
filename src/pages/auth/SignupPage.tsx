import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Gift, Heart, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: 'participant' as 'participant' | 'organizer',
  });
  const [loading, setLoading] = useState(false);
  const { user, signUp } = useAuthStore();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.username);
      toast.success('Welcome to the magic! ✨');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern-dots-pink opacity-50"></div>
      
      <div className="relative max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="bg-gradient-to-br from-maroon-600 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300 relative">
            <Gift className="w-10 h-10 text-white" />
            <Sparkles className="w-4 h-4 text-pink-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-3">
            Create Account
          </h2>
          <p className="text-lg text-gray-600 flex items-center justify-center space-x-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <span>Join the magical journey</span>
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              type="text"
              icon={User}
              value={formData.username}
              onChange={(e) => updateFormData('username', e.target.value)}
              required
              fullWidth
              placeholder="Choose a magical username"
              className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
            />

            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              required
              fullWidth
              placeholder="Enter your email"
              className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={formData.password}
              onChange={(e) => updateFormData('password', e.target.value)}
              required
              fullWidth
              placeholder="Create a secure password"
              className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={(e) => updateFormData('confirmPassword', e.target.value)}
              required
              fullWidth
              placeholder="Confirm your password"
              className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
            />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                I want to:
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 rounded-xl border border-pink-200 hover:border-maroon-300 hover:bg-pink-50 transition-all duration-300 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="participant"
                    checked={formData.role === 'participant'}
                    onChange={(e) => updateFormData('role', e.target.value)}
                    className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-pink-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Participate in magical giveaways
                  </span>
                </label>
                <label className="flex items-center p-3 rounded-xl border border-pink-200 hover:border-maroon-300 hover:bg-pink-50 transition-all duration-300 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="organizer"
                    checked={formData.role === 'organizer'}
                    onChange={(e) => updateFormData('role', e.target.value)}
                    className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-pink-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Create and manage enchanting giveaways
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-start p-3 rounded-xl bg-pink-50 border border-pink-200">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-maroon-600 focus:ring-maroon-500 border-pink-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-maroon-600 hover:text-pink-600 font-semibold transition-colors duration-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-maroon-600 hover:text-pink-600 font-semibold transition-colors duration-300">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              icon={UserPlus}
              className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Create Magical Account
            </Button>

            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                to="/auth/login"
                className="text-maroon-600 hover:text-pink-600 font-semibold transition-colors duration-300"
              >
                Sign in
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};