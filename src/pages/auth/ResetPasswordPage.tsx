import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle, Gift, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');

    if (!accessToken || type !== 'recovery') {
      toast.error('Invalid or expired reset link');
      navigate('/auth/forgot-password');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Password reset successfully!');

      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-50"></div>

        <div className="relative max-w-md w-full">
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-2xl">
            <div className="p-8 text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-red-700 to-pink-600 bg-clip-text text-transparent mb-4">
                Password Reset Complete
              </h2>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>

              <Button
                onClick={() => navigate('/auth/login')}
                fullWidth
                size="lg"
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Sign In Now
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-50"></div>

      <div className="relative max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-gradient-to-br from-red-600 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300 relative">
            <Gift className="w-10 h-10 text-white" />
            <Sparkles className="w-4 h-4 text-pink-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-red-700 to-pink-600 bg-clip-text text-transparent mb-3">
            Reset Password
          </h2>
          <p className="text-lg text-gray-600">
            Enter your new password
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-semibold mb-1">Password Requirements</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>At least 6 characters long</li>
                    <li>Both passwords must match</li>
                  </ul>
                </div>
              </div>
            </div>

            <Input
              label="New Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              placeholder="Enter your new password"
              className="border-pink-200 focus:border-red-400 focus:ring-red-400"
              minLength={6}
            />

            <Input
              label="Confirm New Password"
              type="password"
              icon={Lock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              placeholder="Confirm your new password"
              className="border-pink-200 focus:border-red-400 focus:ring-red-400"
              minLength={6}
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              icon={Lock}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Reset Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
