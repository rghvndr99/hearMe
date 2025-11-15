# Google Meet Scheduling - Simplified Setup

## ✅ What Was Changed

### 1. **Removed OAuth Complexity**
- ❌ Users NO LONGER need to connect their own Google Calendar
- ✅ Bookings are created on **VoiceLap's calendar** (rghvndr99@gmail.com)
- ✅ Users receive **email invites** with Google Meet links

### 2. **Frontend Changes**
- **Removed**: "Connect Google Calendar" button
- **Simplified**: Direct "Schedule Google Meet Session" button
- **Removed**: OAuth callback handling
- **Removed**: Google auth status checks
- **Updated**: Booking history shows for all users (not just those with Google connected)

### 3. **Backend Changes**
- **Removed**: OAuth routes (`/api/bookings/google/auth`, `/api/bookings/google/callback`)
- **Simplified**: `createCalendarEvent()` - no longer requires user's access tokens
- **Simplified**: `updateCalendarEvent()` - uses VoiceLap's calendar
- **Simplified**: `deleteCalendarEvent()` - uses VoiceLap's calendar
- **Updated**: Booking creation validates email/phone instead of Google auth

---

## 🚨 IMPORTANT: Setup Required

The Google Calendar integration will **NOT work** until you complete ONE of these setup options:

### **Option 1: Use Your Personal Google Account (Simpler for Testing)**

1. **Get OAuth tokens for rghvndr99@gmail.com**:
   - Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
   - Click ⚙️ (settings) → Check "Use your own OAuth credentials"
   - Enter your Client ID and Secret from `.env`
   - In Step 1: Select "Calendar API v3" → `https://www.googleapis.com/auth/calendar.events`
   - Click "Authorize APIs" and sign in with **rghvndr99@gmail.com**
   - In Step 2: Click "Exchange authorization code for tokens"
   - Copy the `access_token` and `refresh_token`

2. **Add tokens to `.env`**:
   ```bash
   GOOGLE_ADMIN_ACCESS_TOKEN=ya29.a0AfH6SMB...
   GOOGLE_ADMIN_REFRESH_TOKEN=1//0gHdP9...
   ```

3. **Restart backend**:
   ```bash
   cd backend
   npm run dev
   ```

### **Option 2: Use Service Account (Recommended for Production)**

1. **Create Service Account**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Go to **IAM & Admin** → **Service Accounts**
   - Click **Create Service Account**
   - Name: `voicelap-calendar-service`
   - Click **Create and Continue**
   - Skip role assignment → Click **Done**

2. **Create Key**:
   - Click on the service account you just created
   - Go to **Keys** tab → **Add Key** → **Create new key**
   - Choose **JSON** → Click **Create**
   - Save the downloaded JSON file as `google-service-account-key.json` in the backend folder

3. **Share Calendar with Service Account**:
   - Open [Google Calendar](https://calendar.google.com/)
   - Sign in with **rghvndr99@gmail.com**
   - Click ⚙️ → **Settings**
   - Select your calendar from the left sidebar
   - Scroll to **Share with specific people**
   - Click **Add people**
   - Enter the service account email (from the JSON file, looks like `voicelap-calendar-service@project-id.iam.gserviceaccount.com`)
   - Permission: **Make changes to events**
   - Click **Send**

4. **Update `.env`**:
   ```bash
   GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./google-service-account-key.json
   ```

5. **Update `backend/src/services/googleCalendar.js`**:
   Uncomment the service account code (lines 16-19) and comment out the OAuth code (lines 24-38)

6. **Restart backend**:
   ```bash
   cd backend
   npm run dev
   ```

---

## 🧪 Testing

1. **Start servers**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Test booking flow**:
   - Go to `http://localhost:5173/profile`
   - Click "📅 Schedule Google Meet Session"
   - Fill in date/time/duration
   - Submit

3. **Expected behavior**:
   - ✅ Event created on rghvndr99@gmail.com calendar
   - ✅ User receives email invite with Google Meet link
   - ✅ Booking appears in "My Bookings" section
   - ✅ User can reschedule or cancel (24-hour policy applies)

---

## 📝 Notes

- **Email required**: Users must have an email in their profile to receive invites
- **Phone optional**: Phone number is included in event description for reference
- **Calendar**: All events are created on `rghvndr99@gmail.com` calendar
- **Invites**: Users are added as attendees and receive email notifications
- **Meet links**: Google automatically generates Meet links for each event

---

## 🔧 Troubleshooting

**Error: "Failed to create Google Meet"**
- Check that you've completed one of the setup options above
- Verify tokens/service account credentials in `.env`
- Check backend logs for detailed error messages

**User not receiving invite**
- Verify user has email in their profile
- Check spam folder
- Verify calendar sharing permissions (for service account)

**401 Authentication Error**
- Refresh token may have expired (Option 1)
- Re-run OAuth Playground to get new tokens
- Or switch to Service Account (Option 2)

