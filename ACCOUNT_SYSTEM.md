# 🌟 Nebula Chat Account System

Your Nebula Chat now has a proper account system with username/password authentication! Here's how it works:

## 🔐 How the New System Works

### Automatic Admin Creation
- When the system starts for the first time, it automatically creates an **admin** account
- Username: `admin`
- Password: Your `ADMIN_PASSWORD` from the environment variables (currently: `123456`)

### User Accounts
- Each user now has their own username and password
- **Your chats are tied to your user account** - no more losing chats when you log out!
- Users can have different roles (admin/user)

## 👤 Creating New Accounts

### Method 1: Account Creator Tool (Easiest)
1. Open `account-creator.html` in your browser
2. Fill in:
   - **Admin Password**: `123456` (your ADMIN_PASSWORD)
   - **Username**: The new user's username
   - **Password**: The new user's password
   - **Display Name**: Optional friendly name
   - **Email**: Optional email address
   - **API URL**: `https://nebula-chat-worker.knbuchtyy879.workers.dev`
3. Click "Create Account"

### Method 2: Admin Panel (In the App)
1. Log in as admin (username: `admin`, password: `123456`)
2. You'll see an "Admin Panel" button in the sidebar
3. Click it to open the admin interface
4. Use the "Create User" tab to add new accounts
5. Use the "Manage Users" tab to see all existing accounts

### Method 3: Direct API Call
```bash
curl -X POST https://nebula-chat-worker.knbuchtyy879.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "password": "securepassword",
    "displayName": "New User",
    "email": "user@example.com",
    "adminKey": "123456"
  }'
```

## 🚀 Getting Started

### Step 1: Log in as Admin
1. Go to your Nebula Chat: https://kaiden-buchter.github.io/Nebula-Chat/
2. Use these credentials:
   - **Username**: `admin`
   - **Password**: `123456`

### Step 2: Create User Accounts
- Use any of the methods above to create accounts for yourself and others
- **Recommendation**: Create a personal account for daily use and keep the admin account for management

### Step 3: Start Chatting!
- Log out and log back in with your new personal account
- Your chats will now be saved to your account permanently!

## 🔧 Configuration

### Environment Variables
The backend now uses these environment variables:
- `ADMIN_PASSWORD` - Password for admin account creation and user registration (replaces `AUTH_PASSWORD`)
- `API_SECRET` - Still used for JWT token signing
- `OPENAI_API_KEY` - Still used for AI responses

### Current Settings
- Admin Password: `123456`
- Your backend URL: `https://nebula-chat-worker.knbuchtyy879.workers.dev`
- Your frontend URL: `https://kaiden-buchter.github.io/Nebula-Chat/`

## 🛡️ Security Features

- **Password Hashing**: All passwords are securely hashed with salt
- **JWT Authentication**: Same secure token system as before
- **Account Isolation**: Each user's chats are completely separate
- **Admin-Only Registration**: Only admins can create new accounts (no public registration)

## 📱 What Changed for Users

### Before (Old System):
- Single password for everyone
- Chats lost when logging out
- No user identity

### After (New System):
- Personal username/password
- **Persistent chats tied to your account**
- User profiles and roles
- Admin management interface

## 🎯 Quick Account Creation Examples

### For yourself:
- Username: `kaide` 
- Password: `mypassword123`
- Display Name: `Kaide`

### For a friend:
- Username: `friend1`
- Password: `friendpass456`
- Display Name: `My Friend`

## 💡 Tips

1. **Keep the admin account secure** - use it only for creating/managing users
2. **Create personal accounts** for daily use
3. **Use strong passwords** for all accounts
4. **The display name** is what shows in the UI (can be different from username)
5. **Usernames are case-insensitive** and stored in lowercase

## 🔑 Default Admin Account

**Username**: `admin`  
**Password**: `123456`  
**Role**: Administrator

**⚠️ Important**: Change the admin password by updating `ADMIN_PASSWORD` in your Cloudflare Worker environment variables if you want better security.

## 🔧 Troubleshooting

### CORS Errors
If you get CORS errors when trying to create accounts:
1. Make sure your local server URL is included in `ALLOWED_ORIGINS`
2. Current allowed origins: `https://detailingzone.org,http://127.0.0.1:5500,https://kaiden-buchter.github.io/Nebula-Chat/`
3. If using a different port, update the backend configuration

### Username Field Not Visible
If the username field doesn't appear in the login form:
1. Clear your browser cache
2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
3. Check browser developer console for any JavaScript errors

### Can't Create Admin Account
If the admin account doesn't auto-create:
1. Check that `ADMIN_PASSWORD` is set in your environment variables
2. The admin account is created on first backend startup
3. Try making any API call to trigger initialization

---

Your chat history is now safe and tied to your account! No more losing conversations when you log out. Enjoy your new persistent, secure chat experience! 🎉