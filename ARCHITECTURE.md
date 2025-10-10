# System Architecture - Referral Commission System

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     REFERRAL COMMISSION SYSTEM                   │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│   Daily Cron     │────▶│  Commission      │────▶│   User Wallet    │
│   Job (00:00)    │     │  Calculation     │     │   Update         │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │
        │ Every 24 hours
        ▼
┌──────────────────────────────────────────────────────────────────┐
│  FOR EACH ACTIVE USER (Standard/Pro/Premium):                    │
│  1. Calculate daily return based on plan                         │
│  2. Create commission record                                     │
│  3. Update walletBalance += dailyReturn                          │
│  4. Update totalEarnings += dailyReturn                          │
│  5. Set todayEarnings = dailyReturn                              │
│  6. Set lastDailyUpdate = now                                    │
└──────────────────────────────────────────────────────────────────┘
```

## 💰 Commission Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        COMMISSION TYPES                          │
└─────────────────────────────────────────────────────────────────┘

1. DAILY BONUS (Automatic)
   ┌──────────────┐
   │ User has     │
   │ Active Plan  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ Daily Cron   │────▶│ Calculate    │────▶│ Credit       │
   │ Runs         │     │ Return       │     │ Wallet       │
   └──────────────┘     └──────────────┘     └──────────────┘
   
   Standard: 5% daily ($50 → $2.50/day)
   Pro: 8% daily ($100 → $8/day)
   Premium: 10% daily ($500 → $50/day)

2. REFERRAL COMMISSION (On Signup)
   ┌──────────────┐
   │ User A       │
   │ Refers       │
   │ User B       │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ User B       │────▶│ Admin        │────▶│ Award        │
   │ Signs Up     │     │ Verifies     │     │ Commission   │
   └──────────────┘     └──────────────┘     └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ User A Gets  │
   │ 12% of Plan  │
   │ Price        │
   └──────────────┘

3. PLAN PURCHASE COMMISSION (On Plan Upgrade)
   ┌──────────────┐
   │ Referred     │
   │ User Buys    │
   │ Plan         │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
   │ Payment      │────▶│ Calculate    │────▶│ Credit       │
   │ Verified     │     │ 12% Comm.    │     │ Referrer     │
   └──────────────┘     └──────────────┘     └──────────────┘
```

## 💳 Withdrawal Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        WITHDRAWAL PROCESS                        │
└─────────────────────────────────────────────────────────────────┘

USER SIDE:
┌──────────────┐
│ User Checks  │
│ Wallet       │
└──────┬───────┘
       │
       ▼
┌──────────────┐     Balance > 0?     ┌──────────────┐
│ Click        │────────Yes──────────▶│ Fill Bank    │
│ Withdraw     │                      │ Details Form │
└──────────────┘                      └──────┬───────┘
                                             │
                                             ▼
                                      ┌──────────────┐
                                      │ Submit       │
                                      │ Request      │
                                      └──────┬───────┘
                                             │
                                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ SYSTEM CREATES:                                                  │
│ • Withdrawal record (status: pending)                           │
│ • User.isWithdraw = true                                        │
│ • Email to user (confirmation + 24hr notice)                    │
│ • Email to admin (bank details + verify link)                   │
└─────────────────────────────────────────────────────────────────┘

ADMIN SIDE:
┌──────────────┐
│ Admin Gets   │
│ Email with   │
│ Bank Details │
└──────┬───────┘
       │
       ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Admin Clicks │────▶│ System       │────▶│ Wallet       │
│ Verify Link  │     │ Verifies     │     │ Deducted     │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Status =     │
                     │ Completed    │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Email to     │
                     │ User (Done!) │
                     └──────────────┘

TIMELINE:
┌───────────────────────────────────────────────────────────────┐
│ T+0hr: Request submitted                                       │
│ T+0hr: Emails sent (user + admin)                             │
│ T+0-24hr: Admin processes payment                             │
│ T+24hr: Payment completed (max)                               │
│ T+24hr+: User receives money in bank                          │
└───────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          DATABASE MODELS                         │
└─────────────────────────────────────────────────────────────────┘

USER MODEL
┌──────────────────────────────────────────────┐
│ username, email, password                    │
│ plan (Free/Standard/Pro/Premium)             │
│ ─────────────────────────────────────────── │
│ WALLET FIELDS:                               │
│ • walletBalance (total available)            │
│ • isWithdrawAmount (withdrawable)            │
│ • totalEarnings (lifetime)                   │
│ • todayEarnings (today only)                 │
│ • lastDailyUpdate (timestamp)                │
│ ─────────────────────────────────────────── │
│ BANK FIELDS:                                 │
│ • accountHolderName                          │
│ • accountNumber (from bankAccount)           │
│ • bankName                                   │
│ ─────────────────────────────────────────── │
│ REFERRAL FIELDS:                             │
│ • tReferralCount                             │
│ • tReferrals []                              │
│ • ReferralUrl                                │
│ ─────────────────────────────────────────── │
│ STATUS FIELDS:                               │
│ • isWithdraw (has pending withdrawal?)       │
│ • paymentStatus                              │
│ • isVerified                                 │
└──────────────────────────────────────────────┘
       │                  │
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│ COMMISSION  │    │ WITHDRAWAL  │
│ MODEL       │    │ MODEL       │
└─────────────┘    └─────────────┘

COMMISSION MODEL
┌──────────────────────────────────────────────┐
│ userId (ref: User)                           │
│ referredUserId (ref: User)                   │
│ amount                                       │
│ commissionType (daily_bonus/referral/plan)   │
│ planName                                     │
│ status (pending/approved/paid)               │
│ description                                  │
│ createdAt                                    │
└──────────────────────────────────────────────┘

WITHDRAWAL MODEL
┌──────────────────────────────────────────────┐
│ userId (ref: User)                           │
│ amount                                       │
│ accountNumber                                │
│ accountHolderName                            │
│ bankName                                     │
│ paymentGateway (easypaisa/jazzcash/bank)     │
│ status (pending/processing/completed)        │
│ requestedAt                                  │
│ completedAt                                  │
└──────────────────────────────────────────────┘
```

## 🎯 API Endpoints

```
┌─────────────────────────────────────────────────────────────────┐
│                          API ROUTES                              │
└─────────────────────────────────────────────────────────────────┘

PUBLIC ENDPOINTS:
None (all require authentication or secret)

AUTHENTICATED USER ENDPOINTS:
┌──────────────────────────────────────────────────────────┐
│ GET  /api/commissions                                     │
│ → Returns: todayCommissions, allCommissions, earnings    │
│                                                           │
│ POST /api/withdraw                                        │
│ → Body: {amount, accountNumber, accountHolderName,       │
│          bankName?, paymentGateway}                      │
│ → Returns: {message, withdrawalId}                       │
│                                                           │
│ GET  /api/withdraw                                        │
│ → Returns: {withdrawals[]}                               │
└──────────────────────────────────────────────────────────┘

CRON/SYSTEM ENDPOINTS:
┌──────────────────────────────────────────────────────────┐
│ POST /api/commissions/daily-update                        │
│ → Headers: Authorization: Bearer CRON_SECRET             │
│ → Returns: {message, updatedUsers}                       │
│                                                           │
│ POST /api/withdraw/verify                                 │
│ → Body: {userId, amount}                                 │
│ → Returns: {message}                                     │
│                                                           │
│ POST /api/users/verifyPlan                                │
│ → Body: {url: userId}                                    │
│ → Awards commission + verifies payment                   │
└──────────────────────────────────────────────────────────┘
```

## 🖥️ Frontend Components

```
┌─────────────────────────────────────────────────────────────────┐
│                      COMPONENT HIERARCHY                         │
└─────────────────────────────────────────────────────────────────┘

/dashboard
└── UserDashboard
    ├── CommissionDashboard ← NEW!
    │   ├── Stat Cards (4)
    │   │   ├── Wallet Balance
    │   │   ├── Today's Earnings
    │   │   ├── Total Earnings
    │   │   └── Today's Commissions Count
    │   ├── Today's Commission Feed
    │   └── Commission History Table
    │
    ├── User Profile Card
    │   ├── Avatar + Info
    │   ├── Referral Count
    │   └── Share Buttons
    │
    ├── Wallet Card ← ENHANCED!
    │   ├── Wallet Balance
    │   ├── Available for Withdrawal
    │   ├── Total Earnings
    │   └── Withdraw Button
    │
    └── Referrals Card
        └── Referral List

/auth/withdraw
└── WithdrawPage ← ENHANCED!
    ├── Stats Cards
    ├── Withdrawal Form
    │   ├── Amount Input
    │   ├── Account Holder Name ← NEW!
    │   ├── Account Number
    │   ├── Payment Gateway Select
    │   └── Bank Name (conditional) ← NEW!
    └── Withdrawal History Table ← NEW!
```

## 📧 Email Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                          EMAIL SYSTEM                            │
└─────────────────────────────────────────────────────────────────┘

WITHDRAWAL REQUEST TRIGGERED:
┌──────────────┐
│ User Submits │
│ Withdrawal   │
└──────┬───────┘
       │
       ├────────────────────────────┬────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐            ┌──────────────┐          ┌──────────────┐
│ Create       │            │ Email User   │          │ Email Admin  │
│ Withdrawal   │            │              │          │              │
│ Record       │            │ Subject:     │          │ Subject:     │
└──────────────┘            │ "Request     │          │ "New         │
                            │ Submitted"   │          │ Withdrawal"  │
                            │              │          │              │
                            │ Content:     │          │ Content:     │
                            │ • Amount     │          │ • User Info  │
                            │ • Bank Info  │          │ • Bank Info  │
                            │ • 24hr Note  │          │ • Verify BTN │
                            └──────────────┘          └──────────────┘

WITHDRAWAL COMPLETED:
┌──────────────┐
│ Admin Clicks │
│ Verify Link  │
└──────┬───────┘
       │
       ├────────────────────────────┬────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐            ┌──────────────┐          ┌──────────────┐
│ Update       │            │ Email User   │          │ Email Admin  │
│ Withdrawal   │            │              │          │              │
│ Status       │            │ Subject:     │          │ Subject:     │
└──────────────┘            │ "Completed"  │          │ "Completed"  │
                            │              │          │              │
                            │ Content:     │          │ Content:     │
                            │ • Confirm    │          │ • Confirm    │
                            │ • Bank Info  │          │ • User Info  │
                            │ • Balance    │          │ • Amount     │
                            └──────────────┘          └──────────────┘
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY MEASURES                         │
└─────────────────────────────────────────────────────────────────┘

LAYER 1: Authentication
├── JWT Token for user endpoints
├── Cookie-based session
└── Token expiry handling

LAYER 2: Authorization
├── User can only access own data
├── Admin verification for withdrawals
└── CRON_SECRET for automated endpoints

LAYER 3: Validation
├── Input validation on all forms
├── Balance checks before withdrawal
├── Amount range validation
└── Required field validation

LAYER 4: Data Protection
├── Sensitive data in environment variables
├── Secure password hashing
├── HTTPS only in production
└── No sensitive data in logs

LAYER 5: Rate Limiting (Recommended)
├── Prevent withdrawal spam
├── Limit API calls per user
└── Throttle email sending
```

## 📈 Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE FEATURES                          │
└─────────────────────────────────────────────────────────────────┘

DATABASE:
├── Indexed fields (userId, createdAt)
├── Limited query results (pagination ready)
└── Efficient queries with .populate()

FRONTEND:
├── React.useEffect for data fetching
├── Conditional rendering
├── Skeleton loading states
└── Responsive grid layouts

API:
├── Batch updates in daily cron
├── Async/await for concurrent operations
├── Error handling and recovery
└── Efficient database connections

CACHING (Can be added):
├── Cache commission totals
├── Cache withdrawal history
└── Cache user stats
```

---

**Architecture Version**: 1.0
**Last Updated**: October 10, 2025
