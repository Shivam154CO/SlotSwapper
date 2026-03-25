"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw,
  Database,
  ArrowRight,
  Lock,
  ShoppingBag,
  Users,
  CheckCircle,
  Clock,
  Flame,
  Bot,
  Calendar,
  User,
  Shuffle,
  AlertCircle
} from "lucide-react";
import DiscoveryToolbar from "@/components/DiscoveryToolbar";

type Event = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  ownerName: string;
  ownerEmail: string;
  swappable: boolean;
};

function MarketplaceContent() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    searchStr: '',
    duration: 'any',
    department: 'all',
    timeOfDay: 'any'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [filter, setFilter] = useState<'All' | 'Trending' | 'Smart Match'>('All');

  const filteredEvents = events.filter(event => {
    // 1. Core Filter (All/Trending/Smart Match)
    if (filter === 'Trending') {
      // Mock trending logic
    }

    // 2. Advanced Filters from Toolbar
    const matchesSearch = !activeFilters.searchStr ||
      event.title.toLowerCase().includes(activeFilters.searchStr.toLowerCase()) ||
      event.ownerName?.toLowerCase().includes(activeFilters.searchStr.toLowerCase()) || false;

    const matchesTime = activeFilters.timeOfDay === 'any' || (() => {
      const hour = new Date(event.startTime).getHours();
      if (activeFilters.timeOfDay === 'morning') return hour >= 6 && hour < 12;
      if (activeFilters.timeOfDay === 'afternoon') return hour >= 12 && hour < 17;
      if (activeFilters.timeOfDay === 'evening') return hour >= 17;
      return true;
    })();

    const matchesDept = activeFilters.department === 'all' || true;
    const matchesDuration = activeFilters.duration === 'any' || true;

    return matchesSearch && matchesTime && matchesDept && matchesDuration;
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchRealEvents = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log("Fetching REAL swappable events...");
      const eventsResponse = await api.get("/events/swappable");

      if (eventsResponse && Array.isArray(eventsResponse)) {
        setEvents(eventsResponse);
      } else {
        setEvents([]);
      }

    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err.response?.data?.msg || err.message || "Failed to load events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const debugDatabase = async () => {
    try {
      const response = await api.get("/events/debug/all-events");
      alert(`Database Debug:\nTotal: ${response.data.totalEvents}`);
    } catch (err) {
      alert("Debug failed");
    }
  };

  useEffect(() => {
    if (isClient) {
      fetchRealEvents();
    }
  }, [isClient]);

  const handleRequestSwap = (event: Event) => {
    router.push(`/swap/request?eventId=${event._id}`);
  };

  if (!isClient || loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading marketplace...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pb-12">
        <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-gray-500 max-w-2xl">
              Discover available time slots and request swaps with other users.
            </p>
          </motion.div>

          {/* Discovery Toolbar */}
          <DiscoveryToolbar
            onSearch={(newFilters) => setActiveFilters(newFilters)}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Debug Row */}
          <div className="flex justify-end mb-6 gap-2">
            <button
              onClick={() => fetchRealEvents(true)}
              disabled={refreshing}
              className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            {process.env.NODE_ENV === 'development' && (
              <button onClick={debugDatabase} className="text-sm text-purple-600 hover:underline">
                Debug DB
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                {activeFilters.searchStr ? 'Search Results' : 'Available Time Slots'}
              </h2>

              <div className="flex bg-gray-100 p-1 rounded-lg">
                {['All', 'Trending', 'Smart Match'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${filter === f
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {f === 'Trending' && <Flame className="w-3.5 h-3.5 text-orange-500" />}
                    {f === 'Smart Match' && <Bot className="w-3.5 h-3.5 text-indigo-500" />}
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No slots found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1' : 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  <AnimatePresence mode="popLayout">
                    {filteredEvents.map((event, index) => (
                      <motion.div
                        layout
                        key={event._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`group relative bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : 'p-5'
                          }`}
                      >
                        {/* List View Content */}
                        {viewMode === 'list' ? (
                          <>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.startTime).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {event.ownerName}</span>
                              </div>
                            </div>
                            <div className="w-48">
                              <button
                                onClick={() => handleRequestSwap(event)}
                                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-medium text-sm flex items-center justify-center gap-2"
                              >
                                <Shuffle className="w-3 h-3" /> Request Swap
                              </button>
                            </div>
                          </>
                        ) : (
                          /* Grid View Content */
                          <>
                            <div className="mb-4">
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1 mb-1">{event.title}</h3>
                              <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                Available
                              </div>
                            </div>
                            <div className="space-y-2.5 text-sm text-gray-600 mb-5">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{new Date(event.startTime).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{event.ownerName}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRequestSwap(event)}
                              className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black font-medium flex items-center justify-center gap-2"
                            >
                              <Shuffle className="w-4 h-4" /> Request Swap
                            </button>
                          </>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function Marketplace() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading marketplace...</p>
        </div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}