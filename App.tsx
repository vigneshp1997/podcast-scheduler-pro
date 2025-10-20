import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Host, TimeSlot, Booking, BookingDetails } from './types';
import { calendarService } from './services/calendarService';
import { geminiService } from './services/geminiService';
import Header from './components/Header';
import CalendarView from './components/CalendarView';
import TimeSlotGrid from './components/TimeSlotGrid';
import BookingModal from './components/BookingModal';
import TimezoneSelector from './components/TimezoneSelector';
import HostManager from './components/HostManager';

const App: React.FC = () => {
  const [hosts, setHosts] = useState<Host[]>([
    { id: '1', name: 'Vignesh', email: 'vignesh@everstage.com', connected: false },
    { id: '2', name: 'Lokesh', email: 'lokeshwaran@lyric.tech', connected: false },
    // { id: '2', name: 'Bob', email: 'bob@example.com', connected: false },
    // { id: '3', name: 'Charlie', email: 'charlie@example.com', connected: false },
    // { id: '4', name: 'Diana', email: 'diana@example.com', connected: false },
  ]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState<string>(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  const [lastBookingResult, setLastBookingResult] = useState<{ booking: Booking; eventDetails: { title: string; description: string } } | null>(null);

  const fetchHostStatus = useCallback(async () => {
    try {
      const statuses = await calendarService.getHostStatuses();
      setHosts(currentHosts => currentHosts.map(h => ({
        ...h,
        connected: statuses.some(s => s.email === h.email && s.connected)
      })));
    } catch (err) {
      console.error("Failed to fetch host statuses", err);
      // Don't show a scary error for this, just log it.
    }
  }, []);

  useEffect(() => {
    fetchHostStatus();
    // Periodically check statuses in case a host connects in another tab.
    const interval = setInterval(fetchHostStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchHostStatus]);


  const fetchAvailableSlots = useCallback(async (date: Date) => {
    setIsLoadingSlots(true);
    setError(null);
    setLastBookingResult(null);
    try {
      const slots = await calendarService.getAvailableSlots(date);
      // The service now returns UTC dates from the server
      const slotsAsDates = slots.map(slot => ({ startTime: new Date(slot.startTime) }));
      setAvailableSlots(slotsAsDates);
    } catch (err) {
      setError('Failed to fetch available slots from the server. Please ensure the backend is running and connected.');
      console.error(err);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableSlots(selectedDate);
  }, [selectedDate, fetchAvailableSlots]);

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };

  const handleBookingConfirm = async (bookingDetails: BookingDetails) => {
    if (!selectedSlot) return;

    setIsBooking(true);
    setError(null);
    setLastBookingResult(null);

    try {
      const bookingResult = await calendarService.bookSlot(selectedSlot.startTime, bookingDetails);
      const booking: Booking = {
        ...bookingResult,
        startTime: new Date(bookingResult.startTime),
      };

      const timeStringForPrompt = selectedSlot.startTime.toLocaleTimeString('en-US', {
        timeZone: selectedTimezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      });

      const eventDetails = await geminiService.generateEventDetails({
        ...bookingDetails,
        hostName: booking.host.name,
        date: selectedSlot.startTime,
        time: timeStringForPrompt,
      });

      setLastBookingResult({ booking, eventDetails });
      setIsModalOpen(false);
      setSelectedSlot(null);
      fetchAvailableSlots(selectedDate);
    } catch (err) {
      setError('Failed to book the slot. It might have been taken. Please try another slot.');
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1 space-y-8">
            <HostManager hosts={hosts} />
            <CalendarView selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </aside>

          <div className="lg:col-span-2 space-y-6">
            {lastBookingResult && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-r-lg shadow-md" role="alert">
                <p className="font-bold text-lg">Booking Confirmed!</p>
                <p>Slot with <span className="font-semibold">{lastBookingResult.booking.host.name}</span> on {lastBookingResult.booking.startTime.toLocaleString([], { dateStyle: 'long', timeStyle: 'short', timeZone: selectedTimezone })} is booked for {lastBookingResult.booking.guestName}.</p>
                <div className="mt-4 p-3 bg-white rounded border border-green-200">
                    <h4 className="font-semibold text-md text-gray-700">Generated Event Details:</h4>
                    <p className="text-sm font-bold mt-2">{lastBookingResult.eventDetails.title}</p>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{lastBookingResult.eventDetails.description}</p>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            )}
            <div className="bg-white p-6 rounded-lg shadow">
              <TimezoneSelector timezone={selectedTimezone} setTimezone={setSelectedTimezone} />
            </div>
            <TimeSlotGrid
              selectedDate={selectedDate}
              slots={availableSlots}
              isLoading={isLoadingSlots}
              onSlotSelect={handleSlotSelect}
              timezone={selectedTimezone}
            />
          </div>
        </div>
      </main>

      {isModalOpen && selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          slot={selectedSlot}
          date={selectedDate}
          onConfirm={handleBookingConfirm}
          isBooking={isBooking}
          timezone={selectedTimezone}
        />
      )}
    </div>
  );
};

export default App;
