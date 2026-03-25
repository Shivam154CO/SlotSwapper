"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { CheckCircle, XCircle, AlertCircle, ArrowLeft, Loader2, List } from 'lucide-react';

function SwapConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      setStatus('success');
      setMessage('Swap request submitted successfully!');
    } else if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error));
    } else {
      setStatus('error');
      setMessage('Invalid confirmation page access');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full shadow-sm text-center">
        {status === 'loading' && (
          <div className="py-12">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Processing Request...</h1>
            <p className="text-gray-500">Please wait while we confirm your swap request.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
            <p className="text-gray-600 mb-8 px-4">{message}</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/requests')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <List className="w-4 h-4" /> View My Requests
              </button>
              <button
                onClick={() => router.push('/marketplace')}
                className="w-full bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Marketplace
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Failed</h1>
            <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-8 font-medium">
              {message}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 font-medium transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/marketplace')}
                className="w-full bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Marketplace
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SwapConfirmationPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-12 max-w-md w-full shadow-sm text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Loading...</h1>
            </div>
          </div>
        }
      >
        <SwapConfirmationContent />
      </Suspense>
    </ProtectedRoute>
  );
}