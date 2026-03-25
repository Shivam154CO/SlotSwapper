"use client";
import { useState, useMemo } from 'react';
import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    startOfMonth,
    endOfMonth,
    isSameDay,
    addDays,
    subDays,
    addMonths,
    subMonths
} from 'date-fns';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    MoreHorizontal,
    Zap,
    Layout,
    Maximize2,
    Minimize2,
    Brain,
    Flame,
    CheckCircle,
    XCircle,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Event = {
    _id: string;
    title: string;
    startTime: string | Date;
    endTime: string | Date;
    status?: 'busy' | 'flexible' | 'swappable' | 'high_priority' | 'blocked' | 'ai_optimized';
    category?: 'work' | 'personal' | 'focus' | 'meeting' | 'other';
    color?: string;
};

interface SmartCalendarProps {
    events: Event[];
    onAddEvent?: (date: Date) => void;
    onEventClick?: (event: Event) => void;
}

export default function SmartCalendar({ events, onAddEvent, onEventClick }: SmartCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda' | 'heatmap'>('month');
    const [showAiSuggestions, setShowAiSuggestions] = useState(false);

    // Helper Functions
    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const monthDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentDate));
        const end = endOfWeek(endOfMonth(currentDate));
        return eachDayOfInterval({ start, end });
    }, [currentDate]);

    const getEventsForDay = (date: Date) => {
        return events.filter(event => isSameDay(new Date(event.startTime), date));
    };

    // AI Logic Simulation
    const getConflictLevel = (date: Date) => {
        const dayEvents = getEventsForDay(date);
        if (dayEvents.length > 4) return 'high';
        if (dayEvents.length > 2) return 'medium';
        return 'low';
    };

    const getHeatmapColor = (level: string) => {
        switch (level) {
            case 'high': return 'bg-red-100 border-red-200 text-red-700';
            case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-700';
            default: return 'bg-green-50 border-green-100 text-green-700 hover:bg-green-100';
        }
    };

    // Render Functions
    const renderHeader = () => (
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-white rounded shadow-sm transition-all">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 text-sm font-medium text-gray-600 hover:text-gray-900">
                        Today
                    </button>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-white rounded shadow-sm transition-all">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {[
                    { id: 'month', icon: Layout, label: 'Month' },
                    { id: 'week', icon: CalendarIcon, label: 'Week' },
                    { id: 'agenda', icon: Clock, label: 'Agenda' },
                    { id: 'heatmap', icon: Flame, label: 'Heatmap' },
                ].map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setViewMode(view.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${viewMode === view.id
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <view.icon className="w-4 h-4" />
                        {view.label}
                    </button>
                ))}

                <button
                    onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                    className={`ml-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${showAiSuggestions
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <Brain className={`w-4 h-4 ${showAiSuggestions ? 'text-indigo-600' : 'text-gray-400'}`} />
                    AI Insights
                </button>
            </div>
        </div>
    );

    const renderMonthView = () => (
        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden shadow-sm border border-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {day}
                </div>
            ))}

            {monthDays.map((day, idx) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = format(day, 'MM') === format(currentDate, 'MM');
                const isToday = isSameDay(day, new Date());

                return (
                    <div
                        key={day.toString()}
                        className={`min-h-[120px] bg-white p-2 transition-colors hover:bg-gray-50 cursor-pointer group relative ${!isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : ''
                            }`}
                        onClick={() => onAddEvent && onAddEvent(day)}
                    >
                        <div className={`text-sm font-medium mb-1 ${isToday
                                ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-sm'
                                : 'text-gray-700'
                            }`}>
                            {format(day, 'd')}
                        </div>

                        <div className="space-y-1">
                            {dayEvents.slice(0, 3).map(event => (
                                <div
                                    key={event._id}
                                    onClick={(e) => { e.stopPropagation(); onEventClick && onEventClick(event); }}
                                    className={`text-xs px-2 py-1 rounded truncate border-l-2 transition-all hover:brightness-95 cursor-pointer ${event.status === 'high_priority' ? 'bg-red-50 border-red-500 text-red-700' :
                                            event.status === 'flexible' ? 'bg-green-50 border-green-500 text-green-700' :
                                                event.status === 'swappable' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' :
                                                    'bg-blue-50 border-blue-500 text-blue-700'
                                        }`}
                                >
                                    {format(new Date(event.startTime), 'HH:mm')} {event.title}
                                </div>
                            ))}
                            {dayEvents.length > 3 && (
                                <div className="text-xs text-gray-400 pl-1 font-medium">
                                    +{dayEvents.length - 3} more
                                </div>
                            )}
                        </div>

                        {/* Quick Add Overlay */}
                        <div className="absolute inset-0 bg-blue-50/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <div className="bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-blue-600 shadow-sm border border-blue-100">
                                + Add Event
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderHeatmap = () => (
        <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day) => {
                const level = getConflictLevel(day);
                const dayEvents = getEventsForDay(day);
                return (
                    <div
                        key={day.toString()}
                        className={`aspect-square rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getHeatmapColor(level)}`}
                    >
                        <span className="text-lg font-bold mb-1">{format(day, 'd')}</span>
                        <span className="text-xs font-medium opacity-80">{dayEvents.length} Events</span>
                        {level === 'high' && <AlertTriangle className="w-4 h-4 mt-1 opacity-70" />}
                        {level === 'low' && <CheckCircle className="w-4 h-4 mt-1 opacity-70" />}
                    </div>
                );
            })}
        </div>
    );

    const renderAgenda = () => {
        // Sort all events by date
        const sortedEvents = [...events].sort((a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        return (
            <div className="space-y-4">
                {sortedEvents.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No events scheduled.</div>
                ) : (
                    sortedEvents.map(event => (
                        <div
                            key={event._id}
                            className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow group"
                        >
                            <div className="flex flex-col items-center min-w-[60px]">
                                <span className="text-sm font-bold text-gray-900">{format(new Date(event.startTime), 'MMM d')}</span>
                                <span className="text-xs text-gray-500 uppercase">{format(new Date(event.startTime), 'EEE')}</span>
                            </div>

                            <div className={`w-1 h-full min-h-[40px] rounded-full flex-shrink-0 ${event.status === 'high_priority' ? 'bg-red-500' :
                                    event.status === 'flexible' ? 'bg-green-500' : 'bg-blue-500'
                                }`} />

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {event.status === 'ai_optimized' && (
                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> Optimized
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
                                            {format(new Date(event.startTime), 'HH:mm')} - {format(new Date(event.endTime), 'HH:mm')}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{event.category || 'General'}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            {renderHeader()}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Calendar Area */}
                <div className={showAiSuggestions ? 'lg:col-span-3' : 'lg:col-span-4'}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={viewMode}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {viewMode === 'month' && renderMonthView()}
                            {viewMode === 'heatmap' && renderHeatmap()}
                            {viewMode === 'agenda' && renderAgenda()}
                            {viewMode === 'week' && <div className="p-12 text-center text-gray-500">Week View Coming Soon</div>}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* AI Insight Sidebar */}
                {showAiSuggestions && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="lg:col-span-1 border-l border-gray-100 pl-6 space-y-6"
                    >
                        <div>
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                <Brain className="w-5 h-5 text-indigo-600" />
                                AI Schedule Optimizer
                            </h3>

                            <div className="space-y-4">
                                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                                    <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        Conflict Detected
                                    </h4>
                                    <p className="text-xs text-indigo-700 mb-3">
                                        You have overlapping meetings on {format(addDays(new Date(), 2), 'MMM d')}. Consider rescheduling.
                                    </p>
                                    <button className="text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors w-full">
                                        Auto-Resolve
                                    </button>
                                </div>

                                <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                                    <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        Focus Time Found
                                    </h4>
                                    <p className="text-xs text-green-700 mb-3">
                                        2 hours of uninterrupted time available tomorrow morning.
                                    </p>
                                    <button className="text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors w-full border border-green-200">
                                        Block Time
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                Calendar Stats
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <div className="text-xl font-bold text-gray-900">{events.filter(e => e.status === 'busy').length}</div>
                                    <div className="text-xs text-gray-500">Busy Slots</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <div className="text-xl font-bold text-green-600">{events.filter(e => e.status === 'flexible').length}</div>
                                    <div className="text-xs text-gray-500">Flexible</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
