"use client";

import { useState, useEffect } from "react";

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
};

export default function EventCard({ event, onToggle }: EventCardProps) {
  const [isClient, setIsClient] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggle = () => {
    console.log("EventCard: Toggle button clicked for event:", event._id);
    console.log("Current swappable status:", event.swappable);
    
    setIsAnimating(true);
    onToggle(event._id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const formatDate = (dateString: string) => {
    if (!isClient) return { date: "", time: "" };
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

  const startTime = formatDate(event.startTime);
  const endTime = formatDate(event.endTime);
  const duration = Math.round((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60 * 60));

  if (!isClient) {
    return (
      <div className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm animate-pulse">
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
      border border-gray-200 p-4 rounded-lg bg-white 
      shadow-sm hover:shadow-md transition-all duration-200
      ${event.swappable ? 'border-green-200 bg-green-50/30' : ''}
      ${isAnimating ? 'scale-[0.99]' : ''}
    `}>
      
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {event.title}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">📅</span>
              <span className="font-medium">{startTime.weekday}, {startTime.date}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-gray-400">⏰</span>
              <span>{startTime.time} - {endTime.time}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <span className="text-gray-400">⏱️</span>
              <span className="font-medium">{duration}h</span>
            </div>
          </div>

          {event.swappable && (
            <div className="flex items-center gap-1 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-600 font-medium">
                Available for swap
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleToggle}
          disabled={isAnimating}
          className={`
            relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[120px]
            ${event.swappable
              ? `
                bg-green-100 text-green-700 border border-green-200
                hover:bg-green-200 focus:ring-green-300
              `
              : `
                bg-blue-100 text-blue-700 border border-blue-200
                hover:bg-blue-200 focus:ring-blue-300
              `
            }
            ${isAnimating ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}
          `}
        >
          <div className="flex items-center justify-center gap-1.5">
            {event.swappable ? (
              <>
                <span>✅</span>
                <span>Swappable</span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>Make Swappable</span>
              </>
            )}
          </div>
        </button>
      </div>

      {isClient && (
        <p className="text-xs text-gray-400 mt-2 font-mono">
          #{event._id.substring(0, 6)}
        </p>
      )}
    </div>
  );
}