"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState<
    "incoming" | "outgoing" | "request"
  >("incoming");
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

      console.log("[Frontend] Fetching swap requests...");

      try {
        const [incomingRes, outgoingRes] = await Promise.all([
          api.get("/swap-requests/incoming"),
          api.get("/swap-requests/outgoing"),
        ]);

        console.log("[Frontend] Incoming response:", incomingRes);
        console.log("[Frontend] Outgoing response:", outgoingRes);

        // FIX: Use incomingRes directly instead of incomingRes.data
        if (incomingRes?.success) {
          console.log(
            "[Frontend] Setting incoming requests:",
            incomingRes.data
          );
          setIncomingRequests(incomingRes.data || []);
        } else {
          console.log(
            "[Frontend] No incoming requests or endpoint not available"
          );
          setIncomingRequests([]);
        }

        // FIX: Use outgoingRes directly instead of outgoingRes.data
        if (outgoingRes?.success) {
          console.log(
            "[Frontend] Setting outgoing requests:",
            outgoingRes.data
          );
          setOutgoingRequests(outgoingRes.data || []);
        } else {
          console.log(
            "[Frontend] No outgoing requests or endpoint not available"
          );
          setOutgoingRequests([]);
        }
      } catch (apiErr: any) {
        if (apiErr.response?.status === 401) {
          console.log(
            "[Frontend] Not authenticated for requests - showing empty state"
          );
          setIncomingRequests([]);
          setOutgoingRequests([]);
        } else {
          throw apiErr;
        }
      }
    } catch (err: any) {
      console.error("Error fetching requests:", err);

      if (err.response?.status === 401) {
        console.log("[Frontend] Not authenticated - showing empty state");
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
      console.log("[Frontend] Available events response:", response);

      // FIX: Use response directly instead of response.data
      if (response && Array.isArray(response)) {
        setAvailableEvents(response);
      } else {
        setAvailableEvents([]);
      }
    } catch (err: any) {
      console.error("Error fetching available events:", err);

      if (err.response?.status === 401) {
        console.log(
          "[Frontend] Not authenticated for events - showing empty state"
        );
        setAvailableEvents([]);
      } else if (err.response?.status === 404) {
        console.log("[Frontend] No swappable events found (404)");
        setAvailableEvents([]);
      } else {
        console.error("Other error fetching events:", err);
        setAvailableEvents([]);
      }
    }
  };

  const cleanupTestData = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setError("Please log in to perform this action");
        return;
      }

      const response = await api.delete("/swap-requests/cleanup-test");
      if (response.success) {
        alert(
          `Cleaned up ${response.deletedCount} ALL requests from database`
        );
        fetchRequests();
      }
    } catch (err: any) {
      console.error("Error cleaning up test data:", err);
      if (err.response?.status === 401) {
        setError("Please log in to perform this action");
      } else {
        alert("Error cleaning up test data");
      }
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

      // FIX: Use response directly instead of response.data
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
      if (err.response?.status === 401) {
        setError("Please log in to submit a swap request");
      } else {
        setError(
          "Failed to send swap request: " +
            (err.response?.message || err.message)
        );
      }
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

      const response = await api.patch(`/swaps/${requestId}`, { status });
      fetchRequests();
      alert(`Request ${status} successfully!`);
    } catch (err: any) {
      console.error("Error updating request:", err);
      if (err.response?.status === 401) {
        setError("Please log in to update requests");
      } else if (err.response?.status === 403) {
        alert(
          "You are not authorized to update this request. You must be the event owner."
        );
      } else {
        alert(
          "Failed to update request: " +
            (err.response?.message || err.message)
        );
      }
    }
  };

  const handleRetry = () => {
    setError("");
    fetchRequests();
    fetchAvailableEvents();
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

  if (!isClient) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto pt-20 px-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading swap requests...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto pt-20 px-4">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading swap requests...</p>
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
        <div className="max-w-7xl mx-auto pt-20 px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl rotate-45 w-16 h-16"></div>
                <div className="relative bg-white p-3 rounded-xl shadow-lg">
                  <svg
                    className="w-8 h-8 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Swap Requests
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Manage your incoming and outgoing shift swap requests
            </p>

            {!isLoggedIn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-md mx-auto"
              >
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-blue-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-blue-800">
                      Login Required
                    </h3>
                    <p className="text-blue-600 text-sm mt-1">
                      Please log in to manage swap requests
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLoginRedirect}
                  className="mt-4 w-full bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 font-semibold transition-colors"
                >
                  Log In Now
                </button>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-xl mr-4">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {incomingRequests.length}
                  </p>
                  <p className="text-gray-600 text-sm">Incoming</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-xl mr-4">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {outgoingRequests.length}
                  </p>
                  <p className="text-gray-600 text-sm">Outgoing</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-xl mr-4">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {availableEvents.length}
                  </p>
                  <p className="text-gray-600 text-sm">Available</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
              <div className="flex items-center">
                <div className="bg-orange-100 p-3 rounded-xl mr-4">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <div>
                  <button
                    onClick={fetchRequests}
                    className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    Refresh
                  </button>
                  <p className="text-gray-600 text-sm">Status</p>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 text-yellow-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-yellow-800">Notice</h3>
                      <p className="text-yellow-600 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {error.includes("log in") && (
                      <button
                        onClick={handleLoginRedirect}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-xl hover:bg-yellow-700 font-semibold transition-colors"
                      >
                        Log In
                      </button>
                    )}
                    <button
                      onClick={handleRetry}
                      className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 font-semibold transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex overflow-x-auto border-b border-gray-200 mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-2"
          >
            {[
              {
                key: "incoming",
                label: "Incoming Requests",
                count: incomingRequests.length,
                icon: "📥",
              },
              {
                key: "outgoing",
                label: "My Requests",
                count: outgoingRequests.length,
                icon: "📤",
              },
              {
                key: "request",
                label: "Request Swap",
                count: availableEvents.length,
                icon: "🔄",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center px-6 py-3 font-semibold rounded-xl transition-all duration-300 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                <span>{tab.label}</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </motion.div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden"
          >
            {!isLoggedIn && (
              <div className="p-8 text-center">
                <div className="bg-blue-50 rounded-2xl p-8 max-w-md mx-auto">
                  <svg
                    className="w-16 h-16 text-blue-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Login Required
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Please log in to view and manage swap requests
                  </p>
                  <button
                    onClick={handleLoginRedirect}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Log In to Continue
                  </button>
                </div>
              </div>
            )}

            {isLoggedIn && (
              <>
                {activeTab === "incoming" && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg
                        className="w-6 h-6 mr-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Requests for Your Events
                    </h2>

                    {incomingRequests.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-blue-50 rounded-2xl p-8 max-w-md mx-auto">
                          <svg
                            className="w-16 h-16 text-blue-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No incoming requests
                          </h3>
                          <p className="text-gray-600">
                            When someone requests to swap your shifts, they'll
                            appear here.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {incomingRequests.map((request, index) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {request.eventTitle}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 mr-2 text-blue-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    <span>
                                      By: {request.requesterName} (
                                      {request.requesterEmail})
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 mr-2 text-green-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>
                                      Prefers: {request.preferredDate} at{" "}
                                      {request.preferredTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 lg:mt-0 lg:ml-6">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    request.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                      : request.status === "accepted"
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : "bg-red-100 text-red-800 border border-red-200"
                                  }`}
                                >
                                  {request.status.charAt(0).toUpperCase() +
                                    request.status.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-gray-700">
                                <strong className="text-gray-900">
                                  Reason:
                                </strong>{" "}
                                {request.reason}
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3"
                                  />
                                </svg>
                                Received: {formatDate(request.createdAt)} at{" "}
                                {formatTime(request.createdAt)}
                              </div>

                              {request.status === "pending" && (
                                <div className="flex space-x-3">
                                  <button
                                    onClick={() =>
                                      updateRequestStatus(
                                        request.id,
                                        "accepted"
                                      )
                                    }
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-2"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    <span>Accept</span>
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateRequestStatus(
                                        request.id,
                                        "rejected"
                                      )
                                    }
                                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center space-x-2"
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                    <span>Reject</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "outgoing" && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg
                        className="w-6 h-6 mr-2 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Your Swap Requests
                    </h2>

                    {outgoingRequests.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-green-50 rounded-2xl p-8 max-w-md mx-auto">
                          <svg
                            className="w-16 h-16 text-green-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No outgoing requests
                          </h3>
                          <p className="text-gray-600 mb-6">
                            When you request to swap shifts, they'll appear
                            here.
                          </p>
                          <button
                            onClick={() => setActiveTab("request")}
                            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                          >
                            Request a Swap
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {outgoingRequests.map((request, index) => (
                          <motion.div
                            key={request.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
                          >
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                  {request.eventTitle}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 mr-2 text-purple-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    <span>
                                      Owner: {request.ownerName} (
                                      {request.ownerEmail})
                                    </span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg
                                      className="w-4 h-4 mr-2 text-blue-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>
                                      Your Preference: {request.preferredDate}{" "}
                                      at {request.preferredTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 lg:mt-0 lg:ml-6">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    request.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                      : request.status === "accepted"
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : "bg-red-100 text-red-800 border border-red-200"
                                  }`}
                                >
                                  {request.status.charAt(0).toUpperCase() +
                                    request.status.slice(1)}
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <p className="text-gray-700">
                                <strong className="text-gray-900">
                                  Your Reason:
                                </strong>{" "}
                                {request.reason}
                              </p>
                            </div>

                            <div className="text-sm text-gray-500 flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3"
                                />
                              </svg>
                              Requested: {formatDate(request.createdAt)} at{" "}
                              {formatTime(request.createdAt)}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "request" && (
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <svg
                        className="w-6 h-6 mr-2 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      Available Events for Swapping
                    </h2>

                    {availableEvents.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="bg-orange-50 rounded-2xl p-8 max-w-md mx-auto">
                          <svg
                            className="w-16 h-16 text-orange-400 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No available events
                          </h3>
                          <p className="text-gray-600">
                            Check back later for swappable events.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {availableEvents.map((event, index) => (
                          <motion.div
                            key={event._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 p-6 group"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                              {event.title}
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600 mb-4">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-blue-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3"
                                  />
                                </svg>
                                <span>{formatDateTime(event.startTime)}</span>
                              </div>
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                  />
                                </svg>
                                <span>By: {event.ownerName}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => openRequestModal(event)}
                              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group-hover:scale-105"
                            >
                              Request Swap
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>

        <AnimatePresence>
          {showRequestModal && selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Request Shift Swap
                    </h2>
                    <button
                      onClick={closeRequestModal}
                      className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Event Details
                    </h3>
                    <div className="space-y-2 text-sm text-blue-700">
                      <p>
                        <strong>Title:</strong> {selectedEvent.title}
                      </p>
                      <p>
                        <strong>Time:</strong>{" "}
                        {formatDateTime(selectedEvent.startTime)}
                      </p>
                      <p>
                        <strong>Owner:</strong> {selectedEvent.ownerName} (
                        {selectedEvent.ownerEmail})
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleRequestSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Why do you want to swap this shift? *
                      </label>
                      <textarea
                        value={requestForm.reason}
                        onChange={(e) =>
                          setRequestForm({
                            ...requestForm,
                            reason: e.target.value,
                          })
                        }
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        placeholder="Please explain why you want to swap this shift. Be specific about your situation..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Preferred Date *
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={requestForm.preferredDate}
                            onChange={(e) =>
                              setRequestForm({
                                ...requestForm,
                                preferredDate: e.target.value,
                              })
                            }
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                          <svg
                            className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Preferred Time *
                        </label>
                        <div className="relative">
                          <input
                            type="time"
                            value={requestForm.preferredTime}
                            onChange={(e) =>
                              setRequestForm({
                                ...requestForm,
                                preferredTime: e.target.value,
                              })
                            }
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          />
                          <svg
                            className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Your Email Address *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={requestForm.contactEmail}
                          onChange={(e) =>
                            setRequestForm({
                              ...requestForm,
                              contactEmail: e.target.value,
                            })
                          }
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-11"
                          placeholder="your-email@example.com"
                        />
                        <svg
                          className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={closeRequestModal}
                        className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-300 hover:scale-105"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold transition-all duration-300 flex items-center space-x-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending Request...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            <span>Send Request</span>
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