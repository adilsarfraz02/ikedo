# Complete System Flow Diagram

## 💰 Deposit Flow
```
User Dashboard
    ↓
[Click Deposit Button]
    ↓
Deposit Modal Opens
    ↓
Fill Form:
  - Amount
  - Payment Method
  - Transaction ID
  - Payment Proof (optional)
  - Remarks (optional)
    ↓
[Submit]
    ↓
POST /api/deposit
    ↓
Create Deposit Record (status: pending)
    ↓
    ├─→ Email to Admin (verification request)
    └─→ Email to User (confirmation)
    ↓
Modal Closes
Toast: "Submitted Successfully"

Later...
Admin Reviews → Calls /api/deposit/verify
    ↓
If VERIFIED:
  - Update deposit status → verified
  - Add amount to user.walletBalance
  - Send success email to user
    ↓
If REJECTED:
  - Update deposit status → rejected
  - Save rejection reason
  - Send rejection email to user
```

## 💸 Withdraw Flow
```
User Dashboard
    ↓
[Click Withdraw Button]
    ↓
Withdraw Modal Opens
    ↓
Shows: Available Balance
    ↓
Fill Form:
  - Amount
  - Account Holder Name
  - Account Number
  - Bank Name
  - Payment Gateway
    ↓
[Submit]
    ↓
POST /api/withdraw
    ↓
Create Withdrawal Record (status: pending)
    ↓
    ├─→ Email to Admin (with bank details)
    └─→ Email to User (confirmation)
    ↓
Refresh Commission Data
Modal Closes
Toast: "Submitted Successfully"

Later (within 24 hours)...
Admin Reviews → Calls /api/withdraw/verify
    ↓
If APPROVED:
  - Deduct from user.walletBalance
  - Deduct from user.isWithdrawAmount
  - Update withdrawal status → completed
  - Send success email with bank details
    ↓
If REJECTED:
  - Update withdrawal status → rejected
  - Send rejection email with reason
```

## 🔗 Referral System Flow
```
User Signs Up
    ↓
System Generates:
  username: "John Doe"
    ↓
  Convert & Clean:
    1. Lowercase: "john doe"
    2. Remove special chars: "johndoe"
    3. Replace spaces: "john-doe"
    4. Add unique ID: "john-doe-x7k2p9"
    ↓
  Save to Database:
    referralCode: "john-doe-x7k2p9"
    ReferralUrl: "https://domain.com/signup?ref=john-doe-x7k2p9"
    ↓
  Display in Dashboard:
    [Referral Link Section]
    └─ Input: https://domain.com/signup?ref=john-doe-x7k2p9
    └─ [Copy Button] → Clipboard
    ↓
User Shares Link
    ↓
New Person Clicks Link
    ↓
Signup Page Opens with ?ref=john-doe-x7k2p9
    ↓
On Registration:
  - Extract ref parameter
  - Find user by referralCode
  - Set referredBy relationship
  - Increment referrer's tReferralCount
  - Add to referrer's tReferrals array
    ↓
When Referred User Purchases Plan:
  - Award referral commission to referrer
  - Award plan purchase commission to referrer
  - Credit to referrer's walletBalance
  - Send commission notification email
```

## 🎨 UI Component Structure
```
UserDashboard
  ├─ CommissionDashboard (Full Width)
  │   ├─ Balance Card (Gradient Blue-Purple)
  │   │   ├─ Available Balance (Rs X.XX)
  │   │   ├─ Username
  │   │   └─ Referral Link Section
  │   │       ├─ Input (read-only)
  │   │       ├─ Copy Button
  │   │       └─ Helper Text
  │   │
  │   ├─ Action Buttons (2 Columns)
  │   │   ├─ [Deposit] → Opens Deposit Modal
  │   │   └─ [Withdraw] → Opens Withdraw Modal
  │   │
  │   ├─ Stats Cards (4 Cards)
  │   │   ├─ Today's Earnings
  │   │   ├─ Total Earnings
  │   │   ├─ Commission Count
  │   │   └─ Wallet Balance
  │   │
  │   ├─ Today's Commissions (If any)
  │   │   └─ List of today's transactions
  │   │
  │   └─ Recent Commissions (Table)
  │       └─ Last 10 commission records
  │
  ├─ DepositHistory (Full Width)
  │   └─ Table of all deposits with status
  │
  └─ Two Columns
      ├─ User Profile Card
      │   ├─ Profile Image
      │   ├─ Username & Email
      │   ├─ Referral Count
      │   └─ Share Buttons
      │       ├─ WhatsApp
      │       ├─ Facebook
      │       └─ Native Share
      │
      ├─ Wallet Card
      │   ├─ Wallet Balance
      │   ├─ Available for Withdrawal
      │   ├─ Total Earnings
      │   └─ [Withdraw Now] Button
      │
      └─ Referrals Card
          └─ List of referred users

Modals (Overlays):
  ├─ Deposit Modal
  │   └─ Form with payment details
  │
  └─ Withdraw Modal
      └─ Form with bank details
```

## 📊 Database Schema Updates
```
User Model:
  {
    // ... existing fields ...
    
    // NEW FIELDS:
    referralCode: String (unique, sparse)
      Example: "john-doe-x7k2p9"
    
    ReferralUrl: String
      Example: "https://domain.com/signup?ref=john-doe-x7k2p9"
    
    // Updated generation logic in pre-save hook
  }

Deposit Model (NEW):
  {
    userId: ObjectId (ref: User)
    amount: Number
    paymentMethod: String (enum)
    transactionId: String
    paymentProof: String (URL)
    remarks: String
    status: String (pending/verified/rejected)
    verifiedBy: ObjectId (ref: User)
    verifiedAt: Date
    rejectionReason: String
    createdAt: Date
    updatedAt: Date
  }

Withdrawal Model (existing, enhanced):
  {
    userId: ObjectId (ref: User)
    amount: Number
    accountHolderName: String
    accountNumber: String
    bankName: String
    paymentGateway: String
    status: String (pending/completed/rejected)
    verifiedBy: ObjectId (ref: User)
    verifiedAt: Date
    rejectionReason: String
    createdAt: Date
    updatedAt: Date
  }
```

## 🔄 Data Flow
```
Frontend (React/Next.js)
    ↓
API Routes (Next.js)
    ↓
MongoDB (via Mongoose)
    ↓
Email Service (Resend)
    ↓
Admin & User Inboxes

Interactions:
  User → Frontend → API → Database → Email → Admin
  Admin → API → Database → Email → User
  User → Frontend (Copy Referral) → Clipboard
  User → Share → Friend → Signup → Database (Referral Link)
```

## 🎯 Complete User Journey
```
Day 1: User Signs Up
  → Gets unique referral link: username-xxx123
  → Sees link in dashboard
  → Copies and shares

Day 2: Friend Signs Up Using Link
  → System links accounts
  → Referral count increments

Day 3: Friend Purchases Plan
  → Referral commission awarded
  → Added to wallet balance
  → Email notification sent

Day 4: User Makes Deposit
  → Clicks Deposit button
  → Modal opens
  → Fills details
  → Submits
  → Receives confirmation email

Day 5: Admin Verifies Deposit
  → Reviews payment proof
  → Approves deposit
  → Amount added to wallet
  → User receives success email

Day 6: User Withdraws Money
  → Clicks Withdraw button
  → Modal opens
  → Enters bank details
  → Submits
  → Receives confirmation email

Day 7: Admin Processes Withdrawal
  → Reviews request
  → Approves withdrawal
  → Sends money to bank
  → User receives completion email
```

---

**Visual Summary:**
- 2 Modals: Deposit & Withdraw (both working as popups)
- 1 Referral Link: Displayed in balance card with copy button
- Username-based codes: Clean, readable, shareable
- Full email notification system
- Complete transaction tracking
