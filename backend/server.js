// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Basic Configuration & Validation ---
const { GCP_CLIENT_ID, GCP_CLIENT_SECRET, REDIRECT_URI, FRONTEND_URI } = process.env;
if (!GCP_CLIENT_ID || !GCP_CLIENT_SECRET || !REDIRECT_URI || !FRONTEND_URI) {
    console.error("FATAL ERROR: Missing required environment variables. Please check your .env file.");
    process.exit(1);
}

// --- Middlewares ---
// Enable CORS for all origins. This is suitable for a demo application.
// In a production environment, you would want to restrict this to your frontend's specific domain.
app.use(cors());
app.use(bodyParser.json());

const oauth2Client = new google.auth.OAuth2(
    GCP_CLIENT_ID,
    GCP_CLIENT_SECRET,
    REDIRECT_URI
);

// --- In-Memory Data Store (for demonstration purposes) ---
// In a production app, you MUST use a database (e.g., PostgreSQL, MongoDB) to persist this data.
const hosts = [
    { id: '1', name: 'Alice', email: 'alice@example.com', tokens: null },
    { id: '2', name: 'Bob', email: 'bob@example.com', tokens: null },
    { id: '3', name: 'Charlie', email: 'charlie@example.com', tokens: null },
    { id: '4', name: 'Diana', email: 'diana@example.com', tokens: null },
];
const bookings = []; // In-memory store for booked events
let lastAssignedHostIndex = -1;

// --- OAuth2 Routes ---

// 1. Start the authorization process
app.get('/auth/google', (req, res) => {
    const { hostId } = req.query;
    if (!hostId) {
        return res.status(400).send('Missing hostId query parameter.');
    }

    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Important to get a refresh token
        scope: [
            'https://www.googleapis.com/auth/calendar.events',
            'https://www.googleapis.com/auth/calendar.readonly'
        ],
        state: hostId, // Pass hostId through the OAuth flow
        prompt: 'consent', // Force consent screen to ensure refresh token is sent
    });
    res.redirect(authUrl);
});

// 2. Handle the callback from Google
app.get('/auth/google/callback', async (req, res) => {
    const { code, state } = req.query;
    const hostId = state;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        
        // Find the host and save their tokens
        const host = hosts.find(h => h.id === hostId);
        if (host) {
            host.tokens = tokens;
            console.log(`Successfully authenticated host: ${host.name}`);
        } else {
            console.error(`Could not find host with id: ${hostId}`);
        }

        // Redirect back to the frontend with a success message
        res.send(`<script>window.close();</script>`);
    } catch (error) {
        console.error('Error retrieving access token', error);
        res.status(500).send('Authentication failed');
    }
});


// --- API Routes ---

// Get the connection status of all hosts
app.get('/api/hosts', (req, res) => {
    const hostStatuses = hosts.map(h => ({
        id: h.id,
        name: h.name,
        email: h.email,
        connected: !!h.tokens,
    }));
    res.json(hostStatuses);
});

// Get available slots for a given date
app.get('/api/slots', async (req, res) => {
    const { date } = req.query; // Expecting YYYY-MM-DD
    if (!date) {
        return res.status(400).json({ message: 'Date query parameter is required.' });
    }

    const connectedHosts = hosts.filter(h => h.tokens);
    if (connectedHosts.length === 0) {
        return res.json([]); // No connected hosts, so no available slots
    }

    const timeMin = new Date(`${date}T00:00:00.000Z`);
    const timeMax = new Date(`${date}T23:59:59.999Z`);

    try {
        const calendar = google.calendar({ version: 'v3' });
        const freeBusyResponse = await calendar.freebusy.query({
            requestBody: {
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                items: connectedHosts.map(h => ({ id: h.email })),
            },
        });
        
        const busySlots = [];
        Object.values(freeBusyResponse.data.calendars).forEach(cal => {
            cal.busy.forEach(slot => {
                busySlots.push({ start: new Date(slot.start), end: new Date(slot.end) });
            });
        });

        // Define potential 1-hour slots from 9 AM to 5 PM UTC
        const potentialSlots = [];
        for (let hour = 9; hour < 17; hour++) {
            potentialSlots.push(new Date(`${date}T${String(hour).padStart(2, '0')}:00:00.000Z`));
        }

        const availableSlots = potentialSlots.filter(slotStart => {
            const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);
            
            // A slot is available if at least one host is free.
            const isAnyHostFree = connectedHosts.some(host => {
                const hostBusyTimes = freeBusyResponse.data.calendars[host.email]?.busy || [];
                // Return `true` (host is free) if they have NO overlapping busy times.
                return !hostBusyTimes.some(busy => {
                    const busyStart = new Date(busy.start);
                    const busyEnd = new Date(busy.end);
                    return slotStart < busyEnd && slotEnd > busyStart; // Overlap condition
                });
            });
            return isAnyHostFree;
        });

        res.json(availableSlots.map(s => ({ startTime: s.toISOString() })));

    } catch (error) {
        console.error('Error fetching free/busy information:', error);
        res.status(500).json({ message: 'Failed to fetch calendar availability.' });
    }
});

// Book a new slot
app.post('/api/book', async (req, res) => {
    const { startTime, guestName, guestEmail, topic } = req.body;
    
    const eventStartTime = new Date(startTime);
    const eventEndTime = new Date(eventStartTime.getTime() + 60 * 60 * 1000);

    const connectedHosts = hosts.filter(h => h.tokens);
    if (connectedHosts.length === 0) {
        return res.status(500).json({ message: "No hosts have connected their calendars." });
    }

    // Step 1: Verify which hosts are actually free at the requested time to avoid race conditions.
    const freeHosts = [];
    for (const host of connectedHosts) {
        oauth2Client.setCredentials(host.tokens);
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        try {
            const response = await calendar.freebusy.query({
                requestBody: {
                    timeMin: eventStartTime.toISOString(),
                    timeMax: eventEndTime.toISOString(),
                    items: [{ id: host.email }],
                },
            });
            const busySlots = response.data.calendars[host.email].busy;
            if (busySlots.length === 0) {
                freeHosts.push(host);
            }
        } catch (err) {
            console.error(`Could not verify availability for ${host.email}:`, err.message);
            // If we can't verify, we assume they are not available to be safe.
        }
    }

    if (freeHosts.length === 0) {
        return res.status(409).json({ message: "This slot is no longer available. Please select another time." });
    }

    // Step 2: Implement daily-aware round-robin.
    // Find the host among the free ones who has the fewest bookings for the day.
    const bookingDate = eventStartTime.toISOString().split('T')[0];
    const bookingsToday = bookings.filter(b => b.startTime.startsWith(bookingDate));
    
    const hostBookingCounts = freeHosts.map(host => ({
        host,
        count: bookingsToday.filter(b => b.host.id === host.id).length,
    }));

    const minBookings = Math.min(...hostBookingCounts.map(h => h.count));
    const leastBookedHosts = hostBookingCounts
        .filter(h => h.count === minBookings)
        .map(h => h.host);
    
    // Step 3: Use the global round-robin index as a tie-breaker.
    let assignedHost = null;
    let searchIndex = (lastAssignedHostIndex + 1) % connectedHosts.length;

    for (let i = 0; i < connectedHosts.length; i++) {
        const candidateHost = connectedHosts[searchIndex];
        // Check if this candidate from the main list is in our least-booked-and-free list
        if (leastBookedHosts.some(h => h.id === candidateHost.id)) {
            assignedHost = candidateHost;
            lastAssignedHostIndex = searchIndex; // IMPORTANT: Update the global index
            break;
        }
        searchIndex = (searchIndex + 1) % connectedHosts.length;
    }

    // Fallback if loop fails, though it shouldn't if leastBookedHosts is not empty.
    if (!assignedHost) {
        assignedHost = leastBookedHosts[0];
        lastAssignedHostIndex = connectedHosts.findIndex(h => h.id === assignedHost.id);
    }
    
    // Step 4: Create the calendar event for the assigned host.
    oauth2Client.setCredentials(assignedHost.tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
        summary: `Podcast Recording: ${assignedHost.name} w/ ${guestName}`,
        description: `Podcast recording session with ${guestName} (${guestEmail}) to discuss "${topic}".`,
        start: {
            dateTime: eventStartTime.toISOString(),
            timeZone: 'UTC',
        },
        end: {
            dateTime: eventEndTime.toISOString(),
            timeZone: 'UTC',
        },
        attendees: [
            { email: assignedHost.email },
            { email: guestEmail },
        ],
        conferenceData: {
            createRequest: {
                requestId: `podcast-booking-${Date.now()}`,
                conferenceSolutionKey: {
                    type: 'hangoutsMeet'
                }
            }
        },
    };

    try {
        const createdEvent = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1,
        });

        const bookingConfirmation = {
            id: createdEvent.data.id,
            startTime: createdEvent.data.start.dateTime,
            host: { id: assignedHost.id, name: assignedHost.name, email: assignedHost.email },
            guestName,
            guestEmail,
            topic,
            meetLink: createdEvent.data.hangoutLink,
        };

        // Persist the booking in our in-memory store
        bookings.push(bookingConfirmation);

        res.status(201).json(bookingConfirmation);

    } catch (error) {
        console.error('Error creating calendar event:', error);
        res.status(500).json({ message: 'Failed to create calendar event.' });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
    console.log("Ensure your Google Cloud OAuth Redirect URI is set to http://localhost:3001/auth/google/callback");
});