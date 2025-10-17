/**
 * Authentication Module for Nebula Chat
 * Handles user authentication and authorization
 */

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.authModal = null;
        this.authForm = null;
        this.usernameInput = null;
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
        this.usernameInput = document.getElementById('username');
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

        if (this.usernameInput) {
            this.usernameInput.addEventListener('input', this.clearError.bind(this));
            this.usernameInput.addEventListener('keydown', this.handleKeyDown.bind(this));
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
    async checkAuthStatus() {
        // Wait a bit for API to initialize and load tokens
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (API && API.isAuthenticated()) {
            this.isAuthenticated = true;
            this.showApp();
        } else {
            this.isAuthenticated = false;
            this.showAuthModal();
        }
    }

    /**
     * Handle authentication form submission
     * @param {Event} event - Form submit event
     */
    async handleAuth(event) {
        event.preventDefault();
        
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value.trim();
        
        if (!username) {
            this.showError('Please enter a username');
            this.usernameInput.focus();
            return;
        }

        if (!password) {
            this.showError('Please enter a password');
            this.passwordInput.focus();
            return;
        }

        this.setLoading(true);
        this.clearError();

        try {
            const response = await API.authenticate(username, password);
            
            if (response.success) {
                this.isAuthenticated = true;
                this.currentUser = response.data.user;
                this.setSuccess();
                
                // Small delay for success animation
                setTimeout(() => {
                    this.showApp();
                    UI.showToast(`Welcome back, ${this.currentUser.displayName || this.currentUser.username}!`, 'success');
                }, 500);
            } else {
                this.showError(response.error || 'Invalid credentials');
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
        this.currentUser = null;
        this.usernameInput.value = '';
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
            
            // Focus username input after animation
            setTimeout(() => {
                this.usernameInput?.focus();
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
            
            // Show admin panel button if user is admin
            if (this.currentUser && this.currentUser.role === 'admin') {
                const adminBtn = document.getElementById('admin-panel-btn');
                if (adminBtn) {
                    adminBtn.style.display = 'block';
                    adminBtn.addEventListener('click', this.showAdminPanel.bind(this));
                }
            }
            
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
            this.usernameInput.disabled = true;
            this.passwordInput.disabled = true;
        } else {
            this.authForm.classList.remove('loading');
            this.usernameInput.disabled = false;
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
            this.usernameInput?.focus();
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

    /**
     * Show admin panel
     */
    showAdminPanel() {
        const adminModal = document.getElementById('admin-modal');
        if (adminModal) {
            adminModal.style.display = 'flex';
            this.initializeAdminPanel();
        }
    }

    /**
     * Initialize admin panel
     */
    initializeAdminPanel() {
        // Setup tab switching
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });

                // Load users when switching to manage users tab
                if (tabId === 'manage-users') {
                    this.loadUsers();
                }
            });
        });

        // Setup create user form
        const createUserForm = document.getElementById('create-user-form');
        if (createUserForm) {
            createUserForm.addEventListener('submit', this.handleCreateUser.bind(this));
        }

        // Setup close button
        const closeBtn = document.getElementById('close-admin-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.hideAdminPanel.bind(this));
        }
    }

    /**
     * Hide admin panel
     */
    hideAdminPanel() {
        const adminModal = document.getElementById('admin-modal');
        if (adminModal) {
            adminModal.style.display = 'none';
        }
    }

    /**
     * Handle create user form submission
     */
    async handleCreateUser(event) {
        event.preventDefault();
        
        const username = document.getElementById('new-username').value.trim();
        const password = document.getElementById('new-password').value.trim();
        const displayName = document.getElementById('new-displayname').value.trim();
        const email = document.getElementById('new-email').value.trim();
        const errorElement = document.getElementById('create-user-error');

        if (!username || !password) {
            errorElement.textContent = 'Username and password are required';
            errorElement.classList.add('show');
            return;
        }

        try {
            const response = await API.createUserAccount({
                username,
                password,
                displayName: displayName || username,
                email: email || null
            });

            if (response.success) {
                UI.showToast(`User "${username}" created successfully!`, 'success');
                
                // Clear form
                document.getElementById('create-user-form').reset();
                errorElement.classList.remove('show');
                
                // Refresh users list if visible
                if (document.getElementById('manage-users').classList.contains('active')) {
                    this.loadUsers();
                }
            } else {
                errorElement.textContent = response.error;
                errorElement.classList.add('show');
            }
        } catch (error) {
            errorElement.textContent = 'Failed to create user';
            errorElement.classList.add('show');
        }
    }

    /**
     * Load and display users list
     */
    async loadUsers() {
        const usersList = document.getElementById('users-list');
        if (!usersList) return;

        usersList.innerHTML = '<div class="loading">Loading users...</div>';

        try {
            const users = await API.getUsers();
            
            if (users.length === 0) {
                usersList.innerHTML = '<div class="no-users">No users found</div>';
                return;
            }

            usersList.innerHTML = users.map(user => `
                <div class="user-item">
                    <div class="user-info">
                        <strong>${user.displayName || user.username}</strong>
                        <span class="username">@${user.username}</span>
                        <span class="role role-${user.role}">${user.role}</span>
                        ${user.email ? `<span class="email">${user.email}</span>` : ''}
                    </div>
                    <div class="user-meta">
                        <span class="created">Created: ${new Date(user.createdAt).toLocaleDateString()}</span>
                        ${user.lastLoginAt ? `<span class="last-login">Last login: ${new Date(user.lastLoginAt).toLocaleDateString()}</span>` : ''}
                        <span class="status status-${user.isActive ? 'active' : 'inactive'}">${user.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            usersList.innerHTML = '<div class="error">Failed to load users</div>';
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
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