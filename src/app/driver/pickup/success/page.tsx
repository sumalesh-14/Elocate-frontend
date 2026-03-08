'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action') || 'completed';
  const [countdown, setCountdown] = useState(10);

  const isAccepted = action === 'accepted';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            isAccepted ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isAccepted ? (
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold mb-3 ${
            isAccepted ? 'text-green-900' : 'text-red-900'
          }`}>
            {isAccepted ? 'Pickup Accepted!' : 'Pickup Rejected'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {isAccepted
              ? 'Thank you for completing the pickup. The request has been updated successfully.'
              : 'The pickup has been rejected. The admin team will be notified and will take appropriate action.'}
          </p>

          {/* Status Box */}
          <div className={`border-2 rounded-lg p-4 mb-6 ${
            isAccepted 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              <svg className={`w-5 h-5 ${isAccepted ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-medium ${isAccepted ? 'text-green-900' : 'text-red-900'}`}>
                Status Updated Successfully
              </span>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              {isAccepted ? (
                <>
                  <li>• The citizen will be notified of the successful pickup</li>
                  <li>• The request will move to the next processing stage</li>
                  <li>• Your pickup record has been saved</li>
                </>
              ) : (
                <>
                  <li>• The admin team will review your rejection reason</li>
                  <li>• The citizen will be notified</li>
                  <li>• A new driver may be assigned if needed</li>
                </>
              )}
            </ul>
          </div>

          {/* Auto-close Notice */}
          <div className="text-sm text-gray-500 mb-4">
            This page will close automatically in {countdown} seconds
          </div>

          {/* Close Button */}
          <button
            onClick={() => window.close()}
            className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Close This Page
          </button>

          {/* Help Text */}
          <p className="mt-4 text-xs text-gray-500">
            If the page doesn't close automatically, you can safely close this tab
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PickupSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
