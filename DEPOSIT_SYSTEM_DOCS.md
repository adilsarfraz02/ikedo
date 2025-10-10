# Deposit System Documentation

## Overview
Complete deposit system with user submission, admin verification, and automatic wallet updates via email notifications.

## Features
✅ User deposit submission with payment details
✅ Payment proof upload (URL)
✅ Email notifications to admin for verification
✅ Admin verification/rejection endpoint
✅ Automatic wallet balance updates upon verification
✅ Deposit history tracking
✅ Status tracking (pending, verified, rejected)

## Database Model

### Deposit Schema (`src/models/Deposit.js`)
```javascript
{
  userId: ObjectId (ref: User)
  amount: Number (required, min: 0)
  paymentMethod: String (enum: bank_transfer, upi, card, other)
  transactionId: String (required)
  paymentProof: String (optional, URL)
  remarks: String (optional)
  status: String (enum: pending, verified, rejected, default: pending)
  verifiedBy: ObjectId (ref: User, admin who verified)
  verifiedAt: Date
  rejectionReason: String
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### 1. Submit Deposit Request
**POST** `/api/deposit`

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "amount": 5000,
  "paymentMethod": "bank_transfer",
  "transactionId": "TXN123456789",
  "paymentProof": "https://example.com/payment-slip.jpg",
  "remarks": "Payment made via SBI"
}
```

**Response:**
```json
{
  "message": "Deposit request submitted successfully. Awaiting admin verification.",
  "deposit": {
    "_id": "...",
    "userId": "...",
    "amount": 5000,
    "status": "pending",
    ...
  }
}
```

**Email Notifications:**
- ✅ Admin receives deposit verification request
- ✅ User receives deposit submission confirmation

---

### 2. Get Deposit History
**GET** `/api/deposit`

**Authentication:** Required (JWT token)

**Response:**
```json
{
  "deposits": [
    {
      "_id": "...",
      "amount": 5000,
      "paymentMethod": "bank_transfer",
      "transactionId": "TXN123456789",
      "status": "verified",
      "createdAt": "2024-01-15T10:30:00Z",
      ...
    }
  ]
}
```

---

### 3. Verify/Reject Deposit (Admin Only)
**POST** `/api/deposit/verify`

**Authentication:** Required (JWT token + Admin role)

**Request Body for Verification:**
```json
{
  "depositId": "deposit_id_here",
  "action": "verify"
}
```

**Request Body for Rejection:**
```json
{
  "depositId": "deposit_id_here",
  "action": "reject",
  "rejectionReason": "Invalid transaction ID"
}
```

**Verify Response:**
```json
{
  "message": "Deposit verified successfully. User wallet updated.",
  "deposit": {...},
  "newBalance": 7500.00
}
```

**Actions Performed on Verification:**
1. Updates deposit status to "verified"
2. Adds amount to user's `walletBalance`
3. Records verifier admin ID
4. Records verification timestamp
5. Sends confirmation email to user

**Reject Response:**
```json
{
  "message": "Deposit rejected successfully.",
  "deposit": {...}
}
```

**Actions Performed on Rejection:**
1. Updates deposit status to "rejected"
2. Records rejection reason
3. Records verifier admin ID
4. Records rejection timestamp
5. Sends rejection email to user with reason

---

## UI Components

### 1. Deposit Modal (`CommissionDashboard.jsx`)
- Triggered by clicking "Deposit" button
- Form fields:
  - Amount (required)
  - Payment Method (select: bank_transfer, upi, card, other)
  - Transaction ID (required)
  - Payment Proof URL (optional)
  - Remarks (optional textarea)
- Submit button with loading state
- Validation before submission

### 2. Deposit History (`DepositHistory.jsx`)
- Displays all user deposits
- Table columns:
  - Date & Time
  - Amount
  - Payment Method
  - Transaction ID
  - Status (with colored chips)
  - Remarks/Rejection Reason
- View payment proof link
- Status color coding:
  - 🟢 Green: Verified
  - 🟡 Yellow: Pending
  - 🔴 Red: Rejected

---

## Email Templates

### 1. Admin Notification Email
**Subject:** "New Deposit Request - Verification Required"

**Content:**
- User information (name, email, user ID)
- Deposit details (amount, payment method, transaction ID)
- Payment proof link (if provided)
- Remarks
- Deposit ID for verification

### 2. User Confirmation Email (Submission)
**Subject:** "Deposit Request Received - Pending Verification"

**Content:**
- Confirmation message
- Deposit details
- Estimated verification time (24-48 hours)
- Status: Pending

### 3. User Success Email (Verified)
**Subject:** "Deposit Verified - Amount Credited to Your Wallet"

**Content:**
- Success message
- Deposit details
- New wallet balance (highlighted)
- Verification date

### 4. User Rejection Email (Rejected)
**Subject:** "Deposit Request Rejected"

**Content:**
- Rejection notice
- Deposit details
- Rejection reason (from admin)
- Support contact information

---

## User Flow

### Deposit Submission Flow:
1. User clicks "Deposit" button in dashboard
2. Modal opens with deposit form
3. User fills in:
   - Amount
   - Payment method
   - Transaction ID
   - Payment proof URL (optional)
   - Remarks (optional)
4. User clicks "Submit Deposit Request"
5. System validates input
6. Deposit record created with status "pending"
7. Email sent to admin with all details
8. Confirmation email sent to user
9. Success toast shown to user
10. Modal closes

### Admin Verification Flow:
1. Admin receives email notification
2. Admin reviews deposit details and payment proof
3. Admin calls `/api/deposit/verify` with:
   - depositId
   - action: "verify" or "reject"
   - rejectionReason (if rejecting)
4. If verified:
   - Deposit status updated to "verified"
   - Amount added to user's walletBalance
   - Success email sent to user
5. If rejected:
   - Deposit status updated to "rejected"
   - Rejection reason saved
   - Rejection email sent to user with reason

### User History View Flow:
1. User navigates to dashboard
2. DepositHistory component loads
3. Fetches all user deposits from `/api/deposit`
4. Displays in table with status indicators
5. User can view payment proof links
6. User sees rejection reasons if applicable

---

## Environment Variables

Required in `.env.local`:
```bash
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=admin@example.com
DOMAIN=https://yourdomain.com
```

---

## Integration with Existing System

### Updated User Model Fields:
- `walletBalance`: Increased when deposit is verified

### Dashboard Integration:
1. **CommissionDashboard.jsx**
   - Deposit button opens modal
   - Modal handles submission
   - Success toast on submission

2. **UserDashboard.jsx**
   - Shows CommissionDashboard
   - Shows DepositHistory below
   - Full-width layout

---

## Admin Panel Integration (Required)

### Admin Dashboard Needs:
Create an admin panel page with:

1. **Pending Deposits List:**
   ```javascript
   GET /api/admin/deposits?status=pending
   ```

2. **Verify Button:**
   ```javascript
   POST /api/deposit/verify
   Body: { depositId, action: "verify" }
   ```

3. **Reject Button with Reason Input:**
   ```javascript
   POST /api/deposit/verify
   Body: { depositId, action: "reject", rejectionReason: "..." }
   ```

4. **View All Deposits:**
   ```javascript
   GET /api/admin/deposits
   ```

### Example Admin Endpoint (Create if needed):
```javascript
// src/app/api/admin/deposits/route.js
export async function GET(request) {
  // Check admin authentication
  // Query deposits with filters
  // Return deposits with user details
}
```

---

## Security Considerations

1. **Authentication:**
   - All endpoints require valid JWT token
   - Verify endpoint requires admin role

2. **Validation:**
   - Amount must be positive number
   - Transaction ID is required
   - Payment method must be valid enum value

3. **Email Security:**
   - Uses Resend API with API key
   - Email addresses validated

4. **Data Protection:**
   - Sensitive data (transaction IDs) stored securely
   - Payment proof URLs should be validated

---

## Testing Checklist

- [ ] User can open deposit modal
- [ ] Form validation works correctly
- [ ] Deposit submission creates record
- [ ] Admin receives email notification
- [ ] User receives confirmation email
- [ ] Deposit appears in history
- [ ] Admin can verify deposit
- [ ] Wallet balance updates on verification
- [ ] User receives verification email
- [ ] Admin can reject deposit
- [ ] User receives rejection email with reason
- [ ] Status colors display correctly
- [ ] Payment proof links work

---

## Common Issues & Solutions

### Issue: Admin email not received
**Solution:** Check ADMIN_EMAIL in environment variables

### Issue: Wallet balance not updating
**Solution:** Verify deposit status is "pending" before verification

### Issue: Email sending fails
**Solution:** Check RESEND_API_KEY and email templates

### Issue: Payment proof not displaying
**Solution:** Ensure URL is publicly accessible

---

## Next Steps

1. **Create Admin Panel:**
   - List pending deposits
   - Verify/reject buttons
   - Search and filter deposits

2. **Add File Upload:**
   - Integrate UploadThing or similar
   - Direct payment slip upload
   - Replace URL input with file upload

3. **Add Notifications:**
   - Real-time notifications for status changes
   - Push notifications for mobile

4. **Add Payment Gateway:**
   - Integrate automatic payment verification
   - Reduce manual verification load

---

## Support

For issues or questions:
- Check logs in terminal/Vercel
- Verify environment variables
- Test email delivery with Resend dashboard
- Check MongoDB for deposit records

---

**Status:** ✅ Fully Implemented
**Last Updated:** 2024
