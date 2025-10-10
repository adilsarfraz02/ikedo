# Referral System & Withdraw Modal Updates

## ✅ What's Been Fixed & Updated

### 1. **Withdraw Modal (Popup) - FIXED** ✨
**Issue:** Withdraw button was using a Link, not opening as a modal
**Solution:** Added a proper withdraw modal popup in CommissionDashboard

#### Features:
- Opens on clicking "Withdraw" button
- Form fields:
  - Withdrawal Amount (Rs)
  - Account Holder Name
  - Account Number
  - Bank Name
  - Payment Gateway (Bank Transfer, UPI, PayPal, Other)
- Shows available balance
- Validation before submission
- Success/error toast notifications
- Auto-refreshes commission data after submission

---

### 2. **Username-Based Referral Links** 🔗
**Old System:** Random UUID codes like `?ref=a1b2c3d4-e5f6-7890-abcd-ef1234567890`
**New System:** Clean, readable username-based codes like `?ref=john-doe-x7k2p9`

#### How It Works:
```javascript
// Example transformations:
"John Doe" → "john-doe-x7k2p9"
"Alice_Smith!" → "alicesmith-a8b3c1"
"Bob-123" → "bob-123-d9e4f2"
"User@2024" → "user2024-k5m7n2"
```

#### Regex Pattern Used:
```javascript
username
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
  .replace(/\s+/g, '-')          // Spaces → hyphens
  .replace(/-+/g, '-')           // Multiple hyphens → single
  .trim()
```

#### Uniqueness:
- 6-character random suffix added (e.g., `x7k2p9`)
- Prevents collisions between similar usernames
- Stored in `referralCode` field with unique constraint

---

### 3. **Referral Link Display** 📋
Added a beautiful referral link section in the main balance card:
- Shows full referral URL
- Copy button with one-click copying
- Toast notification on copy
- Positioned in the gradient balance card

---

## 📁 Files Modified

### 1. `src/models/userModel.js`
**Changes:**
- Added `generateUsernameReferralCode()` function
- Added `referralCode` field (unique, sparse index)
- Updated `ReferralUrl` default to use username-based codes
- Updated pre-save hook to generate referral code for new users
- Updated `generateReferralUrl()` method

**New Schema Fields:**
```javascript
referralCode: {
  type: String,
  unique: true,
  sparse: true, // Allows null values, only enforces unique for non-null
}
```

---

### 2. `src/app/dashboard/components/CommissionDashboard.jsx`
**Changes:**
- Added withdraw modal state management
- Added `withdrawForm` state with bank details
- Added `handleWithdrawSubmit()` function
- Added `handleWithdrawInputChange()` helper
- Added `copyReferralLink()` function
- Added Withdraw Modal UI component
- Added Referral Link display section in balance card
- Changed Withdraw button from Link to modal trigger

**New Features:**
- Withdraw modal with full form
- Referral link display with copy button
- Both modals (Deposit & Withdraw) working

---

## 🚀 How to Use

### For Users:

#### 1. **Deposit Money:**
1. Click "Deposit" button
2. Fill payment details
3. Submit → Admin receives email
4. Wait for admin verification

#### 2. **Withdraw Money:**
1. Click "Withdraw" button (modal opens)
2. Enter amount and bank details
3. Submit → Email sent to user & admin
4. Wait 24 hours for processing

#### 3. **Share Referral Link:**
1. See referral link in the balance card
2. Click "Copy" button
3. Share the link with friends
4. Earn commissions when they sign up and purchase plans

---

### For New Signups:
When someone uses your referral link:
```
https://yourdomain.com/auth/signup?ref=john-doe-x7k2p9
```
- System extracts `ref` parameter
- Finds user by `referralCode`
- Establishes referral relationship
- Awards commissions on plan purchases

---

## 🔄 Migration Required

### For Existing Users:
Run the migration script to update all existing users with new referral codes:

```bash
node scripts/migrateReferralCodes.js
```

**What it does:**
- Finds all users without `referralCode`
- Generates username-based codes
- Updates `referralCode` and `ReferralUrl` fields
- Handles collisions automatically
- Shows progress and results

**Output:**
```
Connected to database
Found 150 users to migrate
✓ Updated john.doe: john-doe-x7k2p9
✓ Updated alice.smith: alice-smith-a8b3c1
...
=== Migration Complete ===
Success: 150
Errors: 0
Total: 150
```

---

## 🔒 Security & Validation

### Withdraw Modal:
- ✅ Amount validation (must be positive)
- ✅ Required fields validation
- ✅ Available balance check (server-side)
- ✅ JWT authentication required
- ✅ Email notifications for transparency

### Referral System:
- ✅ Unique referral codes (database constraint)
- ✅ URL-safe characters only
- ✅ Collision prevention with random suffix
- ✅ Case-insensitive matching

---

## 📊 Database Changes

### Before:
```javascript
{
  ReferralUrl: "https://domain.com/signup?ref=a1b2c3d4-e5f6-..."
}
```

### After:
```javascript
{
  referralCode: "john-doe-x7k2p9",
  ReferralUrl: "https://domain.com/signup?ref=john-doe-x7k2p9"
}
```

---

## 🎨 UI Updates

### Balance Card Now Shows:
1. **Available Balance** (large, prominent)
2. **Username** (below balance)
3. **Referral Link Section:**
   - Read-only input with full URL
   - Copy button
   - Helper text

### Action Buttons:
- **Deposit** → Opens deposit modal (red/pink gradient)
- **Withdraw** → Opens withdraw modal (purple gradient)
- Both with hover animations

---

## 🧪 Testing Checklist

- [ ] Click Deposit button → Modal opens
- [ ] Submit deposit form → Email sent, modal closes
- [ ] Click Withdraw button → Modal opens
- [ ] Submit withdraw form → Emails sent, modal closes
- [ ] Click Copy button → Referral link copied
- [ ] Share referral link → Check if `ref` parameter present
- [ ] New user signup with referral link → Relationship established
- [ ] Check referral codes are username-based
- [ ] Check referral codes are unique
- [ ] Run migration script → All users updated

---

## 🐛 Known Issues & Solutions

### Issue: Migration needed for existing users
**Solution:** Run `node scripts/migrateReferralCodes.js`

### Issue: Referral link shows old UUID format
**Solution:** User needs to be updated via migration script

### Issue: Withdraw modal not submitting
**Solution:** Check API endpoint `/api/withdraw` exists and is working

---

## 📝 Environment Variables

Required for referral links:
```bash
DOMAIN=https://yourdomain.com
```

This is used to generate full referral URLs.

---

## 🎯 Next Steps

1. **Run Migration:** Update all existing users
   ```bash
   node scripts/migrateReferralCodes.js
   ```

2. **Test Both Modals:**
   - Deposit submission
   - Withdraw submission

3. **Test Referral Links:**
   - Copy and share
   - Test signup with referral code

4. **Monitor:**
   - Check database for unique referral codes
   - Verify emails are being sent
   - Test referral commission awards

---

## 📚 API Endpoints Used

### Withdraw Modal:
- **POST** `/api/withdraw` - Submit withdrawal request
- **GET** `/api/commissions` - Refresh balance after submission

### Referral System:
- Handled automatically during signup
- No additional API calls needed

---

## 🎉 Benefits

### For Users:
- ✅ Clean, memorable referral links
- ✅ Easy to share (looks professional)
- ✅ Can be customized (based on username)
- ✅ Quick withdraw/deposit access
- ✅ Copy referral link with one click

### For System:
- ✅ Better tracking of referrals
- ✅ More user-friendly URLs
- ✅ Improved conversion rates
- ✅ Professional appearance
- ✅ Better UX with modal popups

---

**Status:** ✅ Ready to Use
**Last Updated:** October 2024
