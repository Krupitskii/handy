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

class Calendar {
    constructor() {
        this.date = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.availableSlots = [];
        
        // Initialize elements
        this.calendarContainer = document.querySelector('.calendar-container');
        this.daysGrid = document.querySelector('.days-grid');
        this.timeSlots = document.querySelector('.time-slots');
        this.currentMonth = document.querySelector('.current-month');
        this.prevMonth = document.querySelector('.prev-month');
        this.nextMonth = document.querySelector('.next-month');
        this.slotsGrid = document.querySelector('.slots-grid');
        this.confirmButton = document.querySelector('.confirm-booking');
        
        if (!this.calendarContainer || !this.daysGrid || !this.timeSlots || 
            !this.currentMonth || !this.prevMonth || !this.nextMonth || 
            !this.slotsGrid || !this.confirmButton) {
            console.error('Calendar elements not found');
            return;
        }

        // Initialize Google Calendar
        this.initGoogleCalendar();
        
        // Add event listeners
        this.addEventListeners();
        
        // Render initial calendar
        this.render();
    }

    async initGoogleCalendar() {
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

    addEventListeners() {
        this.prevMonth.addEventListener('click', () => this.navigateMonth(-1));
        this.nextMonth.addEventListener('click', () => this.navigateMonth(1));
        this.daysGrid.addEventListener('click', (e) => this.handleDayClick(e));
        this.slotsGrid.addEventListener('click', (e) => this.handleTimeSlotClick(e));
        this.confirmButton.addEventListener('click', () => this.handleConfirm());
    }

    async handleDayClick(e) {
        const dayElement = e.target.closest('.day');
        if (!dayElement || dayElement.classList.contains('disabled')) return;

        const day = parseInt(dayElement.textContent);
        const newDate = new Date(this.date.getFullYear(), this.date.getMonth(), day);
        
        if (newDate < new Date().setHours(0, 0, 0, 0)) return;

        this.selectedDate = newDate;
        this.selectedTime = null;
        
        // Update UI
        document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
        dayElement.classList.add('selected');
        
        // Get available slots from Google Calendar
        await this.updateAvailableSlots();
    }

    handleTimeSlotClick(e) {
        const slotElement = e.target.closest('.time-slot');
        if (!slotElement || slotElement.classList.contains('disabled')) return;

        this.selectedTime = new Date(slotElement.dataset.time);
        
        // Update UI
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        slotElement.classList.add('selected');
        
        // Enable confirm button
        this.confirmButton.disabled = false;
    }

    async handleConfirm() {
        if (!this.selectedDate || !this.selectedTime) return;

        try {
            // Create calendar event
            const event = {
                'summary': 'HandyBot Demo Call',
                'start': {
                    'dateTime': this.selectedTime.toISOString(),
                    'timeZone': TIMEZONE
                },
                'end': {
                    'dateTime': new Date(this.selectedTime.getTime() + 30 * 60000).toISOString(),
                    'timeZone': TIMEZONE
                }
            };

            await gapi.client.calendar.events.insert({
                'calendarId': 'primary',
                'resource': event
            });

            // Close modal and show success message
            const modal = document.querySelector('.cta-modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }

            alert('Call scheduled successfully!');
        } catch (error) {
            console.error('Failed to schedule call:', error);
            alert('Failed to schedule call. Please try again.');
        }
    }

    navigateMonth(delta) {
        this.date.setMonth(this.date.getMonth() + delta);
        this.render();
    }

    render() {
        const year = this.date.getFullYear();
        const month = this.date.getMonth();
        const today = new Date();
        
        // Update month display
        this.currentMonth.textContent = this.date.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });
        
        // Clear previous days
        this.daysGrid.innerHTML = '';
        
        // Add day headers
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = day;
            this.daysGrid.appendChild(dayHeader);
        });
        
        // Get first day of month and total days
        const firstDay = new Date(year, month, 1);
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay.getDay(); i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            this.daysGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= totalDays; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = day;
            
            const currentDate = new Date(year, month, day);
            if (currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
                dayElement.classList.add('disabled');
            }
            
            if (this.selectedDate && 
                currentDate.getDate() === this.selectedDate.getDate() &&
                currentDate.getMonth() === this.selectedDate.getMonth() &&
                currentDate.getFullYear() === this.selectedDate.getFullYear()) {
                dayElement.classList.add('selected');
            }
            
            this.daysGrid.appendChild(dayElement);
        }
        
        // If we have a selected date, update available slots
        if (this.selectedDate) {
            this.updateAvailableSlots();
        }
    }

    async updateAvailableSlots() {
        if (!this.selectedDate) return;
        
        try {
            const availableSlots = await window.googleCalendarManager.getAvailableSlots(this.selectedDate);
            this.availableSlots = availableSlots;
            this.renderTimeSlots();
        } catch (error) {
            console.error('Error updating available slots:', error);
        }
    }

    renderTimeSlots() {
        this.slotsGrid.innerHTML = '';
        
        this.availableSlots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = 'time-slot';
            slotElement.textContent = slot.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            slotElement.dataset.time = slot.toISOString();
            
            if (this.selectedTime && 
                slot.getTime() === this.selectedTime.getTime()) {
                slotElement.classList.add('selected');
            }
            
            this.slotsGrid.appendChild(slotElement);
        });
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calendar = new Calendar();
});

// Make Calendar available globally
window.Calendar = Calendar; 