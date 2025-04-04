// Base JavaScript functionality will be added here
console.log('Script loaded'); // Debug log

// Remove imports and use global objects
const { translations } = window;

// Add error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// Declare all variables at the top
let jobValueInput, missedCallsInput, calculateButton, weeklyLossElement, monthlyLossElement;
let phoneInput;

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
    const demoModal = document.getElementById('demoModal');
    const leadCaptureModal = document.getElementById('leadCaptureModal');
    const successModal = document.getElementById('successModal');
    
    console.log('Modals found:', { 
        demoModal: !!demoModal,
        leadCaptureModal: !!leadCaptureModal,
        successModal: !!successModal
    }); // Debug log
    
    // Initially hide modals
    if (demoModal) demoModal.style.display = 'none';
    if (leadCaptureModal) leadCaptureModal.style.display = 'none';
    if (successModal) successModal.style.display = 'none';
    
    // Get buttons that open the modals
    const demoButtons = document.querySelectorAll('.secondary-button');
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    console.log('Buttons found:', { 
        demoButtons: demoButtons.length,
        ctaButtons: ctaButtons.length
    }); // Debug log
    
    // Add click handlers for demo buttons
    demoButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Demo button clicked');
            if (demoModal) {
                document.getElementById('demoStep1').style.display = 'block';
                document.getElementById('demoStep2').style.display = 'none';
                demoModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Add click handlers for CTA buttons
    ctaButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('CTA button clicked');
            if (leadCaptureModal) {
                leadCaptureModal.style.display = 'flex';
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
                if (modal.id === 'demoModal') {
                    document.getElementById('demoStep1').style.display = 'block';
                    document.getElementById('demoStep2').style.display = 'none';
                }
            }
        });
    });
    
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

    // Initialize phone input with US formatting
    phoneInput = window.intlTelInput(document.querySelector("#phone"), {
        preferredCountries: ['us'],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
    });

    // Handle lead capture form submission
    const leadCaptureForm = document.getElementById('leadCaptureForm');
    if (leadCaptureForm) {
        let submitButtonText = '';
        
        leadCaptureForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate phone number
            if (!phoneInput.isValidNumber()) {
                alert('Please enter a valid phone number');
                return;
            }

            // Get form data
            const formData = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: phoneInput.getNumber(),
                trade: document.getElementById('trade').value,
                companyName: document.getElementById('companyName').value,
                jobsPerWeek: document.getElementById('jobsPerWeek').value,
                language: currentLanguage,
                formId: 'lead-capture'
            };

            try {
                // Show loading state
                const submitButton = leadCaptureForm.querySelector('button[type="submit"]');
                submitButtonText = submitButton.textContent;
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;

                // Send form data to Firebase
                const success = await window.submitFormData(formData);
                
                if (success) {
                    // Hide lead capture modal and show success modal
                    leadCaptureModal.style.display = 'none';
                    successModal.style.display = 'flex';
                } else {
                    throw new Error('Failed to submit form');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Sorry, there was an error submitting your form. Please try again.');
            } finally {
                // Reset button state
                const submitButton = leadCaptureForm.querySelector('button[type="submit"]');
                submitButton.textContent = submitButtonText;
                submitButton.disabled = false;
            }
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});