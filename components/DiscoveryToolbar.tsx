
"use client";
import { useState, useMemo } from 'react';
import {
    Search,
    MapPin,
    Clock,
    Filter,
    Grid,
    List,
    Map as MapIcon,
    TrendingUp,
    Zap,
    Bookmark,
    Bell,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type FilterState = {
    searchStr: string;
    duration: string;
    department: string;
    timeOfDay: string;
};

interface DiscoveryToolbarProps {
    onSearch: (filters: FilterState) => void;
    viewMode: 'grid' | 'list' | 'map';
    setViewMode: (mode: 'grid' | 'list' | 'map') => void;
}

export default function DiscoveryToolbar({ onSearch, viewMode, setViewMode }: DiscoveryToolbarProps) {
    const [filters, setFilters] = useState<FilterState>({
        searchStr: '',
        duration: 'any',
        department: 'all',
        timeOfDay: 'any'
    });
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFilters = { ...filters, searchStr: e.target.value };
        setFilters(newFilters);
        onSearch(newFilters);
    };

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onSearch(newFilters);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 sticky top-20 z-20">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">

                {/* NLP Search Bar */}
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Try 'Need free slot Friday evening' or 'Marketing team swaps'"
                        value={filters.searchStr}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                    />
                    {filters.searchStr && (
                        <button
                            onClick={() => handleFilterChange('searchStr', '')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {[
                            { id: 'grid', icon: Grid },
                            { id: 'list', icon: List },
                            { id: 'map', icon: MapIcon }
                        ].map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => setViewMode(mode.id as any)}
                                className={`p-2 rounded-md transition-all ${viewMode === mode.id
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <mode.icon className="w-4 h-4" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expanded Smart Filters */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Duration</label>
                                <select
                                    value={filters.duration}
                                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
                                >
                                    <option value="any">Any Duration</option>
                                    <option value="short">Short (30m - 1h)</option>
                                    <option value="medium">Medium (1h - 4h)</option>
                                    <option value="long">Long (4h+)</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Department</label>
                                <select
                                    value={filters.department}
                                    onChange={(e) => handleFilterChange('department', e.target.value)}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
                                >
                                    <option value="all">All Departments</option>
                                    <option value="engineering">Engineering</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="sales">Sales</option>
                                    <option value="design">Design</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Time Preference</label>
                                <select
                                    value={filters.timeOfDay}
                                    onChange={(e) => handleFilterChange('timeOfDay', e.target.value)}
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 outline-none"
                                >
                                    <option value="any">Any Time</option>
                                    <option value="morning">Morning (6am - 12pm)</option>
                                    <option value="afternoon">Afternoon (12pm - 5pm)</option>
                                    <option value="evening">Evening (5pm+)</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Tags / NLP Chips Simulation */}
            {filters.searchStr.length > 5 && (
                <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <Zap className="w-3 h-3" /> AI Detected: Urgency
                    </span>
                    {filters.searchStr.toLowerCase().includes('friday') && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            <Clock className="w-3 h-3" /> Day: Friday
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
