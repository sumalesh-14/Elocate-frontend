'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'An error occurred';

  const getErrorDetails = (msg: string) => {
    if (msg.includes('expired') || msg.includes('Token expired')) {
      return {
        title: 'Link Expired',
        description: 'This pickup link has expired. Links are valid for 24 hours only.',
        icon: (
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'yellow',
      };
    }

    if (msg.includes('used') || msg.includes('already used')) {
      return {
        title: 'Link Already Used',
        description: 'This pickup link has already been used and cannot be used again.',
        icon: (
          <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'orange',
      };
    }

    if (msg.includes('Invalid')) {
      return {
        title: 'Invalid Link',
        description: 'This pickup link is invalid or has been revoked.',
        icon: (
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        color: 'red',
      };
    }

    return {
      title: 'Error',
      description: msg,
      icon: (
        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      color: 'red',
    };
  };

  const errorDetails = getErrorDetails(message);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Error Icon */}
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-${errorDetails.color}-100`}>
            {errorDetails.icon}
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold text-${errorDetails.color}-900 mb-3`}>
            {errorDetails.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            {errorDetails.description}
          </p>

          {/* Error Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 font-mono break-words">
              {message}
            </p>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What should I do?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Contact your supervisor or the admin team</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Request a new pickup link if needed</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Check your email for the latest pickup assignments</span>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm">
              <a
                href="mailto:support@elocate.com"
                className="flex items-center justify-center text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@elocate.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center justify-center text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +1 (234) 567-890
              </a>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => window.close()}
            className="mt-6 w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Close This Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PickupErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
