/**
 * Chat Management Module for Nebula Chat
 * Handles chat sessions, messages, and chat-related functionality
 */

class ChatManager {
    constructor() {
        this.currentChatId = null;
        this.chats = new Map();
        this.messagesContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.chatSessions = null;
        this.chatTitle = null;
        this.chatStatus = null;
        this.charCount = null;
        
        this.isLoading = false;
        this.typingIndicator = null;
        
        this.init();
    }

    /**
     * Initialize chat manager
     */
    init() {
        this.bindElements();
        this.bindEvents();
        this.setupAutoResize();
    }

    /**
     * Bind DOM elements
     */
    bindElements() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-btn');
        this.chatSessions = document.getElementById('chat-sessions');
        this.chatTitle = document.getElementById('chat-title');
        this.chatStatus = document.getElementById('chat-status');
        this.charCount = document.getElementById('char-count');
        this.newChatBtn = document.getElementById('new-chat-btn');
        this.clearChatBtn = document.getElementById('clear-chat-btn');
        this.deleteChatBtn = document.getElementById('delete-chat-btn');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Message input events
        if (this.messageInput) {
            this.messageInput.addEventListener('input', this.handleInputChange.bind(this));
            this.messageInput.addEventListener('keydown', this.handleKeyDown.bind(this));
            this.messageInput.addEventListener('paste', this.handlePaste.bind(this));
        }

        // Send button
        if (this.sendButton) {
            this.sendButton.addEventListener('click', this.handleSendMessage.bind(this));
        }

        // New chat button
        if (this.newChatBtn) {
            this.newChatBtn.addEventListener('click', this.createNewChat.bind(this));
        }

        // Chat actions
        if (this.clearChatBtn) {
            this.clearChatBtn.addEventListener('click', this.clearCurrentChat.bind(this));
        }

        if (this.deleteChatBtn) {
            this.deleteChatBtn.addEventListener('click', this.deleteCurrentChat.bind(this));
        }

        // Listen for app ready event
        document.addEventListener('app-ready', this.loadChats.bind(this));
    }

    /**
     * Setup auto-resize for textarea
     */
    setupAutoResize() {
        if (this.messageInput) {
            this.messageInput.addEventListener('input', () => {
                Utils.autoResizeTextarea(this.messageInput);
            });
        }
    }

    /**
     * Handle input change
     */
    handleInputChange() {
        const text = this.messageInput.value;
        const length = text.length;
        
        // Update character count
        if (this.charCount) {
            this.charCount.textContent = `${length}/${CONFIG.UI.MAX_MESSAGE_LENGTH}`;
            this.charCount.style.color = length > CONFIG.UI.MAX_MESSAGE_LENGTH * 0.9 
                ? 'var(--warning)' 
                : 'var(--text-quaternary)';
        }
        
        // Enable/disable send button
        if (this.sendButton) {
            this.sendButton.disabled = !text.trim() || length > CONFIG.UI.MAX_MESSAGE_LENGTH || this.isLoading;
        }
    }

    /**
     * Handle key down events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!this.sendButton.disabled) {
                this.handleSendMessage();
            }
        }
    }

    /**
     * Handle paste events
     * @param {ClipboardEvent} event - Paste event
     */
    handlePaste(event) {
        // Allow paste but trigger validation
        setTimeout(() => {
            this.handleInputChange();
            Utils.autoResizeTextarea(this.messageInput);
        }, 0);
    }

    /**
     * Load all chats
     */
    async loadChats() {
        try {
            UI.showLoading('Loading chats...');
            
            // Wait a bit for Auth to be properly initialized
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Check if we're authenticated first
            if (!Auth || !Auth.isUserAuthenticated || !Auth.isUserAuthenticated()) {
                this.showWelcomeMessage();
                return;
            }
            
            const chats = await API.getChats();
            
            this.chats.clear();
            chats.forEach(chat => {
                this.chats.set(chat.id, chat);
            });
            
            this.renderChatList();
            
            // Load the most recent chat or show welcome
            if (chats.length > 0) {
                const recentChat = chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
                await this.loadChat(recentChat.id);
            } else {
                this.showWelcomeMessage();
            }
        } catch (error) {
            console.error('Failed to load chats:', error);
            UI.showToast(`Failed to load chats: ${error.message}`, 'error');
            this.showWelcomeMessage();
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * Render chat list in sidebar
     */
    renderChatList() {
        if (!this.chatSessions) return;

        const chatArray = Array.from(this.chats.values())
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        if (chatArray.length === 0) {
            this.chatSessions.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>No chats yet. Create your first chat to get started!</p>
                </div>
            `;
            return;
        }

        this.chatSessions.innerHTML = chatArray.map(chat => `
            <div class="chat-session ${chat.id === this.currentChatId ? 'active' : ''}" data-chat-id="${chat.id}">
                <div class="chat-session-title">${Utils.escapeHtml(chat.title)}</div>
                <div class="chat-session-preview">${Utils.escapeHtml(chat.preview || 'No messages')}</div>
                <div class="chat-session-time">${Utils.formatDate(chat.updatedAt)}</div>
            </div>
        `).join('');

        // Bind click events
        this.chatSessions.querySelectorAll('.chat-session').forEach(session => {
            session.addEventListener('click', () => {
                const chatId = session.dataset.chatId;
                if (chatId !== this.currentChatId) {
                    this.loadChat(chatId);
                }
            });
        });
    }

    /**
     * Activate a chat session in the UI
     * @param {string} chatId - Chat ID to activate
     */
    activateChat(chatId) {
        // Update chat list active state
        this.chatSessions?.querySelectorAll('.chat-session').forEach(session => {
            session.classList.toggle('active', session.dataset.chatId === chatId);
        });
    }

    /**
     * Create new chat
     */
    async createNewChat() {
        try {
            const chat = await API.createChat();
            this.chats.set(chat.id, chat);
            this.renderChatList();
            
            // Instead of loading from server, use the chat data we just received
            this.currentChatId = chat.id;
            this.currentChat = chat;
            this.renderMessages(chat.messages || []);
            this.updateChatHeader(chat);
            this.activateChat(chat.id);
            
            UI.showToast('New chat created successfully', 'success');
            
            // Disable input initially to prevent sending before KV propagation
            this.disableInput();
            
            // Show loading state while waiting for KV storage propagation
            UI.showToast('Setting up chat...', 'info');
            
            // Longer delay to allow KV storage to propagate before enabling input
            setTimeout(() => {
                this.enableInput();
                this.messageInput?.focus();
                UI.showToast('Chat ready!', 'success');
            }, 3000); // Increased from 1 second to 3 seconds
        } catch (error) {
            console.error('Failed to create chat:', error);
            UI.showToast('Failed to create new chat', 'error');
        }
    }

    /**
     * Load specific chat
     * @param {string} chatId - Chat ID to load
     */
    async loadChat(chatId) {
        if (!chatId || chatId === this.currentChatId) return;

        try {
            UI.showLoading('Loading chat...');
            
            // Always fetch full chat data from server (local cache only has summaries)
            const chatData = await API.getChat(chatId);
            
            // Update local cache with full chat data
            this.chats.set(chatId, chatData);
            
            this.currentChatId = chatId;
            this.currentChat = chatData;
            
            this.updateChatHeader(chatData);
            this.renderMessages(chatData.messages || []);
            this.renderChatList();
            this.activateChat(chatId);
            
            // Enable input
            this.enableInput();
            
        } catch (error) {
            console.error('Failed to load chat:', error);
            
            // If it's a newly created chat that hasn't propagated yet, 
            // check if we have it locally
            const localChat = this.chats.get(chatId);
            if (localChat) {
                this.currentChatId = chatId;
                this.currentChat = localChat;
                this.updateChatHeader(localChat);
                this.renderMessages(localChat.messages || []);
                this.activateChat(chatId);
                this.enableInput();
                UI.showToast('Using local chat data', 'info');
            } else {
                UI.showToast('Failed to load chat', 'error');
            }
        } finally {
            UI.hideLoading();
        }
    }

    /**
     * Update chat header
     * @param {Object} chat - Chat data
     */
    updateChatHeader(chat) {
        if (this.chatTitle) {
            this.chatTitle.textContent = chat.title;
        }
        
        if (this.chatStatus) {
            const messageCount = chat.messages?.length || 0;
            this.chatStatus.textContent = messageCount === 0 
                ? 'No messages yet' 
                : `${messageCount} message${messageCount === 1 ? '' : 's'}`;
        }
    }

    /**
     * Render messages in chat
     * @param {Array} messages - Array of messages
     */
    renderMessages(messages = []) {
        if (!this.messagesContainer) {
            console.error('❌ Messages container not found!');
            return;
        }

        this.messagesContainer.innerHTML = '';

        if (messages.length === 0) {
            this.showEmptyState();
            return;
        }

        messages.forEach((message, index) => {
            this.addMessageToUI(message, false);
        });

        // Scroll to bottom
        UI.scrollToBottom(this.messagesContainer, true);
    }

    /**
     * Add message to UI
     * @param {Object} message - Message object
     * @param {boolean} animate - Whether to animate the message
     */
    addMessageToUI(message, animate = true) {
        if (!this.messagesContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = `message ${message.role}`;
        
        const avatarContent = message.role === 'user' 
            ? '<i class="fas fa-user"></i>' 
            : '<i class="fas fa-robot"></i>';

        messageEl.innerHTML = `
            <div class="message-avatar">
                ${avatarContent}
            </div>
            <div class="message-content">
                <div class="message-text">${this.formatMessageText(message.content)}</div>
                <div class="message-time">${Utils.formatTime(message.timestamp)}</div>
            </div>
        `;

        this.messagesContainer.appendChild(messageEl);

        if (animate) {
            UI.animateIn(messageEl);
        }

        // Scroll to bottom if needed
        UI.scrollToBottom(this.messagesContainer);

        return messageEl;
    }

    /**
     * Format message text with enhanced markdown and math
     * @param {string} text - Message text
     * @returns {string} Formatted HTML
     */
    formatMessageText(text) {
        // Escape HTML first, then apply markdown
        const escapedText = Utils.escapeHtml(text);
        const markdownHTML = Utils.parseSimpleMarkdown(escapedText);
        
        // Create a temporary element to process math
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = markdownHTML;
        
        // Render math expressions
        Utils.renderMath(tempDiv);
        
        return tempDiv.innerHTML;
    }

    /**
     * Handle send message
     */
    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isLoading) return;
        
        if (!this.currentChatId) {
            UI.showToast('Please select or create a chat first', 'warning');
            return;
        }

        if (message.length > CONFIG.UI.MAX_MESSAGE_LENGTH) {
            UI.showToast('Message is too long', 'warning');
            return;
        }

        this.isLoading = true;
        this.disableInput();
        
        // Clear input
        this.messageInput.value = '';
        this.handleInputChange();
        Utils.autoResizeTextarea(this.messageInput);

        try {
            // Add user message to UI immediately
            const userMessage = {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            };
            
            this.addMessageToUI(userMessage);
            
            // Show typing indicator
            this.typingIndicator = UI.showTypingIndicator(this.messagesContainer);
            
            // Send message to API with retry for KV propagation
            let response;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
                try {
                    response = await API.sendMessage(this.currentChatId, message);
                    break; // Success, exit retry loop
                } catch (error) {
                    if (error.message === 'Chat not found' && retryCount < maxRetries - 1) {
                        retryCount++;
                        UI.showToast(`Waiting for chat sync... (${retryCount}/${maxRetries})`, 'info');
                        // Wait 2 seconds before retry
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    } else {
                        throw error; // Re-throw if it's not a chat not found error or max retries reached
                    }
                }
            }
            
            // Remove typing indicator
            UI.hideTypingIndicator(this.typingIndicator);
            
            // Add assistant response
            if (response.reply) {
                const assistantMessage = {
                    role: 'assistant',
                    content: response.reply,
                    timestamp: new Date().toISOString()
                };
                
                this.addMessageToUI(assistantMessage);
            }
            
            // Update chat data
            if (response.chat) {
                this.chats.set(this.currentChatId, response.chat);
                this.updateChatHeader(response.chat);
                this.renderChatList();
            }
            
        } catch (error) {
            console.error('Failed to send message:', error);
            UI.showToast(error.message || 'Failed to send message', 'error');
            
            // Remove typing indicator
            UI.hideTypingIndicator(this.typingIndicator);
        } finally {
            this.isLoading = false;
            this.enableInput();
            this.messageInput.focus();
        }
    }

    /**
     * Clear current chat
     */
    async clearCurrentChat() {
        if (!this.currentChatId) return;

        const confirmed = await UI.confirm(
            'Are you sure you want to clear all messages in this chat? This action cannot be undone.',
            'Clear Chat'
        );

        if (!confirmed) return;

        try {
            await API.clearChat(this.currentChatId);
            
            // Update UI
            if (this.messagesContainer) {
                this.messagesContainer.innerHTML = '';
                this.showEmptyState();
            }
            
            // Update chat data
            const chat = this.chats.get(this.currentChatId);
            if (chat) {
                chat.messages = [];
                chat.preview = '';
                this.updateChatHeader(chat);
                this.renderChatList();
            }
            
            UI.showToast('Chat cleared', 'success');
        } catch (error) {
            console.error('Failed to clear chat:', error);
            UI.showToast('Failed to clear chat', 'error');
        }
    }

    /**
     * Delete current chat
     */
    async deleteCurrentChat() {
        if (!this.currentChatId) return;

        const confirmed = await UI.confirm(
            'Are you sure you want to delete this chat? This action cannot be undone.',
            'Delete Chat'
        );

        if (!confirmed) return;

        try {
            await API.deleteChat(this.currentChatId);
            
            // Remove from local data
            this.chats.delete(this.currentChatId);
            
            // Find next chat to load
            const remainingChats = Array.from(this.chats.values());
            if (remainingChats.length > 0) {
                const nextChat = remainingChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
                await this.loadChat(nextChat.id);
            } else {
                this.currentChatId = null;
                this.showWelcomeMessage();
            }
            
            this.renderChatList();
            UI.showToast('Chat deleted', 'success');
        } catch (error) {
            console.error('Failed to delete chat:', error);
            UI.showToast('Failed to delete chat', 'error');
        }
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        this.currentChatId = null;
        
        if (this.chatTitle) {
            this.chatTitle.textContent = 'Welcome to Nebula Chat';
        }
        
        if (this.chatStatus) {
            this.chatStatus.textContent = 'Create a new chat to get started';
        }
        
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-star"></i>
                    <h3>Welcome to Nebula Chat</h3>
                    <p>Your secure AI-powered conversation platform. Create a new chat to start chatting with AI.</p>
                </div>
            `;
        }
        
        this.disableInput();
    }

    /**
     * Show empty state for current chat
     */
    showEmptyState() {
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>Start the conversation</h3>
                    <p>Send a message to begin chatting with AI. Your conversation history will be preserved.</p>
                </div>
            `;
        }
    }

    /**
     * Enable input controls
     */
    enableInput() {
        if (this.messageInput) {
            this.messageInput.disabled = false;
            this.messageInput.placeholder = 'Type your message...';
        }
        this.handleInputChange();
    }

    /**
     * Disable input controls
     */
    disableInput() {
        if (this.messageInput) {
            this.messageInput.disabled = true;
            this.messageInput.placeholder = 'Select a chat to start messaging...';
        }
        
        if (this.sendButton) {
            this.sendButton.disabled = true;
        }
    }

    /**
     * Get current chat
     * @returns {Object|null} Current chat data
     */
    getCurrentChat() {
        return this.currentChatId ? this.chats.get(this.currentChatId) : null;
    }

    /**
     * Refresh current chat
     */
    async refreshCurrentChat() {
        if (this.currentChatId) {
            await this.loadChat(this.currentChatId);
        }
    }
}

// Initialize chat manager
document.addEventListener('DOMContentLoaded', () => {
    window.Chat = new ChatManager();
});