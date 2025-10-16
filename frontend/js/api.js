/**
 * API Communication Module for Nebula Chat
 * Handles all communication with the backend API
 */

class ApiClient {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
        this.token = null;
        this.refreshToken = null;
        this.isRefreshing = false;
        this.failedQueue = [];
        
        // Load token from storage
        this.loadTokenFromStorage();
        
        // Set up periodic token refresh
        this.setupTokenRefresh();
    }

    /**
     * Load authentication token from localStorage
     */
    loadTokenFromStorage() {
        const tokenData = Utils.storage.get(CONFIG.SECURITY.TOKEN_STORAGE_KEY);
        if (tokenData) {
            this.token = tokenData.accessToken;
            this.refreshToken = tokenData.refreshToken;
        }
    }

    /**
     * Save authentication token to localStorage
     * @param {string} accessToken - Access token
     * @param {string} refreshToken - Refresh token
     */
    saveTokenToStorage(accessToken, refreshToken) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        
        Utils.storage.set(CONFIG.SECURITY.TOKEN_STORAGE_KEY, {
            accessToken,
            refreshToken,
            timestamp: Date.now()
        });
    }

    /**
     * Clear authentication token from storage
     */
    clearTokenFromStorage() {
        this.token = null;
        this.refreshToken = null;
        Utils.storage.remove(CONFIG.SECURITY.TOKEN_STORAGE_KEY);
    }

    /**
     * Setup periodic token refresh
     */
    setupTokenRefresh() {
        setInterval(() => {
            if (this.token && !this.isRefreshing) {
                this.refreshTokenIfNeeded();
            }
        }, CONFIG.SECURITY.TOKEN_REFRESH_INTERVAL);
    }

    /**
     * Check if token needs refresh and refresh if needed
     */
    async refreshTokenIfNeeded() {
        const tokenData = Utils.storage.get(CONFIG.SECURITY.TOKEN_STORAGE_KEY);
        if (!tokenData) return;

        const tokenAge = Date.now() - tokenData.timestamp;
        const refreshThreshold = CONFIG.SECURITY.TOKEN_REFRESH_INTERVAL * 0.8; // 80% of refresh interval

        if (tokenAge > refreshThreshold) {
            await this.refreshAccessToken();
        }
    }

    /**
     * Refresh the access token
     */
    async refreshAccessToken() {
        if (this.isRefreshing) return;

        this.isRefreshing = true;

        try {
            const response = await this.makeRequest('/api/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: this.refreshToken }),
                headers: { 'Content-Type': 'application/json' }
            }, false); // Don't include auth header

            if (response.success) {
                this.saveTokenToStorage(response.data.accessToken, response.data.refreshToken);
                
                // Process failed queue
                this.processQueue(null, response.data.accessToken);
            } else {
                this.processQueue(new Error('Token refresh failed'), null);
                this.clearTokenFromStorage();
            }
        } catch (error) {
            this.processQueue(error, null);
            this.clearTokenFromStorage();
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Process queued requests after token refresh
     * @param {Error|null} error - Error if refresh failed
     * @param {string|null} token - New token if refresh succeeded
     */
    processQueue(error, token) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });
        
        this.failedQueue = [];
    }

    /**
     * Get headers for API requests
     * @returns {Object} Request headers
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    /**
     * Make HTTP request with automatic retry and token refresh
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @param {boolean} includeAuth - Whether to include auth header
     * @returns {Promise<Object>} Response data
     */
    async makeRequest(endpoint, options = {}, includeAuth = true) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const requestOptions = {
            ...options,
            headers: {
                ...(includeAuth ? this.getHeaders() : { 'Content-Type': 'application/json' }),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, requestOptions);
            
            // Handle token expiration
            if (response.status === 401 && includeAuth && !this.isRefreshing) {
                try {
                    await this.refreshAccessToken();
                    
                    // Retry with new token
                    requestOptions.headers['Authorization'] = `Bearer ${this.token}`;
                    return await this.makeRequest(endpoint, options, includeAuth);
                } catch (refreshError) {
                    throw new Error('Authentication failed');
                }
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your connection.');
            }
            throw error;
        }
    }

    /**
     * Authenticate with password
     * @param {string} password - Authentication password
     * @returns {Promise<Object>} Authentication response
     */
    async authenticate(password) {
        try {
            const response = await this.makeRequest(CONFIG.ENDPOINTS.AUTH, {
                method: 'POST',
                body: JSON.stringify({ password })
            }, false);

            if (response.success) {
                this.saveTokenToStorage(response.data.accessToken, response.data.refreshToken);
            }

            return response;
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }

    /**
     * Logout and clear tokens
     */
    async logout() {
        try {
            if (this.token) {
                await this.makeRequest('/api/logout', {
                    method: 'POST'
                });
            }
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.clearTokenFromStorage();
        }
    }

    /**
     * Get all chat sessions
     * @returns {Promise<Array>} Array of chat sessions
     */
    async getChats() {
        try {
            const response = await this.makeRequest(CONFIG.ENDPOINTS.CHATS);
            return response.data || [];
        } catch (error) {
            console.error('Failed to fetch chats:', error);
            throw error;
        }
    }

    /**
     * Create a new chat session
     * @param {string} title - Chat title
     * @returns {Promise<Object>} Created chat session
     */
    async createChat(title = 'New Chat') {
        try {
            const response = await this.makeRequest(CONFIG.ENDPOINTS.CHATS, {
                method: 'POST',
                body: JSON.stringify({ title })
            });
            return response.data;
        } catch (error) {
            console.error('Failed to create chat:', error);
            throw error;
        }
    }

    /**
     * Get specific chat with messages
     * @param {string} chatId - Chat ID
     * @returns {Promise<Object>} Chat data with messages
     */
    async getChat(chatId) {
        try {
            const response = await this.makeRequest(`${CONFIG.ENDPOINTS.CHATS}/${chatId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch chat:', error);
            throw error;
        }
    }

    /**
     * Send message to chat
     * @param {string} chatId - Chat ID
     * @param {string} message - Message content
     * @returns {Promise<Object>} Response with AI reply
     */
    async sendMessage(chatId, message) {
        try {
            const response = await this.makeRequest(`${CONFIG.ENDPOINTS.CHATS}/${chatId}/messages`, {
                method: 'POST',
                body: JSON.stringify({ message })
            });
            return response.data;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    /**
     * Delete a chat session
     * @param {string} chatId - Chat ID
     * @returns {Promise<Object>} Deletion response
     */
    async deleteChat(chatId) {
        try {
            const response = await this.makeRequest(`${CONFIG.ENDPOINTS.CHATS}/${chatId}`, {
                method: 'DELETE'
            });
            return response;
        } catch (error) {
            console.error('Failed to delete chat:', error);
            throw error;
        }
    }

    /**
     * Clear all messages in a chat
     * @param {string} chatId - Chat ID
     * @returns {Promise<Object>} Clear response
     */
    async clearChat(chatId) {
        try {
            const response = await this.makeRequest(`${CONFIG.ENDPOINTS.CHATS}/${chatId}/clear`, {
                method: 'POST'
            });
            return response;
        } catch (error) {
            console.error('Failed to clear chat:', error);
            throw error;
        }
    }

    /**
     * Update chat title
     * @param {string} chatId - Chat ID
     * @param {string} title - New title
     * @returns {Promise<Object>} Update response
     */
    async updateChatTitle(chatId, title) {
        try {
            const response = await this.makeRequest(`${CONFIG.ENDPOINTS.CHATS}/${chatId}`, {
                method: 'PATCH',
                body: JSON.stringify({ title })
            });
            return response.data;
        } catch (error) {
            console.error('Failed to update chat title:', error);
            throw error;
        }
    }

    /**
     * Check API health
     * @returns {Promise<Object>} Health status
     */
    async checkHealth() {
        try {
            const response = await this.makeRequest('/api/health', {}, false);
            return response;
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        return !!this.token;
    }
}

// Create global API instance
window.API = new ApiClient();