/**
 * Authentication Module for Nebula Chat
 * Handles user authentication and authorization
 */

class AuthManager {
    constructor() {
     /**
     * Show the main application
     */
    showApp() {
        if (this.authModal) {
            this.authModal.classList.add('hidden');
            document.getElementById('app')?.classList.remove('hidden');
            
            console.log('🔐 Authentication successful, showing app...');
            
            // Trigger app initialization
            document.dispatchEvent(new Event('app-ready'));
        }
    }isAuthenticated = false;
        this.authModal = null;
        this.authForm = null;
        this.passwordInput = null;
        this.errorElement = null;
        
        this.init();
    }

    /**
     * Initialize authentication manager
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.checkAuthStatus();
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.authModal = document.getElementById('auth-modal');
        this.authForm = document.getElementById('auth-form');
        this.passwordInput = document.getElementById('password');
        this.errorElement = document.getElementById('auth-error');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        if (this.authForm) {
            this.authForm.addEventListener('submit', this.handleAuth.bind(this));
        }

        if (this.passwordInput) {
            this.passwordInput.addEventListener('input', this.clearError.bind(this));
            this.passwordInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        }

        // Listen for logout events
        document.addEventListener('logout', this.handleLogout.bind(this));
    }

    /**
     * Handle key down events in password input
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.authForm.dispatchEvent(new Event('submit'));
        }
    }

    /**
     * Check authentication status on load
     */
    checkAuthStatus() {
        if (API.isAuthenticated()) {
            this.showApp();
        } else {
            this.showAuthModal();
        }
    }

    /**
     * Handle authentication form submission
     * @param {Event} event - Form submit event
     */
    async handleAuth(event) {
        event.preventDefault();
        
        const password = this.passwordInput.value.trim();
        
        if (!password) {
            this.showError('Please enter a password');
            return;
        }

        this.setLoading(true);
        this.clearError();

        try {
            const response = await API.authenticate(password);
            
            if (response.success) {
                this.isAuthenticated = true;
                this.setSuccess();
                
                // Small delay for success animation
                setTimeout(() => {
                    this.showApp();
                    UI.showToast('Welcome to Nebula Chat!', 'success');
                }, 500);
            } else {
                this.showError(response.error || 'Invalid password');
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            this.showError(error.message || 'Authentication failed. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        try {
            await API.logout();
        } catch (error) {
            console.warn('Logout request failed:', error);
        }
        
        this.isAuthenticated = false;
        this.passwordInput.value = '';
        this.clearError();
        this.showAuthModal();
        
        UI.showToast('You have been logged out', 'info');
    }

    /**
     * Show authentication modal
     */
    showAuthModal() {
        if (this.authModal) {
            this.authModal.classList.remove('hidden');
            document.getElementById('app')?.classList.add('hidden');
            
            // Focus password input after animation
            setTimeout(() => {
                this.passwordInput?.focus();
            }, 300);
        }
    }

    /**
     * Show main application
     */
    showApp() {
        if (this.authModal) {
            this.authModal.classList.add('hidden');
            document.getElementById('app')?.classList.remove('hidden');
            
            console.log('🔐 Authentication successful, showing app...');
            
            // Trigger app initialization
            document.dispatchEvent(new Event('app-ready'));
        }
    }

    /**
     * Set loading state
     * @param {boolean} loading - Loading state
     */
    setLoading(loading) {
        if (!this.authForm) return;
        
        if (loading) {
            this.authForm.classList.add('loading');
            this.passwordInput.disabled = true;
        } else {
            this.authForm.classList.remove('loading');
            this.passwordInput.disabled = false;
        }
    }

    /**
     * Set success state
     */
    setSuccess() {
        if (this.authForm) {
            this.authForm.classList.add('success');
            
            setTimeout(() => {
                this.authForm.classList.remove('success');
            }, 1000);
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.classList.add('show');
            
            // Shake animation
            this.passwordInput?.focus();
        }
    }

    /**
     * Clear error message
     */
    clearError() {
        if (this.errorElement) {
            this.errorElement.classList.remove('show');
            this.errorElement.textContent = '';
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isUserAuthenticated() {
        return this.isAuthenticated && API.isAuthenticated();
    }

    /**
     * Force logout
     */
    forceLogout() {
        document.dispatchEvent(new Event('logout'));
    }
}

/**
 * Auth Guard Mixin
 * Ensures authentication before allowing access to features
 */
const AuthGuard = {
    /**
     * Require authentication for a function
     * @param {Function} fn - Function to guard
     * @returns {Function} Guarded function
     */
    requireAuth(fn) {
        return function(...args) {
            if (!window.Auth?.isUserAuthenticated()) {
                UI.showToast('Please log in to continue', 'warning');
                window.Auth?.showAuthModal();
                return Promise.reject(new Error('Authentication required'));
            }
            return fn.apply(this, args);
        };
    },

    /**
     * Check authentication and redirect if needed
     * @returns {boolean} Authentication status
     */
    checkAuth() {
        if (!window.Auth?.isUserAuthenticated()) {
            window.Auth?.showAuthModal();
            return false;
        }
        return true;
    }
};

// Initialize authentication manager
document.addEventListener('DOMContentLoaded', () => {
    window.Auth = new AuthManager();
});

// Export for use in other modules
window.AuthGuard = AuthGuard;