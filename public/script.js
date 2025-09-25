// NASA Hackathon Website - JavaScript Functionality

class NASAHackathonApp {
    constructor() {
        this.currentTab = 'home';
        this.isLoggedIn = false;
        this.init();
    }

    init() {
        this.checkLoginStatus();
        this.setupEventListeners();
        this.initializeTabSwitching();
        this.initializeDemoFeatures();
        this.initializeContactForm();
        this.initializeLoginForm();
        this.startCosmicAnimations();
    }

    // Authentication System
    checkLoginStatus() {
        const loggedIn = localStorage.getItem('nasaHackathonLoggedIn');
        if (loggedIn === 'true') {
            this.isLoggedIn = true;
            this.showMainContent();
        } else {
            this.showLoginPrompt();
        }
    }

    showLoginPrompt() {
        const loginCheck = document.getElementById('loginCheck');
        if (loginCheck) {
            loginCheck.style.display = 'flex';
        }
    }

    showMainContent() {
        const loginCheck = document.getElementById('loginCheck');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginCheck) {
            loginCheck.style.display = 'none';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
        }
    }

    login(username, password) {
        // Demo authentication - in real app, this would be server-side
        const demoCredentials = {
            username: 'nasa',
            password: 'nasa'
        };

        const normalizedUsername = (username || '').trim();
        const normalizedPassword = (password || '').trim();

        if (normalizedUsername === demoCredentials.username && normalizedPassword === demoCredentials.password) {
            this.isLoggedIn = true;
            localStorage.setItem('nasaHackathonLoggedIn', 'true');

            // Show success notification and redirect after a short delay
            this.showNotification('Welcome to NASA Hackathon Platform!', 'success');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

            return true;
        } else {
            this.showNotification('Invalid credentials. Use: nasa / nasa', 'error');
            return false;
        }
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('nasaHackathonLoggedIn');
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        this.showLoginPrompt();
        this.showNotification('Logged out successfully', 'success');
    }

    // Tab Switching System
    initializeTabSwitching() {
        const navLinks = document.querySelectorAll('.nav-link');
        const tabContents = document.querySelectorAll('.tab-content');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href') || '';
                // Only intercept in-page hash links like #home, #features, etc.
                if (!href.startsWith('#')) {
                    return; // allow normal navigation for page links
                }

                e.preventDefault();
                const targetTab = href.substring(1);

                this.switchTab(targetTab);
            });
        });
    }

    switchTab(targetTab) {
        console.log(`Switching to tab: ${targetTab}`);

        // Hide all tabs
        const tabContents = document.querySelectorAll('.tab-content');
        const navLinks = document.querySelectorAll('.nav-link');

        tabContents.forEach(content => {
            content.classList.remove('active');
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Show target tab
        const targetContent = document.getElementById(targetTab);
        const targetLink = document.querySelector(`[href="#${targetTab}"]`);

        console.log(`Target content found:`, targetContent);
        console.log(`Target link found:`, targetLink);

        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.style.display = 'block';
            this.currentTab = targetTab;
            console.log(`Tab ${targetTab} activated successfully`);
        } else {
            console.error(`Tab content not found for: ${targetTab}`);
        }

        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Update URL without page reload
        history.pushState(null, null, `#${targetTab}`);
    }

    // Mobile Navigation
    setupEventListeners() {
        // Mobile menu toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            const hash = window.location.hash.substring(1);
            if (hash) {
                this.switchTab(hash);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    }

    // Login Form Handler
    initializeLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                this.login(username, password);
            });
        }
    }

    // Demo Features
    initializeDemoFeatures() {
        const refreshBtn = document.getElementById('refreshData');
        const satelliteSelect = document.getElementById('satelliteSelect');
        const dataTypeSelect = document.getElementById('dataTypeSelect');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDemoData();
            });
        }

        // Auto-refresh demo data every 30 seconds
        setInterval(() => {
            this.updateDemoData();
        }, 30000);
    }

    refreshDemoData() {
        const dataInfo = document.getElementById('dataInfo');
        if (dataInfo) {
            dataInfo.innerHTML = `
                <p><strong>Satellite:</strong> ${document.getElementById('satelliteSelect').value.toUpperCase()}</p>
                <p><strong>Last Update:</strong> <span id="lastUpdate">${new Date().toLocaleTimeString()}</span></p>
                <p><strong>Coverage:</strong> Global</p>
                <p><strong>Data Points:</strong> ${(Math.random() * 1000000 + 1000000).toLocaleString()} processed</p>
            `;
        }

        this.showNotification('Demo data refreshed!', 'success');
        this.animateMapRefresh();
    }

    updateDemoData() {
        const lastUpdate = document.getElementById('lastUpdate');
        if (lastUpdate) {
            lastUpdate.textContent = new Date().toLocaleTimeString();
        }
    }

    animateMapRefresh() {
        const mapPlaceholder = document.querySelector('.map-placeholder');
        if (mapPlaceholder) {
            mapPlaceholder.style.transform = 'scale(0.95)';
            setTimeout(() => {
                mapPlaceholder.style.transform = 'scale(1)';
            }, 200);
        }
    }

    // Contact Form
    initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();

                const formData = new FormData(contactForm);
                const name = formData.get('name');
                const email = formData.get('email');
                const subject = formData.get('subject');
                const message = formData.get('message');

                // Simulate form submission
                this.submitContactForm({ name, email, subject, message });
            });
        }
    }

    submitContactForm(data) {
        // Simulate API call
        console.log('Contact form submission:', data);

        this.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');

        // Reset form
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.reset();
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        document.body.appendChild(notification);

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff4444' : '#00d4ff'};
            color: #0a0a0f;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;

        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #0a0a0f;
            font-weight: bold;
        `;

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close functionality
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto close after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Cosmic Animations
    startCosmicAnimations() {
        this.createFloatingStars();
        this.animateBackgroundElements();
    }

    createFloatingStars() {
        const starsContainer = document.querySelector('.login-bg') || document.body;

        for (let i = 0; i < 50; i++) {
            const star = document.createElement('div');
            star.className = 'cosmic-star';
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: white;
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.8 + 0.2};
                animation: twinkle ${Math.random() * 3 + 2}s infinite;
                pointer-events: none;
            `;

            starsContainer.appendChild(star);
        }
    }

    animateBackgroundElements() {
        // Add subtle parallax effect to background elements
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            const spaceBg = document.querySelector('.space-bg');
            if (spaceBg) {
                spaceBg.style.transform = `translateY(${rate}px)`;
            }
        });
    }

    // Utility Functions
    togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.querySelector('.password-toggle i');

        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            toggleBtn.className = 'fas fa-eye';
        }
    }

    // NASA Dataset Integration Placeholder
    async loadNASADataset(datasetType) {
        // Placeholder for future NASA dataset integration
        console.log(`Loading NASA dataset: ${datasetType}`);

        try {
            // This would be replaced with actual NASA API calls
            const mockData = {
                satellite: datasetType,
                timestamp: new Date().toISOString(),
                dataPoints: Math.floor(Math.random() * 1000000),
                coverage: 'Global'
            };

            return mockData;
        } catch (error) {
            console.error('Error loading NASA dataset:', error);
            this.showNotification('Error loading dataset. Please try again.', 'error');
            return null;
        }
    }

    // Public API for external integrations
    getCurrentTab() {
        return this.currentTab;
    }

    isUserLoggedIn() {
        return this.isLoggedIn;
    }

    // Debug function to test tab switching
    debugTabSwitch(tabName) {
        console.log(`Debug: Attempting to switch to ${tabName}`);
        const targetContent = document.getElementById(tabName);
        const targetLink = document.querySelector(`[href="#${tabName}"]`);

        console.log(`Debug: Content element:`, targetContent);
        console.log(`Debug: Link element:`, targetLink);

        if (targetContent) {
            console.log(`Debug: Content display style:`, targetContent.style.display);
            console.log(`Debug: Content classList:`, targetContent.classList.toString());
        }

        this.switchTab(tabName);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.nasaApp = new NASAHackathonApp();
});

// Global function for password toggle (called from HTML)
function togglePassword() {
    if (window.nasaApp) {
        window.nasaApp.togglePassword();
    }
}

// Add CSS animations for notifications and effects
const style = document.createElement('style');
style.textContent = `
    @keyframes twinkle {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
    }

    .cosmic-star {
        animation: twinkle 3s infinite;
    }

    .notification {
        font-family: 'Space Grotesk', sans-serif;
        font-weight: 500;
    }

    .notification-content {
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;
document.head.appendChild(style);

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NASAHackathonApp;
}