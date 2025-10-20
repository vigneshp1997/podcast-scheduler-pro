import { Host, TimeSlot, Booking, BookingDetails } from '../types';

// NOTE: In a real app, this should be an environment variable.
const API_BASE_URL = 'http://localhost:3001';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const calendarService = {
  getAvailableSlots: async (date: Date): Promise<TimeSlot[]> => {
    // The backend expects the date in YYYY-MM-DD format in UTC.
    const dateString = date.toISOString().split('T')[0];
    const response = await fetch(`${API_BASE_URL}/api/slots?date=${dateString}`);
    return handleResponse(response);
  },

  bookSlot: async (startTime: Date, details: BookingDetails): Promise<Booking> => {
    const response = await fetch(`${API_BASE_URL}/api/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startTime: startTime.toISOString(), // Send timestamp in UTC ISO format
        ...details,
      }),
    });
    return handleResponse(response);
  },

  getHostStatuses: async (): Promise<{id: string; name: string; email: string; connected: boolean}[]> => {
    const response = await fetch(`${API_BASE_URL}/api/hosts`);
    return handleResponse(response);
  }
};
