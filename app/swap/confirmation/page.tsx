'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

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
      setMessage('Failed to submit swap request: ' + error);
    } else {
      setStatus('error');
      setMessage('Invalid confirmation page access');
    }
  }, [searchParams]);

  return (
    <div className="max-w-2xl mx-auto p-4 mt-8">
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing...</h1>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Success!</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/requests')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                View My Requests
              </button>
              <button
                onClick={() => router.push('/marketplace')}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
              >
                Back to Marketplace
              </button>
            </div>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/marketplace')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Back to Marketplace
              </button>
              <button
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
              >
                Try Again
              </button>
            </div>
          </>
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
          <div className="max-w-2xl mx-auto p-4 mt-8">
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h1>
            </div>
          </div>
        }
      >
        <SwapConfirmationContent />
      </Suspense>
    </ProtectedRoute>
  );
}