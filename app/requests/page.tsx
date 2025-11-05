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

interface Event {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  ownerName: string;
  ownerEmail: string;
  swappable: boolean;
}

export default function RequestsPage() {
  const router = useRouter();
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'request'>('incoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [requestForm, setRequestForm] = useState({
    reason: '',
    preferredDate: '',
    preferredTime: '',
    contactEmail: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
    fetchAvailableEvents();
  }, []);

  const fetchRequests = async () => {
  try {
    setLoading(true);
    setError('');

    console.log('🟡 [Frontend] Fetching swap requests...');

    const [incomingRes, outgoingRes] = await Promise.all([
      api.get('/swap-requests/incoming'),
      api.get('/swap-requests/outgoing')
    ]);

    console.log('✅ [Frontend] Incoming response:', incomingRes.data);
    console.log('✅ [Frontend] Outgoing response:', outgoingRes.data);

    if (incomingRes.data.success) {
      console.log('🟢 [Frontend] Setting incoming requests:', incomingRes.data.data);
      setIncomingRequests(incomingRes.data.data || []);
    } else {
      console.error('❌ [Frontend] Incoming requests failed:', incomingRes.data);
    }

    if (outgoingRes.data.success) {
      console.log('🟢 [Frontend] Setting outgoing requests:', outgoingRes.data.data);
      setOutgoingRequests(outgoingRes.data.data || []);
    } else {
      console.error('❌ [Frontend] Outgoing requests failed:', outgoingRes.data);
    }

  } catch (err: any) {
    console.error('❌ Error fetching requests:', err);
    // ... rest of error handling
  } finally {
    setLoading(false);
  }
};

  const fetchAvailableEvents = async () => {
    try {
      const response = await api.get('/events/swappable');
      if (response.data && Array.isArray(response.data)) {
        setAvailableEvents(response.data);
      }
    } catch (err) {
      console.error('❌ Error fetching available events:', err);
    }
  };

  const cleanupTestData = async () => {
    try {
      const response = await api.delete('/swap-requests/cleanup-test');
      if (response.data.success) {
        alert(`Cleaned up ${response.data.deletedCount} ALL requests from database`);
        fetchRequests();
      }
    } catch (err) {
      console.error('❌ Error cleaning up test data:', err);
      alert('Error cleaning up test data');
    }
  };

  const openRequestModal = (event: Event) => {
    setSelectedEvent(event);
    setRequestForm({
      reason: '',
      preferredDate: '',
      preferredTime: '',
      contactEmail: ''
    });
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setSelectedEvent(null);
    setRequestForm({
      reason: '',
      preferredDate: '',
      preferredTime: '',
      contactEmail: ''
    });
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEvent) return;

    try {
      setSubmitting(true);

      const requestData = {
        eventId: selectedEvent._id,
        reason: requestForm.reason,
        preferredDate: requestForm.preferredDate,
        preferredTime: requestForm.preferredTime,
        contactEmail: requestForm.contactEmail
      };
      
      const response = await api.post('/swaps', requestData);
      
      if (response.data.success) {
        alert('Swap request sent successfully!');
        closeRequestModal();
        fetchRequests();
        setActiveTab('outgoing');
      } else {
        alert('Failed to send request: ' + response.data.message);
      }

    } catch (err: any) {
      console.error('❌ Error submitting swap request:', err);
      alert('Failed to send swap request: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const response = await api.patch(`/swaps/${requestId}`, { status });
      fetchRequests();
      alert(`Request ${status} successfully!`);
    } catch (err: any) {
      console.error('❌ Error updating request:', err);
      if (err.response?.status === 403) {
        alert('You are not authorized to update this request. You must be the event owner.');
      } else {
        alert('Failed to update request: ' + (err.response?.data?.message || err.message));
      }
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

        {/* Stats Info */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Stats:</strong> Incoming: {incomingRequests.length} | Outgoing: {outgoingRequests.length} | Available Events: {availableEvents.length}
          </p>
          <div className="mt-2 flex gap-2">
            <button 
              onClick={fetchRequests}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Refresh
            </button>
            <button 
              onClick={cleanupTestData}
              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
            >
              Clean ALL Data
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
          <button
            onClick={() => setActiveTab('request')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'request'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Request Swap
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
                <button
                  onClick={() => setActiveTab('request')}
                  className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Request a Swap
                </button>
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

        {/* Request Swap Tab */}
        {activeTab === 'request' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Events for Swapping</h2>
            
            {availableEvents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No available events for swapping</p>
                <p className="text-gray-400 mt-2">Check back later for swappable events.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableEvents.map((event) => (
                  <div key={event._id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      <strong>Time:</strong> {formatDateTime(event.startTime)}
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      <strong>Owner:</strong> {event.ownerName}
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                      <strong>Email:</strong> {event.ownerEmail}
                    </p>
                    <button
                      onClick={() => openRequestModal(event)}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Request Swap
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Swap Request Modal */}
        {showRequestModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Request Shift Swap</h2>
                  <button
                    onClick={closeRequestModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Event Details */}
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">Event Details</h3>
                  <p><strong>Title:</strong> {selectedEvent.title}</p>
                  <p><strong>Time:</strong> {formatDateTime(selectedEvent.startTime)}</p>
                  <p><strong>Owner:</strong> {selectedEvent.ownerName} ({selectedEvent.ownerEmail})</p>
                </div>

                {/* Request Form */}
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Why do you want to swap this shift? *
                    </label>
                    <textarea
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Please explain why you want to swap this shift..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        value={requestForm.preferredDate}
                        onChange={(e) => setRequestForm({...requestForm, preferredDate: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preferred Time *
                      </label>
                      <input
                        type="time"
                        value={requestForm.preferredTime}
                        onChange={(e) => setRequestForm({...requestForm, preferredTime: e.target.value})}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email Address *
                    </label>
                    <input
                      type="email"
                      value={requestForm.contactEmail}
                      onChange={(e) => setRequestForm({...requestForm, contactEmail: e.target.value})}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your-email@example.com"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeRequestModal}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Sending...' : 'Send Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

