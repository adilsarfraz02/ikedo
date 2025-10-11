# Admin Quick Reference - Withdrawal System

## 📧 Email Notifications You'll Receive

### 1. New Withdrawal Request
```
Subject: 🔔 NEW WITHDRAWAL REQUEST - PKR [amount] - Action Required
Priority: High
Action Required: Within 24 hours
```

**What to do:**
1. Review user details and balance
2. Verify payment information is correct
3. Process payment to user's account
4. Click "VERIFY & COMPLETE WITHDRAWAL" button

---

## 💰 Payment Methods Guide

### JazzCash (📱)
- **Account Type:** Mobile Wallet
- **Format:** 03XXXXXXXXX (11 digits)
- **How to Pay:**
  1. Open JazzCash app
  2. Send Money → Mobile Number
  3. Enter user's mobile number
  4. Enter exact amount from email
  5. Complete transaction

### Easypaisa (💳)
- **Account Type:** Mobile Wallet  
- **Format:** 03XXXXXXXXX (11 digits)
- **How to Pay:**
  1. Open Easypaisa app
  2. Send Money → Mobile Number
  3. Enter user's mobile number
  4. Enter exact amount from email
  5. Complete transaction

### Bank Account (🏦)
- **Account Type:** Bank Account
- **Format:** IBAN (PK + 22 digits)
- **How to Pay:**
  1. Log in to your business banking
  2. Initiate bank transfer
  3. Enter user's IBAN
  4. Enter exact amount from email
  5. Complete transaction

---

## ⚡ Quick Process Workflow

```
1. 📧 Receive email notification
   ↓
2. 💸 Send payment to user's account
   ↓
3. ✅ Click verification link in email
   ↓
4. 🎉 System automatically:
   - Updates user balance
   - Marks withdrawal as complete
   - Sends confirmation to user
   - Sends confirmation to you
```

---

## 📋 Payment Checklist

Before clicking the verification link:

- [ ] Payment sent to correct account
- [ ] Amount matches exactly
- [ ] Transaction successful
- [ ] Screenshot saved (optional but recommended)
- [ ] User details verified

---

## 🔗 Manual Verification URL Format

If email link doesn't work, use:
```
https://ikedo.live/withdraw/amount/[USER_ID]?amount=[AMOUNT]

Example:
https://ikedo.live/withdraw/amount/507f1f77bcf86cd799439011?amount=500
```

---

## ⚠️ Important Notes

### Always Check:
1. **User Balance:** Email shows user's wallet balance
2. **Account Details:** Verify account holder name matches
3. **Amount:** Send exact amount shown (no more, no less)
4. **Payment Method:** Use the correct gateway shown

### Never:
- ❌ Verify without sending payment first
- ❌ Send partial payments
- ❌ Send to different account than shown
- ❌ Process after 24 hours without user confirmation

### Security:
- ✅ All requests are authenticated
- ✅ Verification links expire after use
- ✅ System prevents duplicate claims
- ✅ All transactions are logged

---

## 📊 Dashboard Access

### View All Withdrawals:
```
URL: /dashboard/admin/withdrawals
(If admin dashboard exists)
```

### User Profile:
```
URL: /dashboard/users/[USER_ID]
```

---

## 🚨 Common Issues & Solutions

### Issue: Can't access verification link
**Solution:** 
1. Copy the full URL from email
2. Paste in browser
3. Or manually construct URL with user ID and amount

### Issue: Payment failed to user
**Solution:**
1. Don't click verification link
2. Retry payment
3. Contact user if account details wrong
4. Once successful, then verify

### Issue: Wrong amount sent
**Solution:**
1. Don't verify the withdrawal
2. Contact user to correct
3. Send adjustment payment
4. Then verify with correct total

### Issue: User says didn't receive payment
**Solution:**
1. Check your transaction history
2. Verify account details in withdrawal request
3. Mobile wallets: 1-5 minutes
4. Bank transfers: 1-3 business days
5. Contact user's bank if needed

---

## 📞 Contact Information

### For Technical Issues:
- Email: tech@ikedo.live
- Report system bugs or errors

### For Payment Issues:
- Email: support@ikedo.live
- Payment gateway problems

### For User Disputes:
- Email: disputes@ikedo.live
- User complaints or verification issues

---

## 📈 Processing Statistics

### Target Times:
- **Response Time:** Within 1 hour of request
- **Processing Time:** Within 24 hours
- **Peak Times:** After 6 PM local time

### Volume Expectations:
- **Daily Average:** 10-50 withdrawals
- **Weekly Peak:** Fridays
- **Monthly Peak:** End of month

---

## ✅ Best Practices

1. **Process in Order:** First-come, first-served
2. **Double Check:** Always verify account details
3. **Keep Records:** Save transaction confirmations
4. **Quick Response:** Process within 24 hours
5. **Communication:** Email users if delays occur

---

## 🎯 Quality Standards

### Every Withdrawal Should:
- [x] Be processed within 24 hours
- [x] Have correct amount sent
- [x] Use correct payment method
- [x] Be verified after payment
- [x] Have confirmation emails sent

### Your Goals:
- 📊 100% accuracy rate
- ⏱️ Average processing time < 12 hours
- 😊 Zero user complaints
- ✅ All verifications completed same day

---

## 🔐 Security Protocols

### Before Processing:
1. Verify email is from withdraw@ikedo.live
2. Check user has sufficient balance (shown in email)
3. Confirm account details look legitimate
4. Verify amount is within reasonable limits

### Red Flags:
- 🚩 Duplicate requests in short time
- 🚩 Unusual account details
- 🚩 Very large amounts (>PKR 50,000)
- 🚩 New accounts with high balance

**If you see red flags:** Contact user for verification before processing

---

## 📝 Daily Routine

### Morning (9 AM):
- [ ] Check email for overnight requests
- [ ] Review pending withdrawals
- [ ] Process all verified requests

### Afternoon (2 PM):
- [ ] Check for new requests
- [ ] Process any pending
- [ ] Follow up on delayed payments

### Evening (6 PM):
- [ ] Final check of the day
- [ ] Process all remaining requests
- [ ] Update any delayed users

---

## 🎓 Training Resources

### New Admin Onboarding:
1. Read this quick reference
2. Review full documentation
3. Watch demo video (if available)
4. Process 3 test withdrawals
5. Shadow experienced admin
6. Independent processing with review

### Knowledge Base:
- JazzCash support: https://jazzcash.com.pk
- Easypaisa support: https://easypaisa.com.pk
- Banking: Contact your business account manager

---

## 📞 Emergency Contacts

### System Down:
Call: [IT Support Number]

### Payment Issues:
Call: [Finance Team]

### User Emergency:
Call: [Customer Support Lead]

---

## 💡 Pro Tips

1. **Batch Processing:** Process multiple withdrawals at once during peak times
2. **Template Messages:** Save common responses for faster communication
3. **Keyboard Shortcuts:** Use browser shortcuts for faster workflow
4. **Dual Monitor:** Use second screen for emails while processing
5. **Mobile Access:** Save verification links to process on mobile if needed

---

**Remember: Every withdrawal is someone's earnings. Process with care and speed! 🚀**

---

Last Updated: October 11, 2025
Version: 2.0.0
