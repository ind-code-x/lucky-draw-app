import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

export const SubscriptionFailurePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  const txnid = searchParams.get('txnid');
  const error = searchParams.get('error');
  const error_Message = searchParams.get('error_Message');

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-maroon-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="bg-white/90 backdrop-blur-sm border-pink-200 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="bg-gradient-to-br from-red-500 to-rose-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-red-600 mb-4">
              Payment Failed
            </h1>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We're sorry, but your payment could not be processed. 
              Please try again or contact support if the issue persists.
            </p>

            {(txnid || error || error_Message) && (
              <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {txnid && <div><span className="font-medium">Transaction ID:</span> {txnid}</div>}
                  {error && <div><span className="font-medium">Error Code:</span> {error}</div>}
                  {error_Message && <div><span className="font-medium">Message:</span> {error_Message}</div>}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <Button
                as={Link}
                to="/subscription"
                size="lg"
                fullWidth
                icon={RefreshCw}
                className="bg-gradient-to-r from-maroon-600 to-pink-600 hover:from-maroon-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Try Again
              </Button>
              
              <Button
                as={Link}
                to="/dashboard"
                size="lg"
                fullWidth
                variant="outline"
                icon={ArrowLeft}
                className="border-2 border-gray-400 text-gray-600 hover:bg-gray-50"
              >
                Back to Dashboard
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-pink-200">
              <p className="text-sm text-gray-500 mb-4">
                Need help with your payment?
              </p>
              <Link
                to="/contact"
                className="text-maroon-600 hover:text-pink-600 font-semibold text-sm flex items-center justify-center transition-colors duration-300"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Contact Support
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};