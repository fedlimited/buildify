import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PaymentVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  const reference = searchParams.get('reference');
  const trxref = searchParams.get('trxref');

  useEffect(() => {
    const verifyPayment = async () => {
      const ref = reference || trxref;
      
      if (!ref) {
        setStatus('failed');
        setMessage('No payment reference found');
        return;
      }

      try {
        const response = await fetch(`/api/paystack/verify?reference=${ref}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Payment successful! Your subscription has been activated.');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('failed');
          setMessage(data.error || 'Payment verification failed');
        }
      } catch (error) {
        setStatus('failed');
        setMessage('Network error. Please contact support.');
      }
    };

    verifyPayment();
  }, [reference, trxref, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">Payment Verification</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <div className="py-8">
              <Loader2 size={48} className="animate-spin mx-auto text-amber-500 mb-4" />
              <p>Verifying your payment...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="py-8">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
              <p className="text-green-600 font-medium mb-2">Payment Successful!</p>
              <p className="text-gray-600 text-sm mb-4">{message}</p>
              <Button onClick={() => navigate('/dashboard')} className="bg-amber-500 hover:bg-amber-600">
                Go to Dashboard
              </Button>
            </div>
          )}
          
          {status === 'failed' && (
            <div className="py-8">
              <XCircle size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-red-600 font-medium mb-2">Payment Failed</p>
              <p className="text-gray-600 text-sm mb-4">{message}</p>
              <Button onClick={() => navigate('/subscription')} variant="outline">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}