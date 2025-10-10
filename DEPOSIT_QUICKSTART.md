# Deposit System - Quick Setup Guide

## ✅ What's Been Implemented

### 1. Database Model
- **File:** `src/models/Deposit.js`
- Tracks all deposit transactions with status (pending, verified, rejected)

### 2. API Endpoints
- **POST** `/api/deposit` - User submits deposit request
- **GET** `/api/deposit` - Get user's deposit history
- **POST** `/api/deposit/verify` - Admin verifies/rejects deposit (Admin only)
- **GET** `/api/admin/deposits` - Admin views all deposits with filters (Admin only)

### 3. UI Components
- **Deposit Modal** in `CommissionDashboard.jsx` - Click "Deposit" button to open
- **Deposit History** in `DepositHistory.jsx` - Shows all user deposits
- Integrated in `UserDashboard.jsx`

### 4. Email Notifications
✅ Admin receives deposit request with all details
✅ User receives confirmation on submission
✅ User receives success email when verified
✅ User receives rejection email with reason

## 🚀 How It Works

### User Flow:
1. User clicks "Deposit" button in dashboard
2. Modal opens with form:
   - Amount (Rs)
   - Payment Method (Bank Transfer, UPI, Card, Other)
   - Transaction ID
   - Payment Proof URL (optional)
   - Remarks (optional)
3. User submits form
4. Email sent to admin for verification
5. User sees "Pending" status in deposit history

### Admin Flow:
1. Admin receives email with deposit details
2. Admin reviews payment proof and details
3. Admin calls verify API with:
   ```javascript
   POST /api/deposit/verify
   {
     "depositId": "...",
     "action": "verify" // or "reject"
     "rejectionReason": "..." // if rejecting
   }
   ```
4. If verified: Amount added to user's wallet
5. If rejected: User notified with reason

## 📋 What You Need to Do

### 1. Set Environment Variables
Add to `.env.local`:
```bash
ADMIN_EMAIL=your-admin-email@example.com
```

### 2. Create Admin Panel (Optional but Recommended)
Create a page at `src/app/admin/deposits/page.jsx`:

```javascript
"use client";
import { useState, useEffect } from "react";

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  
  useEffect(() => {
    fetch('/api/admin/deposits?status=pending')
      .then(res => res.json())
      .then(data => setDeposits(data.deposits));
  }, []);

  const handleVerify = async (depositId) => {
    await fetch('/api/deposit/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId, action: 'verify' })
    });
    // Refresh list
  };

  const handleReject = async (depositId, reason) => {
    await fetch('/api/deposit/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId, action: 'reject', rejectionReason: reason })
    });
    // Refresh list
  };

  return (
    <div>
      <h1>Pending Deposits</h1>
      {deposits.map(deposit => (
        <div key={deposit._id}>
          <p>User: {deposit.userId.username}</p>
          <p>Amount: Rs {deposit.amount}</p>
          <p>Transaction ID: {deposit.transactionId}</p>
          {deposit.paymentProof && (
            <a href={deposit.paymentProof} target="_blank">View Proof</a>
          )}
          <button onClick={() => handleVerify(deposit._id)}>Verify</button>
          <button onClick={() => {
            const reason = prompt('Enter rejection reason:');
            if (reason) handleReject(deposit._id, reason);
          }}>Reject</button>
        </div>
      ))}
    </div>
  );
}
```

### 3. Test the System
1. Login as user
2. Go to dashboard
3. Click "Deposit" button
4. Fill form and submit
5. Check your admin email
6. Verify deposit via API or admin panel
7. Check user's wallet balance increased
8. Check user received success email

## 📧 Email Templates

All emails are automatically sent via Resend:
- Modern HTML templates
- Responsive design
- Clear action items
- Professional branding

## 🎨 UI Features

- **Modern Modal Design:** Clean form with NextUI components
- **Status Indicators:** Color-coded chips (Green=Verified, Yellow=Pending, Red=Rejected)
- **Responsive Table:** Shows all deposit history
- **Payment Proof Links:** Direct links to view payment slips
- **Loading States:** Submit button shows loading animation
- **Toast Notifications:** Success/error messages

## 🔒 Security

- JWT authentication required for all endpoints
- Admin role verification for admin endpoints
- Input validation on all forms
- Secure email delivery via Resend

## 📊 Features

✅ User deposit submission
✅ Payment proof upload (URL)
✅ Admin email notifications
✅ User email confirmations
✅ Automatic wallet updates
✅ Deposit history tracking
✅ Status management
✅ Rejection with reasons
✅ Admin statistics
✅ Pagination support

## 🐛 Troubleshooting

**Emails not sending?**
- Check RESEND_API_KEY in environment
- Check ADMIN_EMAIL is set
- Verify Resend domain setup

**Wallet not updating?**
- Check deposit status is "pending" before verification
- Verify user model has walletBalance field

**Modal not opening?**
- Check NextUI is installed
- Check import statements

## 📚 Full Documentation

See `DEPOSIT_SYSTEM_DOCS.md` for complete documentation.

---

**Status:** ✅ Ready to Use
**Next Step:** Test the deposit flow end-to-end!
