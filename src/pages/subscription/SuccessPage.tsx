import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Trophy, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import toast from 'react-hot-toast';

export const SubscriptionSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const txnid = searchParams.get('txnid');
  const amount = searchParams.get('amount');
  const productinfo = searchParams.get('productinfo');
  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'success') {
      toast.success('Payment successful! Welcome to premium! ✨');
    }
  }, [status]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold bg-gradient-to-r from-maroon-700 to-pink-600 bg-clip-text text-transparent mb-4">
              Payment Successful!
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Congratulations! Your subscription has been activated successfully. 
              You now have access to all premium features.
            </p>

            {txnid && (
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-maroon-800 mb-2">Transaction Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><span className="font-medium">Transaction ID:</span> {txnid}</div>
                  {amount && <div><span className="font-medium">Amount:</span> ₹{amount}</div>}
                  {productinfo && <div><span className="font-medium">Plan:</span> {productinfo}</div>}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button
                as={Link}
                to="/dashboard"
                size="lg"
                fullWidth
                icon={Trophy}
                className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Go to Dashboard
              </Button>
              
              <Button
                as={Link}
                to="/dashboard/create"
                size="lg"
                fullWidth
                variant="outline"
                icon={Sparkles}
                className="border-2 border-maroon-600 text-maroon-600 hover:bg-maroon-50"
              >
                Create Your First Giveaway
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-pink-200">
              <p className="text-sm text-gray-500 mb-4">
                Need help getting started?
              </p>
              <Link
                to="/help"
                className="text-maroon-600 hover:text-pink-600 font-semibold text-sm flex items-center justify-center transition-colors duration-300"
              >
                Visit Help Center
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};