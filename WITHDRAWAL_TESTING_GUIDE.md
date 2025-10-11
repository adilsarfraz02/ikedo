# Withdrawal System - Testing Guide

## 🧪 Complete Testing Workflow

### Step 1: User Withdrawal Request

1. **Navigate to Withdrawal Page**
   ```
   URL: /auth/withdraw
   ```

2. **Check Page Display**
   - [ ] Wallet balance shown correctly
   - [ ] Referral stats displayed
   - [ ] Available withdrawal amount visible
   - [ ] "Withdraw Funds" button present

3. **Open Withdrawal Modal**
   - Click "Withdraw Funds" button
   - [ ] Modal opens smoothly
   - [ ] Form fields are visible
   - [ ] UI is responsive

4. **Test Mobile Wallet Withdrawal**
   - [ ] Enter amount: 500 PKR
   - [ ] Select "Mobile Wallet" account type
   - [ ] Choose "JazzCash" (should show 📱 icon)
   - [ ] Enter holder name: "John Doe"
   - [ ] Enter mobile number: "03001234567"
   - [ ] Click "Submit Withdrawal"
   - [ ] Success toast appears
   - [ ] Modal closes
   - [ ] Page refreshes withdrawal history

5. **Verify User Email**
   Check user's email inbox for:
   - [ ] Subject: "✅ Withdrawal Request Received - Processing Within 24 Hours"
   - [ ] Beautiful HTML template with gradient header
   - [ ] Withdrawal details (amount, method, account)
   - [ ] 24-hour processing timeline
   - [ ] Status shows "PENDING"

### Step 2: Admin Notification

1. **Check Admin Email**
   Look for email to `ADMIN_EMAIL` with:
   - [ ] Subject: "🔔 NEW WITHDRAWAL REQUEST - PKR 500 - Action Required"
   - [ ] Urgent notice with red gradient header
   - [ ] 24-hour deadline warning
   - [ ] User information section
   - [ ] Payment details clearly displayed
   - [ ] Account holder name
   - [ ] Mobile number
   - [ ] "VERIFY & COMPLETE WITHDRAWAL" button

2. **Note Email Details**
   ```
   From: withdraw@ikedo.live
   To: [ADMIN_EMAIL]
   Contains: Verification link
   Format: /withdraw/amount/[userId]?amount=[amount]
   ```

### Step 3: Admin Verification

1. **Click Verification Link**
   From admin email, click the green button
   - [ ] Opens verification page
   - [ ] Shows loading state
   - [ ] Displays user and amount info

2. **Verify Payment Processing**
   - [ ] Success message appears
   - [ ] "Withdrawal Verified!" shown
   - [ ] Countdown timer starts
   - [ ] Window closes after 5 seconds

3. **Database Updates**
   Verify these changes occurred:
   - [ ] `withdrawal.status` = "completed"
   - [ ] `withdrawal.completedAt` = current date
   - [ ] `user.isWithdraw` = false
   - [ ] `user.walletBalance` decreased by amount
   - [ ] `user.isWithdrawAmount` decreased by amount

### Step 4: Completion Emails

1. **User Completion Email**
   Check user inbox for:
   - [ ] Subject: "✅ Withdrawal Completed - Payment Sent Successfully!"
   - [ ] Green gradient header with checkmark
   - [ ] "Payment Sent Successfully!" message
   - [ ] Payment details (amount, method, account)
   - [ ] Updated wallet balance
   - [ ] 1-3 business days processing notice
   - [ ] Status shows "COMPLETED"
   - [ ] Support information included

2. **Admin Completion Email**
   Check admin inbox for:
   - [ ] Subject: "✅ Withdrawal Completed - PKR 500 - John Doe"
   - [ ] Transaction summary
   - [ ] User details
   - [ ] Payment details
   - [ ] "User has been notified" confirmation
   - [ ] Transaction ID and timestamp

### Step 5: Withdrawal History Verification

1. **User Dashboard**
   On `/auth/withdraw` page:
   - [ ] Withdrawal history table visible
   - [ ] Latest withdrawal appears at top
   - [ ] Date and time displayed correctly
   - [ ] Amount shown: "PKR 500.00"
   - [ ] Method shows: "📱 JAZZCASH"
   - [ ] Account details displayed:
     - Account holder name
     - Mobile number
   - [ ] Status chip shows "Completed" in green
   - [ ] Completion date visible

### Step 6: Test Bank Account Withdrawal

1. **Open Modal Again**
   - [ ] Click "Withdraw Funds"
   
2. **Select Bank Account**
   - [ ] Enter amount: 1000 PKR
   - [ ] Select "Bank Account" account type
   - [ ] "Bank Account" button highlighted
   - [ ] Bank name field appears
   - [ ] Enter holder name: "Jane Smith"
   - [ ] Enter account number: "PK36HABB0000000012345678"
   - [ ] Enter bank name: "Habib Bank Limited"
   - [ ] Submit form

3. **Verify Bank Account Emails**
   User email should show:
   - [ ] Payment method: "🏦 Bank Account"
   - [ ] Account number (IBAN)
   - [ ] Bank name included
   
   Admin email should show:
   - [ ] Bank account details
   - [ ] IBAN format
   - [ ] Bank name

### Step 7: Error Testing

1. **Test Insufficient Balance**
   - [ ] Try to withdraw more than available
   - [ ] Error message: "Insufficient balance for withdrawal"

2. **Test Duplicate Request**
   - [ ] Submit first withdrawal
   - [ ] Try to submit another before approval
   - [ ] Error message: "You already have a pending withdrawal request"

3. **Test Minimum Amount**
   - [ ] Try to withdraw less than PKR 100
   - [ ] Error message: "Minimum withdrawal amount is PKR 100"

4. **Test Required Fields**
   - [ ] Submit without amount
   - [ ] Submit without account holder name
   - [ ] Submit without account number
   - [ ] Submit bank without bank name
   - [ ] Each shows appropriate error

### Step 8: UI/UX Testing

1. **Modal Behavior**
   - [ ] Opens smoothly
   - [ ] Closes with Cancel button
   - [ ] Closes with backdrop click
   - [ ] Form clears on close
   - [ ] Loading state during submission
   - [ ] Button disabled while loading

2. **Account Type Toggle**
   - [ ] Mobile Wallet button toggles correctly
   - [ ] Bank Account button toggles correctly
   - [ ] Payment gateway updates automatically
   - [ ] Bank name field shows/hides properly

3. **Responsive Design**
   Test on:
   - [ ] Desktop (1920x1080)
   - [ ] Laptop (1366x768)
   - [ ] Tablet (768x1024)
   - [ ] Mobile (375x667)

4. **Payment Gateway Selection**
   - [ ] JazzCash button works
   - [ ] Easypaisa button works
   - [ ] Bank Account button works
   - [ ] Selected gateway highlighted
   - [ ] Icons display correctly

### Step 9: Email Template Testing

1. **Test in Email Clients**
   Send test emails to:
   - [ ] Gmail
   - [ ] Outlook
   - [ ] Yahoo Mail
   - [ ] Apple Mail
   - [ ] Mobile email apps

2. **Verify Email Rendering**
   - [ ] HTML renders correctly
   - [ ] Gradients display properly
   - [ ] Tables aligned correctly
   - [ ] Colors match design
   - [ ] Links work
   - [ ] Responsive on mobile

### Step 10: Database Verification

Check MongoDB collections:

1. **Withdrawals Collection**
   ```javascript
   {
     _id: ObjectId,
     userId: ObjectId,
     amount: 500,
     accountNumber: "03001234567",
     accountHolderName: "John Doe",
     bankName: "", // or bank name for bank accounts
     paymentGateway: "jazzcash",
     accountType: "mobile_wallet", // NEW FIELD
     status: "completed",
     requestedAt: Date,
     completedAt: Date,
     availableForWithdrawalAt: Date
   }
   ```

2. **Users Collection**
   Verify updated fields:
   ```javascript
   {
     _id: ObjectId,
     walletBalance: [decreased by withdrawal amount],
     isWithdrawAmount: [decreased by withdrawal amount],
     isWithdraw: false, // reset after completion
   }
   ```

## 🎯 Test Scenarios

### Scenario 1: First-Time User
- User with balance but no withdrawal history
- Should see empty history message
- Should be able to request withdrawal
- Should receive all emails correctly

### Scenario 2: Returning User
- User with previous withdrawals
- Should see withdrawal history
- Should not have duplicate pending requests
- Should be able to make new requests after completion

### Scenario 3: Low Balance User
- User with balance below withdrawal amount
- Should see error on withdrawal attempt
- Should not create withdrawal record
- Should display current balance

### Scenario 4: Admin Processing
- Admin receives multiple withdrawal requests
- Should be able to process in any order
- Each verification should work independently
- All parties should receive correct emails

## ✅ Success Criteria

All of the following must pass:

- [ ] Modal interface works flawlessly
- [ ] All form validations function correctly
- [ ] Both account types (Mobile Wallet & Bank) work
- [ ] All three payment gateways selectable
- [ ] User receives confirmation email immediately
- [ ] Admin receives notification email immediately
- [ ] Verification link processes correctly
- [ ] Completion emails sent to both parties
- [ ] Database updates correctly
- [ ] Withdrawal history displays properly
- [ ] UI is responsive on all devices
- [ ] No console errors
- [ ] No server errors
- [ ] Professional email appearance

## 🐛 Common Issues & Solutions

### Issue: Modal doesn't open
**Solution:** Check NextUI installation and imports

### Issue: Emails not sending
**Solution:** Verify Resend API key and ADMIN_EMAIL in .env

### Issue: Verification link broken
**Solution:** Check DOMAIN variable in .env

### Issue: Database not updating
**Solution:** Check MongoDB connection and model imports

### Issue: Balance not updating
**Solution:** Verify calculation logic in verify route

## 📊 Test Results Template

```
Test Date: _______________
Tester: __________________

[✅/❌] User can open withdrawal modal
[✅/❌] Form validation works
[✅/❌] Mobile wallet withdrawal succeeds
[✅/❌] Bank account withdrawal succeeds
[✅/❌] User receives confirmation email
[✅/❌] Admin receives notification email
[✅/❌] Verification link works
[✅/❌] Completion emails sent
[✅/❌] Withdrawal history updates
[✅/❌] Balance updates correctly

Overall Status: [PASS/FAIL]
Notes: _______________________
```

## 🚀 Go Live Checklist

Before deploying to production:

- [ ] All tests passed
- [ ] Environment variables set correctly
- [ ] Email templates reviewed and approved
- [ ] Database indexes created
- [ ] Error handling tested
- [ ] User documentation updated
- [ ] Admin documentation updated
- [ ] Support team trained
- [ ] Rollback plan prepared
- [ ] Monitoring set up

---

**Happy Testing! 🎉**
