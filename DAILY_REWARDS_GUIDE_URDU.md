# Daily Rewards System - Quick Guide (Urdu)

## خلاصہ (Summary)
یہ نیا Daily Rewards صفحہ صارفین کو ان کے referrals کی plan purchases پر 14% commission claim کرنے کی سہولت دیتا ہے۔ ہر reward کو 24 گھنٹے کے بعد claim کیا جا سکتا ہے۔

## کیسے کام کرتا ہے؟

### جب کوئی Referral Plan خریدتا ہے:
1. آپ نے کسی کو refer کیا
2. وہ شخص کوئی plan خریدتا ہے (مثلاً $100 plan)
3. آپ کو 14% commission ملتا ہے ($14)
4. یہ commission فوراً wallet میں نہیں آتا
5. 24 گھنٹے بعد آپ اسے claim کر سکتے ہیں

### Commission Claim کرنے کا طریقہ:
1. Dashboard سے "Daily Rewards" پر جائیں
2. تین tabs نظر آئیں گے:
   - **Ready to Claim**: جو rewards ابھی claim کیے جا سکتے ہیں
   - **Pending**: جو rewards 24 گھنٹے کے انتظار میں ہیں
   - **Claimed History**: جو rewards پہلے claim ہو چکے ہیں

3. "Ready to Claim" tab میں:
   - ہر reward کے ساتھ "Claim Now" button ہوگا
   - یا پھر "Claim All" button سے سارے rewards ایک ساتھ claim کریں

4. Claim کرنے کے بعد:
   - Reward amount آپ کے wallet balance میں add ہو جائے گا
   - آپ یہ amount withdraw کر سکتے ہیں

## Key Features

### صفحہ پر کیا دکھائی دیتا ہے:

1. **Statistics Cards** (اوپر 4 کارڈ):
   - **Ready to Claim**: کتنا amount ابھی claim ہو سکتا ہے
   - **Pending**: کتنا amount انتظار میں ہے
   - **Total Claimed**: کل کتنا claim کیا جا چکا ہے
   - **Wallet Balance**: موجودہ balance

2. **ہر Reward Card میں**:
   - Referred person کی تصویر اور نام
   - انہوں نے کون سا plan خریدا
   - Reward amount (14% commission)
   - تاریخ اور وقت
   - Claim button یا countdown timer

3. **Timer System**:
   - Pending rewards کے لیے countdown timer
   - دکھاتا ہے کہ کتنے گھنٹے/منٹ باقی ہیں
   - 24 گھنٹے مکمل ہونے پر claim button نظر آتا ہے

## Commission Rate
- **نیا Rate**: 14% (پہلے 12% تھا)
- $100 plan = $14 commission
- $500 plan = $70 commission
- $1000 plan = $140 commission

## Important Points

✅ **Automatic نہیں**: Rewards خود wallet میں نہیں آتے، claim کرنا ضروری ہے
✅ **24 گھنٹے انتظار**: ہر reward کو claim کرنے کے لیے 24 گھنٹے کا gap ضروری ہے
✅ **کوئی Time Limit نہیں**: Unclaimed rewards ہمیشہ کے لیے available رہتے ہیں
✅ **Bulk Claim**: سارے ready rewards ایک ساتھ claim کیے جا سکتے ہیں
✅ **فوری Withdrawal**: Claimed amount فوراً withdraw کے لیے available ہو جاتا ہے

## Access کرنے کا طریقہ

Dashboard کے Sidebar میں "Daily Rewards" کا آپشن نظر آئے گا (Gift icon کے ساتھ)

## فوائد

### صارفین کے لیے:
- ✅ اپنے تمام rewards ایک جگہ دیکھیں
- ✅ واضح طور پر پتا چلے کہ کب claim کر سکتے ہیں
- ✅ سارے rewards ایک ساتھ claim کریں
- ✅ Complete history دیکھیں
- ✅ Real-time countdown timers

### Platform کے لیے:
- ✅ Users روزانہ واپس آتے ہیں
- ✅ Fair distribution system
- ✅ Complete tracking
- ✅ بہتر engagement

## مثال

### Scenario 1:
- آپ نے 3 لوگوں کو refer کیا
- ان تینوں نے plans خریدے:
  - Person A: $100 plan → $14 commission
  - Person B: $200 plan → $28 commission  
  - Person C: $500 plan → $70 commission
- Total: $112 commission

### Claim Process:
1. Day 1, 10:00 AM: Commissions create ہوئے
2. Day 2, 10:00 AM: سب claim کے لیے ready
3. آپ Daily Rewards page پر جائیں
4. "Claim All" button پر کلک کریں
5. $112 آپ کے wallet میں add ہو جائیں گے

## Technical Details

### API Endpoints:
- `GET /api/daily-rewards` - سارے rewards fetch کریں
- `POST /api/daily-rewards` - ایک reward claim کریں
- `PUT /api/daily-rewards` - سارے ready rewards claim کریں

### Database:
Commission model میں نئی fields add ہوئیں:
- `isClaimed`: کیا claim ہو چکا ہے؟
- `claimedAt`: کب claim ہوا؟
- `nextClaimTime`: کب claim کیا جا سکتا ہے؟
- `commissionRate`: 14% (0.14)

## Support

اگر کوئی مسئلہ ہو تو:
- WhatsApp Customer Support استعمال کریں
- Sidebar میں "Customer Support" کا لنک ہے

---

یہ system مکمل طور پر کام کر رہا ہے اور production کے لیے تیار ہے! 🎉
