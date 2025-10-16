# Nebula Chat - Secure AI Chat Platform

Nebula Chat is a modern, secure AI-powered chat platform with a dark theme and enterprise-grade security features. The platform consists of a password-protected frontend and a secure backend that can be deployed on Cloudflare Workers.

## 🌟 Features

- **Secure Authentication**: Password-protected access with custom modal
- **Multiple Chat Sessions**: Create and manage multiple conversations
- **Chat History**: Persistent chat storage with conversation context
- **Secure API**: Backend API with token-based authentication
- **Modern Dark UI**: Sleek dark theme with responsive design
- **Modular Architecture**: Clean, maintainable code structure
- **Zero Token Exposure**: OpenAI API keys never exposed to frontend

## 🏗️ Architecture

### Frontend (`frontend/`)
- **index.html**: Main application entry point
- **css/**: Stylesheets with dark theme
- **js/**: Modular JavaScript components
  - `auth.js`: Authentication handling
  - `chat.js`: Chat functionality
  - `api.js`: API communication
  - `ui.js`: UI management

### Backend (`backend/`)
- **worker.js**: Cloudflare Worker backend
- **config.js**: Configuration management
- **auth.js**: Authentication middleware
- **chat.js**: Chat processing logic
- **storage.js**: Data persistence

## 🔐 Security Features

1. **Password Protection**: Frontend requires password authentication
2. **API Token Security**: Secure token exchange between frontend/backend
3. **OpenAI Key Protection**: API keys only stored on backend
4. **CORS Protection**: Configured for specific origins
5. **Rate Limiting**: Built-in request throttling

## 🚀 Deployment

### Cloudflare Workers
1. Copy contents of `backend/worker.js`
2. Set environment variables in Cloudflare dashboard
3. Deploy to your worker

### GitHub Pages
1. Upload `frontend/` contents to GitHub repository
2. Enable GitHub Pages in repository settings
3. Configure custom domain if desired

## 📱 Usage

1. Navigate to your deployed frontend
2. Enter the configured password when prompted
3. Create new chat sessions or continue existing ones
4. Enjoy secure AI conversations with full chat history

## ⚙️ Configuration

### Environment Variables (Cloudflare Worker)
- `OPENAI_API_KEY`: Your OpenAI API key
- `AUTH_PASSWORD`: Password for frontend access
- `API_SECRET`: Secret key for API authentication

### Frontend Configuration
- Update API endpoint in `js/config.js`
- Customize theme colors in `css/variables.css`

## 📚 API Documentation

### Authentication
- `POST /api/auth`: Authenticate and get access token

### Chat Operations
- `GET /api/chats`: List all chat sessions
- `POST /api/chats`: Create new chat session
- `GET /api/chats/:id`: Get specific chat
- `POST /api/chats/:id/messages`: Send message to chat

## 🎨 Customization

The platform is designed to be easily customizable:
- **Colors**: Modify CSS variables in `css/variables.css`
- **Layout**: Update component styles in respective CSS files
- **Functionality**: Extend modular JavaScript components
- **API**: Add new endpoints in backend modules

## 🔧 Development

### Local Development
1. Use a local server for frontend development
2. Test backend logic before deploying to Cloudflare
3. Use environment variables for configuration

### Code Structure
- Clean separation of concerns
- Modular design for easy maintenance
- Comprehensive error handling
- Responsive design principles

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ for secure, modern AI conversations.