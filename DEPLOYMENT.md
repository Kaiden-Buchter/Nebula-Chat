# Deployment Guide for Nebula Chat

This guide will help you deploy Nebula Chat to Cloudflare Workers and GitHub Pages.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **GitHub Account**: Sign up at [github.com](https://github.com)
3. **OpenAI API Key**: Get one from [platform.openai.com](https://platform.openai.com)
4. **Node.js**: Install from [nodejs.org](https://nodejs.org) (version 16 or higher)

## Part 1: Deploy Backend to Cloudflare Workers

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

### Step 3: Create KV Namespace

```bash
wrangler kv:namespace create "NEBULA_CHAT_KV"
wrangler kv:namespace create "NEBULA_CHAT_KV" --preview
```

Note the namespace IDs returned by these commands.

### Step 4: Update wrangler.toml

1. Open `backend/wrangler.toml`
2. Replace the KV namespace IDs with the ones from Step 3
3. Update the worker name if desired

### Step 5: Set Environment Variables

Go to your Cloudflare dashboard and set these variables:

```bash
# Option 1: Using Wrangler CLI
wrangler secret put OPENAI_API_KEY
wrangler secret put AUTH_PASSWORD
wrangler secret put API_SECRET

# Option 2: Using Cloudflare Dashboard
# Go to Workers & Pages > Your Worker > Settings > Variables
```

**Required Environment Variables:**
- `OPENAI_API_KEY`: Your OpenAI API key (starts with sk-)
- `AUTH_PASSWORD`: Choose a secure password for frontend access
- `API_SECRET`: A random string for JWT token signing (generate with: `openssl rand -base64 32`)
- `ALLOWED_ORIGINS`: (Optional) Comma-separated list of allowed origins

### Step 6: Deploy the Worker

```bash
cd backend
npm install
wrangler deploy
```

Your worker will be deployed to: `https://your-worker-name.your-subdomain.workers.dev`

## Part 2: Deploy Frontend to GitHub Pages

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and create a new repository
2. Clone the repository to your local machine

### Step 2: Update Frontend Configuration

1. Open `frontend/js/config.js`
2. Update `API_BASE_URL` to your Cloudflare Worker URL:
   ```javascript
   API_BASE_URL: 'https://your-worker-name.your-subdomain.workers.dev'
   ```

### Step 3: Upload Frontend Files

1. Copy all files from the `frontend/` directory to your GitHub repository
2. Commit and push the changes:

```bash
git add .
git commit -m "Initial commit: Nebula Chat frontend"
git push origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** > **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**

Your site will be available at: `https://yourusername.github.io/your-repo-name`

## Part 3: Configuration and Testing

### Step 1: Test the Deployment

1. Visit your GitHub Pages URL
2. Enter the password you set in `AUTH_PASSWORD`
3. Create a new chat and send a message
4. Verify that the AI responds correctly

### Step 2: Custom Domain (Optional)

#### For GitHub Pages:
1. Add a `CNAME` file to your repository root with your domain
2. Configure DNS to point to `yourusername.github.io`
3. Enable HTTPS in Pages settings

#### For Cloudflare Worker:
1. Add a route in `wrangler.toml`:
   ```toml
   [[routes]]
   pattern = "api.yourdomain.com/*"
   zone_name = "yourdomain.com"
   ```
2. Update `ALLOWED_ORIGINS` to include your custom domain

### Step 3: Security Configuration

1. **CORS Origins**: Update `ALLOWED_ORIGINS` to only include your frontend domains
2. **Strong Password**: Use a secure password for `AUTH_PASSWORD`
3. **JWT Secret**: Use a cryptographically secure random string for `API_SECRET`
4. **API Key Security**: Never expose your OpenAI API key in frontend code

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-...` |
| `AUTH_PASSWORD` | Frontend access password | `mySecurePassword123!` |
| `API_SECRET` | JWT signing secret | `abc123...` |
| `ALLOWED_ORIGINS` | Allowed frontend origins | `https://mysite.com,https://mysite.pages.dev` |

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Check `ALLOWED_ORIGINS` environment variable
2. **Authentication Fails**: Verify `AUTH_PASSWORD` is set correctly
3. **AI Not Responding**: Check `OPENAI_API_KEY` and OpenAI account status
4. **Token Errors**: Regenerate `API_SECRET` with a new random string

### Debug Mode:

Enable debug mode in the frontend by opening browser console and typing:
```javascript
enableDebug()
```

### Logs:

View Cloudflare Worker logs:
```bash
wrangler tail
```

## Production Checklist

- [ ] Backend deployed to Cloudflare Workers
- [ ] Frontend deployed to GitHub Pages
- [ ] All environment variables set securely
- [ ] CORS configured for your domain only
- [ ] Custom domains configured (if applicable)
- [ ] HTTPS enabled
- [ ] Testing completed
- [ ] Password is secure and shared with authorized users only

## Security Best Practices

1. **Use HTTPS everywhere**
2. **Set restrictive CORS origins**
3. **Use strong, unique passwords**
4. **Regularly rotate API keys and secrets**
5. **Monitor usage and costs**
6. **Keep dependencies updated**

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Cloudflare Workers documentation
3. Check OpenAI API status and documentation
4. Refer to the main README.md for detailed API documentation

---

**🎉 Congratulations!** Your Nebula Chat platform is now deployed and ready to use!