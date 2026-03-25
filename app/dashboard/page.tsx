"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import SmartCalendar from "@/components/SmartCalendar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  RefreshCw,
  Lock,
  Plus,
  Trophy,
  Star,
  Activity,
  Zap,
  Layout,
  Clock,
  Trash2,
  AlertCircle
} from "lucide-react";

type Event = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  swappable?: boolean;
  status?: 'busy' | 'flexible' | 'swappable' | 'high_priority' | 'blocked' | 'ai_optimized';
  category?: 'work' | 'personal' | 'focus' | 'meeting' | 'other';
};

function DashboardContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [form, setForm] = useState({ title: "", startTime: "", endTime: "" });
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  /* State for Gamification */
  const [userInfo, setUserInfo] = useState({
    name: "",
    points: 0,
    level: 1,
    badges: [] as string[],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const storedId = localStorage.getItem("userId");
      const storedName = localStorage.getItem("userName");
      const storedPoints = parseInt(localStorage.getItem("userPoints") || "0");
      const storedLevel = parseInt(localStorage.getItem("userLevel") || "1");
      const storedBadges = JSON.parse(localStorage.getItem("userBadges") || "[]");

      console.log("Loaded userId from localStorage:", storedId);
      setUserId(storedId);
      setUserInfo({
        name: storedName || "User",
        points: storedPoints,
        level: storedLevel,
        badges: storedBadges
      });
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
        console.log("Events fetched successfully:", res);

        if (res && Array.isArray(res)) {
          setEvents(res);
        } else {
          console.log("Unexpected response format, setting empty array");
          setEvents([]);
        }
      } catch (err: any) {
        console.error("Error fetching events:", err);
        console.error("Error status:", err.response?.status);
        console.error("Error details:", err.response?.data);

        if (err.response?.status === 404) {
          console.log("No events found for user - this is normal for new users");
          setEvents([]);
        } else {
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
      console.log("Refreshed events:", res);
      if (res && Array.isArray(res)) {
        setEvents(res);
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      console.error("Error adding event:", err);
      console.error("Error details:", err.response?.data);
      alert("Failed to add event. Try again.");
    }
  };

  const toggleSwappable = async (id: string) => {
    if (!id || !userId) return;

    try {
      await api.patch(`/events/toggle/${id}`);
      const res = await api.get(`/events/user/${userId}`);
      if (res && Array.isArray(res)) {
        setEvents(res);
      }
    } catch (err: any) {
      console.error("Error toggling event:", err);
      alert("Failed to toggle event status.");
    }
  };

  const deleteEvent = async (id: string) => {
    if (!id || !userId) return;

    const isConfirmed = window.confirm("Are you sure you want to delete this event? This action cannot be undone.");
    if (!isConfirmed) return;

    try {
      setDeletingEventId(id);
      await api.delete(`/events/${id}`);
      setEvents(prevEvents => prevEvents.filter(event => event._id !== id));
    } catch (err: any) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event.");
    } finally {
      setDeletingEventId(null);
    }
  };

  const totalEvents = events?.length || 0;
  const swappableCount = events?.filter(e => e.swappable).length || 0;
  const fixedCount = events?.filter(e => !e.swappable).length || 0;

  // Calculate progress to next level
  const nextLevelPoints = userInfo.level * 100;
  const progressPercent = Math.min((userInfo.points / nextLevelPoints) * 100, 100);

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8 pb-12">

          {/* Welcome & Gamification Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {userInfo.name}
                  </h1>
                  <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    Level {userInfo.level} Scheduler • {userInfo.points} Points
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                    {userInfo.badges.length > 0 ? (
                      userInfo.badges.map((badge, idx) => (
                        <span key={idx} className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium border border-yellow-100 flex items-center gap-1">
                          <Star className="w-3 h-3" /> {badge}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4" /> No badges yet. Start swapping!
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-1/3 bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                    <span>Level Progress</span>
                    <span>{userInfo.points} / {nextLevelPoints} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="bg-blue-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    ></motion.div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">
                    {nextLevelPoints - userInfo.points} points to next level
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                <p className="text-sm text-gray-500 font-medium">Total Events</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{swappableCount}</p>
                <p className="text-sm text-gray-500 font-medium">For Swap</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{fixedCount}</p>
                <p className="text-sm text-gray-500 font-medium">Fixed</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
            >
              {showForm ? <Activity className="w-5 h-5 rotate-45" /> : <Plus className="w-5 h-5" />}
              <span>{showForm ? "Cancel" : "Add Event"}</span>
            </button>
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Create New Event
                  </h3>
                  <form onSubmit={addEvent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Event Title</label>
                        <input
                          type="text"
                          placeholder="Meeting, Class..."
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Start Time</label>
                        <input
                          type="datetime-local"
                          value={form.startTime}
                          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1.5 block">End Time</label>
                        <input
                          type="datetime-local"
                          value={form.endTime}
                          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all"
                      >
                        Create Event
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smart Calendar Integration */}
          <div className="mb-12">
            <SmartCalendar
              events={events}
              onAddEvent={(date) => {
                setForm({ ...form, startTime: date.toISOString().slice(0, 16) });
                setShowForm(true);
              }}
              onEventClick={(event) => {
                // Future: Open edit modal
                console.log("Clicked event:", event);
              }}
            />
          </div>

          {/* Legacy List View (Optional - can be toggled or removed) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px] mt-8">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">All Events List</h2>
              <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                {events.length} events found
              </div>
            </div>

            <div className="p-6">
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-4 text-sm">Loading events...</p>
                </div>
              )}

              {!loading && events.length === 0 && (
                <div className="text-center py-16">
                  <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No events yet</h3>
                  <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by creating your first event to start swapping slots with others.</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="text-blue-600 font-medium hover:text-blue-700 hover:underline"
                  >
                    Create Your First Event
                  </button>
                </div>
              )}

              {!loading && events.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <motion.div
                      key={event._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      <EventCard
                        event={event}
                        onToggle={toggleSwappable}
                        onDelete={deleteEvent}
                        isDeleting={deletingEventId === event._id}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}