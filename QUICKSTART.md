# Referral Commission System - Quick Start

## ✅ What's Been Implemented

### 1. **Automatic Daily Commission Updates**
   - Users with active plans receive daily returns automatically
   - Standard Plan: 5% daily return ($2.50/day on $50)
   - Pro Plan: 8% daily return ($8/day on $100)
   - Premium Plan: 10% daily return ($50/day on $500)

### 2. **Wallet System**
   - Real-time balance tracking
   - Separate tracking for total earnings and withdrawable amount
   - Today's earnings display
   - Commission history

### 3. **Referral Commissions**
   - 12% commission on referral plan purchases
   - Automatic commission calculation and crediting
   - Commission tracking with detailed history

### 4. **24-Hour Withdrawal System**
   - Bank details collection (account holder name, account number, bank name)
   - Automated email notifications to user and admin
   - Email includes complete bank details
   - Withdrawal history with status tracking
   - One-click admin verification

### 5. **Enhanced Dashboard**
   - Commission dashboard showing:
     - Wallet balance
     - Today's earnings
     - Total earnings
     - Today's commissions count
   - Real-time commission feed
   - Complete commission history table

## 🚀 Setup Instructions

### Step 1: Environment Variables

Add these to your `.env.local` file:

```env
# Existing variables
MONGODB_URI=your_mongodb_connection_string
DOMAIN=https://yourdomain.com
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@yourdomain.com
JWT_SECRET=your-jwt-secret

# New variables for commission system
CRON_SECRET=generate-a-random-secret-key-here
```

### Step 2: Install Dependencies

No new dependencies needed! The system uses existing packages.

### Step 3: Set Up Daily Cron Job

#### Option A: Vercel (Recommended)
The `vercel.json` file is already configured. Just deploy to Vercel.

#### Option B: External Cron Service
1. Sign up at https://cron-job.org/ (free)
2. Create new cron job:
   - **URL**: `https://yourdomain.com/api/commissions/daily-update`
   - **Method**: POST
   - **Schedule**: Daily at 00:00
   - **Headers**: 
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_CRON_SECRET
     ```

### Step 4: Test the System

#### Test Commission Tracking
```bash
# View commissions (requires authentication)
curl -X GET https://yourdomain.com/api/commissions \
  -H "Cookie: token=YOUR_TOKEN"
```

#### Test Daily Update Manually
```bash
curl -X POST https://yourdomain.com/api/commissions/daily-update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Test Withdrawal
1. Log in to your dashboard
2. Navigate to "Withdraw" section
3. Fill in the form with bank details
4. Submit withdrawal request
5. Check your email for confirmation
6. Admin receives email with bank details and verification link

## 📧 Email Notifications

### User Emails:
1. **Withdrawal Request Submitted**
   - Confirmation with bank details
   - 24-hour processing notice
   - Current request status

2. **Withdrawal Completed**
   - Payment confirmation
   - Bank details used for payment
   - Updated wallet balance
   - Transaction details

3. **Payment Verified**
   - Plan activation confirmation
   - Referral link
   - Account benefits

### Admin Emails:
1. **New Withdrawal Request**
   - User information
   - Complete bank details for payment
   - One-click verification link
   - 24-hour reminder

2. **Withdrawal Completed**
   - Confirmation of processed payment
   - User and payment details

## 📊 Dashboard Features

### Commission Dashboard
Navigate to `/dashboard` to see:
- **Wallet Balance**: Total available balance
- **Today's Earnings**: Earnings from today
- **Total Earnings**: Lifetime earnings
- **Today's Commissions**: Number of commissions received today
- **Commission Feed**: Real-time list of today's commissions
- **Commission History**: Detailed table of all commissions

### Withdrawal Page
Navigate to `/auth/withdraw` to:
- View wallet balance and available withdrawal amount
- Submit withdrawal requests with bank details
- View withdrawal history
- Track withdrawal status

## 🔧 How It Works

### Daily Commission Flow:
1. Cron job runs daily at 00:00 UTC
2. System finds all users with active plans (not Free)
3. For each user:
   - Calculate daily return based on plan
   - Create commission record
   - Update wallet balance
   - Update total and today's earnings
4. Users can view new commissions in dashboard

### Referral Commission Flow:
1. User A refers User B (via referral link)
2. User B signs up and purchases a plan
3. Admin verifies User B's payment
4. System automatically:
   - Calculates 12% commission
   - Credits User A's wallet
   - Creates commission record
   - Updates User A's earnings

### Withdrawal Flow:
1. User submits withdrawal request with bank details
2. System validates balance and creates withdrawal record
3. User receives confirmation email with details
4. Admin receives email with bank details and verification link
5. Admin clicks verification link to approve
6. System:
   - Deducts amount from wallet
   - Updates withdrawal status
   - Sends completion email to user

## 🎯 Key Features

### ✅ Automatic Wallet Updates
- Daily returns added automatically
- Referral commissions credited instantly
- Real-time balance updates

### ✅ Bank Details Collection
- Account holder name
- Account number
- Bank name (optional for mobile wallets)
- Payment gateway selection

### ✅ 24-Hour Processing
- Clear communication to users
- 24-hour guarantee for withdrawals
- Email reminders to admin

### ✅ Complete History Tracking
- All commissions recorded
- Withdrawal history maintained
- Detailed transaction logs

## 🛠️ API Endpoints Reference

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/commissions` | GET | Get user commissions | Yes |
| `/api/commissions/daily-update` | POST | Run daily update (cron) | Secret Key |
| `/api/withdraw` | POST | Submit withdrawal | Yes |
| `/api/withdraw` | GET | Get withdrawal history | Yes |
| `/api/withdraw/verify` | POST | Verify withdrawal (admin) | Admin Link |

## 🔒 Security Features

- ✅ CRON_SECRET protects daily update endpoint
- ✅ JWT authentication for user endpoints
- ✅ Admin verification for withdrawals
- ✅ Input validation on all endpoints
- ✅ Balance checks before withdrawals

## 📱 User Experience

### For Users:
1. **Easy to understand**: Clear dashboard showing all earnings
2. **Transparent**: Complete history of all transactions
3. **Fast withdrawals**: 24-hour processing guarantee
4. **Email updates**: Stay informed at every step

### For Admin:
1. **One-click verification**: Easy withdrawal approval
2. **Complete information**: All bank details in email
3. **Automated notifications**: Never miss a withdrawal request

## 🐛 Troubleshooting

### Daily update not running?
- Check `CRON_SECRET` is set correctly
- Verify cron job is configured
- Check application logs

### Commissions not showing?
- Ensure user has an active plan (not Free)
- Verify MongoDB connection
- Check if daily update has run

### Withdrawal email not received?
- Verify `RESEND_API_KEY` is valid
- Check email address is correct
- Look in spam folder

## 📈 Next Steps

1. ✅ Deploy your application
2. ✅ Set up environment variables
3. ✅ Configure cron job
4. ⏳ Wait for first daily update (midnight UTC)
5. ⏳ Test withdrawal flow
6. ⏳ Monitor commission system

## 💡 Tips

- Test the system with a small amount first
- Monitor the first few daily updates
- Keep track of admin emails for withdrawal requests
- Regularly check withdrawal status in admin panel

## 📞 Support

For detailed setup information, see `COMMISSION_SETUP.md`

---

**System Status**: ✅ Ready to deploy!
