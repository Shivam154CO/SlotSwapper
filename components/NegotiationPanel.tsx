
"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    User,
    Bot,
    Clock,
    CheckCircle,
    XCircle,
    Calendar,
    MoreHorizontal,
    ThumbsUp,
    ThumbsDown,
    Sparkles,
    Video,
    Phone,
    PhoneOff
} from 'lucide-react';
import api from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';

interface Message {
    _id?: string;
    sender: {
        _id: string;
        name: string;
        email: string;
    };
    message: string;
    type: 'message' | 'counter_offer' | 'system' | 'ai_suggestion';
    proposedDate?: string;
    proposedTime?: string;
    timestamp: string;
}

interface NegotiationPanelProps {
    requestId: string;
    initialHistory: Message[];
    currentUserEmail: string;
    status: string;
    onStatusUpdate: (newStatus: string) => void;
}

export default function NegotiationPanel({
    requestId,
    initialHistory,
    currentUserEmail,
    status,
    onStatusUpdate
}: NegotiationPanelProps) {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const { socket, onlineUsers } = useSocket(userId);
    const [history, setHistory] = useState<Message[]>(initialHistory);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [showCounterOffer, setShowCounterOffer] = useState(false);
    const [counterOffer, setCounterOffer] = useState({ date: '', time: '' });
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        setHistory(initialHistory);
    }, [initialHistory]);

    useEffect(() => {
        if (!socket) return;

        socket.emit('join_swap', requestId);

        socket.on('new_message', (data: any) => {
            console.log("Socket received message:", data);
            if (data.requestId === requestId) {
                // Check if message already exists in history to avoid duplication
                setHistory(prev => {
                    const exists = prev.some(msg => msg._id === data._id || (msg.timestamp === data.timestamp && msg.message === data.message));
                    if (exists) return prev;
                    return [...prev, data];
                });

                if (data.status) onStatusUpdate(data.status);
            }
        });

        return () => {
            socket.off('new_message');
        };
    }, [socket, requestId, onStatusUpdate]);

    useEffect(() => {
        scrollToBottom();
    }, [history]);

    const handleSendMessage = async (type: 'message' | 'counter_offer' = 'message') => {
        if (!newMessage.trim() && type === 'message') return;

        try {
            setSending(true);

            const payload: any = {
                message: newMessage,
                type
            };

            if (type === 'counter_offer') {
                payload.proposedDate = counterOffer.date;
                payload.proposedTime = counterOffer.time;
                payload.message = `Counter Offer: ${newMessage || 'Check my proposed time.'}`;
            }

            const response = await api.post(`/swaps/${requestId}/negotiate`, payload);

            if (response.success) {
                // Socket will handle the history update via 'new_message' listener
                setNewMessage('');
                setShowCounterOffer(false);
            }
        } catch (error) {
            console.error("Failed to send message", error);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    const generateSmartReply = () => {
        const replies = [
            "That time works perfectly for me!",
            "Could we do an hour later?",
            "I'm afraid I'm busy then. Any other options?",
            "Accepting your request now."
        ];
        setNewMessage(replies[Math.floor(Math.random() * replies.length)]);
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            Negotiation & Chat
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                status === 'negotiating' ? 'bg-blue-100 text-blue-700' :
                                    status === 'accepted' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {status}
                            </span>
                        </h3>
                        <p className="text-xs text-gray-500">Discuss details or propose new times.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => alert("Video calling coming in 3... 2... 1...")}
                        className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-gray-200 bg-white"
                        title="Start Video Meeting"
                    >
                        <Video className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => alert("Voice call initiated...")}
                        className="p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors border border-gray-200 bg-white"
                        title="Start Voice Call"
                    >
                        <Phone className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg lg:hidden">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {history.map((msg, index) => {
                    const isMe = msg.sender?.email === currentUserEmail;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-xl p-3 shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 rounded-tl-none'
                                }`}>
                                {/* Header (Name) */}
                                {!isMe && (
                                    <p className="text-xs font-semibold text-gray-500 mb-1">{msg.sender?.name || 'User'}</p>
                                )}

                                {/* Content */}
                                {msg.type === 'counter_offer' ? (
                                    <div className="bg-white/10 rounded-md p-2 mb-2 border border-white/20">
                                        <div className="flex items-center gap-2 font-medium mb-1">
                                            <Clock className="w-4 h-4" />
                                            <span>New Proposal</span>
                                        </div>
                                        <p className="text-sm">
                                            {msg.proposedDate} @ {msg.proposedTime}
                                        </p>
                                    </div>
                                ) : null}

                                <p className={`text-sm ${isMe ? 'text-white' : 'text-gray-800'}`}>{msg.message}</p>

                                {/* Timestamp */}
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Action Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                {/* Smart Actions Bar */}
                <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                    <button
                        onClick={generateSmartReply}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium hover:bg-indigo-100 transition-colors whitespace-nowrap"
                    >
                        <Sparkles className="w-3 h-3" /> Smart Reply
                    </button>
                    <button
                        onClick={() => setShowCounterOffer(!showCounterOffer)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                        <Clock className="w-3 h-3" /> Propose New Time
                    </button>
                </div>

                {/* Counter Offer Form */}
                <AnimatePresence>
                    {showCounterOffer && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-2 text-sm border rounded-md"
                                        onChange={e => setCounterOffer({ ...counterOffer, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full p-2 text-sm border rounded-md"
                                        onChange={e => setCounterOffer({ ...counterOffer, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => handleSendMessage('counter_offer')}
                                className="w-full py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-black transition-colors"
                            >
                                Send Counter Offer
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Text Input */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={sending || !newMessage.trim()}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
