// Base JavaScript functionality will be added here
console.log('Script loaded'); // Debug log

// Import translations, Calendar and Firebase functions
import { translations } from './translations.js';
import { Calendar } from './calendar.js';
import { submitFormData } from './firebase-config.js';

// Add error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// Declare all variables at the top
let jobValueInput, missedCallsInput, calculateButton, weeklyLossElement, monthlyLossElement;
let calendarApiInitialized = false;

// Language switching functionality
let currentLanguage = 'en';

// Function to calculate and display losses
function calculateLosses() {
    console.log('Calculating losses...'); // Debug log
    
    if (!jobValueInput || !missedCallsInput) {
        console.error('Calculator inputs not found!');
        return;
    }
    
    const jobValue = parseFloat(jobValueInput.value) || 200;
    const missedCalls = parseFloat(missedCallsInput.value) || 5;
    
    console.log('Values:', { jobValue, missedCalls }); // Debug log
    
    const weeklyLoss = jobValue * missedCalls;
    const monthlyLoss = weeklyLoss * 4;
    
    // Show result box with animation
    const resultBox = document.querySelector('.result-box');
    if (resultBox) {
        console.log('Found result box, adding visible class');
        resultBox.classList.add('visible');
    } else {
        console.error('Result box not found!');
    }
    
    // Animate the values
    if (weeklyLossElement) {
        console.log('Updating weekly loss element');
        weeklyLossElement.classList.remove('visible');
        // Trigger reflow
        void weeklyLossElement.offsetWidth;
        weeklyLossElement.textContent = `${formatCurrency(weeklyLoss)} lost`;
        // Add animation class with a slight delay
        setTimeout(() => {
            weeklyLossElement.classList.add('visible');
        }, 100);
    } else {
        console.error('Weekly loss element not found!');
    }
    
    if (monthlyLossElement) {
        console.log('Updating monthly loss element');
        monthlyLossElement.classList.remove('visible');
        // Trigger reflow
        void monthlyLossElement.offsetWidth;
        monthlyLossElement.textContent = `${formatCurrency(monthlyLoss)} per month`;
        // Add animation class with a slight delay
        setTimeout(() => {
            monthlyLossElement.classList.add('visible');
        }, 300);
    } else {
        console.error('Monthly loss element not found!');
    }
    
    console.log('Results:', { weeklyLoss, monthlyLoss }); // Debug log
}

// Function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function updateLanguage(lang) {
    currentLanguage = lang;
    
    // Update active state of language buttons
    document.querySelectorAll('.language-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Update all translatable elements
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.dataset.translate;
        const keys = key.split('.');
        
        // Get the translation value by traversing the nested structure
        let translation = translations[lang];
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                translation = null;
                break;
            }
        }
        
        if (translation) {
            if (element.tagName === 'INPUT') {
                element.placeholder = translation;
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else if (element.tagName === 'SELECT') {
                // For SELECT elements, we only update the placeholder
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        }
    });

    // Handle elements with data-translate-title and data-translate-subtitle
    document.querySelectorAll('[data-translate-title], [data-translate-subtitle]').forEach(element => {
        if (element.hasAttribute('data-translate-title')) {
            const titleKey = element.dataset.translateTitle;
            const titleKeys = titleKey.split('.');
            let titleTranslation = translations[lang];
            for (const k of titleKeys) {
                if (titleTranslation && titleTranslation[k]) {
                    titleTranslation = titleTranslation[k];
                } else {
                    titleTranslation = null;
                    break;
                }
            }
            if (titleTranslation) {
                element.style.setProperty('--title-content', `"${titleTranslation}"`);
            }
        }
        
        if (element.hasAttribute('data-translate-subtitle')) {
            const subtitleKey = element.dataset.translateSubtitle;
            const subtitleKeys = subtitleKey.split('.');
            let subtitleTranslation = translations[lang];
            for (const k of subtitleKeys) {
                if (subtitleTranslation && subtitleTranslation[k]) {
                    subtitleTranslation = subtitleTranslation[k];
                } else {
                    subtitleTranslation = null;
                    break;
                }
            }
            if (subtitleTranslation) {
                element.style.setProperty('--subtitle-content', `"${subtitleTranslation}"`);
            }
        }
    });
    
    // Update form validation messages
    const form = document.querySelector('.signup-form');
    if (form) {
        form.querySelectorAll('[required]').forEach(field => {
            field.setAttribute('title', translations[lang].modal.required);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...'); // Debug log
    
    // Initialize calculator elements
    jobValueInput = document.getElementById('jobValue');
    missedCallsInput = document.getElementById('missedCalls');
    calculateButton = document.querySelector('.calculate-button');
    weeklyLossElement = document.getElementById('weeklyLoss');
    monthlyLossElement = document.getElementById('monthlyLoss');

    console.log('Calculator elements initialized:', {
        jobValueInput: !!jobValueInput,
        missedCallsInput: !!missedCallsInput,
        calculateButton: !!calculateButton,
        weeklyLossElement: !!weeklyLossElement,
        monthlyLossElement: !!monthlyLossElement
    });

    // Calculator functionality
    if (calculateButton) {
        calculateButton.addEventListener('click', function(e) {
            e.preventDefault();
            calculateLosses();
        });
    }
    
    // Calculate on Enter key
    if (jobValueInput && missedCallsInput) {
        [jobValueInput, missedCallsInput].forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    calculateLosses();
                }
            });
        });
    }

    // Initialize modals
    const signupModal = document.getElementById('signupModal');
    const ctaModal = document.getElementById('ctaModal');
    const demoModal = document.getElementById('demoModal');
    
    console.log('Modals initialized:', {
        signupModal: !!signupModal,
        ctaModal: !!ctaModal,
        demoModal: !!demoModal
    });
    
    // Initially hide modals
    if (signupModal) signupModal.style.display = 'none';
    if (ctaModal) ctaModal.style.display = 'none';
    if (demoModal) demoModal.style.display = 'none';
    
    // Get buttons that open the modals
    const ctaButtons = document.querySelectorAll('.cta-button:not([type="submit"]):not(.dashboard-button)');
    const secondaryButtons = document.querySelectorAll('.secondary-button');
    
    console.log('Modal buttons found:', {
        ctaButtons: ctaButtons.length,
        secondaryButtons: secondaryButtons.length
    });
    
    // Add click handlers for CTA buttons (signup modal)
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Only handle non-modal CTA buttons
            if (!button.closest('.modal-content')) {
                console.log('CTA button clicked');
                if (ctaModal) {
                    ctaModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });
    
    // Add click handlers for secondary buttons (demo modal)
    secondaryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            // Only handle non-modal secondary buttons
            if (!button.closest('.modal-content')) {
                console.log('Secondary button clicked');
                if (demoModal) {
                    demoModal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });

    // CTA Modal handlers
    const ctaForm = document.getElementById('ctaForm');
    const watchDemoLink = document.querySelector('.modal-watch-demo');
    const closeButtons = document.querySelectorAll('.close');

    // Close button handlers
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // CTA Form Submit
    if (ctaForm) {
        ctaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('CTA Form Submitted');
            ctaModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // Here you would typically send the form data to your server
        });
    }

    // Watch Demo Link Click
    if (watchDemoLink) {
        watchDemoLink.addEventListener('click', function(e) {
            e.preventDefault();
            ctaModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Demo Modal handlers
    const demoForm = document.getElementById('demoForm');
    const demoStep1 = document.getElementById('demoStep1');
    const demoStep2 = document.getElementById('demoStep2');
    const demoNextButton = document.getElementById('demoNextButton');

    // Demo Next Button Click
    if (demoNextButton) {
        demoNextButton.addEventListener('click', function() {
            demoStep1.style.display = 'none';
            demoStep2.style.display = 'block';
        });
    }

    // Demo Form Submit
    if (demoForm) {
        demoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(demoForm);
            const data = Object.fromEntries(formData.entries());
            
            // Validate all required fields
            const requiredFields = ['name', 'email', 'phone', 'company'];
            const missingFields = requiredFields.filter(field => !data[field]);
            
            if (missingFields.length > 0) {
                alert('Please fill in all required fields');
                return;
            }

            console.log('Demo Form Submitted:', data);
            demoModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // Here you would typically send the form data to your server
        });
    }

    // Handle booking system selection
    const bookingSystemSelect = document.getElementById('bookingSystem');
    const otherSystemInput = document.getElementById('otherBookingSystem');
    
    console.log('Booking system elements:', {
        bookingSystemSelect: !!bookingSystemSelect,
        otherSystemInput: !!otherSystemInput
    });
    
    if (bookingSystemSelect && otherSystemInput) {
        bookingSystemSelect.addEventListener('change', () => {
            console.log('Booking system changed:', bookingSystemSelect.value);
            if (bookingSystemSelect.value === 'Other') {
                otherSystemInput.style.display = 'block';
            } else {
                otherSystemInput.style.display = 'none';
            }
        });
    }
    
    // Initialize calendar
    new Calendar();
    
    // Language switcher functionality
    const languageButtons = document.querySelectorAll('.language-btn');
    console.log('Language buttons found:', languageButtons.length);
    
    languageButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lang = button.getAttribute('data-lang');
            console.log('Language button clicked:', lang);
            if (lang) {
                // Remove active class from all buttons
                languageButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                // Update language
                updateLanguage(lang);
            }
        });
    });
});