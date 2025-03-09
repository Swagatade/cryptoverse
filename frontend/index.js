/**
 * Main JavaScript file for index.html
 * Handles navigation and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Application initialized');
    
    // Store a flag in localStorage to indicate the index page was visited
    localStorage.setItem("visitedIndex", "true");

    // Handle "Get Started" button navigation
    const getStartedButton = document.querySelector('.hero-buttons .btn-primary');
    if (getStartedButton) {
        getStartedButton.addEventListener('click', function() {
            console.log('Navigating to AI interface');
            window.location.href = 'ai-interface.html';
        });
    }
    
    // Handle "Learn More" scroll
    const learnMoreButton = document.querySelector('.hero-buttons .btn-secondary');
    if (learnMoreButton) {
        learnMoreButton.addEventListener('click', function() {
            const whyUsSection = document.querySelector('.why-us');
            if (whyUsSection) {
                whyUsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Initialize 3D card effects
    initializeCardEffects();
    
    // Initialize wallet functionality
    initWallet();
    
    // Check if we should redirect to AI page from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('redirect') === 'ai') {
        window.location.href = 'ai-interface.html';
    }
});

// Initialize 3D effects for cards
function initializeCardEffects() {
    document.querySelectorAll('.card-3d').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
        });
    });
}

// Function to redirect to the faucet
function redirectToFaucet() {
    window.location.href = "https://www.hackquest.io/faucets/656476";
}
