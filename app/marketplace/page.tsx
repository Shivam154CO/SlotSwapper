"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

type Event = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  ownerName: string;
  ownerEmail: string;
  swappable: boolean;
};

// Client component that handles state
function MarketplaceContent() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch REAL swappable events
  const fetchRealEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🟡 STEP 1: Testing backend connection...");
      
      // Test if backend is running using the real events test endpoint
      const testResponse = await api.get("/events/test");
      console.log("✅ Backend test passed:", testResponse.data);

      console.log("🟡 STEP 2: Fetching REAL swappable events from /events/swappable...");
      
      // Fetch REAL events from the database
      const eventsResponse = await api.get("/events/swappable");
      console.log("✅ REAL Events received:", eventsResponse.data);

      setEvents(eventsResponse.data);
      
    } catch (err: any) {
      console.error("❌ Error fetching real events:", err);
      console.error("❌ Error details:", err.response?.data);
      setError(err.response?.data?.msg || err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Debug function to check database
  const debugDatabase = async () => {
    try {
      console.log("🟡 Debug: Checking all events in database...");
      const response = await api.get("/events/debug/all-events");
      console.log("🔍 Database debug:", response.data);
      
      const totalEvents = response.data.totalEvents;
      const swappableEvents = response.data.events.filter((e: any) => e.swappable).length;
      
      alert(`Database Debug:\nTotal Events: ${totalEvents}\nSwappable Events: ${swappableEvents}\nCheck console for details.`);
      
    } catch (err) {
      console.error("❌ Debug failed:", err);
      alert("Debug failed - check console");
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchRealEvents();
    }
  }, [isClient]);

  // ✅ FIXED: Navigate to swap request page with correct event ID
  const handleRequestSwap = (event: Event) => {
    console.log("🟡 Requesting swap for event:", event);
    console.log("🟡 Event ID:", event._id);
    
    // Navigate to swap request page with the event ID
    router.push(`/swap/request?eventId=${event._id}`);
  };

  // Show loading state during SSR
  if (!isClient) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="max-w-6xl mx-auto mt-8 px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading marketplace...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="max-w-6xl mx-auto mt-8 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">
            Swappable Events Marketplace
          </h1>
          <p className="text-gray-600">
            Real Events - From Your Database
          </p>
        </div>

        {/* Status Panel */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow border">
          <h3 className="font-bold text-gray-800 mb-2">Live Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className={`p-3 rounded ${loading ? 'bg-yellow-50' : error ? 'bg-red-50' : 'bg-green-50'}`}>
              <strong>Status:</strong> {loading ? "🟡 Loading..." : error ? "❌ Error" : "✅ Connected"}
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <strong>Events Found:</strong> {events.length}
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <strong>Route Fixed:</strong> ✅
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 font-medium">Error: {error}</p>
              <p className="text-red-600 text-sm mt-1">
                Route ordering issue fixed. Make sure you have events marked as swappable.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={fetchRealEvents}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? "Refreshing..." : "Refresh Marketplace"}
          </button>
          
          <button
            onClick={debugDatabase}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
          >
            Debug Database
          </button>

          <a
            href="/dashboard"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium"
          >
            Go to Dashboard
          </a>

          <a
            href="/requests"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-medium"
          >
            View My Requests
          </a>
        </div>

        {/* Events Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading real events from database...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border">
            <p className="text-gray-500 text-lg mb-4">No swappable events found in database</p>
            <div className="max-w-md mx-auto text-left bg-gray-50 p-4 rounded border">
              <p className="text-sm text-gray-600 mb-2">
                This is normal if:
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li>No events have been marked as "swappable" yet</li>
                <li>You haven't created any events in the dashboard</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                <strong>Solution: Go to Dashboard → Create events → Mark as Swappable</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-semibold text-blue-700 mb-3">{event.title}</h2>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p><strong>Start:</strong> {new Date(event.startTime).toLocaleString()}</p>
                  <p><strong>End:</strong> {new Date(event.endTime).toLocaleString()}</p>
                  <p><strong>Owner:</strong> {event.ownerName}</p>
                  <p><strong>Email:</strong> {event.ownerEmail}</p>
                </div>
                <div className="mt-4 p-2 bg-green-50 rounded border border-green-200">
                  <p className="text-xs text-green-700 text-center font-medium">
                    ✅ Available for Swapping
                  </p>
                </div>
                
                {/* ✅ FIXED: Request Swap Button */}
                <button
                  onClick={() => handleRequestSwap(event)}
                  className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  Request Swap
                </button>
                
                {/* Debug Info */}
                <div className="mt-2 text-xs text-gray-400 text-center">
                  ID: {event._id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

// Main component with Suspense
export default function Marketplace() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold text-blue-600">SlotSwapper</h1>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto mt-8 px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading marketplace...</p>
          </div>
        </div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}