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
    const ctaModal = document.getElementById('ctaModal');
    const demoModal = document.getElementById('demoModal');
    
    console.log('Modals initialized:', {
        ctaModal: !!ctaModal,
        demoModal: !!demoModal
    });
    
    // Initially hide modals
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
    
    // Close button handlers
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
    
    // Handle form submissions
    const ctaForm = document.getElementById('ctaForm');
    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('CTA form submitted');
            if (ctaModal) {
                ctaModal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    }
    
    // Handle "Watch Demo" link in CTA modal
    const watchDemoLink = document.querySelector('.modal-watch-demo');
    if (watchDemoLink) {
        watchDemoLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (ctaModal) {
                ctaModal.style.display = 'none';
                document.body.style.overflow = '';
            }
            // Scroll to hero section
            const heroSection = document.querySelector('.hero');
            if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Handle demo modal steps
    const demoStep1 = document.getElementById('demoStep1');
    const demoStep2 = document.getElementById('demoStep2');
    const demoStep3 = document.getElementById('demoStep3');
    const demoNextButton = document.querySelector('.modal-next-button');
    const demoForm = document.getElementById('demoForm');
    
    if (demoNextButton) {
        demoNextButton.addEventListener('click', () => {
            if (demoStep1 && demoStep2) {
                demoStep1.style.display = 'none';
                demoStep2.style.display = 'block';
            }
        });
    }
    
    if (demoForm) {
        demoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = demoForm.querySelector('input[name="name"]').value;
            const email = demoForm.querySelector('input[name="email"]').value;
            const phone = demoForm.querySelector('input[name="phone"]').value;
            const company = demoForm.querySelector('input[name="company"]').value;
            
            if (name && email && phone && company) {
                if (demoStep2 && demoStep3) {
                    demoStep2.style.display = 'none';
                    demoStep3.style.display = 'block';
                }
            }
        });
    }

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