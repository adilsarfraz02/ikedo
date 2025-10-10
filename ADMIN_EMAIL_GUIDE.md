# Admin Email Verification Guide 📧

## What You'll Receive

When a user submits a payment, you'll receive a professional email notification with:

### 📧 Email Subject
```
🔔 New Payment Verification Required - user@example.com
```

---

## Email Contents

### 1️⃣ **Header Section**
- Red/Orange gradient background
- "⚠️ Payment Verification Required"
- "Action needed within 24 hours" subtitle

### 2️⃣ **User Information Card**
```
👤 User Information
├─ 👤 Username: john_doe
├─ 📧 Email: john@example.com
└─ 🆔 User ID: 507f1f77bcf86cd799439011
```

### 3️⃣ **Payment Details Card**
```
💳 Payment Details
├─ 📦 Plan: Plan 1
├─ 💰 Price: 590 PKR
├─ 🎁 Daily Cashback: 40 PKR Daily
├─ 💳 Payment Method: EASYPAISA
└─ 📅 Submission Date: Oct 11, 2025, 10:30 AM
```

### 4️⃣ **Payment Receipt**
- Large, embedded image of the payment receipt
- Click to view full size
- Border for easy viewing

### 5️⃣ **Verification Button**
```
┌────────────────────────────────┐
│  ✅ VERIFY PAYMENT NOW         │
│  (Large Green Button)          │
└────────────────────────────────┘
```

### 6️⃣ **Direct URL**
```
Alternative: Copy/paste this link
https://ikedo.live/auth/verifyPlan?ref=507f1f77bcf86cd799439011
```

### 7️⃣ **Next Steps Guide**
```
📝 Next Steps:
1. Review the payment receipt carefully
2. Verify the payment amount matches the plan price
3. Click the verification button to approve or reject
4. User will be notified automatically
```

---

## How to Verify

### Method 1: Click the Button ✅
1. Open the email
2. Scroll to the green "VERIFY PAYMENT NOW" button
3. Click it
4. You'll be redirected to the verification page
5. Confirm the verification
6. User automatically receives approval email

### Method 2: Copy URL 📋
1. Copy the verification URL from the email
2. Paste it in your browser
3. Complete the verification process

---

## What Happens After Verification?

### ✅ User Receives:
- **Subject:** "✅ Payment Verified - Account Activated!"
- Celebration email with:
  - Active status badge
  - Complete plan details
  - Benefits breakdown
  - Referral link to start earning
  - Dashboard access button

### 💰 System Actions:
- User status changed to "Approved"
- User marked as "Verified"
- If referred by someone:
  - Referrer receives 12% commission automatically
  - Commission credited to referrer's wallet
- Daily returns activated for the user

---

## Email Design Features

### Professional Design:
- ✅ Mobile responsive
- ✅ Professional color scheme
- ✅ Clear information hierarchy
- ✅ Large, easy-to-click buttons
- ✅ Embedded receipt preview
- ✅ Organized with icons
- ✅ Professional branding

### Security:
- ✅ Direct verification links
- ✅ User ID in URL for tracking
- ✅ Automatic notifications
- ✅ No manual copying needed

---

## Troubleshooting

### If Email Doesn't Arrive:
1. Check spam/junk folder
2. Verify admin email in `.env` file:
   ```
   ADMIN_EMAIL=your-admin@email.com
   ```
3. Check console logs for email sending status

### If Verification Link Doesn't Work:
1. Check `DOMAIN` environment variable
2. Ensure URL format is correct
3. Try copying the full URL from the email

### If User Doesn't Get Confirmation:
1. Check user email is correct in database
2. Verify Resend API configuration
3. Check console logs for email errors

---

## Console Logs You'll See

### Successful Flow:
```
✅ Payment verification request received: { email, title, price, paymentMethod, hasReceipt: true }
✅ User found: user@example.com
✅ User updated successfully: user@example.com
✅ Verification pending email sent to: user@example.com
✅ Admin notification sent successfully to: admin@ikedo.live
```

### After You Verify:
```
Verifying plan for user: user@example.com
✅ User plan verified successfully: user@example.com
Awarding commission to referrer: 507f191e810c19729de860ea
✅ Commission awarded successfully
✅ Verification success email sent to: user@example.com
```

---

## Quick Reference

| Action | What Happens |
|--------|--------------|
| User submits payment | Admin gets email + User gets "processing" email |
| Admin clicks verify | User gets "approved" email + Status changes to "Approved" |
| Referrer exists | Referrer gets 12% commission automatically |
| User has plan active | Daily returns start + Referral link activated |

---

## Best Practices

1. ⏰ **Respond within 24 hours** - Users expect quick verification
2. 🔍 **Check receipt carefully** - Ensure payment matches plan price
3. 📧 **Keep email notifications on** - Don't miss payment requests
4. 💾 **Check console logs** - Monitor system health
5. 📱 **Mobile access** - Emails are mobile-friendly for on-the-go verification

---

**Need Help?** Check the console logs or contact the development team.

**Last Updated:** October 11, 2025
