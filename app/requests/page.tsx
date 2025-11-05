"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

type Event = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  swappable?: boolean;
};

type RequestedEvent = Event & {
  ownerName: string;
  ownerEmail: string;
};

export default function RequestSwap() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedEventId = searchParams.get("eventId");

  const [requestedEvent, setRequestedEvent] = useState<RequestedEvent | null>(null);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestedEventId) {
      setError("No event specified for swap");
      setLoading(false);
      return;
    }

    fetchData();
  }, [requestedEventId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch the requested event details from swappable events
      const eventsResponse = await api.get(`/events/swappable`);
      const events = eventsResponse.data;
      const event = events.find((e: RequestedEvent) => e._id === requestedEventId);
      
      if (!event) {
        setError("Event not found or not available for swapping");
        setLoading(false);
        return;
      }

      setRequestedEvent(event);

      // Fetch user's events to offer
      const userId = localStorage.getItem("userId");
      const myEventsResponse = await api.get(`/events/${userId}`);
      const userEvents = myEventsResponse.data.filter((e: Event) => e._id !== requestedEventId);
      
      setMyEvents(userEvents);

    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEventId) {
      alert("Please select an event to offer in exchange");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const swapData = {
        requestedEventId,
        offeredEventId: selectedEventId,
        message: message.trim() || "I'd like to swap events with you!"
      };

      console.log("🟡 Sending swap request:", swapData);
      
      const response = await api.post("/swaps", swapData);
      console.log("✅ Swap request created:", response.data);

      alert("Swap request sent successfully!");
      router.push("/requests");

    } catch (err: any) {
      console.error("❌ Error creating swap request:", err);
      setError(err.response?.data?.msg || "Failed to send swap request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="max-w-2xl mx-auto mt-10 px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !requestedEvent) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="max-w-2xl mx-auto mt-10 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error || "Event not found"}</p>
            <button
              onClick={() => router.push("/marketplace")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
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
      
      <div className="max-w-2xl mx-auto mt-10 px-4">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Request Event Swap</h1>
        <p className="text-gray-600 mb-8">Select one of your events to offer in exchange</p>

        {/* Requested Event Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200 mb-8">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Event You Want</h2>
          <div className="space-y-2">
            <p><strong>Title:</strong> {requestedEvent.title}</p>
            <p><strong>Start:</strong> {new Date(requestedEvent.startTime).toLocaleString()}</p>
            <p><strong>End:</strong> {new Date(requestedEvent.endTime).toLocaleString()}</p>
            <p><strong>Owner:</strong> {requestedEvent.ownerName}</p>
            <p><strong>Email:</strong> {requestedEvent.ownerEmail}</p>
          </div>
        </div>

        {/* Swap Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Offer</h2>
          
          {/* Event Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select your event to offer:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose an event...</option>
              {myEvents.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.title} ({new Date(event.startTime).toLocaleDateString()})
                </option>
              ))}
            </select>
            {myEvents.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                You don't have any events to offer. Create events in your dashboard first.
              </p>
            )}
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to event owner (optional):
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I'd like to swap events with you because..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>

          {/* Selected Event Preview */}
          {selectedEventId && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">You're offering:</h3>
              {(() => {
                const selectedEvent = myEvents.find(e => e._id === selectedEventId);
                return selectedEvent ? (
                  <div className="text-sm text-gray-600">
                    <p><strong>Title:</strong> {selectedEvent.title}</p>
                    <p><strong>Start:</strong> {new Date(selectedEvent.startTime).toLocaleString()}</p>
                    <p><strong>End:</strong> {new Date(selectedEvent.endTime).toLocaleString()}</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/marketplace")}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedEventId || myEvents.length === 0}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
            >
              {submitting ? "Sending Request..." : "Send Swap Request"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}