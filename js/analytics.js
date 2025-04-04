// Google Analytics Configuration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Initialize Google Analytics
gtag('js', new Date());
gtag('config', 'G-XXXXXXXXXX'); // Replace with your actual tracking ID

// Track page views
function trackPageView(page) {
    gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: window.location.pathname
    });
}

// Track user actions
function trackUserAction(action, category, label) {
    gtag('event', action, {
        event_category: category,
        event_label: label
    });
}

// Track form submissions
function trackFormSubmission(formId) {
    gtag('event', 'form_submit', {
        event_category: 'Forms',
        event_label: formId
    });
}

// Track button clicks
function trackButtonClick(buttonId) {
    gtag('event', 'button_click', {
        event_category: 'Buttons',
        event_label: buttonId
    });
}

// Track login attempts
function trackLoginAttempt(success) {
    gtag('event', 'login_attempt', {
        event_category: 'Authentication',
        event_label: success ? 'success' : 'failure'
    });
}

// Track job bookings
function trackJobBooking(jobType, duration) {
    gtag('event', 'job_booked', {
        event_category: 'Bookings',
        event_label: jobType,
        value: duration
    });
}

// Export functions
window.analytics = {
    trackPageView,
    trackUserAction,
    trackFormSubmission,
    trackButtonClick,
    trackLoginAttempt,
    trackJobBooking
}; 