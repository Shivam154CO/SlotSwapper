'use client';
import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-4xl font-bold text-green-600 mb-6">Swap Request Submitted!</h1>
        
        <div className="text-lg text-gray-700 mb-8 space-y-3">
          <p>Your shift swap request has been received and is pending approval.</p>
          <p>The event owner will contact you via email to arrange the swap.</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl mb-8 text-left">
          <h3 className="text-xl font-semibold text-green-800 mb-4 text-center">What happens next?</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">•</span>
              The event owner will review your request
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">•</span>
              You'll receive an email notification with updates
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">•</span>
              The owner will contact you to arrange the swap details
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">•</span>
              Check your email regularly for updates
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/marketplace" 
            className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 font-semibold transition-colors text-center"
          >
            📋 Back to Marketplace
          </Link>
          <Link 
            href="/dashboard" 
            className="bg-gray-600 text-white px-8 py-4 rounded-lg hover:bg-gray-700 font-semibold transition-colors text-center"
          >
            🏠 Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}