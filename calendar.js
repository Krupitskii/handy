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
            await window.googleCalendarManager.init();
            console.log('Google Calendar initialized');
        } catch (error) {
            console.error('Failed to initialize Google Calendar:', error);
        }
    }

    addEventListeners() {
        this.prevMonth.addEventListener('click', () => this.navigateMonth(-1));
        this.nextMonth.addEventListener('click', () => this.navigateMonth(1));
        this.daysGrid.addEventListener('click', (e) => this.handleDayClick(e));
        this.slotsGrid.addEventListener('click', (e) => this.handleTimeSlotClick(e));
        this.confirmButton.addEventListener('click', () => this.handleConfirm());
    }

    navigateMonth(delta) {
        this.date.setMonth(this.date.getMonth() + delta);
        this.render();
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

    async updateAvailableSlots() {
        if (!this.selectedDate) return;

        try {
            this.availableSlots = await window.googleCalendarManager.getAvailableSlots(this.selectedDate);
            this.renderTimeSlots();
        } catch (error) {
            console.error('Failed to get available slots:', error);
        }
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
                    'timeZone': 'America/Los_Angeles'
                },
                'end': {
                    'dateTime': new Date(this.selectedTime.getTime() + 30 * 60000).toISOString(),
                    'timeZone': 'America/Los_Angeles'
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

    render() {
        const year = this.date.getFullYear();
        const month = this.date.getMonth();
        
        // Update month display
        this.currentMonth.textContent = new Date(year, month).toLocaleDateString('en-US', { 
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
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            this.daysGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        const today = new Date();
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