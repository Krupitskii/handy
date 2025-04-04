// Google Calendar API configuration
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const API_KEY = process.env.GOOGLE_CLIENT_SECRET;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

// Time zone configuration
const TIMEZONE = 'America/Los_Angeles'; // Pacific Time
const START_HOUR = 10; // 10 AM
const END_HOUR = 19.5; // 7:30 PM
const SLOT_DURATION = 30; // 30 minutes

class GoogleCalendarManager {
    constructor() {
        this.tokenClient = null;
        this.accessToken = null;
        this.calendar = null;
        this.initialized = false;
    }

    async init() {
        try {
            // Load the Google API client library
            await this.loadGoogleAPI();
            
            // Initialize the token client
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: (tokenResponse) => {
                    this.accessToken = tokenResponse.access_token;
                    this.initialized = true;
                    console.log('Google Calendar API initialized successfully');
                },
            });

            // Initialize the calendar service
            this.calendar = google.calendar({ version: 'v3', auth: this.accessToken });
            
            return true;
        } catch (error) {
            console.error('Error initializing Google Calendar:', error);
            return false;
        }
    }

    loadGoogleAPI() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: API_KEY,
                            discoveryDocs: DISCOVERY_DOCS,
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    async getBusySlots(startDate, endDate) {
        if (!this.initialized) {
            await this.init();
        }

        try {
            const response = await gapi.client.calendar.freebusy.query({
                timeMin: startDate.toISOString(),
                timeMax: endDate.toISOString(),
                timeZone: TIMEZONE,
                items: [{ id: 'primary' }]
            });

            return response.result.calendars.primary.busy;
        } catch (error) {
            console.error('Error fetching busy slots:', error);
            return [];
        }
    }

    generateTimeSlots(date) {
        const slots = [];
        const startTime = new Date(date);
        startTime.setHours(START_HOUR, 0, 0, 0);
        
        const endTime = new Date(date);
        endTime.setHours(Math.floor(END_HOUR), (END_HOUR % 1) * 60, 0, 0);

        while (startTime < endTime) {
            slots.push(new Date(startTime));
            startTime.setMinutes(startTime.getMinutes() + SLOT_DURATION);
        }

        return slots;
    }

    isSlotAvailable(slot, busySlots) {
        const slotStart = slot.getTime();
        const slotEnd = slot.getTime() + (SLOT_DURATION * 60 * 1000);

        return !busySlots.some(busy => {
            const busyStart = new Date(busy.start).getTime();
            const busyEnd = new Date(busy.end).getTime();
            return (slotStart < busyEnd && slotEnd > busyStart);
        });
    }

    async getAvailableSlots(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const busySlots = await this.getBusySlots(startOfDay, endOfDay);
        const allSlots = this.generateTimeSlots(date);
        
        return allSlots.filter(slot => this.isSlotAvailable(slot, busySlots));
    }
}

// Export the manager
window.googleCalendarManager = new GoogleCalendarManager(); 