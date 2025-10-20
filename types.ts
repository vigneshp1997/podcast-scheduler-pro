export interface Host {
  id: string;
  name: string;
  email: string;
  connected?: boolean;
}

export interface TimeSlot {
  startTime: Date; // e.g., A UTC Date object representing the start of the slot
}

export interface BookingDetails {
  guestName: string;
  guestEmail: string;
  topic: string;
}

export interface Booking extends BookingDetails {
  id: string;
  startTime: Date; // Stores the exact time of the booking in UTC
  host: Host;
}

export interface GeminiPromptInfo extends BookingDetails {
  hostName: string;
  date: Date;
  time: string;
}
