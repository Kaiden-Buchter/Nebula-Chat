# Security Configuration for Nebula Chat

This document outlines the security measures and configuration for Nebula Chat.

## 🔒 Security Architecture

### Overview

Nebula Chat implements multiple layers of security:

1. **Frontend Authentication**: Password-protected access with secure token storage
2. **Backend Authorization**: JWT-based API protection
3. **API Key Protection**: OpenAI keys never exposed to client
4. **CORS Protection**: Configurable origin restrictions
5. **Input Validation**: Comprehensive sanitization and validation
6. **Rate Limiting**: Request throttling and abuse prevention

## 🛡️ Frontend Security

### Authentication Flow

1. User enters password in protected modal
2. Password sent securely to backend via HTTPS
3. Backend validates and returns JWT tokens
4. Tokens stored securely in localStorage
5. All subsequent API calls include Bearer token

### Token Management

```javascript
// Secure token storage
const tokenData = {
  accessToken: "jwt_token",
  refreshToken: "refresh_token", 
  timestamp: Date.now()
};
localStorage.setItem('nebula_token', JSON.stringify(tokenData));
```

### Security Features

- **No API Key Exposure**: OpenAI API key never sent to frontend
- **Automatic Token Refresh**: Tokens refreshed before expiration
- **Secure Storage**: Sensitive data encrypted in localStorage
- **Input Sanitization**: All user inputs sanitized and validated
- **XSS Protection**: HTML escaping and content filtering

## 🔐 Backend Security

### JWT Implementation

```javascript
// Token structure
{
  "sub": "user_id",           // Subject (user identifier)
  "iat": 1697461200,          // Issued at
  "exp": 1697464800,          // Expires at
  "type": "access"            // Token type
}
```

### Token Security

- **HMAC SHA-256 Signing**: Cryptographically secure signatures
- **Short Expiration**: Access tokens expire in 1 hour
- **Refresh Tokens**: Longer-lived tokens for seamless renewal
- **Secure Secrets**: JWT secrets should be cryptographically random

### API Protection

```javascript
// All protected endpoints verify JWT
const authResult = await authManager.verifyToken(request, env.API_SECRET);
if (!authResult.success) {
  return createResponse({ error: 'Unauthorized' }, 401);
}
```

## 🌐 Network Security

### CORS Configuration

```javascript
// Restrictive CORS for production
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};
```

### Environment Variables

| Variable | Purpose | Security Level |
|----------|---------|----------------|
| `OPENAI_API_KEY` | AI service access | 🔴 Critical |
| `AUTH_PASSWORD` | Frontend authentication | 🔴 Critical |
| `API_SECRET` | JWT signing | 🔴 Critical |
| `ALLOWED_ORIGINS` | CORS restriction | 🟡 Important |

### HTTPS Enforcement

- All communications over HTTPS only
- Cloudflare automatic SSL/TLS
- HSTS headers for additional protection
- Secure cookie flags when applicable

## 🛡️ Input Validation & Sanitization

### Message Validation

```javascript
// Backend message sanitization
function sanitizeMessage(message) {
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid message format');
  }
  
  const trimmed = message.trim();
  
  if (trimmed.length === 0) {
    throw new Error('Message cannot be empty');
  }
  
  if (trimmed.length > 4000) {
    throw new Error('Message too long');
  }
  
  return trimmed;
}
```

### Content Filtering

```javascript
// Basic content safety checks
const forbiddenPatterns = [
  /\b(hack|exploit|vulnerability)\b/i,
  /\b(bypass|circumvent)\b.*\b(security|protection)\b/i
];

for (const pattern of forbiddenPatterns) {
  if (pattern.test(message)) {
    throw new Error('Message contains inappropriate content');
  }
}
```

### HTML Escaping

```javascript
// Prevent XSS attacks
function escapeHtml(text) {
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
}
```

## ⚡ Rate Limiting

### Implementation

```javascript
class RateLimiter {
  constructor() {
    this.windowMs = 60000;      // 1 minute window
    this.maxRequests = 100;     // 100 requests per window
  }
  
  checkLimit(identifier) {
    // Rate limiting logic
    const now = Date.now();
    const requests = this.getRequests(identifier);
    
    if (requests.length >= this.maxRequests) {
      return { allowed: false, resetTime: now + this.windowMs };
    }
    
    return { allowed: true, remaining: this.maxRequests - requests.length };
  }
}
```

### Rate Limit Headers

```javascript
// Response headers for rate limiting
{
  'X-RateLimit-Limit': '100',
  'X-RateLimit-Remaining': '95',
  'X-RateLimit-Reset': '1697461800'
}
```

## 🔍 Security Monitoring

### Logging Strategy

```javascript
// Security event logging
const securityLogger = {
  authFailure: (ip, timestamp) => {
    console.warn(`[SECURITY] Auth failure from ${ip} at ${timestamp}`);
  },
  rateLimitExceeded: (ip, endpoint) => {
    console.warn(`[SECURITY] Rate limit exceeded: ${ip} -> ${endpoint}`);
  },
  suspiciousActivity: (ip, activity) => {
    console.error(`[SECURITY] Suspicious activity: ${ip} - ${activity}`);
  }
};
```

### Monitoring Metrics

- Failed authentication attempts
- Rate limit violations
- Unusual request patterns
- Error rates and types
- Token refresh frequency

## 🚨 Incident Response

### Security Breach Response

1. **Immediate Actions**
   - Rotate all API keys and secrets
   - Revoke active JWT tokens
   - Enable additional logging
   - Block suspicious IPs if necessary

2. **Investigation**
   - Review Cloudflare logs
   - Check for data access patterns
   - Verify integrity of stored data
   - Document findings

3. **Recovery**
   - Deploy security patches
   - Update authentication credentials
   - Notify users if necessary
   - Implement additional safeguards

### Emergency Procedures

```bash
# Emergency key rotation
wrangler secret put OPENAI_API_KEY    # New OpenAI key
wrangler secret put API_SECRET        # New JWT secret
wrangler secret put AUTH_PASSWORD     # New auth password

# Force logout all users (by rotating JWT secret)
# Users will need to re-authenticate
```

## 🔧 Security Configuration Checklist

### Production Deployment

- [ ] **Strong Passwords**: Use cryptographically secure passwords
- [ ] **Secure Secrets**: Generate random JWT secrets (32+ bytes)
- [ ] **CORS Restriction**: Set specific allowed origins only
- [ ] **HTTPS Only**: Ensure all communications over HTTPS
- [ ] **Rate Limiting**: Configure appropriate request limits
- [ ] **Input Validation**: Implement comprehensive validation
- [ ] **Error Handling**: Avoid information disclosure in errors
- [ ] **Monitoring**: Set up security event monitoring
- [ ] **Updates**: Keep dependencies and runtime updated

### Environment Security

```bash
# Generate secure API secret
openssl rand -base64 32

# Generate secure auth password
openssl rand -base64 16

# Verify HTTPS configuration
curl -I https://your-worker.workers.dev/api/health
```

### Security Headers

```javascript
// Additional security headers
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

## 🔐 Encryption & Secrets Management

### JWT Secret Requirements

- **Length**: Minimum 256 bits (32 bytes)
- **Randomness**: Cryptographically secure random generation
- **Rotation**: Regular rotation recommended (monthly)
- **Storage**: Secure environment variable storage only

### Password Security

```javascript
// Password strength requirements
const passwordRequirements = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  noCommonPasswords: true
};
```

### Secure Storage Practices

- Never commit secrets to version control
- Use Cloudflare Workers secrets management
- Implement secret rotation procedures
- Use different secrets for different environments
- Monitor secret access and usage

## 🛡️ Data Protection

### Data Encryption

- **In Transit**: HTTPS/TLS 1.3 encryption
- **At Rest**: Cloudflare KV encrypted storage
- **Processing**: Memory-only processing, no disk writes

### Privacy Protection

- **Data Isolation**: User data completely isolated
- **No Cross-Access**: Impossible to access other users' data
- **Minimal Storage**: Only necessary data stored
- **Retention Policy**: Configurable data retention periods

### GDPR Compliance

```javascript
// Data export functionality
async function exportUserData(userId) {
  return {
    exportDate: new Date().toISOString(),
    userId: userId,
    chats: await getUserChats(userId),
    requestType: 'GDPR_DATA_EXPORT'
  };
}

// Data deletion functionality
async function deleteAllUserData(userId) {
  // Complete user data removal
  await deleteAllChats(userId);
  await removeUserProfile(userId);
}
```

## 📋 Security Testing

### Penetration Testing Checklist

- [ ] **Authentication Bypass**: Test auth circumvention
- [ ] **JWT Security**: Verify token validation
- [ ] **CORS Bypass**: Test origin restrictions
- [ ] **Rate Limit Bypass**: Verify throttling works
- [ ] **Input Validation**: Test injection attacks
- [ ] **XSS Prevention**: Test script injection
- [ ] **CSRF Protection**: Verify cross-site protections
- [ ] **Error Information**: Check for data leaks in errors

### Automated Security Scanning

```bash
# OWASP ZAP scanning
zap-cli quick-scan https://your-worker.workers.dev

# SSL/TLS testing
testssl.sh https://your-worker.workers.dev

# Security headers testing
curl -I https://your-worker.workers.dev | grep -i security
```

## 🚀 Security Best Practices

### Development Practices

1. **Principle of Least Privilege**: Minimal necessary permissions
2. **Defense in Depth**: Multiple security layers
3. **Fail Securely**: Secure defaults when errors occur
4. **Input Validation**: Validate all inputs client and server-side
5. **Output Encoding**: Encode all outputs appropriately
6. **Error Handling**: Don't leak sensitive information
7. **Logging**: Log security events for monitoring
8. **Testing**: Regular security testing and reviews

### Operational Security

1. **Regular Updates**: Keep all dependencies current
2. **Secret Rotation**: Regular rotation of all secrets
3. **Access Control**: Limit who has deployment access
4. **Monitoring**: Continuous security monitoring
5. **Backups**: Secure backup procedures
6. **Incident Response**: Prepared incident response plan
7. **Documentation**: Keep security documentation updated
8. **Training**: Regular security training for developers

---

**⚠️ Important**: Security is an ongoing process. Regularly review and update these configurations as threats evolve and new security best practices emerge.