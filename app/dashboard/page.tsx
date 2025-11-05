"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";

type Event = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  swappable?: boolean;
};

function DashboardContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({ title: "", startTime: "", endTime: "" });
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedId = localStorage.getItem("userId");
      console.log("Loaded userId from localStorage:", storedId);
      setUserId(storedId);
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient || !userId) {
      console.log("No userId available or not on client, skipping event fetch");
      return;
    }
    
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log("Fetching events for userId:", userId);
        
        const res = await api.get(`/events/user/${userId}`);
        console.log("Events fetched successfully:", res.data);
        setEvents(res.data);
      } catch (err: any) {
        console.error("Error fetching events:", err);
        console.error("Error status:", err.response?.status);
        console.error("Error details:", err.response?.data);
        
        if (err.response?.status === 404) {
          console.log("No events found for user - this is normal for new users");
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [userId, isClient]);

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("User not logged in. Please log in again.");
      return;
    }

    try {
      const payload = { ...form, userId };
      console.log("Sending event:", payload);
      const response = await api.post("/events", payload);
      console.log("Event added successfully:", response.data);
      alert("Event added successfully!");
      setForm({ title: "", startTime: "", endTime: "" });

      console.log("Refreshing events list...");
      const res = await api.get(`/events/user/${userId}`);
      console.log("Refreshed events:", res.data);
      setEvents(res.data);
    } catch (err: any) {
      console.error("Error adding event:", err);
      console.error("Error details:", err.response?.data);
      alert("Failed to add event. Try again.");
    }
  };
  const toggleSwappable = async (id: string) => {
    console.log("toggleSwappable called with id:", id);
    console.log("Current userId:", userId);
    
    if (!id) {
      console.error("No event ID provided");
      alert("No event ID provided");
      return;
    }

    if (!userId) {
      console.error("No user ID available");
      alert("User not logged in");
      return;
    }

    try {
      console.log("Making API call to toggle event:", id);
      const response = await api.patch(`/events/toggle/${id}`);
      console.log("Toggle response:", response.data);

      console.log("Refreshing events list...");
      const res = await api.get(`/events/user/${userId}`);
      console.log("Refreshed events:", res.data);
      setEvents(res.data);
      
      alert("Event status updated successfully!");
    } catch (err: any) {
      console.error("Error toggling event:", err);
      console.error("Error response:", err.response?.data);
      console.error("Error status:", err.response?.status);
      alert("Failed to toggle event status. Check console for details.");
    }
  };

  if (!isClient) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="max-w-3xl mx-auto mt-10">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">My Schedule</h1>

        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Debug Info:</strong> UserID: {userId || "Not set"} | 
            Events Count: {events.length} | 
            Status: {loading ? "Loading..." : "Ready"}
          </p>
        </div>

        <form
          onSubmit={addEvent}
          className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-4 rounded-lg shadow-sm border"
        >
          <input
            type="text"
            placeholder="Event title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 rounded-lg flex-1"
            required
          />
          <input
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="border p-2 rounded-lg flex-1"
            required
          />
          <input
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            className="border p-2 rounded-lg flex-1"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
          >
            Add Event
          </button>
        </form>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading events...</p>
          </div>
        )}

        {!loading && events.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border">
            <p className="text-gray-500 text-lg mb-2">No events added yet.</p>
            <p className="text-gray-400 text-sm">
              Add your first event using the form above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onToggle={toggleSwappable}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}