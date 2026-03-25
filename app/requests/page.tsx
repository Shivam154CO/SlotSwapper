"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Upload,
  RefreshCw,
  Lock,
  User,
  Calendar,
  Clock,
  Mail,
  Check,
  X,
  AlertCircle,
  Info,
  FileText,
  Send,
  ArrowRight,
  Filter,
  Search,
  Inbox,
  ArrowUpRight,
  Shuffle
} from "lucide-react";

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

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getStoredUserEmail = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userEmail");
};

export default function RequestsPage() {
  const router = useRouter();
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<SwapRequest[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "request">("incoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [requestForm, setRequestForm] = useState({
    reason: "",
    preferredDate: "",
    preferredTime: "",
    contactEmail: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchRequests();
      fetchAvailableEvents();
    }
  }, [isClient]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      try {
        const [incomingRes, outgoingRes] = await Promise.all([
          api.get("/swap-requests/incoming"),
          api.get("/swap-requests/outgoing"),
        ]);

        if (incomingRes?.success) setIncomingRequests(incomingRes.data || []);
        else setIncomingRequests([]);

        if (outgoingRes?.success) setOutgoingRequests(outgoingRes.data || []);
        else setOutgoingRequests([]);

      } catch (apiErr: any) {
        if (apiErr.response?.status === 401) {
          setIncomingRequests([]);
          setOutgoingRequests([]);
        } else {
          throw apiErr;
        }
      }
    } catch (err: any) {
      console.error("Error fetching requests:", err);
      if (err.response?.status === 401) {
        setIncomingRequests([]);
        setOutgoingRequests([]);
      } else {
        setError("Failed to load requests. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableEvents = async () => {
    try {
      const response = await api.get("/events/swappable");
      if (response && Array.isArray(response)) {
        setAvailableEvents(response);
      } else {
        setAvailableEvents([]);
      }
    } catch (err: any) {
      console.error("Error fetching available events:", err);
      setAvailableEvents([]);
    }
  };

  const openRequestModal = (event: Event) => {
    const token = getStoredToken();
    if (!token) {
      setError("Please log in to request a swap");
      return;
    }

    setSelectedEvent(event);
    setRequestForm({
      reason: "",
      preferredDate: "",
      preferredTime: "",
      contactEmail: getStoredUserEmail() || "",
    });
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setSelectedEvent(null);
    setRequestForm({
      reason: "",
      preferredDate: "",
      preferredTime: "",
      contactEmail: "",
    });
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    try {
      setSubmitting(true);
      setError("");

      const token = getStoredToken();
      if (!token) {
        setError("Please log in to submit a swap request");
        return;
      }

      const requestData = {
        eventId: selectedEvent._id,
        reason: requestForm.reason,
        preferredDate: requestForm.preferredDate,
        preferredTime: requestForm.preferredTime,
        contactEmail: requestForm.contactEmail,
      };

      const response = await api.post("/swaps", requestData);

      if (response.success) {
        alert("Swap request sent successfully!");
        closeRequestModal();
        fetchRequests();
        setActiveTab("outgoing");
      } else {
        setError("Failed to send request: " + response.message);
      }
    } catch (err: any) {
      console.error("Error submitting swap request:", err);
      setError("Failed to send swap request: " + (err.response?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const token = getStoredToken();
      if (!token) {
        setError("Please log in to update requests");
        return;
      }

      await api.patch(`/swaps/${requestId}`, { status });
      fetchRequests();
      alert(`Request ${status} successfully!`);
    } catch (err: any) {
      console.error("Error updating request:", err);
      alert("Failed to update request: " + (err.response?.message || err.message));
    }
  };

  const handleLoginRedirect = () => {
    router.push("/login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLoggedIn = isClient && getStoredToken();

  if (!isClient || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Loading requests...</p>
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

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Swap Requests</h1>
            <p className="text-gray-500">Manage incoming and outgoing shift swap requests</p>
          </div>

          {!isLoggedIn && (
            <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Login Required</h3>
                  <p className="text-blue-700 text-sm">Please log in to manage your requests.</p>
                </div>
              </div>
              <button
                onClick={handleLoginRedirect}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm whitespace-nowrap"
              >
                Log In Now
              </button>
            </div>
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{incomingRequests.length}</p>
                <p className="text-sm text-gray-500 font-medium">Incoming Requests</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{outgoingRequests.length}</p>
                <p className="text-sm text-gray-500 font-medium">Outgoing Requests</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{availableEvents.length}</p>
                <p className="text-sm text-gray-500 font-medium">Available to Swap</p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 p-1.5 flex gap-1 mb-8 overflow-x-auto">
            {[
              { id: 'incoming', label: 'Incoming', icon: Inbox, count: incomingRequests.length },
              { id: 'outgoing', label: 'My Requests', icon: ArrowUpRight, count: outgoingRequests.length },
              { id: 'request', label: 'Available Swaps', icon: Search, count: availableEvents.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {activeTab === 'incoming' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-indigo-600" />
                  Requests for Your Events
                </h2>
                {incomingRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Inbox className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">No incoming requests</h3>
                    <p className="text-gray-500">Requests from other users will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incomingRequests.map((request) => (
                      <div
                        key={request.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors group relative"
                      >
                        {/* Card Body Clickable */}
                        <div
                          onClick={() => router.push(`/requests/${request.id}`)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{request.eventTitle}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${request.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                  request.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                  }`}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span>{request.requesterName}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>Prefers: {request.preferredDate} at {request.preferredTime}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <p className="text-gray-700 italic">"{request.reason}"</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Button - separate from card click */}
                        {request.status === 'pending' && (
                          <div className="flex items-center gap-2 mt-4 md:mt-0 md:absolute md:top-5 md:right-5">
                            <button
                              onClick={(e) => { e.stopPropagation(); updateRequestStatus(request.id, 'accepted'); }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors shadow-sm"
                            >
                              <Check className="w-4 h-4" /> Accept
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); updateRequestStatus(request.id, 'rejected'); }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium text-sm transition-colors shadow-sm"
                            >
                              <X className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'outgoing' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-purple-600" />
                  Your Sent Requests
                </h2>
                {outgoingRequests.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <ArrowUpRight className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">No sent requests</h3>
                    <p className="text-gray-500 mb-6">You haven't sent any swap requests yet.</p>
                    <button
                      onClick={() => setActiveTab('request')}
                      className="text-blue-600 font-medium hover:text-blue-700 hover:underline"
                    >
                      Browse Available Swaps
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {outgoingRequests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => router.push(`/requests/${request.id}`)}
                        className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{request.eventTitle}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${request.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                              request.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                                'bg-red-50 text-red-700 border-red-100'
                              }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {request.ownerName && (
                              <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>Owner: {request.ownerName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span>Your Preference: {request.preferredDate} at {request.preferredTime}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Requested on {formatDate(request.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'request' && (
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Search className="w-5 h-5 text-green-600" />
                  Available Opportunities
                </h2>
                {availableEvents.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-medium mb-1">No available swaps</h3>
                    <p className="text-gray-500">Check back later for new opportunities.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {availableEvents.map((event) => (
                      <div key={event._id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group">
                        <h3 className="font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{formatDateTime(event.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span>By: {event.ownerName}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => openRequestModal(event)}
                          className="w-full py-2.5 bg-gray-900 text-white rounded-lg hover:bg-black font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Shuffle className="w-4 h-4" /> Request Swap
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {showRequestModal && selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Request Swap</h2>
                  <button onClick={closeRequestModal} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="bg-indigo-50 rounded-xl p-4 mb-6 border border-indigo-100">
                    <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" /> Event Details
                    </h3>
                    <div className="space-y-1 text-sm text-indigo-800">
                      <p><span className="font-medium">Title:</span> {selectedEvent.title}</p>
                      <p><span className="font-medium">Time:</span> {formatDateTime(selectedEvent.startTime)}</p>
                      <p><span className="font-medium">Owner:</span> {selectedEvent.ownerName}</p>
                    </div>
                  </div>

                  <form onSubmit={handleRequestSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Swap *</label>
                      <textarea
                        value={requestForm.reason}
                        onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                        required
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                        placeholder="Why do you want to swap?"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Date *</label>
                        <input
                          type="date"
                          value={requestForm.preferredDate}
                          onChange={(e) => setRequestForm({ ...requestForm, preferredDate: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Time *</label>
                        <input
                          type="time"
                          value={requestForm.preferredTime}
                          onChange={(e) => setRequestForm({ ...requestForm, preferredTime: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          value={requestForm.contactEmail}
                          onChange={(e) => setRequestForm({ ...requestForm, contactEmail: e.target.value })}
                          required
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={closeRequestModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" /> Send Request
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}