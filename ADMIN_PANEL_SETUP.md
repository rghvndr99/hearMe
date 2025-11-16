# Admin Panel Setup Guide

## ✅ What Has Been Implemented

I've successfully created a complete admin panel for managing payment verifications. Here's what's been added:

### Backend Changes

1. **User Model** (`backend/src/models/User.js`)
   - Added `isAdmin` field (Boolean, default: false, indexed)

2. **Admin Middleware** (`backend/src/middleware/adminAuth.js`) - NEW FILE
   - Verifies user is authenticated AND has admin privileges
   - Returns 403 if user is not an admin

3. **Admin Routes** (`backend/src/routes/admin.js`) - NEW FILE
   - `GET /api/admin/subscriptions/pending` - List all pending verification subscriptions with user details
   - `POST /api/admin/subscriptions/approve` - Bulk approve subscriptions
   - `POST /api/admin/subscriptions/:id/reject` - Reject a subscription
   - `GET /api/admin/stats` - Get dashboard statistics

4. **Server Configuration** (`backend/src/server.js`)
   - Registered admin routes at `/api/admin`

5. **Admin Script** (`backend/scripts/make_admin.js`) - NEW FILE
   - Command-line tool to make any user an admin

### Frontend Changes

1. **Admin Login Page** (`frontend/src/pages/AdminLogin.jsx`) - NEW FILE
   - Simple login form for admin access
   - Stores token in `vl-admin-token` localStorage key
   - Redirects to dashboard on success

2. **Admin Dashboard** (`frontend/src/pages/AdminDashboard.jsx`) - NEW FILE
   - Shows statistics: Pending Verifications, Active Subscriptions, Total Revenue
   - Table displaying all pending subscriptions with:
     - User name, email
     - Plan and billing cycle
     - Amount
     - Transaction ID
     - Submission date
   - Bulk selection with checkboxes
   - "Approve Selected" button for bulk approval
   - Auto-refresh after approval

3. **Router Configuration** (`frontend/src/main.jsx`)
   - Added routes:
     - `/admin/login` - Admin login page
     - `/admin/dashboard` - Admin dashboard

---

## 🚀 How to Use

### Step 1: Make a User an Admin

First, you need to make your account an admin. Run this command:

```bash
node backend/scripts/make_admin.js <your-username>
```

**Example:**
```bash
node backend/scripts/make_admin.js rghvndr99
```

**Output:**
```
Connected to MongoDB
✅ User "rghvndr99" is now an admin!
User ID: 507f1f77bcf86cd799439011
Email: raghvendra_dixit@condenast.com
```

### Step 2: Login to Admin Panel

1. Navigate to: `http://localhost:5173/admin/login`
2. Enter your username and password
3. Click "Login"
4. You'll be redirected to the admin dashboard

### Step 3: Approve Pending Payments

1. The dashboard shows all subscriptions with status `pending_verification`
2. You can see:
   - User details (name, email)
   - Plan and amount
   - Transaction ID submitted by user
   - Date of submission
3. Select subscriptions using checkboxes:
   - Click individual checkboxes to select specific subscriptions
   - Click the header checkbox to select all
4. Click "Approve Selected (X)" button
5. Subscriptions will be updated to `active` status
6. Users will immediately see their active subscription in their profile page

---

## 🔄 What Happens When You Approve

When you approve a subscription:

1. **Subscription Status Changes:**
   - `status`: `pending_verification` → `active`
   - `verifiedAt`: Set to current timestamp
   - `verifiedBy`: Set to your admin user ID
   - `activatedAt`: Set to current timestamp

2. **User Profile Updates Automatically:**
   - The verification alert banner disappears
   - Status badge changes from "Pending Verification" (orange) to "Active" (green)
   - User can now use their subscription features

---

## 📊 Dashboard Features

### Statistics Cards
- **Pending Verifications**: Count of subscriptions awaiting approval
- **Active Subscriptions**: Total active subscriptions
- **Total Revenue**: Sum of all active subscription prices

### Subscription Table
- **Columns**: Checkbox, User, Plan, Amount, Transaction ID, Date
- **Sorting**: Most recent submissions first
- **Pagination**: Supports up to 50 items per page (can be extended)

### Bulk Actions
- Select multiple subscriptions at once
- Approve all selected with one click
- Counter shows how many are selected

---

## 🔐 Security

- Admin routes are protected by TWO middlewares:
  1. `auth` - Verifies JWT token
  2. `adminAuth` - Verifies user has `isAdmin: true`
- Non-admin users get 403 Forbidden error
- Tokens are stored separately (`vl-admin-token`)

---

## 🎯 Next Steps (Optional Enhancements)

If you want to add more features later:

1. **Email Notifications**
   - Send email to user when subscription is approved
   - Send email when subscription is rejected

2. **Rejection Reason**
   - Add UI to reject subscriptions with a reason
   - Store rejection reason in database

3. **Transaction Proof Upload**
   - Allow users to upload screenshot of payment
   - Display screenshot in admin dashboard

4. **Search & Filter**
   - Search by transaction ID
   - Filter by plan type
   - Filter by date range

5. **Admin Activity Log**
   - Track all admin actions
   - Show who approved what and when

---

## 🐛 Troubleshooting

### "Access denied. Admin privileges required"
- Make sure you ran the `make_admin.js` script for your user
- Check that you're logged in with the correct account

### "No pending verifications"
- This means all subscriptions have been processed
- Users need to submit new payments to see them here

### Dashboard not loading
- Check that backend is running on port 5001
- Check browser console for errors
- Verify your token is valid (try logging in again)

---

## ✅ Summary

You now have a fully functional admin panel where you can:
- ✅ Login as admin
- ✅ View all pending payment verifications
- ✅ See user details and transaction IDs
- ✅ Approve subscriptions in bulk
- ✅ View dashboard statistics
- ✅ Users automatically see their active subscription after approval

**The payment verification workflow is now complete!** 🎉

