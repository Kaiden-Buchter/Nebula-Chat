# API Documentation - Nebula Chat

This document provides comprehensive API documentation for the Nebula Chat backend.

## Base URL

```
https://your-worker-name.your-subdomain.workers.dev
```

## Authentication

Nebula Chat uses JWT tokens for authentication. All protected endpoints require a valid access token in the Authorization header.

### Headers

```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true|false,
  "data": <response_data>,
  "error": "<error_message>",
  "timestamp": "2023-10-16T12:00:00.000Z"
}
```

## Authentication Endpoints

### POST /api/auth

Authenticate with password and receive access tokens.

**Request Body:**
```json
{
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
- `400`: Missing password
- `401`: Invalid password

### POST /api/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600
  }
}
```

**Error Responses:**
- `400`: Missing refresh token
- `401`: Invalid refresh token

### POST /api/logout

Logout (client-side token removal).

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

## Chat Management Endpoints

### GET /api/chats

Get all chat sessions for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "chat_1234567890_abc123",
      "title": "Chat about AI",
      "preview": "What is artificial intelligence?",
      "createdAt": "2023-10-16T10:00:00.000Z",
      "updatedAt": "2023-10-16T12:00:00.000Z",
      "messageCount": 4
    }
  ]
}
```

### POST /api/chats

Create a new chat session.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "New Chat Title" // optional, defaults to "New Chat"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "chat_1234567890_abc123",
    "userId": "user_1234567890",
    "title": "New Chat Title",
    "preview": "",
    "messages": [],
    "messageCount": 0,
    "createdAt": "2023-10-16T12:00:00.000Z",
    "updatedAt": "2023-10-16T12:00:00.000Z"
  }
}
```

### GET /api/chats/:id

Get a specific chat with all messages.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "chat_1234567890_abc123",
    "userId": "user_1234567890",
    "title": "Chat about AI",
    "preview": "What is artificial intelligence?",
    "messages": [
      {
        "id": "msg_1234567890_user",
        "role": "user",
        "content": "What is artificial intelligence?",
        "timestamp": "2023-10-16T10:00:00.000Z"
      },
      {
        "id": "msg_1234567891_assistant",
        "role": "assistant",
        "content": "Artificial intelligence (AI) refers to...",
        "timestamp": "2023-10-16T10:00:05.000Z"
      }
    ],
    "messageCount": 2,
    "createdAt": "2023-10-16T10:00:00.000Z",
    "updatedAt": "2023-10-16T10:00:05.000Z"
  }
}
```

**Error Responses:**
- `404`: Chat not found or not accessible

### PATCH /api/chats/:id

Update chat properties.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Chat Title"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated chat object
  }
}
```

### DELETE /api/chats/:id

Delete a chat session.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Chat deleted successfully"
  }
}
```

**Error Responses:**
- `404`: Chat not found

### POST /api/chats/:id/clear

Clear all messages from a chat.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Chat cleared successfully"
  }
}
```

## Message Endpoints

### POST /api/chats/:id/messages

Send a message to a chat and get AI response.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "Your message here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "AI response message",
    "chat": {
      // Updated chat object with new messages
    }
  }
}
```

**Error Responses:**
- `400`: Missing or empty message
- `404`: Chat not found
- `500`: AI service error

## Health Endpoint

### GET /api/health

Check API health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2023-10-16T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Headers**: Rate limit info is included in response headers
- **Exceeded**: Returns 429 status with retry information

## Data Models

### Chat Object

```typescript
interface Chat {
  id: string;                    // Unique chat identifier
  userId: string;                // Owner user ID
  title: string;                 // Chat title
  preview: string;               // Preview of last user message
  messages: Message[];           // Array of messages
  messageCount: number;          // Total message count
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
}
```

### Message Object

```typescript
interface Message {
  id: string;                    // Unique message identifier
  role: 'user' | 'assistant';    // Message sender
  content: string;               // Message content
  timestamp: string;             // ISO timestamp
}
```

### Token Response

```typescript
interface TokenResponse {
  accessToken: string;           // JWT access token
  refreshToken: string;          // JWT refresh token
  expiresIn: number;            // Token expiry in seconds
}
```

## Security Considerations

### CORS

The API implements CORS (Cross-Origin Resource Sharing) controls:
- Configurable allowed origins via `ALLOWED_ORIGINS` environment variable
- Default allows all origins (`*`) for development
- Production should restrict to specific domains

### Authentication

- JWT tokens expire after 1 hour
- Refresh tokens expire after 7 days
- Tokens are signed with HMAC SHA-256
- API secret should be cryptographically secure

### Data Privacy

- All user data is isolated by user ID
- No cross-user data access possible
- OpenAI API key never exposed to frontend
- All API communications over HTTPS

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI responses |
| `AUTH_PASSWORD` | Yes | Password for frontend authentication |
| `API_SECRET` | Yes | Secret for JWT token signing |
| `ALLOWED_ORIGINS` | No | Comma-separated allowed CORS origins |

## OpenAI Integration

### Model Configuration

- **Default Model**: `gpt-3.5-turbo`
- **Max Tokens**: 1000 per response
- **Temperature**: 0.7 (balanced creativity/consistency)
- **System Prompt**: Configurable AI personality

### Context Management

- Conversation history included in AI requests
- Recent messages prioritized (last 10 messages)
- Automatic token limit management
- Context trimming for long conversations

### Error Handling

- Graceful fallback responses for AI failures
- Network error retry logic
- Rate limit handling
- Invalid response detection

## Storage

### Cloudflare KV

The backend uses Cloudflare KV for data persistence:

- **Key Pattern**: `user_chats:{userId}` for chat lists
- **Key Pattern**: `chat:{chatId}` for individual chats
- **Consistency**: Eventually consistent
- **Limits**: 1000 writes per day (free tier)

### Data Structure

```
user_chats:{userId} -> Array of chat summaries
chat:{chatId} -> Full chat object with messages
```

## Testing

### Local Development

```bash
cd backend
npm install
wrangler dev
```

### Testing Endpoints

Use curl or your preferred HTTP client:

```bash
# Health check
curl https://your-worker.workers.dev/api/health

# Authentication
curl -X POST https://your-worker.workers.dev/api/auth \
  -H "Content-Type: application/json" \
  -d '{"password":"your-password"}'

# Get chats (with token)
curl https://your-worker.workers.dev/api/chats \
  -H "Authorization: Bearer your-token"
```

## Monitoring

### Cloudflare Analytics

Monitor your worker through Cloudflare dashboard:
- Request count and latency
- Error rates and status codes
- Geographic distribution
- CPU time usage

### Logging

View real-time logs:
```bash
wrangler tail
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check `ALLOWED_ORIGINS` environment variable
   - Ensure frontend domain is included

2. **Authentication Failures**
   - Verify `AUTH_PASSWORD` is set correctly
   - Check password in frontend config

3. **AI Not Responding**
   - Verify `OPENAI_API_KEY` is valid and has credits
   - Check OpenAI API status

4. **Token Errors**
   - Ensure `API_SECRET` is set and consistent
   - Check token expiration handling

### Debug Mode

Enable verbose logging by setting environment variable:
```
DEBUG=true
```

---

For more information, see the [DEPLOYMENT.md](DEPLOYMENT.md) guide.