# Daily Rewards System Documentation

## Overview
The Daily Rewards system allows users to claim 14% commission from their referrals' plan purchases. Users can claim rewards once every 24 hours after the commission is generated.

## Features Implemented

### 1. **Commission Model Updates** (`src/models/Commission.js`)
Added new fields to track reward claiming:
- `isClaimed`: Boolean to track if reward has been claimed
- `claimedAt`: Date when reward was claimed
- `nextClaimTime`: Date when reward can be claimed (24 hours after creation)
- `commissionRate`: The commission percentage (default 14%)

### 2. **Daily Rewards API** (`src/app/api/daily-rewards/route.js`)

#### GET Endpoint - Fetch Rewards
- Fetches all commissions for the logged-in user
- Separates rewards into three categories:
  - **Ready to Claim**: Rewards that have passed the 24-hour cooldown
  - **Pending**: Rewards still within 24-hour cooldown period
  - **Claimed**: Rewards already claimed by the user
- Returns statistics about rewards and wallet balance
- Includes time remaining for pending rewards

#### POST Endpoint - Claim Single Reward
- Allows claiming individual reward by commission ID
- Validates 24-hour cooldown period
- Adds reward amount to user's wallet balance
- Updates commission status to "paid" and marks as claimed
- Returns updated wallet balance

#### PUT Endpoint - Claim All Ready Rewards
- Claims all rewards that have passed the 24-hour cooldown
- Bulk updates all ready rewards
- Adds total amount to user's wallet balance
- Returns count of claimed rewards and total amount

### 3. **Daily Rewards Page** (`src/app/dashboard/daily-rewards/page.jsx`)

#### Key Features:
- **Statistics Dashboard**: Shows 4 key metrics
  - Ready to Claim: Amount and count of claimable rewards
  - Pending: Amount waiting for cooldown
  - Total Claimed: Historical claimed amount
  - Current Wallet Balance

- **Claim All Button**: One-click to claim all ready rewards

- **Three Tabs**:
  1. **Ready to Claim**: Rewards that can be claimed now
  2. **Pending**: Rewards with countdown timer showing time remaining
  3. **Claimed History**: Previously claimed rewards

- **Reward Card Details**: Each reward shows:
  - Referred user's profile picture, name, and email
  - Plan name and commission type
  - Reward amount (14% commission)
  - Created date and claimed date (if applicable)
  - Claim button or countdown timer
  - Reward description

- **Auto-Refresh**: Page refreshes every minute to update timers

### 4. **Sidebar Navigation** (`src/components/Sidebar.jsx`)
- Added "Daily Rewards" menu item with Gift icon
- Positioned between Dashboard and Profile links
- Accessible from all dashboard pages

### 5. **Commission Helper Updates** (`src/helpers/commissionHelper.js`)
- Updated commission rate from 12% to 14%
- Modified `awardPlanPurchaseCommission()` to:
  - NOT add commission to wallet immediately
  - Set `isClaimed` to false
  - Calculate `nextClaimTime` as 24 hours from creation
  - Log commission creation for tracking
- Updated helper functions to use 14% rate

## How It Works

### When a Referral Makes a Purchase:
1. User A refers User B
2. User B purchases a plan (e.g., $100 plan)
3. System creates a commission record:
   - Amount: $14 (14% of $100)
   - Status: "approved"
   - isClaimed: false
   - nextClaimTime: 24 hours from now
4. Commission is NOT added to wallet yet

### When User Claims Reward:
1. User A navigates to Daily Rewards page
2. After 24 hours, reward appears in "Ready to Claim" tab
3. User A clicks "Claim Now" or "Claim All"
4. System validates cooldown period
5. If valid:
   - Adds amount to walletBalance
   - Adds amount to isWithdrawAmount (available for withdrawal)
   - Adds amount to totalEarnings
   - Marks commission as claimed
   - Sets status to "paid"

## API Endpoints

### GET `/api/daily-rewards`
Fetches all rewards data for the logged-in user.

**Response:**
```json
{
  "success": true,
  "data": {
    "readyToClaim": [...],
    "notReadyToClaim": [...],
    "claimedRewards": [...],
    "stats": {
      "totalClaimedAmount": 28.00,
      "totalPendingAmount": 42.00,
      "totalReadyToClaimAmount": 14.00,
      "totalRewards": 10,
      "claimedCount": 5,
      "pendingCount": 5,
      "readyToClaimCount": 2
    },
    "walletBalance": 128.00
  }
}
```

### POST `/api/daily-rewards`
Claims a single reward by commission ID.

**Request:**
```json
{
  "commissionId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reward claimed successfully!",
  "data": {
    "commission": {...},
    "newWalletBalance": 142.00,
    "claimedAmount": 14.00
  }
}
```

### PUT `/api/daily-rewards`
Claims all ready rewards at once.

**Response:**
```json
{
  "success": true,
  "message": "Successfully claimed 3 rewards!",
  "data": {
    "claimedCount": 3,
    "totalAmount": 42.00,
    "newWalletBalance": 170.00
  }
}
```

## User Interface

### Statistics Cards
- **Ready to Claim** (Green): Shows claimable amount and count
- **Pending** (Orange): Shows amount waiting for cooldown
- **Total Claimed** (Blue): Historical earnings
- **Wallet Balance** (Purple): Current balance with link to dashboard

### Reward Display
Each reward card shows:
- User avatar and details
- Plan badge (e.g., "Premium Plan")
- Commission type badge
- Large reward amount in green
- "14% Commission" label
- Created date
- Claim button (if ready) or countdown timer (if pending)
- Claimed date (if already claimed)

### Visual States
- **Ready to Claim**: Green "Claim Now" button with gift icon
- **Pending**: Orange countdown display with clock icon
- **Claimed**: Green "Claimed" badge with checkmark

## Commission Calculation

All plans now use 14% commission rate:
- $100 plan → $14 commission
- $500 plan → $70 commission
- $1000 plan → $140 commission

## 24-Hour Cooldown System

1. Commission created at: `2024-01-01 10:00 AM`
2. Next claim time set to: `2024-01-02 10:00 AM` (24 hours later)
3. User can claim anytime after: `2024-01-02 10:00 AM`
4. Countdown shows time remaining until claimable

## Database Schema

### Commission Collection Updates:
```javascript
{
  _id: ObjectId,
  userId: ObjectId (referrer),
  referredUserId: ObjectId (person who made purchase),
  amount: Number,
  commissionType: String ("plan_purchase" | "referral"),
  planName: String,
  status: String ("pending" | "approved" | "paid"),
  description: String,
  createdAt: Date,
  paidAt: Date,
  isClaimed: Boolean,           // NEW
  claimedAt: Date,              // NEW
  nextClaimTime: Date,          // NEW
  commissionRate: Number        // NEW (0.14)
}
```

## Navigation
Access Daily Rewards from:
1. Sidebar → Daily Rewards (with gift icon)
2. Direct URL: `/dashboard/daily-rewards`

## Benefits for Users

1. **Visual Tracking**: See all rewards in one place
2. **Transparency**: Know exactly when rewards can be claimed
3. **Instant Gratification**: Claim multiple rewards at once
4. **History**: Track all claimed rewards
5. **Real-time Updates**: Countdown timers show exact time remaining

## Benefits for Platform

1. **Engagement**: Users return daily to claim rewards
2. **Fair Distribution**: 24-hour cooldown prevents abuse
3. **Transparency**: Clear tracking of all commissions
4. **Scalability**: Can handle many rewards efficiently
5. **Analytics**: Complete history of reward claims

## Notes

- Rewards must be claimed manually by users
- Unclaimed rewards remain available indefinitely
- Multiple rewards can be claimed simultaneously
- Claimed amounts are immediately available for withdrawal
- System automatically calculates time remaining for pending rewards
- Page auto-refreshes to keep timers accurate
