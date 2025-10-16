// Configuration settings for Nebula Chat
const CONFIG = {
    // Backend API endpoint - Update this to your Cloudflare Worker URL
    API_BASE_URL: 'https://nebula-chat-worker.knbuchtyy879.workers.dev',
    
    // API endpoints
    ENDPOINTS: {
        AUTH: '/api/auth',
        CHATS: '/api/chats',
        MESSAGES: '/api/messages'
    },
    
    // UI settings
    UI: {
        MAX_MESSAGE_LENGTH: 4000,
        AUTO_SCROLL_THRESHOLD: 100,
        TYPING_INDICATOR_DELAY: 1000,
        TOAST_DURATION: 3000
    },
    
    // Chat settings
    CHAT: {
        MAX_CHAT_TITLE_LENGTH: 50,
        MAX_CHATS_DISPLAY: 20,
        AUTO_SAVE_INTERVAL: 5000
    },
    
    // Security settings
    SECURITY: {
        TOKEN_STORAGE_KEY: 'nebula_token',
        SESSION_STORAGE_KEY: 'nebula_session',
        TOKEN_REFRESH_INTERVAL: 3600000 // 1 hour
    }
};

// Environment detection
CONFIG.IS_DEVELOPMENT = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';

// Development overrides
if (CONFIG.IS_DEVELOPMENT) {
    CONFIG.API_BASE_URL = 'http://localhost:8787'; // Local Cloudflare Worker
    CONFIG.UI.TOAST_DURATION = 5000; // Longer toasts in dev
}

// Export for use in other modules
window.CONFIG = CONFIG;