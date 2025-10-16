/**
 * Main Application Module for Nebula Chat
 * Coordinates all modules and handles global app functionality
 */

class NebulaApp {
    constructor() {
        this.isInitialized = false;
        this.version = '1.0.0';
        this.buildDate = new Date().toISOString();
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        console.log(`🌟 Nebula Chat v${this.version} - Starting up...`);
        
        this.bindGlobalEvents();
        this.setupErrorHandling();
        this.setupPerformanceMonitoring();
        this.checkBrowserSupport();
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.onDOMReady.bind(this));
        } else {
            this.onDOMReady();
        }
    }

    /**
     * Handle DOM ready event
     */
    onDOMReady() {
        console.log('📱 DOM ready - Initializing modules...');
        
        this.initializeModules();
        this.setupKeyboardShortcuts();
        this.setupServiceWorker();
        this.isInitialized = true;
        
        console.log('✅ Nebula Chat initialized successfully');
    }

    /**
     * Initialize all application modules
     */
    initializeModules() {
        // Modules are auto-initialized in their respective files
        // This method ensures they're properly connected
        
        // Wait for all modules to be ready
        const checkModules = () => {
            if (window.UI && window.Auth && window.API && window.Chat && window.Utils) {
                this.connectModules();
                return true;
            }
            return false;
        };

        if (!checkModules()) {
            // Retry after a short delay
            setTimeout(() => {
                if (!checkModules()) {
                    console.warn('⚠️ Some modules failed to initialize properly');
                }
            }, 100);
        }
    }

    /**
     * Connect modules and setup inter-module communication
     */
    connectModules() {
        // Setup logout functionality
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Setup mobile menu toggle if needed
        this.setupMobileMenu();
        
        // Setup periodic health checks
        this.setupHealthChecks();
        
        // Trigger app ready event to initialize chat loading
        console.log('🚀 Triggering app initialization...');
        document.dispatchEvent(new Event('app-ready'));
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        // Add mobile menu toggle if on mobile
        if (Utils.isMobile()) {
            this.createMobileMenuToggle();
        }

        // Listen for mobile state changes
        document.addEventListener('mobile-state-changed', (event) => {
            if (event.detail.isMobile) {
                this.createMobileMenuToggle();
            } else {
                this.removeMobileMenuToggle();
            }
        });
    }

    /**
     * Create mobile menu toggle button
     */
    createMobileMenuToggle() {
        const existing = document.getElementById('mobile-menu-toggle');
        if (existing) return;

        const toggle = document.createElement('button');
        toggle.id = 'mobile-menu-toggle';
        toggle.className = 'mobile-menu-toggle';
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        toggle.setAttribute('aria-label', 'Toggle menu');
        
        toggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.insertBefore(toggle, chatHeader.firstChild);
        }
    }

    /**
     * Remove mobile menu toggle button
     */
    removeMobileMenuToggle() {
        const toggle = document.getElementById('mobile-menu-toggle');
        if (toggle) {
            toggle.remove();
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    /**
     * Setup global keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Global shortcuts
            if (event.ctrlKey || event.metaKey) {
                switch (event.key) {
                    case 'k':
                        event.preventDefault();
                        this.focusSearch();
                        break;
                    case ',':
                        event.preventDefault();
                        this.openSettings();
                        break;
                    case '/':
                        event.preventDefault();
                        this.showKeyboardShortcuts();
                        break;
                }
            }

            // Function keys
            if (event.key === 'F1') {
                event.preventDefault();
                this.showHelp();
            }
        });
    }

    /**
     * Setup service worker for offline support
     */
    setupServiceWorker() {
        // Service worker disabled for now to avoid 404 errors
        // if ('serviceWorker' in navigator && !CONFIG.IS_DEVELOPMENT) {
        //     navigator.serviceWorker.register('/sw.js')
        //         .then(registration => {
        //             console.log('🔧 Service Worker registered:', registration.scope);
        //         })
        //         .catch(error => {
        //             console.warn('🔧 Service Worker registration failed:', error);
        //         });
        // }
        console.log('🔧 Service Worker registration skipped');
    }

    /**
     * Setup periodic health checks
     */
    setupHealthChecks() {
        // Check API health every 5 minutes
        setInterval(async () => {
            try {
                await API.checkHealth();
            } catch (error) {
                console.warn('⚕️ Health check failed:', error);
                if (error.message.includes('Network')) {
                    UI.showToast('Connection issue detected', 'warning');
                }
            }
        }, 5 * 60 * 1000);
    }

    /**
     * Bind global event listeners
     */
    bindGlobalEvents() {
        // Handle online/offline status
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Handle before unload
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Handle visibility change
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Handle uncaught JavaScript errors
        window.addEventListener('error', (event) => {
            console.error('🚨 Uncaught error:', event.error);
            this.reportError('JavaScript Error', event.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🚨 Unhandled promise rejection:', event.reason);
            this.reportError('Promise Rejection', event.reason);
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Log performance metrics
        if ('performance' in window && performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const timing = performance.timing;
                    const loadTime = timing.loadEventEnd - timing.navigationStart;
                    console.log(`⚡ Page load time: ${loadTime}ms`);
                }, 0);
            });
        }
    }

    /**
     * Check browser support
     */
    checkBrowserSupport() {
        const features = {
            'localStorage': 'localStorage' in window,
            'fetch': 'fetch' in window,
            'Promise': 'Promise' in window,
            'CSS Grid': CSS.supports('display', 'grid'),
            'CSS Variables': CSS.supports('color', 'var(--test)')
        };

        const unsupported = Object.entries(features)
            .filter(([name, supported]) => !supported)
            .map(([name]) => name);

        if (unsupported.length > 0) {
            console.warn('⚠️ Browser missing features:', unsupported);
            setTimeout(() => {
                UI.showToast('Some features may not work properly in this browser', 'warning');
            }, 1000);
        }
    }

    /**
     * Handle online event
     */
    handleOnline() {
        console.log('🌐 Connection restored');
        UI.showToast('Connection restored', 'success');
    }

    /**
     * Handle offline event
     */
    handleOffline() {
        console.log('🌐 Connection lost');
        UI.showToast('You are offline. Some features may not work.', 'warning');
    }

    /**
     * Handle before unload
     * @param {BeforeUnloadEvent} event - Before unload event
     */
    handleBeforeUnload(event) {
        // Only prompt if there's unsaved content
        const messageInput = document.getElementById('message-input');
        if (messageInput && messageInput.value.trim()) {
            event.preventDefault();
            event.returnValue = '';
            return '';
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('👁️ App hidden');
        } else {
            console.log('👁️ App visible');
            // Refresh data if needed
            if (Chat && typeof Chat.refreshCurrentChat === 'function') {
                Chat.refreshCurrentChat();
            }
        }
    }

    /**
     * Handle logout
     */
    async handleLogout() {
        const confirmed = await UI.confirm(
            'Are you sure you want to log out?',
            'Confirm Logout'
        );

        if (confirmed) {
            document.dispatchEvent(new Event('logout'));
        }
    }

    /**
     * Focus search functionality
     */
    focusSearch() {
        // Focus the message input if available
        const messageInput = document.getElementById('message-input');
        if (messageInput && !messageInput.disabled) {
            messageInput.focus();
        }
    }

    /**
     * Open settings (placeholder)
     */
    openSettings() {
        UI.showToast('Settings panel coming soon!', 'info');
    }

    /**
     * Show keyboard shortcuts
     */
    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Ctrl/Cmd + Enter', action: 'Send message' },
            { key: 'Ctrl/Cmd + N', action: 'New chat' },
            { key: 'Ctrl/Cmd + K', action: 'Focus input' },
            { key: 'Ctrl/Cmd + /', action: 'Show shortcuts' },
            { key: 'Escape', action: 'Close modals' },
            { key: 'F1', action: 'Help' }
        ];

        const shortcutsList = shortcuts.map(s => 
            `<div style="display: flex; justify-content: space-between; margin: 8px 0;">
                <code style="background: var(--bg-quaternary); padding: 2px 6px; border-radius: 4px;">${s.key}</code>
                <span>${s.action}</span>
            </div>`
        ).join('');

        // Create modal for shortcuts
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">⌨️ Keyboard Shortcuts</h3>
                    </div>
                    <div class="card-body">
                        ${shortcutsList}
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Got it</button>
                    </div>
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    /**
     * Show help
     */
    showHelp() {
        const helpContent = `
            <h4>🌟 Welcome to Nebula Chat</h4>
            <p>Your secure AI-powered conversation platform.</p>
            
            <h5>Features:</h5>
            <ul>
                <li>💬 Multiple chat sessions</li>
                <li>🔒 Secure authentication</li>
                <li>📱 Mobile responsive</li>
                <li>🎨 Dark theme interface</li>
                <li>⌨️ Keyboard shortcuts</li>
            </ul>
            
            <h5>Tips:</h5>
            <ul>
                <li>Use Shift+Enter for new lines</li>
                <li>Your conversations are automatically saved</li>
                <li>Click on a chat in the sidebar to switch</li>
                <li>Use the action buttons to manage chats</li>
            </ul>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Help & Guide</h3>
                    </div>
                    <div class="card-body">
                        ${helpContent}
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-secondary" onclick="window.open('https://github.com/your-repo', '_blank')">Documentation</button>
                        <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            </div>
        `;

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    /**
     * Report error to console (could be extended to send to analytics)
     * @param {string} type - Error type
     * @param {Error} error - Error object
     */
    reportError(type, error) {
        console.group(`🚨 ${type}`);
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        console.error('Timestamp:', new Date().toISOString());
        console.groupEnd();

        // Could send to analytics service here
        // analytics.reportError(type, error);
    }

    /**
     * Get app information
     * @returns {Object} App information
     */
    getAppInfo() {
        return {
            name: 'Nebula Chat',
            version: this.version,
            buildDate: this.buildDate,
            isInitialized: this.isInitialized,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
    }

    /**
     * Enable debug mode
     */
    enableDebugMode() {
        window.DEBUG = true;
        console.log('🐛 Debug mode enabled');
        
        // Add debug info to console
        console.table(this.getAppInfo());
        
        // Make modules globally accessible for debugging
        window.NebulaDebug = {
            app: this,
            api: window.API,
            auth: window.Auth,
            chat: window.Chat,
            ui: window.UI,
            utils: window.Utils,
            config: window.CONFIG
        };
        
        UI.showToast('Debug mode enabled - Check console', 'info');
    }
}

// Initialize the application
const NebulaApp_Instance = new NebulaApp();

// Expose app instance globally for debugging
if (CONFIG.IS_DEVELOPMENT) {
    window.NebulaApp = NebulaApp_Instance;
    window.enableDebug = () => NebulaApp_Instance.enableDebugMode();
    console.log('🛠️ Development mode - Type enableDebug() to enable debug mode');
}

// Export for module use
window.App = NebulaApp_Instance;