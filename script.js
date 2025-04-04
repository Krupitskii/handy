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

    // Initialize modals
    const signupModal = document.getElementById('signupModal');
    const demoModal = document.getElementById('demoModal');
    
    console.log('Modals initialized:', {
        signupModal: !!signupModal,
        demoModal: !!demoModal
    });
    
    // Initially hide modals
    if (signupModal) signupModal.style.display = 'none';
    if (demoModal) demoModal.style.display = 'none';
    
    // Get buttons that open the modals
    const ctaButtons = document.querySelectorAll('.cta-button:not([type="submit"])');
    const secondaryButtons = document.querySelectorAll('.secondary-button');
    
    console.log('Modal buttons found:', {
        ctaButtons: ctaButtons.length,
        secondaryButtons: secondaryButtons.length
    });
    
    // Add click handlers for CTA buttons (signup modal)
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('CTA button clicked');
            if (signupModal) {
                signupModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Add click handlers for secondary buttons (demo modal)
    secondaryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Secondary button clicked');
            if (demoModal) {
                demoModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Add close handlers for signup modal
    if (signupModal) {
        const closeBtn = signupModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Signup modal close button clicked');
                signupModal.style.display = 'none';
                document.body.style.overflow = '';
            });
        }
        
        // Close on click outside
        signupModal.addEventListener('click', (e) => {
            if (e.target === signupModal) {
                console.log('Signup modal outside click');
                signupModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
    
    // Add close handlers for demo modal
    if (demoModal) {
        const closeBtn = demoModal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                console.log('Demo modal close button clicked');
                demoModal.style.display = 'none';
                document.body.style.overflow = '';
            });
        }
        
        // Close on click outside
        demoModal.addEventListener('click', (e) => {
            if (e.target === demoModal) {
                console.log('Demo modal outside click');
                demoModal.style.display = 'none';
                document.body.style.overflow = '';
            }
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
    
    // Form submission handlers
    const registrationForm = document.getElementById('registrationForm');
    const demoForm = document.getElementById('demoForm');
    const nextButton = document.querySelector('.next-button');
    const demoSubmitButton = document.querySelector('#demoForm button[type="submit"]');

    console.log('Form elements:', {
        registrationForm: !!registrationForm,
        demoForm: !!demoForm,
        nextButton: !!nextButton,
        demoSubmitButton: !!demoSubmitButton
    });

    if (nextButton) {
        nextButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Next button clicked');
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const bookingSystem = document.getElementById('bookingSystem').value;

            if (!fullName || !email || !phone || !bookingSystem) {
                alert('Please fill in all required fields');
                return;
            }

            // Move to next step
            const step1 = document.querySelector('.step-content[data-step="1"]');
            const step2 = document.querySelector('.step-content[data-step="2"]');
            const stepIndicator1 = document.querySelector('.step-indicator[data-step="1"]');
            const stepIndicator2 = document.querySelector('.step-indicator[data-step="2"]');

            if (step1 && step2 && stepIndicator1 && stepIndicator2) {
                step1.classList.remove('active');
                step2.classList.add('active');
                stepIndicator1.classList.remove('active');
                stepIndicator2.classList.add('active');
            }
        });
    }

    if (demoSubmitButton) {
        demoSubmitButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Demo form submit clicked');
            const firstName = document.getElementById('firstName').value;
            const phone = document.getElementById('phone').value;
            const tradeType = document.getElementById('tradeType').value;

            if (!firstName || !phone || !tradeType) {
                alert('Please fill in all required fields');
                return;
            }

            // Close demo modal
            if (demoModal) {
                demoModal.style.display = 'none';
            }
        });
    }
});