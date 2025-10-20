import React from 'react';
import { TimeSlot } from '../types';
import ClockIcon from './icons/ClockIcon';

interface TimeSlotGridProps {
  selectedDate: Date;
  slots: TimeSlot[];
  isLoading: boolean;
  onSlotSelect: (slot: TimeSlot) => void;
  timezone: string;
}

const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ selectedDate, slots, isLoading, onSlotSelect, timezone }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-700 mb-1">Available Slots</h2>
      <p className="text-sm text-gray-500 mb-6">
        {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: timezone })}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
          ))}
        </div>
      ) : slots.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {slots.map((slot) => {
            const displayTime = slot.startTime.toLocaleTimeString('en-US', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
            return (
                <button
                key={slot.startTime.toISOString()}
                onClick={() => onSlotSelect(slot)}
                className="flex items-center justify-center p-3 border border-gray-300 rounded-md text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 transform hover:scale-105"
                >
                <ClockIcon />
                <span className="ml-2">{displayTime}</span>
                </button>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-10 px-4">
          <p className="text-gray-500">No available slots for this day.</p>
          <p className="text-sm text-gray-400 mt-2">Please select another date from the calendar.</p>
        </div>
      )}
    </div>
  );
};

export default TimeSlotGrid;
