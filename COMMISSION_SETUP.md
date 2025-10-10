# Referral Commission System - Setup Guide

## Overview
This referral commission system includes:
- Daily automatic commission updates
- Wallet balance tracking
- 24-hour withdrawal processing
- Email notifications with bank details
- Commission history and tracking

## Features Implemented

### 1. Commission Tracking
- **Daily Returns**: Automatic daily returns based on user plan
  - Standard: 5% daily ($50 plan = $2.50/day)
  - Pro: 8% daily ($100 plan = $8/day)
  - Premium: 10% daily ($500 plan = $50/day)
- **Referral Commissions**: Track commissions from referrals
- **Plan Purchase Commissions**: Track commissions from plan purchases

### 2. Wallet System
- `walletBalance`: Current available balance
- `isWithdrawAmount`: Amount available for withdrawal
- `totalEarnings`: Lifetime earnings
- `todayEarnings`: Today's earnings
- `lastDailyUpdate`: Last time daily update ran

### 3. Withdrawal System
- **Bank Details Collection**: Account holder name, account number, bank name
- **24-Hour Processing**: Withdrawals processed within 24 hours
- **Email Notifications**: Both user and admin receive detailed emails
- **Withdrawal History**: Complete history of all withdrawals
- **Status Tracking**: pending, processing, completed, rejected

## API Endpoints

### 1. Get Commissions
```
GET /api/commissions
```
Returns today's commissions, all commissions, and wallet balance.

### 2. Daily Update (Cron Job)
```
POST /api/commissions/daily-update
Authorization: Bearer YOUR_CRON_SECRET
```
Updates all active users with daily returns.

### 3. Submit Withdrawal
```
POST /api/withdraw
Body: {
  amount: number,
  accountNumber: string,
  accountHolderName: string,
  bankName: string (optional),
  paymentGateway: "easypaisa" | "jazzcash" | "bank"
}
```

### 4. Get Withdrawal History
```
GET /api/withdraw
```

### 5. Verify Withdrawal (Admin)
```
POST /api/withdraw/verify
Body: {
  userId: string,
  amount: number
}
```

## Setting Up Daily Cron Job

### Option 1: Vercel Cron Jobs (Recommended for Vercel)

1. Add to your `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/commissions/daily-update",
      "schedule": "0 0 * * *"
    }
  ]
}
```

2. Add environment variable:
```
CRON_SECRET=your-secret-key-here
```

3. The cron job will run daily at midnight UTC.

### Option 2: External Cron Service (EasyCron, cron-job.org)

1. Sign up for a cron service like:
   - https://www.easycron.com/
   - https://cron-job.org/
   
2. Create a new cron job with:
   - URL: `https://yourdomain.com/api/commissions/daily-update`
   - Method: POST
   - Schedule: Daily at 00:00
   - Headers: 
     - `Content-Type: application/json`
     - `Authorization: Bearer YOUR_CRON_SECRET`

3. Add `CRON_SECRET` to your environment variables.

### Option 3: GitHub Actions

Create `.github/workflows/daily-update.yml`:

```yaml
name: Daily Commission Update

on:
  schedule:
    - cron: '0 0 * * *'  # Runs at 00:00 UTC daily
  workflow_dispatch:  # Allows manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Daily Update
        run: |
          curl -X POST https://yourdomain.com/api/commissions/daily-update \
          -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
          -H "Content-Type: application/json"
```

## Environment Variables Required

Add these to your `.env.local` or hosting platform:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Domain
DOMAIN=https://yourdomain.com

# Email (Resend)
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@yourdomain.com

# Cron Job Security
CRON_SECRET=your-secret-key-here

# JWT Secret
JWT_SECRET=your-jwt-secret
```

## Database Models

### Commission Model
- Tracks all commission transactions
- Types: referral, plan_purchase, daily_bonus
- Status: pending, approved, paid

### Withdrawal Model
- Tracks withdrawal requests
- Includes bank details
- Status: pending, processing, completed, rejected
- 24-hour processing window

### User Model (Updated)
- Added: `walletBalance`, `totalEarnings`, `todayEarnings`
- Added: `lastDailyUpdate`, `accountHolderName`, `bankName`

## Email Templates

### Withdrawal Request Email (User)
- Confirmation of request
- Bank details
- 24-hour processing notice
- Current status

### Withdrawal Request Email (Admin)
- User information
- Bank details for payment
- One-click verification link
- 24-hour reminder

### Withdrawal Completed Email (User)
- Payment confirmation
- Bank details used
- Transaction date
- Updated wallet balance

## Testing the System

### 1. Test Commission System
```bash
# Get user commissions
curl -X GET https://yourdomain.com/api/commissions \
  -H "Cookie: token=YOUR_TOKEN"
```

### 2. Test Daily Update (Manual Trigger)
```bash
curl -X POST https://yourdomain.com/api/commissions/daily-update \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 3. Test Withdrawal
```bash
curl -X POST https://yourdomain.com/api/withdraw \
  -H "Content-Type: application/json" \
  -H "Cookie: token=YOUR_TOKEN" \
  -d '{
    "amount": 50,
    "accountNumber": "1234567890",
    "accountHolderName": "John Doe",
    "bankName": "Example Bank",
    "paymentGateway": "bank"
  }'
```

## Dashboard Features

### Commission Dashboard
- Real-time wallet balance
- Today's earnings
- Total earnings
- Today's commission count
- List of today's commissions
- Recent commission history

### Withdrawal Page
- Bank details form
- Withdrawal history table
- Status indicators
- 24-hour processing notice

## Security Considerations

1. **Cron Job Protection**: Use `CRON_SECRET` to prevent unauthorized access
2. **Authentication**: All user endpoints require valid JWT token
3. **Input Validation**: Validate all withdrawal amounts and bank details
4. **Rate Limiting**: Consider adding rate limits to withdrawal endpoints
5. **Email Verification**: Ensure user email is verified before withdrawal

## Maintenance

### Monitor Daily Updates
Check logs daily to ensure cron job runs successfully:
```bash
# Check application logs
vercel logs
```

### Handle Failed Withdrawals
1. Admin receives email with bank details
2. Admin clicks verification link
3. System updates user balance and sends confirmation
4. If payment fails, admin can reject and refund

## Support

For issues or questions:
1. Check application logs
2. Verify environment variables
3. Test API endpoints manually
4. Check email delivery status
5. Verify database connections

## Next Steps

1. ✅ Set up environment variables
2. ✅ Configure cron job
3. ✅ Test commission system
4. ✅ Test withdrawal flow
5. ✅ Verify email delivery
6. ⏳ Monitor first daily update
7. ⏳ Process first withdrawal
