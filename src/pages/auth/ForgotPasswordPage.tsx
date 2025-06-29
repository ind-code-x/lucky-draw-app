import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Gift, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast.success('Password reset email sent! ✨');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots-pink opacity-50"></div>
        
        <div className="relative max-w-md w-full">
          <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-2xl">
            <div className="p-8 text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-4">
                Check Your Email
              </h2>
              
              <p className="text-gray-600 mb-8 leading-relaxed">
                We've sent a password reset link to <strong>{email}</strong>. 
                Click the link in the email to reset your password.
              </p>

              <div className="space-y-4">
                <Button
                  as={Link}
                  to="/auth/login"
                  fullWidth
                  size="lg"
                  icon={ArrowLeft}
                  className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-maroon-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern-dots-pink opacity-50"></div>
      
      <div className="relative max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="bg-gradient-to-br from-maroon-600 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-all duration-300 relative">
            <Gift className="w-10 h-10 text-white" />
            <Sparkles className="w-4 h-4 text-pink-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-3">
            Reset Password
          </h2>
          <p className="text-lg text-gray-600">
            Enter your email to receive a reset link
          </p>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              placeholder="Enter your email"
              className="border-pink-200 focus:border-maroon-400 focus:ring-maroon-400"
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              icon={Mail}
              className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Send Reset Link
            </Button>

            <div className="text-center">
              <Link
                to="/auth/login"
                className="text-maroon-600 hover:text-pink-600 font-semibold transition-colors duration-300 flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};