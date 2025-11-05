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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleToggle = () => {
    console.log("🟡 EventCard: Toggle button clicked for event:", event._id);
    console.log("🟡 Current swappable status:", event.swappable);
    onToggle(event._id);
  };

  // Format dates only on client to avoid hydration issues
  const formatDate = (dateString: string) => {
    if (!isClient) return "";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-800">{event.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            📅 {formatDate(event.startTime)}
          </p>
          <p className="text-sm text-gray-600">
            ⏰ {formatDate(event.startTime)} - {formatDate(event.endTime)}
          </p>
          {isClient && (
            <p className="text-xs text-gray-500 mt-1">ID: {event._id.substring(0, 8)}...</p>
          )}
        </div>
        <button
          onClick={handleToggle}
          className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
            event.swappable
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {event.swappable ? "✅ Swappable" : "🔄 Mark Swappable"}
        </button>
      </div>
      {event.swappable && (
        <div className="mt-2 text-xs text-green-600 font-medium">
          ✓ This event is available for swapping in the marketplace
        </div>
      )}
    </div>
  );
}