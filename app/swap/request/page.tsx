'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

interface SwapRequest {
  id: string;
  eventTitle: string;
  eventTime: string;
  ownerName?: string;
  ownerEmail?: string;
  requesterEmail?: string;
  requesterName?: string;
  reason: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  createdAt: string;
  requestType: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🟡 Fetching swap requests from new endpoints...');

      // ✅ FIXED: Use the new non-conflicting routes
      const [incomingRes, outgoingRes] = await Promise.all([
        api.get('/swap-requests/incoming'),
        api.get('/swap-requests/outgoing')
      ]);

      console.log('✅ Incoming response:', incomingRes.data);
      console.log('✅ Outgoing response:', outgoingRes.data);

      if (incomingRes.data.success) {
        setIncomingRequests(incomingRes.data.data || []);
      } else {
        console.error('❌ Incoming requests failed:', incomingRes.data);
      }

      if (outgoingRes.data.success) {
        setOutgoingRequests(outgoingRes.data.data || []);
      } else {
        console.error('❌ Outgoing requests failed:', outgoingRes.data);
      }

    } catch (err: any) {
      console.error('❌ Error fetching requests:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError('Please log in to view swap requests');
      } else if (err.response?.status === 404) {
        setError('Swap requests endpoint not found. Please check the backend routes.');
      } else {
        setError('Failed to load swap requests. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      console.log(`🟡 Updating request ${requestId} to ${status}`);
      
      // This still uses the original swaps route for individual requests
      const response = await api.patch(`/swaps/${requestId}`, { status });
      
      console.log('✅ Update response:', response.data);
      
      // Refresh requests
      fetchRequests();
      
      alert(`Request ${status} successfully!`);
    } catch (err: any) {
      console.error('❌ Error updating request:', err);
      console.error('❌ Error response:', err.response?.data);
      alert('Failed to update request');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Test if swap requests are being created
  const testSwapCreation = async () => {
    try {
      // Create a test swap request
      const testEventId = "690b1bab6cf93531a025237e"; // Use a real event ID from your database
      const testData = {
        eventId: testEventId,
        reason: "Test swap request from requests page",
        preferredDate: "2024-01-20",
        preferredTime: "14:00",
        contactEmail: "test@example.com"
      };

      console.log('🟡 Creating test swap request:', testData);
      
      const response = await api.post('/swaps', testData);
      console.log('✅ Test swap created:', response.data);
      
      alert('Test swap request created! Refresh the page to see it.');
      fetchRequests(); // Refresh to see the new request
    } catch (err: any) {
      console.error('❌ Error creating test swap:', err);
      alert('Failed to create test swap request');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="max-w-6xl mx-auto p-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading swap requests...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Swap Requests</h1>
          <p className="text-gray-600">Manage your incoming and outgoing shift swap requests</p>
        </div>

        {/* Debug Info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Debug Info:</strong> Incoming: {incomingRequests.length} | Outgoing: {outgoingRequests.length}
          </p>
          <div className="mt-2 flex gap-2">
            <button 
              onClick={testSwapCreation}
              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
            >
              Test Create Swap
            </button>
            <button 
              onClick={fetchRequests}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'incoming'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Incoming Requests ({incomingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('outgoing')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'outgoing'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Requests ({outgoingRequests.length})
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={fetchRequests}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Incoming Requests Tab */}
        {activeTab === 'incoming' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Requests for Your Events</h2>
            
            {incomingRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No incoming swap requests</p>
                <p className="text-gray-400 mt-2">When someone requests to swap your shifts, they'll appear here.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Make sure your events are marked as "swappable" in your dashboard.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {request.eventTitle}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Requested by: {request.requesterName} ({request.requesterEmail})
                        </p>
                        <p className="text-gray-600 text-sm">
                          Preferred: {request.preferredDate} at {request.preferredTime}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700"><strong>Reason:</strong> {request.reason}</p>
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      <p>Received on: {formatDate(request.createdAt)} at {formatTime(request.createdAt)}</p>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => updateRequestStatus(request.id, 'accepted')}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                        >
                          Accept Request
                        </button>
                        <button
                          onClick={() => updateRequestStatus(request.id, 'rejected')}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
                        >
                          Reject Request
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Outgoing Requests Tab */}
        {activeTab === 'outgoing' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Swap Requests</h2>
            
            {outgoingRequests.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No outgoing swap requests</p>
                <p className="text-gray-400 mt-2">
                  When you request to swap shifts, they'll appear here.
                </p>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => router.push('/marketplace')}
                    className="block w-full max-w-xs mx-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Browse Marketplace
                  </button>
                  <p className="text-gray-500 text-sm">
                    Go to Marketplace → Find swappable events → Click "Request Swap"
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {request.eventTitle}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Event Owner: {request.ownerName} ({request.ownerEmail})
                        </p>
                        <p className="text-gray-600 text-sm">
                          Your Preferred: {request.preferredDate} at {request.preferredTime}
                        </p>
                      </div>
                      <div className="mt-2 md:mt-0">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : request.status === 'accepted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-gray-700"><strong>Your Reason:</strong> {request.reason}</p>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>Requested on: {formatDate(request.createdAt)} at {formatTime(request.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}