/**
 * UI Management Module for Nebula Chat
 * Handles all UI interactions and components
 */

class UIManager {
    constructor() {
        this.toastContainer = null;
        this.loadingElement = null;
        this.isMobile = Utils.isMobile();
        
        this.init();
    }

    /**
     * Initialize UI manager
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.setupResponsive();
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.toastContainer = document.getElementById('toast-container');
        this.loadingElement = document.getElementById('loading');
    }

    /**
     * Bind global event listeners
     */
    bindEvents() {
        // Handle window resize
        window.addEventListener('resize', Utils.throttle(() => {
            this.handleResize();
        }, 250));

        // Handle keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));

        // Handle visibility change
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    /**
     * Setup responsive behavior
     */
    setupResponsive() {
        this.updateMobileState();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const wasMobile = this.isMobile;
        this.updateMobileState();
        
        if (wasMobile !== this.isMobile) {
            // Mobile state changed
            document.dispatchEvent(new CustomEvent('mobile-state-changed', {
                detail: { isMobile: this.isMobile }
            }));
        }
    }

    /**
     * Update mobile state
     */
    updateMobileState() {
        this.isMobile = Utils.isMobile();
        document.body.classList.toggle('mobile', this.isMobile);
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Enter to send message
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            const sendButton = document.getElementById('send-btn');
            if (sendButton && !sendButton.disabled) {
                sendButton.click();
            }
        }

        // Escape to close modals
        if (event.key === 'Escape') {
            this.closeModals();
        }

        // Ctrl/Cmd + N for new chat
        if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
            event.preventDefault();
            const newChatBtn = document.getElementById('new-chat-btn');
            if (newChatBtn) {
                newChatBtn.click();
            }
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Tab became visible
            document.dispatchEvent(new Event('tab-visible'));
        } else {
            // Tab became hidden
            document.dispatchEvent(new Event('tab-hidden'));
        }
    }

    /**
     * Show toast notification
     * @param {string} message - Toast message
     * @param {string} type - Toast type (success, error, warning, info)
     * @param {number} duration - Duration in milliseconds
     */
    showToast(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
        if (!this.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // Create toast content
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="${iconMap[type] || iconMap.info}"></i>
            <span>${Utils.escapeHtml(message)}</span>
        `;

        // Add to container
        this.toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);

        // Remove on click
        toast.addEventListener('click', () => {
            this.removeToast(toast);
        });

        return toast;
    }

    /**
     * Remove toast notification
     * @param {HTMLElement} toast - Toast element
     */
    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.add('toast-exit');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 250);
        }
    }

    /**
     * Show loading indicator
     * @param {string} message - Loading message
     */
    showLoading(message = 'Loading...') {
        if (this.loadingElement) {
            const messageEl = this.loadingElement.querySelector('p');
            if (messageEl) {
                messageEl.textContent = message;
            }
            this.loadingElement.classList.remove('hidden');
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.classList.add('hidden');
        }
    }

    /**
     * Close all modals
     */
    closeModals() {
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    /**
     * Smooth scroll to bottom of element
     * @param {HTMLElement} element - Element to scroll
     * @param {boolean} force - Force scroll even if near bottom
     */
    scrollToBottom(element, force = false) {
        if (!element) return;

        const isNearBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 100;
        
        if (force || isNearBottom) {
            element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Animate element entrance
     * @param {HTMLElement} element - Element to animate
     * @param {string} animation - Animation class
     */
    animateIn(element, animation = 'animate-fade-in-up') {
        if (element) {
            element.classList.add(animation);
            element.addEventListener('animationend', () => {
                element.classList.remove(animation);
            }, { once: true });
        }
    }

    /**
     * Animate element exit
     * @param {HTMLElement} element - Element to animate
     * @param {string} animation - Animation class
     * @returns {Promise} Promise that resolves when animation completes
     */
    animateOut(element, animation = 'animate-fade-out') {
        return new Promise(resolve => {
            if (element) {
                element.classList.add(animation);
                element.addEventListener('animationend', () => {
                    element.classList.remove(animation);
                    resolve();
                }, { once: true });
            } else {
                resolve();
            }
        });
    }

    /**
     * Create confirmation dialog
     * @param {string} message - Confirmation message
     * @param {string} title - Dialog title
     * @returns {Promise<boolean>} User's choice
     */
    confirm(message, title = 'Confirm') {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">${Utils.escapeHtml(title)}</h3>
                        </div>
                        <div class="card-body">
                            <p>${Utils.escapeHtml(message)}</p>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                            <button class="btn btn-primary" data-action="confirm">Confirm</button>
                        </div>
                    </div>
                </div>
            `;

            // Handle clicks
            modal.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                if (action === 'confirm') {
                    resolve(true);
                    document.body.removeChild(modal);
                } else if (action === 'cancel' || event.target === modal) {
                    resolve(false);
                    document.body.removeChild(modal);
                }
            });

            // Handle escape key
            const handleEscape = (event) => {
                if (event.key === 'Escape') {
                    resolve(false);
                    document.body.removeChild(modal);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);

            document.body.appendChild(modal);
        });
    }

    /**
     * Create input dialog
     * @param {string} message - Input message
     * @param {string} title - Dialog title
     * @param {string} defaultValue - Default input value
     * @returns {Promise<string|null>} User's input or null if cancelled
     */
    prompt(message, title = 'Input', defaultValue = '') {
        return new Promise(resolve => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">${Utils.escapeHtml(title)}</h3>
                        </div>
                        <div class="card-body">
                            <p>${Utils.escapeHtml(message)}</p>
                            <input type="text" class="form-input" value="${Utils.escapeHtml(defaultValue)}" autofocus>
                        </div>
                        <div class="card-footer">
                            <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                            <button class="btn btn-primary" data-action="confirm">OK</button>
                        </div>
                    </div>
                </div>
            `;

            const input = modal.querySelector('input');

            // Handle clicks
            modal.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                if (action === 'confirm') {
                    resolve(input.value.trim() || null);
                    document.body.removeChild(modal);
                } else if (action === 'cancel' || event.target === modal) {
                    resolve(null);
                    document.body.removeChild(modal);
                }
            });

            // Handle enter key
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    resolve(input.value.trim() || null);
                    document.body.removeChild(modal);
                } else if (event.key === 'Escape') {
                    resolve(null);
                    document.body.removeChild(modal);
                }
            });

            document.body.appendChild(modal);
            input.focus();
            input.select();
        });
    }

    /**
     * Copy text to clipboard and show feedback
     * @param {string} text - Text to copy
     * @param {string} successMessage - Success message
     */
    async copyToClipboard(text, successMessage = 'Copied to clipboard!') {
        try {
            const success = await Utils.copyToClipboard(text);
            if (success) {
                this.showToast(successMessage, 'success');
            } else {
                this.showToast('Failed to copy to clipboard', 'error');
            }
        } catch (error) {
            this.showToast('Failed to copy to clipboard', 'error');
        }
    }

    /**
     * Update page title with unread indicator
     * @param {string} title - Page title
     * @param {boolean} hasUnread - Whether there are unread messages
     */
    updateTitle(title = 'Nebula Chat', hasUnread = false) {
        document.title = hasUnread ? `(1) ${title}` : title;
    }

    /**
     * Show typing indicator for better UX
     * @param {HTMLElement} container - Container to show typing in
     * @returns {HTMLElement} Typing indicator element
     */
    showTypingIndicator(container) {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        if (container) {
            container.appendChild(typingDiv);
            this.scrollToBottom(container);
        }
        
        return typingDiv;
    }

    /**
     * Remove typing indicator
     * @param {HTMLElement} typingElement - Typing indicator element
     */
    hideTypingIndicator(typingElement) {
        if (typingElement && typingElement.parentNode) {
            typingElement.parentNode.removeChild(typingElement);
        }
    }

    /**
     * Get current mobile state
     * @returns {boolean} True if mobile
     */
    isMobileDevice() {
        return this.isMobile;
    }

    /**
     * Focus element with error handling
     * @param {HTMLElement|string} element - Element or selector
     */
    focusElement(element) {
        try {
            const el = typeof element === 'string' ? document.querySelector(element) : element;
            if (el && typeof el.focus === 'function') {
                el.focus();
            }
        } catch (error) {
            console.warn('Failed to focus element:', error);
        }
    }
}

// Initialize UI manager
document.addEventListener('DOMContentLoaded', () => {
    window.UI = new UIManager();
});