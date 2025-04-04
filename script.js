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
    
    // Update loss values with animation
    if (weeklyLossElement && monthlyLossElement) {
        weeklyLossElement.textContent = `$${weeklyLoss.toLocaleString()}`;
        monthlyLossElement.textContent = `$${monthlyLoss.toLocaleString()}`;
        
        // Add visible class to trigger animation
        weeklyLossElement.classList.add('visible');
        monthlyLossElement.classList.add('visible');
    } else {
        console.error('Loss elements not found!');
    }
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
            } else if (element.tagName === 'path') {
                // Skip SVG path elements
                return;
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
    
    // Initialize modals
    const ctaModal = document.getElementById('ctaModal');
    const demoModal = document.getElementById('demoModal');
    
    console.log('Modals found:', { ctaModal: !!ctaModal, demoModal: !!demoModal }); // Debug log
    
    // Initially hide modals
    if (ctaModal) ctaModal.style.display = 'none';
    if (demoModal) demoModal.style.display = 'none';
    
    // Get buttons that open the modals
    const ctaButtons = document.querySelectorAll('.cta-button');
    const secondaryButtons = document.querySelectorAll('.secondary-button');
    
    console.log('Buttons found:', { 
        ctaButtons: ctaButtons.length, 
        secondaryButtons: secondaryButtons.length 
    }); // Debug log
    
    // Add click handlers for CTA buttons (signup modal)
    ctaButtons.forEach(button => {
        console.log('Adding click handler to CTA button:', button); // Debug log
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('CTA button clicked');
            if (ctaModal) {
                console.log('Showing CTA modal');
                // Show first step, hide second step
                document.getElementById('ctaStep1').style.display = 'block';
                document.getElementById('ctaStep2').style.display = 'none';
                ctaModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            } else {
                console.error('CTA modal not found!');
            }
        });
    });
    
    // Add click handlers for secondary buttons (demo modal)
    secondaryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Secondary button clicked');
            if (demoModal) {
                // Show first step, hide second step
                document.getElementById('demoStep1').style.display = 'block';
                document.getElementById('demoStep2').style.display = 'none';
                demoModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close button handlers
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            console.log('Close button clicked');
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
                // Reset steps to initial state
                if (modal.id === 'ctaModal') {
                    document.getElementById('ctaStep1').style.display = 'block';
                    document.getElementById('ctaStep2').style.display = 'none';
                } else if (modal.id === 'demoModal') {
                    document.getElementById('demoStep1').style.display = 'block';
                    document.getElementById('demoStep2').style.display = 'none';
                }
            }
        });
    });
    
    // Handle CTA form submission
    const ctaForm = document.getElementById('ctaForm');
    if (ctaForm) {
        ctaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('CTA form submitted');
            
            // Get form data
            const formData = {
                name: ctaForm.querySelector('input[name="name"]').value,
                email: ctaForm.querySelector('input[name="email"]').value,
                phone: ctaForm.querySelector('input[name="phone"]').value
            };
            
            // Validate form data
            if (formData.name && formData.email && formData.phone) {
                // Hide step 1, show step 2 (calendar)
                document.getElementById('ctaStep1').style.display = 'none';
                document.getElementById('ctaStep2').style.display = 'block';
                
                // Initialize calendar if not already initialized
                if (!calendarApiInitialized) {
                    const calendar = new Calendar();
                    calendarApiInitialized = true;
                }
            }
        });
    }
    
    // Handle demo form submission
    const demoForm = document.getElementById('demoForm');
    if (demoForm) {
        demoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Demo form submitted');
            
            // Get form data
            const formData = {
                name: demoForm.querySelector('input[name="name"]').value,
                email: demoForm.querySelector('input[name="email"]').value,
                phone: demoForm.querySelector('input[name="phone"]').value,
                company: demoForm.querySelector('input[name="company"]').value
            };
            
            // Validate form data
            if (formData.name && formData.email && formData.phone && formData.company) {
                // Hide step 1, show step 2 (phone number)
                document.getElementById('demoStep1').style.display = 'none';
                document.getElementById('demoStep2').style.display = 'block';
            }
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = '';
            // Reset steps
            if (e.target.id === 'ctaModal') {
                document.getElementById('ctaStep1').style.display = 'block';
                document.getElementById('ctaStep2').style.display = 'none';
            } else if (e.target.id === 'demoModal') {
                document.getElementById('demoStep1').style.display = 'block';
                document.getElementById('demoStep2').style.display = 'none';
            }
        }
    });
    
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