'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface TokenValidation {
  valid: boolean;
  action: string;
  requestId: string;
  driverName: string;
  citizenAddress: string;
  deviceName: string;
  message: string;
}

export default function RejectPickupPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenData, setTokenData] = useState<TokenValidation | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  // Common rejection reasons
  const commonReasons = [
    'Address not found',
    'Customer not available',
    'Device not ready for pickup',
    'Access denied to location',
    'Incorrect device information',
    'Safety concerns',
    'Other (specify below)',
  ];

  useEffect(() => {
    if (token) {
      validateToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/driver/pickup/validate/${token}`);
      const data = await response.json();

      if (!data.valid) {
        router.push(`/driver/pickup/error?message=${encodeURIComponent(data.message)}`);
        return;
      }

      if (data.action !== 'REJECT') {
        router.push(`/driver/pickup/error?message=Invalid token type`);
        return;
      }

      setTokenData(data);
    } catch (err) {
      console.error('Token validation error:', err);
      router.push('/driver/pickup/error?message=Failed to validate token');
    } finally {
      setValidating(false);
    }
  };

  const handleReasonSelect = (selectedReason: string) => {
    if (selectedReason === 'Other (specify below)') {
      setReason('');
    } else {
      setReason(selectedReason);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/driver/pickup/reject/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject pickup');
      }

      // Success - redirect to success page
      router.push('/driver/pickup/success?action=rejected');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to reject pickup. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Validating token...</p>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Reject Pickup
            </h1>
            <p className="text-gray-600">
              Please provide a reason for rejecting this pickup
            </p>
          </div>

          {/* Pickup Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-red-900 mb-3">Pickup Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Request ID:</span>
                <span className="font-medium text-gray-900">{tokenData.requestId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Driver:</span>
                <span className="font-medium text-gray-900">{tokenData.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Device:</span>
                <span className="font-medium text-gray-900">{tokenData.deviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-gray-900 text-right ml-4">
                  {tokenData.citizenAddress}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Common Reasons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Reason <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {commonReasons.map((commonReason) => (
                  <button
                    key={commonReason}
                    type="button"
                    onClick={() => handleReasonSelect(commonReason)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                      reason === commonReason
                        ? 'border-red-500 bg-red-50 text-red-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    {commonReason}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details {reason && <span className="text-red-500">*</span>}
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Provide additional details about why the pickup cannot be completed..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Please be specific to help resolve the issue
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !reason.trim()}
                className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  '✗ Reject Pickup'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
