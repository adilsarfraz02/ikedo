# Withdrawal System Flow Diagram

## 📊 Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: User visits /auth/withdraw page                        │
│  ┌──────────────────────────────────────────┐                   │
│  │  Wallet Balance: PKR 5,000               │                   │
│  │  Available for Withdrawal: PKR 5,000     │                   │
│  │                                           │                   │
│  │  [Withdraw Funds] ← Click this button   │                   │
│  └──────────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Modal Popup Opens                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  💼 Withdraw Funds                                        │   │
│  │  ────────────────────────────────────────                │   │
│  │                                                           │   │
│  │  Amount: [_____] PKR                                     │   │
│  │  Max: PKR 5,000                                          │   │
│  │                                                           │   │
│  │  Account Type:                                           │   │
│  │  [📱 Mobile Wallet] [🏦 Bank Account]                    │   │
│  │                                                           │   │
│  │  Payment Method:                                         │   │
│  │  [📱 JazzCash] [💳 Easypaisa]                            │   │
│  │                                                           │   │
│  │  Account Holder: [___________]                           │   │
│  │  Mobile Number: [___________]                            │   │
│  │                                                           │   │
│  │  [Cancel] [Submit Withdrawal]                            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Form Validation                                        │
│  ✅ Amount > PKR 100                                            │
│  ✅ Amount ≤ Available Balance                                  │
│  ✅ All required fields filled                                  │
│  ✅ Valid account format                                        │
│  ✅ No pending withdrawals                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: API POST /api/withdraw                                 │
│  ┌────────────────────────────────────┐                         │
│  │  REQUEST BODY:                     │                         │
│  │  {                                 │                         │
│  │    amount: 500,                    │                         │
│  │    accountNumber: "03001234567",  │                         │
│  │    accountHolderName: "John Doe", │                         │
│  │    paymentGateway: "jazzcash",    │                         │
│  │    accountType: "mobile_wallet"   │                         │
│  │  }                                 │                         │
│  └────────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Database Operations                                    │
│  ┌────────────────────────────────────────────────┐             │
│  │  CREATE Withdrawal Document:                   │             │
│  │  {                                             │             │
│  │    userId: ObjectId,                           │             │
│  │    amount: 500,                                │             │
│  │    status: "pending",                          │             │
│  │    accountNumber: "03001234567",              │             │
│  │    accountHolderName: "John Doe",             │             │
│  │    paymentGateway: "jazzcash",                │             │
│  │    accountType: "mobile_wallet",              │             │
│  │    requestedAt: 2025-10-11T10:30:00Z          │             │
│  │  }                                             │             │
│  │                                                 │             │
│  │  UPDATE User Document:                          │             │
│  │  {                                             │             │
│  │    isWithdraw: true                            │             │
│  │  }                                             │             │
│  └────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  Step 6A: User Email     │    │  Step 6B: Admin Email    │
│  ┌────────────────────┐  │    │  ┌────────────────────┐  │
│  │  TO: user@email    │  │    │  │  TO: admin@email   │  │
│  │  FROM: withdraw@   │  │    │  │  FROM: withdraw@   │  │
│  │  SUBJECT:          │  │    │  │  SUBJECT:          │  │
│  │  ✅ Request        │  │    │  │  🔔 NEW REQUEST    │  │
│  │  Received          │  │    │  │  Action Required   │  │
│  │                    │  │    │  │                    │  │
│  │  Content:          │  │    │  │  Content:          │  │
│  │  - Amount: PKR 500 │  │    │  │  - User: John Doe  │  │
│  │  - Method:JazzCash │  │    │  │  - Amount: PKR 500 │  │
│  │  - Account: 03001  │  │    │  │  - Method:JazzCash │  │
│  │  - Status: Pending │  │    │  │  - Account: 03001  │  │
│  │  - Timeline: 24h   │  │    │  │  - Deadline: 24h   │  │
│  │                    │  │    │  │                    │  │
│  │  [Beautiful HTML]  │  │    │  │  [VERIFY BUTTON]   │  │
│  └────────────────────┘  │    │  └────────────────────┘  │
└──────────────────────────┘    └──────────────────────────┘
              │                               │
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  User sees confirmation  │    │  Admin receives alert    │
│  "Request submitted!"    │    │  Reviews details         │
└──────────────────────────┘    └──────────────────────────┘
                                              │
                                              ▼
                              ┌───────────────────────────────┐
                              │  Step 7: Admin processes       │
                              │  1. Opens JazzCash app         │
                              │  2. Sends PKR 500 to 03001... │
                              │  3. Transaction successful     │
                              └───────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 8: Admin Verification                                     │
│  Admin clicks "VERIFY & COMPLETE WITHDRAWAL" in email           │
│                                                                  │
│  Opens: /withdraw/amount/[userId]?amount=500                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 9: API POST /api/withdraw/verify                          │
│  ┌────────────────────────────────────┐                         │
│  │  REQUEST BODY:                     │                         │
│  │  {                                 │                         │
│  │    userId: "507f...",              │                         │
│  │    amount: 500                     │                         │
│  │  }                                 │                         │
│  └────────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 10: Database Updates                                      │
│  ┌────────────────────────────────────────────────┐             │
│  │  UPDATE Withdrawal Document:                   │             │
│  │  {                                             │             │
│  │    status: "completed",                        │             │
│  │    completedAt: 2025-10-11T11:00:00Z          │             │
│  │  }                                             │             │
│  │                                                 │             │
│  │  UPDATE User Document:                          │             │
│  │  {                                             │             │
│  │    isWithdraw: false,                          │             │
│  │    walletBalance: 4500,  (5000 - 500)         │             │
│  │    isWithdrawAmount: 4500 (5000 - 500)        │             │
│  │  }                                             │             │
│  └────────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  Step 11A: User Email    │    │  Step 11B: Admin Email   │
│  ┌────────────────────┐  │    │  ┌────────────────────┐  │
│  │  TO: user@email    │  │    │  │  TO: admin@email   │  │
│  │  FROM: withdraw@   │  │    │  │  FROM: withdraw@   │  │
│  │  SUBJECT:          │  │    │  │  SUBJECT:          │  │
│  │  ✅ Payment Sent!  │  │    │  │  ✅ Completed      │  │
│  │                    │  │    │  │                    │  │
│  │  Content:          │  │    │  │  Content:          │  │
│  │  - Sent: PKR 500   │  │    │  │  - User: John Doe  │  │
│  │  - Method:JazzCash │  │    │  │  - Amount: PKR 500 │  │
│  │  - Account: 03001  │  │    │  │  - Status: Done ✅ │  │
│  │  - New Balance:    │  │    │  │  - User notified   │  │
│  │    PKR 4,500       │  │    │  │                    │  │
│  │  - Timeline: 1-3   │  │    │  │  [Transaction ID]  │  │
│  │    business days   │  │    │  │                    │  │
│  │                    │  │    │  │                    │  │
│  │  [Beautiful HTML]  │  │    │  │  [Beautiful HTML]  │  │
│  └────────────────────┘  │    │  └────────────────────┘  │
└──────────────────────────┘    └──────────────────────────┘
              │                               │
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│  User receives payment   │    │  Admin gets confirmation │
│  Checks account          │    │  Process complete        │
└──────────────────────────┘    └──────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Step 12: User sees updated dashboard                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Withdrawal History                                       │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │ Date       │ Amount  │ Method    │ Account │ Status│  │   │
│  │  ├────────────────────────────────────────────────────┤  │   │
│  │  │ Oct 11 11AM│ PKR 500 │ 📱 JAZZCASH│ John D. │ ✅    │  │   │
│  │  │            │         │            │ 03001...│ Done  │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  │                                                           │   │
│  │  Current Balance: PKR 4,500                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Error Handling Flows

### Error Flow 1: Insufficient Balance
```
User enters PKR 10,000 (but has PKR 5,000)
    │
    ▼
Validation fails
    │
    ▼
❌ Toast: "Insufficient balance for withdrawal"
    │
    ▼
Form remains open for correction
```

### Error Flow 2: Duplicate Request
```
User has pending withdrawal
    │
    ▼
Tries to submit new request
    │
    ▼
API checks isWithdraw = true
    │
    ▼
❌ Error: "You already have a pending withdrawal request"
    │
    ▼
Shows yellow banner: "Your withdrawal request is pending approval"
```

### Error Flow 3: Below Minimum
```
User enters PKR 50
    │
    ▼
Validation checks amount
    │
    ▼
❌ Error: "Minimum withdrawal amount is PKR 100"
    │
    ▼
Form shows error message
```

## 🎯 Status Lifecycle

```
┌──────────┐       ┌────────────┐       ┌───────────┐
│ PENDING  │  →    │ PROCESSING │  →    │ COMPLETED │
└──────────┘       └────────────┘       └───────────┘
    │                    │                     
    │                    │                     
    ▼                    ▼                     
┌──────────┐       ┌────────────┐             
│ REJECTED │       │ (optional) │             
└──────────┘       └────────────┘             

Legend:
- PENDING: Initial state after user submission
- PROCESSING: (Optional) While admin is working on it
- COMPLETED: Payment sent, verified by admin
- REJECTED: (Future) If unable to process
```

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React Component (withdraw/page.jsx)             │   │
│  │  - State management                              │   │
│  │  - Form validation                               │   │
│  │  - Modal control                                 │   │
│  │  - API calls                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTP Request
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API ROUTES                            │
│  ┌──────────────────────────────────────────────────┐   │
│  │  POST /api/withdraw                              │   │
│  │  - Authentication check                          │   │
│  │  - Input validation                              │   │
│  │  - Business logic                                │   │
│  │  - Database operations                           │   │
│  │  - Email sending                                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  POST /api/withdraw/verify                       │   │
│  │  - Admin verification                            │   │
│  │  - Status update                                 │   │
│  │  - Balance adjustment                            │   │
│  │  - Completion emails                             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   DATABASE   │ │    RESEND    │ │   HELPERS    │
│   MongoDB    │ │  Email API   │ │   Utilities  │
│              │ │              │ │              │
│ - Users      │ │ - Templates  │ │ - Token      │
│ - Withdrawals│ │ - Delivery   │ │ - Validation │
│ - Indexes    │ │ - Tracking   │ │ - Formatting │
└──────────────┘ └──────────────┘ └──────────────┘
```

## 🎨 UI Component Hierarchy

```
WithdrawPage
│
├─ Sidebar
│
├─ Stats Cards
│   ├─ Referral Count
│   ├─ Wallet Balance
│   └─ Available Amount
│
├─ Withdraw Button
│   └─ Opens Modal
│
├─ Modal
│   ├─ Header
│   ├─ Body
│   │   ├─ Amount Input
│   │   ├─ Account Type Selector
│   │   │   ├─ Mobile Wallet Button
│   │   │   └─ Bank Account Button
│   │   ├─ Payment Gateway Selector
│   │   │   ├─ JazzCash Button
│   │   │   ├─ Easypaisa Button
│   │   │   └─ Bank Button
│   │   ├─ Account Holder Input
│   │   ├─ Account Number Input
│   │   └─ Bank Name Input (conditional)
│   └─ Footer
│       ├─ Cancel Button
│       └─ Submit Button
│
└─ Withdrawal History Table
    ├─ Table Header
    └─ Table Rows
        ├─ Date
        ├─ Amount
        ├─ Method
        ├─ Account Details
        └─ Status Chip
```

---

**This diagram provides a complete visual understanding of the entire withdrawal system flow! 🎯**
