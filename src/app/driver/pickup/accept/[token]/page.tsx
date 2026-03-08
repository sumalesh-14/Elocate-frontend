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

export default function AcceptPickupPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenData, setTokenData] = useState<TokenValidation | null>(null);
  const [comments, setComments] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    if (token) {
      validateToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const validateToken = async () => {
    try {
      console.log('🔵 [DRIVER API CALL 1] Validating token:', token);
      const response = await fetch(`${API_BASE}/api/v1/driver/pickup/validate/${token}`);
      const data = await response.json();
      console.log('✅ [DRIVER API RESPONSE 1] Token validation result:', data);

      if (!data.valid) {
        router.push(`/driver/pickup/error?message=${encodeURIComponent(data.message)}`);
        return;
      }

      if (data.action !== 'ACCEPT') {
        router.push(`/driver/pickup/error?message=Invalid token type`);
        return;
      }

      setTokenData(data);
    } catch (err) {
      console.error('❌ [DRIVER API ERROR 1] Token validation error:', err);
      router.push('/driver/pickup/error?message=Failed to validate token');
    } finally {
      setValidating(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setPhotoFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async () => {
    if (!photoFile) {
      setError('Please select a photo');
      return false;
    }

    setUploadingPhoto(true);
    setError(null);

    try {
      console.log('🔵 [DRIVER API CALL 2] Getting S3 upload URL for token:', token);
      console.log('📷 [PHOTO INFO] File type:', photoFile.type, 'Size:', photoFile.size);
      
      const urlResponse = await fetch(`${API_BASE}/api/v1/driver/pickup/upload-url/${token}`);
      
      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, publicUrl } = await urlResponse.json();
      console.log('✅ [DRIVER API RESPONSE 2] Got S3 URLs - Public URL:', publicUrl);

      // IMPORTANT: Content-Type must match what was used to generate the pre-signed URL
      console.log('🔵 [DRIVER S3 CALL] Uploading photo to S3 with Content-Type: image/jpeg');
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: photoFile,
        headers: {
          'Content-Type': 'image/jpeg',
        },
      });

      if (!uploadResponse.ok) {
        console.error('❌ [S3 ERROR] Status:', uploadResponse.status, 'StatusText:', uploadResponse.statusText);
        throw new Error('Failed to upload photo');
      }

      console.log('✅ [DRIVER S3 RESPONSE] Photo uploaded successfully to S3');
      setPhotoUrl(publicUrl);
      return true;
    } catch (err) {
      console.error('❌ [DRIVER UPLOAD ERROR] Photo upload error:', err);
      setError('Failed to upload photo. Please try again.');
      return false;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🟢 [DRIVER SUBMIT] Starting pickup acceptance flow...');
    
    if (!comments.trim()) {
      setError('Please enter comments');
      return;
    }

    if (!photoFile) {
      setError('Please take a photo of the pickup');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      console.log('📸 [DRIVER STEP 1] Uploading photo first...');
      const uploadSuccess = await uploadPhoto();
      if (!uploadSuccess) {
        console.log('❌ [DRIVER STEP 1] Photo upload failed, stopping...');
        setSubmitting(false);
        return;
      }

      console.log('🔵 [DRIVER API CALL 3] Accepting pickup with photo URL:', photoUrl);
      const response = await fetch(`${API_BASE}/api/v1/driver/pickup/accept/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comments: comments.trim(),
          photoUrl: photoUrl,
        }),
      });

      const data = await response.json();
      console.log('✅ [DRIVER API RESPONSE 3] Accept pickup result:', data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to accept pickup');
      }

      console.log('🎉 [DRIVER COMPLETE] Pickup accepted successfully! Redirecting...');
      router.push('/driver/pickup/success?action=accepted');
    } catch (err: any) {
      console.error('❌ [DRIVER SUBMIT ERROR] Submit error:', err);
      setError(err.message || 'Failed to accept pickup. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Accept Pickup
            </h1>
            <p className="text-gray-600">
              Complete the pickup by taking a photo and adding comments
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-3">Pickup Details</h2>
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Photo <span className="text-red-500">*</span>
              </label>
              
              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Pickup preview"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      setPhotoUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Click to take photo or upload
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter pickup details, condition of device, any issues, etc."
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Describe the pickup condition and any relevant details
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || uploadingPhoto || !photoFile || !comments.trim()}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {uploadingPhoto ? 'Uploading Photo...' : 'Submitting...'}
                  </span>
                ) : (
                  '✓ Accept Pickup'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
