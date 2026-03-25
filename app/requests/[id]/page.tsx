
"use client";
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import NegotiationPanel from '@/components/NegotiationPanel';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    Calendar,
    User,
    CheckCircle,
    XCircle,
    AlertCircle,
    RefreshCw,
    Mail,
    MoreHorizontal
} from 'lucide-react';

export default function RequestDetailPage() {
    const router = useRouter();
    const params = useParams();
    const requestId = params.id as string;

    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        // Get current user email from local storage or context (mocked for now as we don't have global user context easily accessible here)
        const email = localStorage.getItem('userEmail') || '';
        setCurrentUserEmail(email);

        if (requestId) {
            fetchRequestDetails();
        }
    }, [requestId]);

    const fetchRequestDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/swaps/${requestId}`);
            if (response.success) {
                setRequest(response.data);
            } else {
                setError(response.message || 'Failed to load request');
            }
        } catch (err: any) {
            setError(err.message || 'Error loading request');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            const response = await api.patch(`/swaps/${requestId}`, { status: newStatus });
            if (response.success) {
                setRequest((prev: any) => ({ ...prev, status: newStatus }));
                alert(`Request ${newStatus} successfully`);
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-xl font-bold text-gray-900">Request Not Found</h1>
                <button
                    onClick={() => router.push('/requests')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Back to Requests
                </button>
            </div>
        );
    }

    // Determine if current user is owner or requester for UI logic
    const isOwner = request.eventOwner?.email === currentUserEmail;
    const isRequester = request.requester?.email === currentUserEmail;

    return (
        <ProtectedRoute>
            <Navbar />
            <div className="min-h-screen bg-gray-50 pb-12">
                <div className="max-w-6xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <button
                            onClick={() => router.push('/requests')}
                            className="flex items-center text-gray-500 hover:text-gray-900 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Requests
                        </button>
                        <div className="flex items-center gap-2">
                            {isOwner && request.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate('accepted')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 shadow-sm"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Accept Request
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate('rejected')}
                                        className="px-4 py-2 bg-white text-red-600 border border-gray-200 rounded-lg hover:bg-red-50 text-sm font-medium flex items-center gap-2 shadow-sm"
                                    >
                                        <XCircle className="w-4 h-4" /> Reject
                                    </button>
                                </>
                            )}
                            {request.status === 'accepted' && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" /> Accepted
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Request Details */}
                        <div className="lg:col-span-1 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
                            >
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    Swap Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Requested Event</label>
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-blue-900">
                                            <p className="font-bold">{request.requestedEvent?.title}</p>
                                            <p className="text-sm opacity-80 flex items-center gap-1 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(request.requestedEvent?.startTime).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Requester</label>
                                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                {request.requesterName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{request.requesterName}</p>
                                                <p className="text-xs text-gray-500">{request.contactEmail}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Proposal</label>
                                        <div className="flex flex-col gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            <div className="flex justify-between">
                                                <span>Preferred Date:</span>
                                                <span className="font-medium text-gray-900">{request.preferredDate}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Preferred Time:</span>
                                                <span className="font-medium text-gray-900">{request.preferredTime}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {request.aiAnalysis && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                                AI Analysis
                                            </label>
                                            <div className="bg-indigo-50/30 p-4 rounded-xl border border-indigo-100 shadow-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-sm font-medium text-gray-700">Compatibility</span>
                                                    <span className={`text-sm font-bold ${request.aiAnalysis.compatibilityScore > 80 ? 'text-green-600' :
                                                            request.aiAnalysis.compatibilityScore > 50 ? 'text-yellow-600' : 'text-red-600'
                                                        }`}>
                                                        {request.aiAnalysis.compatibilityScore}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-indigo-100 rounded-full h-1.5 mb-3">
                                                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${request.aiAnalysis.compatibilityScore}%` }}></div>
                                                </div>
                                                <p className="text-xs text-indigo-700 leading-relaxed bg-white/50 p-2 rounded-md border border-indigo-50">
                                                    {request.aiAnalysis.matchReason || "Analysis based on availability overlap and user reputation."}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: Negotiation Panel */}
                        <div className="lg:col-span-2">
                            <NegotiationPanel
                                requestId={requestId}
                                initialHistory={request.negotiationHistory || []}
                                currentUserEmail={currentUserEmail}
                                status={request.status}
                                onStatusUpdate={handleStatusUpdate}
                            />
                        </div>
                    </div>

                </div>
            </div>
        </ProtectedRoute>
    );
}
