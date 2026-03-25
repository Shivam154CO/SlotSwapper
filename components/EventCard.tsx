"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, ArrowRight, Check, RefreshCw, Trash2, AlertCircle } from "lucide-react";

type Event = {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  swappable?: boolean;
};

type EventCardProps = {
  event: Event;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
};

export default function EventCard({ event, onToggle, onDelete, isDeleting = false }: EventCardProps) {
  const [isClient, setIsClient] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle(event._id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDelete = () => {
    onDelete(event._id);
  };

  const formatDate = (dateString: string) => {
    if (!isClient) return { date: "", time: "", weekday: "" };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' })
    };
  };

  const start = formatDate(event.startTime);
  const end = formatDate(event.endTime);
  const duration = Math.round((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60 * 60));

  if (!isClient) {
    return (
      <div className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm animate-pulse">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-9 bg-gray-200 rounded-lg w-28 ml-3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`
      relative group border p-5 rounded-xl bg-white 
      shadow-sm hover:shadow-md transition-all duration-200
      ${event.swappable ? 'border-green-200 bg-green-50/10' : 'border-gray-200'}
      ${isAnimating ? 'scale-[0.99] opacity-90' : ''}
    `}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        {/* Event Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1 truncate pr-2">
              {event.title}
            </h3>
            {event.swappable && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Swappable
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{start.weekday}, {start.date}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{start.time}</span>
              <ArrowRight className="w-3 h-3 text-gray-300" />
              <span>{end.time}</span>
            </div>

            <div className="text-xs px-2 py-0.5 bg-gray-100 rounded-md text-gray-500 font-medium hidden sm:inline-block">
              {duration}h
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
          <button
            onClick={handleToggle}
            disabled={isAnimating || isDeleting}
            className={`
              flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
              ${event.swappable
                ? 'bg-white text-green-700 border border-green-200 hover:bg-green-50'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {event.swappable ? (
              <>
                <Check className="w-4 h-4" />
                <span>Offering Swap</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Offer Swap</span>
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`
              flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
              bg-white text-gray-400 border border-gray-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            title="Delete Event"
          >
            {isDeleting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}