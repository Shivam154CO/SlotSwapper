
// app/swap/request/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';

interface Event {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  ownerName: string;
  ownerEmail: string;
  swappable: boolean;
}

export default function SwapRequestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get('eventId');
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    preferredDate: '',
    preferredTime: '',
    contactEmail: ''
  });

  useEffect(() => {
    if (!eventId) {
      console.error('❌ No eventId parameter found in URL');
      alert('No event specified for swap. Please select an event from the marketplace.');
      router.push('/marketplace');
      return;
    }

    fetchEventDetails();
  }, [eventId, router]);

// In the fetchEventDetails function, update the API call:
const fetchEventDetails = async () => {
  try {
    setLoading(true);
    console.log('🟡 Fetching event details for ID:', eventId);
    
    // Use the correct endpoint - /api/events/:id
    const response = await api.get(`/events/${eventId}`);
    console.log('✅ Event details response:', response.data);
    
    if (response.data) {
      setEvent(response.data);
    } else {
      throw new Error('Event not found');
    }
  } catch (error: any) {
    console.error('❌ Error fetching event details:', error);
    alert('Error loading event details: ' + (error.response?.data?.message || error.message));
    router.push('/marketplace');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventId || !event) {
      alert('No event selected for swap');
      return;
    }

    try {
      setSubmitting(true);
      
      const requestData = {
        eventId: eventId,
        reason: formData.reason,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        contactEmail: formData.contactEmail
      };

      console.log('🟡 Submitting swap request:', requestData);
      
      const response = await api.post('/swaps', requestData);
      console.log('✅ Swap request response:', response.data);
      
      if (response.data.success) {
        alert('Swap request sent successfully!');
        router.push('/requests');
      } else {
        alert('Failed to send request: ' + response.data.message);
      }
    } catch (error: any) {
      console.error('❌ Error submitting swap request:', error);
      alert('Failed to send swap request: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading event details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!event) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-6">The event you're trying to swap could not be found.</p>
            <button
              onClick={() => router.push('/marketplace')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <button
            onClick={() => router.push('/marketplace')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Marketplace
          </button>
          <h1 className="text-3xl font-bold text-blue-700 mb-2">Request Shift Swap</h1>
          <p className="text-gray-600">Submit a request to swap this event</p>
        </div>

        {/* Event Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Title:</strong> {event.title}</p>
              <p><strong>Start Time:</strong> {formatDateTime(event.startTime)}</p>
              <p><strong>End Time:</strong> {formatDateTime(event.endTime)}</p>
            </div>
            <div>
              <p><strong>Owner:</strong> {event.ownerName}</p>
              <p><strong>Email:</strong> {event.ownerEmail}</p>
              <p><strong>Status:</strong> <span className="text-green-600">Available for Swap</span></p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Your swap request will be sent to {event.ownerName} for approval.
            </p>
          </div>
        </div>

        {/* Swap Request Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Swap Request Form</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Swap Request *
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please explain why you want to swap this shift..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  id="preferredDate"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time *
                </label>
                <input
                  type="time"
                  id="preferredTime"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email Address *
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your-email@example.com"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/marketplace')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Request...
                  </span>
                ) : (
                  'Send Swap Request'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700">Debug Information</summary>
            <div className="mt-2 space-y-1 font-mono text-xs">
              <p>Event ID: {eventId}</p>
              <p>Event Title: {event.title}</p>
              <p>Event Owner: {event.ownerName}</p>
            </div>
          </details>
        </div>
      </div>
    </ProtectedRoute>
  );
}