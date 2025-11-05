"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showForm, setShowForm] = useState(false);

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
      
      setForm({ title: "", startTime: "", endTime: "" });
      setShowForm(false);

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-6xl mx-auto pt-20">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto pt-20 px-4">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl rotate-45 w-16 h-16"></div>
                <div className="relative bg-white p-3 rounded-xl shadow-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Schedule
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage your events and make them available for swapping with others
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                  <p className="text-gray-600 text-sm">Total Events</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => e.swappable).length}
                  </p>
                  <p className="text-gray-600 text-sm">Available for Swap</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {events.filter(e => !e.swappable).length}
                  </p>
                  <p className="text-gray-600 text-sm">Fixed Events</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Add Event Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center mb-8"
          >
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>{showForm ? "Cancel" : "Add New Event"}</span>
            </button>
          </motion.div>

          {/* Add Event Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Event</h3>
                  <form onSubmit={addEvent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Event Title</label>
                        <input
                          type="text"
                          placeholder="Meeting, Class, Appointment..."
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Start Time</label>
                        <input
                          type="datetime-local"
                          value={form.startTime}
                          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">End Time</label>
                        <input
                          type="datetime-local"
                          value={form.endTime}
                          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                      >
                        Create Event
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Events Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
              <p className="text-gray-600 mt-1">Manage and toggle swap availability</p>
            </div>

            <div className="p-6">
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4">Loading events...</p>
                </div>
              )}

              {!loading && events.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-blue-50 rounded-2xl p-8 max-w-md mx-auto">
                    <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
                    <p className="text-gray-600 mb-6">Get started by creating your first event!</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      Create Your First Event
                    </button>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {events.map((event, index) => (
                      <motion.div
                        key={event._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <EventCard
                          event={event}
                          onToggle={toggleSwappable}
                        />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>

          {/* Debug Info - Hidden by default, can be enabled if needed */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Debug Info:</strong> UserID: {userId || "Not set"} | 
                Events Count: {events.length} | 
                Status: {loading ? "Loading..." : "Ready"}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}