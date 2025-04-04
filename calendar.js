class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        
        // Find calendar elements in step 2
        const step2 = document.getElementById('demoStep2');
        if (!step2) {
            console.error('Step 2 not found');
            return;
        }
        
        this.calendarContainer = step2.querySelector('.calendar-container');
        this.daysGrid = step2.querySelector('.days-grid');
        this.timeSlots = step2.querySelector('.time-slots');
        this.currentMonthEl = step2.querySelector('.current-month');
        this.prevMonthBtn = step2.querySelector('.prev-month');
        this.nextMonthBtn = step2.querySelector('.next-month');
        this.slotsGrid = step2.querySelector('.slots-grid');
        this.confirmButton = step2.querySelector('.confirm-booking');
        
        console.log('Calendar elements:', {
            calendarContainer: this.calendarContainer,
            daysGrid: this.daysGrid,
            timeSlots: this.timeSlots,
            currentMonthEl: this.currentMonthEl,
            prevMonthBtn: this.prevMonthBtn,
            nextMonthBtn: this.nextMonthBtn,
            slotsGrid: this.slotsGrid,
            confirmButton: this.confirmButton
        });
        
        this.init();
    }

    init() {
        if (!this.daysGrid || !this.timeSlots) {
            console.error('Required calendar elements not found');
            return;
        }
        
        this.renderCalendar();
        this.addEventListeners();
        
        // Hide time slots initially
        if (this.timeSlots) {
            this.timeSlots.style.display = 'none';
        }
        
        // Hide confirm button initially
        if (this.confirmButton) {
            this.confirmButton.style.display = 'none';
        }
    }

    addEventListeners() {
        // Add month navigation handlers
        if (this.prevMonthBtn) {
            this.prevMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
                if (this.selectedDate) {
                    this.highlightSelectedDate();
                }
            });
        }
        
        if (this.nextMonthBtn) {
            this.nextMonthBtn.addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
                if (this.selectedDate) {
                    this.highlightSelectedDate();
                }
            });
        }
        
        // Add day selection handlers
        if (this.daysGrid) {
            this.daysGrid.addEventListener('click', (e) => {
                const dayElement = e.target.closest('.day');
                if (dayElement && !dayElement.classList.contains('disabled') && !dayElement.classList.contains('empty')) {
                    const dateStr = dayElement.dataset.date;
                    if (dateStr) {
                        const date = new Date(dateStr);
                        this.selectDate(date, dayElement);
                    }
                }
            });
        }
        
        // Add time slot selection handlers
        if (this.slotsGrid) {
            this.slotsGrid.addEventListener('click', (e) => {
                const timeSlot = e.target.closest('.time-slot');
                if (timeSlot && !timeSlot.classList.contains('disabled')) {
                    this.selectTime(timeSlot.textContent.trim(), timeSlot);
                }
            });
        }
        
        // Add confirm button handler
        if (this.confirmButton) {
            this.confirmButton.addEventListener('click', () => {
                if (this.selectedDate && this.selectedTime) {
                    console.log('Booking confirmed:', {
                        date: this.selectedDate,
                        time: this.selectedTime
                    });
                    
                    // Move to next step
                    const step2 = document.querySelector('.step-content[data-step="2"]');
                    const step3 = document.querySelector('.step-content[data-step="3"]');
                    const step2Indicator = document.querySelector('.step[data-step="2"]');
                    const step3Indicator = document.querySelector('.step[data-step="3"]');
                    
                    if (step2 && step3 && step2Indicator && step3Indicator) {
                        step2.classList.remove('active');
                        step3.classList.add('active');
                        step2Indicator.classList.remove('active');
                        step3Indicator.classList.add('active');
                    }
                }
            });
        }
    }

    renderCalendar() {
        if (!this.daysGrid || !this.currentMonthEl) {
            console.error('Required elements for rendering calendar not found');
            return;
        }
        
        // Clear days grid
        this.daysGrid.innerHTML = '';
        
        // Set current month and year
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.currentMonthEl.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        
        // Get first day of month
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Get number of days in month
        const daysInMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
        
        // Get today's date for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Add empty cells for days before first day of month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            this.daysGrid.appendChild(emptyDay);
        }
        
        // Add month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = i;
            
            // Create date for this day
            const date = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
            dayElement.dataset.date = date.toISOString();
            
            // Only disable past dates (not including today)
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;
            
            if (isPast && !isToday) {
                dayElement.classList.add('disabled');
            }
            
            this.daysGrid.appendChild(dayElement);
        }
        
        // Highlight selected date if exists
        if (this.selectedDate) {
            this.highlightSelectedDate();
        }
    }

    highlightSelectedDate() {
        if (!this.selectedDate || !this.daysGrid) return;
        
        // Find all days in grid
        const dayElements = this.daysGrid.querySelectorAll('.day:not(.empty)');
        
        // Remove selection from all days
        dayElements.forEach(day => {
            day.classList.remove('selected');
        });
        
        // Find and highlight selected date
        dayElements.forEach(day => {
            const dateStr = day.dataset.date;
            if (dateStr) {
                const date = new Date(dateStr);
                if (this.isSameDay(date, this.selectedDate)) {
                    day.classList.add('selected');
                }
            }
        });
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    selectDate(date, element) {
        // Remove selection from all days
        const dayElements = this.daysGrid.querySelectorAll('.day');
        dayElements.forEach(day => {
            day.classList.remove('selected');
        });
        
        // Highlight selected day
        element.classList.add('selected');
        
        // Save selected date
        this.selectedDate = date;
        
        // Show time slots
        if (this.timeSlots) {
            this.timeSlots.style.display = 'block';
        }
        
        // Hide confirm button until time is selected
        if (this.confirmButton) {
            this.confirmButton.style.display = 'none';
        }
        
        // Reset selected time
        this.selectedTime = null;
        
        // Remove selection from all time slots
        if (this.slotsGrid) {
            const timeSlotElements = this.slotsGrid.querySelectorAll('.time-slot');
            timeSlotElements.forEach(slot => {
                slot.classList.remove('selected');
            });
        }
    }

    selectTime(time, element) {
        if (!this.slotsGrid || !this.confirmButton) return;
        
        // Remove selection from all time slots
        const timeSlotElements = this.slotsGrid.querySelectorAll('.time-slot');
        timeSlotElements.forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Highlight selected time slot
        element.classList.add('selected');
        
        // Save selected time
        this.selectedTime = time;
        
        // Show confirm button
        this.confirmButton.style.display = 'block';
    }
}

// Создаем экземпляр календаря после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});

export { Calendar }; 