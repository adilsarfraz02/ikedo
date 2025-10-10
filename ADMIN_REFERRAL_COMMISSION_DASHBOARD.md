# Admin Referral & Commission Dashboard Documentation

## Overview
This feature provides a comprehensive admin dashboard to view and manage the entire referral system and commission data for all users.

## ✅ Completed Features

### 1. Admin-Only Sidebar Navigation
**File:** `src/components/Sidebar.jsx`
- ✅ "Payments" link now only visible to admin users
- ✅ Conditional rendering based on `data?.isAdmin`
- ✅ Works on both desktop and mobile views

### 2. Admin API Endpoint
**File:** `src/app/api/admin/referrals-commissions/route.js`
- ✅ Secure admin-only access with authentication check
- ✅ Fetches all users' referral and commission data
- ✅ Calculates comprehensive statistics

**Endpoint:** `GET /api/admin/referrals-commissions`

**Response Data:**
```javascript
{
  stats: {
    totalReferrals: number,
    totalCommissionsPaid: number,
    totalWalletBalance: number,
    activeReferrers: number,
    todayEarnings: number,
    todayCommissionsCount: number
  },
  topReferrers: Array<{
    _id, username, email, image,
    referralCount, totalEarnings,
    walletBalance, referralCode
  }>,
  commissionByType: {
    referral: number,
    plan_purchase: number,
    daily_bonus: number
  },
  commissionTimeline: Array<{
    date: string,
    amount: number,
    count: number
  }>, // Last 7 days
  userCommissions: Array<{
    user, commissions,
    totalAmount, todayAmount
  }>,
  allUsers: Array<User>,
  recentCommissions: Array<Commission> // Last 50
}
```

### 3. Comprehensive Admin Dashboard Component
**File:** `src/app/dashboard/components/AdminReferralCommissionDashboard.jsx`

**Features:**
- ✅ **Statistics Overview Cards:**
  - Total Referrals & Active Referrers
  - Total Commissions Paid (lifetime)
  - Today's Earnings & Commission Count
  - Total Wallet Balance (all users)

- ✅ **Interactive Charts:**
  - Line Chart: Commission timeline (last 7 days) showing amount and count
  - Pie Chart: Commission breakdown by type (referral, plan purchase, daily bonus)

- ✅ **Top 10 Referrers Table:**
  - Ranked by referral count
  - Shows username, email, referral code
  - Displays referral count, total earnings, wallet balance
  - Copy referral code button with success indicator

- ✅ **All Users Referral System Table:**
  - Searchable by username or email
  - Shows user info, referral code, plan type
  - Displays referral count, earnings (today/total), wallet balance
  - Verification status chip
  - Copy referral URL button

- ✅ **Recent Commissions Table (Last 50):**
  - Date and time of commission
  - Earner and referred user info with avatars
  - Commission type with color-coded chips
  - Amount and description

### 4. Admin Dashboard Integration
**File:** `src/app/dashboard/components/AdminDashboard.jsx`
- ✅ Imported and integrated AdminReferralCommissionDashboard
- ✅ Displayed below existing admin charts and user table
- ✅ Seamless integration with existing layout

## 🎨 UI Components Used

### NextUI Components:
- `Card`, `CardBody`, `CardHeader`
- `Avatar`
- `Chip` (with color variants)
- `Input` (for search)

### Shadcn UI Components:
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `Skeleton` (loading states)

### Recharts (Data Visualization):
- `LineChart` with `Line`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- `PieChart` with `Pie`, `Cell`
- `ResponsiveContainer`, `CartesianGrid`

### Lucide Icons:
- `Users`, `DollarSign`, `TrendingUp`, `Award`, `Calendar`
- `Copy`, `CheckCircle2`

## 🔒 Security Features

1. **Admin Authentication:**
   - API endpoint checks if user is authenticated
   - Verifies `isAdmin` status from database
   - Returns 401 (Unauthorized) or 403 (Forbidden) for non-admin users

2. **Data Protection:**
   - Only non-admin users' data is returned
   - Sensitive fields are filtered using `.select()`
   - Token-based authentication via `getDataFromToken`

## 📊 Key Metrics Tracked

1. **Referral Metrics:**
   - Total referrals across all users
   - Active referrers count
   - Top 10 referrers by performance
   - Individual user referral counts

2. **Commission Metrics:**
   - Total commissions paid (lifetime)
   - Today's earnings
   - Commission breakdown by type
   - 7-day commission timeline
   - Per-user commission details

3. **Financial Metrics:**
   - Total wallet balance (all users)
   - Individual wallet balances
   - Today's earnings per user
   - Total earnings per user

## 🎯 User Features

### For Admins:

1. **Quick Overview:**
   - View system-wide statistics at a glance
   - Monitor today's activity vs historical data
   - Identify top performers

2. **Detailed Analysis:**
   - Track commission trends over time
   - Understand commission distribution by type
   - Analyze user performance individually

3. **User Management:**
   - Search users by name or email
   - View referral links and codes
   - Copy referral information for support
   - Check verification status

4. **Transaction Monitoring:**
   - See recent commission transactions
   - Track commission flow between users
   - Verify commission types and amounts

## 🔧 How to Use

### Accessing the Dashboard:
1. Login as an admin user
2. Navigate to `/dashboard`
3. Scroll down to see "Referral & Commission System" section
4. Explore different tables and charts

### Searching Users:
1. Use search bar in "All Users Referral System" section
2. Type username or email
3. Results filter in real-time

### Copying Referral Information:
1. Click copy icon next to referral code
2. Success toast notification appears
3. Checkmark icon shows for 2 seconds

### Understanding Charts:
- **Timeline Chart:** Shows daily commission trends
  - Blue line: Amount earned (Rs)
  - Green line: Number of commissions
- **Pie Chart:** Shows commission distribution
  - Hover for percentages
  - Legend shows commission types

## 📱 Responsive Design

- ✅ Mobile-friendly tables with horizontal scroll
- ✅ Responsive grid layouts for cards
- ✅ Charts adapt to container width
- ✅ Touch-friendly buttons and interactions

## 🚀 Performance Optimizations

1. **Efficient Queries:**
   - Indexed database fields (userId, createdAt)
   - Limited data fetching (last 50 commissions)
   - Selective field projection with `.select()`

2. **Client-Side:**
   - Real-time search filtering
   - Conditional rendering
   - Optimized state management

3. **Caching:**
   - Data fetched once on component mount
   - Manual refresh if needed

## 🔮 Future Enhancements (Optional)

1. **Export Functionality:**
   - Export commission reports to CSV/Excel
   - Generate PDF reports

2. **Date Range Filters:**
   - Custom date range selection
   - Compare different time periods

3. **Advanced Analytics:**
   - Conversion rate metrics
   - Referral source tracking
   - Performance trends analysis

4. **Real-Time Updates:**
   - WebSocket integration
   - Live commission notifications

5. **Email Reports:**
   - Scheduled weekly/monthly reports
   - Commission milestone alerts

## 🐛 Troubleshooting

### Dashboard not loading:
- Check if user is admin (`data?.isAdmin === true`)
- Verify API endpoint is accessible
- Check browser console for errors

### Data not showing:
- Ensure users have referral codes generated
- Check if commissions exist in database
- Verify commission status is "approved"

### Search not working:
- Check if search term is correct
- Verify users exist with matching criteria
- Clear search and try again

## 📝 Notes

- Only verified commissions (status: "approved") are displayed
- Admin users are excluded from user lists
- Dates are formatted in locale-specific format
- All amounts are displayed in Pakistani Rupees (Rs)
- Referral codes are username-based for better readability

## 🎓 Code Examples

### Fetching Data:
```javascript
const response = await fetch("/api/admin/referrals-commissions");
const data = await response.json();
```

### Copying to Clipboard:
```javascript
navigator.clipboard.writeText(text);
toast.success("Copied to clipboard!");
```

### Filtering Users:
```javascript
const filtered = users.filter((user) =>
  user.username.toLowerCase().includes(searchTerm.toLowerCase())
);
```

---

## Summary

This admin dashboard provides a complete view of the referral and commission system, enabling administrators to:
- Monitor system performance
- Track user engagement
- Analyze commission flow
- Support users with referral information
- Make data-driven decisions

All features are secure, responsive, and optimized for performance! 🎉
