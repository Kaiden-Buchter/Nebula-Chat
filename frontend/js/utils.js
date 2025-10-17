/**
 * Utility functions for Nebula Chat
 * Provides common helper functions used throughout the application
 */

const Utils = {
    /**
     * Generate a unique ID
     * @returns {string} Unique identifier
     */
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    },

    /**
     * Format a date for display
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        
        // Less than a minute
        if (diff < 60000) {
            return 'Just now';
        }
        
        // Less than an hour
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
        
        // Less than a day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }
        
        // Less than a week
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }
        
        // More than a week
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    },

    /**
     * Format time for message timestamps
     * @param {Date|string} date - Date to format
     * @returns {string} Formatted time string
     */
    formatTime(date) {
        const d = new Date(date);
        return d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    },

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Sanitize text input
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeText(text) {
        return text
            .trim()
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .substring(0, CONFIG.UI.MAX_MESSAGE_LENGTH); // Limit length
    },

    /**
     * Generate a preview from text
     * @param {string} text - Text to preview
     * @param {number} maxLength - Maximum length of preview
     * @returns {string} Preview text
     */
    generatePreview(text, maxLength = 50) {
        if (!text || text.length === 0) return 'Empty message';
        
        const cleanText = text.replace(/\n/g, ' ').trim();
        if (cleanText.length <= maxLength) return cleanText;
        
        return cleanText.substring(0, maxLength - 3) + '...';
    },

    /**
     * Generate a title from the first message
     * @param {string} text - Text to generate title from
     * @returns {string} Generated title
     */
    generateChatTitle(text) {
        if (!text || text.length === 0) return 'New Chat';
        
        const cleanText = text.replace(/\n/g, ' ').trim();
        const words = cleanText.split(' ').slice(0, 6); // First 6 words
        let title = words.join(' ');
        
        if (title.length > CONFIG.CHAT.MAX_CHAT_TITLE_LENGTH) {
            title = title.substring(0, CONFIG.CHAT.MAX_CHAT_TITLE_LENGTH - 3) + '...';
        }
        
        return title || 'New Chat';
    },

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackErr) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    },

    /**
     * Format file size for display
     * @param {number} bytes - Size in bytes
     * @returns {string} Formatted size string
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    isMobile() {
        return window.innerWidth <= 768;
    },

    /**
     * Smooth scroll to element
     * @param {HTMLElement} element - Element to scroll to
     * @param {string} behavior - Scroll behavior
     */
    scrollToElement(element, behavior = 'smooth') {
        if (element) {
            element.scrollIntoView({ 
                behavior, 
                block: 'nearest',
                inline: 'nearest' 
            });
        }
    },

    /**
     * Auto-resize textarea
     * @param {HTMLTextAreaElement} textarea - Textarea element
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    },

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} True if in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Get contrast color for background
     * @param {string} hexColor - Hex color code
     * @returns {string} Black or white contrast color
     */
    getContrastColor(hexColor) {
        // Remove # if present
        hexColor = hexColor.replace('#', '');
        
        // Convert to RGB
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        return luminance > 0.5 ? '#000000' : '#ffffff';
    },

    /**
     * Parse markdown-like formatting in text
     * @param {string} text - Text to parse (should already be HTML-escaped)
     * @returns {string} HTML string with advanced formatting
     */
    parseSimpleMarkdown(text) {
        // First handle code blocks (must be done before other formatting)
        text = text.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
            const language = lang || '';
            const trimmedCode = code.trim();
            return `<pre class="code-block" data-language="${language}"><code>${trimmedCode}</code></pre>`;
        });
        
        // Handle single-line code blocks without language
        text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
            const trimmedCode = code.trim();
            return `<pre class="code-block"><code>${trimmedCode}</code></pre>`;
        });
        
        return text
            // Headers (only on new lines) - support all 6 levels
            .replace(/^###### (.*$)/gm, '<h6 class="markdown-h6">$1</h6>')
            .replace(/^##### (.*$)/gm, '<h5 class="markdown-h5">$1</h5>')
            .replace(/^#### (.*$)/gm, '<h4 class="markdown-h4">$1</h4>')
            .replace(/^### (.*$)/gm, '<h3 class="markdown-h3">$1</h3>')
            .replace(/^## (.*$)/gm, '<h2 class="markdown-h2">$1</h2>')
            .replace(/^# (.*$)/gm, '<h1 class="markdown-h1">$1</h1>')
            
            // Horizontal lines
            .replace(/^(---+|___+|\*\*\*+)$/gm, '<hr class="markdown-hr">')
            
            // Bold and italic combinations (must be done before individual bold/italic)
            .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
            .replace(/\_\_\_(.*?)\_\_\_/g, '<strong><em>$1</em></strong>')
            
            // Bold text: **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            
            // Italic text: *text* or _text_ (with negative lookbehind/ahead to avoid conflicts)
            .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
            .replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em>$1</em>')
            
            // Strikethrough: ~~text~~
            .replace(/~~(.*?)~~/g, '<del>$1</del>')
            
            // Task lists (must be done before regular lists)
            .replace(/^(\s*)- \[x\]\s+(.*$)/gm, '$1<li class="markdown-task-item completed"><input type="checkbox" checked disabled> $2</li>')
            .replace(/^(\s*)- \[ \]\s+(.*$)/gm, '$1<li class="markdown-task-item"><input type="checkbox" disabled> $2</li>')
            
            // Ordered lists
            .replace(/^(\s*)(\d+)\.\s+(.*$)/gm, '$1<li class="markdown-ol-item">$3</li>')
            
            // Unordered lists with nesting support
            .replace(/^(\s*)[-*+]\s+(.*$)/gm, (match, indent, content) => {
                const level = Math.floor(indent.length / 2);
                return `${indent}<li class="markdown-li" data-level="${level}">${content}</li>`;
            })
            
            // Wrap consecutive list items in appropriate list tags
            .replace(/((?:<li class="markdown-li"[^>]*>.*<\/li>\s*)+)/g, (match) => {
                return `<ul class="markdown-ul">${match}</ul>`;
            })
            .replace(/((?:<li class="markdown-ol-item">.*<\/li>\s*)+)/g, (match) => {
                return `<ol class="markdown-ol">${match}</ol>`;
            })
            .replace(/((?:<li class="markdown-task-item[^>]*>.*<\/li>\s*)+)/g, (match) => {
                return `<ul class="markdown-task-list">${match}</ul>`;
            })
            
            // Blockquotes: > text (handle multiple lines and nesting)
            .replace(/^(>\s.*(?:\n>\s.*)*)/gm, (match) => {
                const lines = match.split('\n').map(line => {
                    return line.replace(/^>\s/, '').trim();
                }).join('<br>');
                return `<blockquote class="markdown-quote">${lines}</blockquote>`;
            })
            
            // Images: ![alt](url)
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="markdown-image" loading="lazy">')
            
            // Links: [text](url)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>')
            
            // Inline code: `code` (must be done after code blocks)
            .replace(/`([^`\n]+?)`/g, '<code class="inline-code">$1</code>')
            
            // Line breaks
            .replace(/\n/g, '<br>');
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Generate random color for avatars
     * @param {string} seed - Seed for consistent colors
     * @returns {string} Hex color code
     */
    generateColor(seed) {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const hue = Math.abs(hash) % 360;
        return `hsl(${hue}, 70%, 60%)`;
    },

    /**
     * Storage helpers
     */
    storage: {
        /**
         * Get item from localStorage with JSON parsing
         * @param {string} key - Storage key
         * @param {*} defaultValue - Default value if not found
         * @returns {*} Parsed value
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Failed to parse localStorage item:', key, error);
                return defaultValue;
            }
        },

        /**
         * Set item in localStorage with JSON stringify
         * @param {string} key - Storage key
         * @param {*} value - Value to store
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (error) {
                console.error('Failed to set localStorage item:', key, error);
            }
        },

        /**
         * Remove item from localStorage
         * @param {string} key - Storage key
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error('Failed to remove localStorage item:', key, error);
            }
        },

        /**
         * Clear all localStorage
         */
        clear() {
            try {
                localStorage.clear();
            } catch (error) {
                console.error('Failed to clear localStorage:', error);
            }
        }
    }
};

// Export for use in other modules
window.Utils = Utils;