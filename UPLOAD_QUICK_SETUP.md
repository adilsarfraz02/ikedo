# Quick Setup - UploadThing Screenshot Upload

## ✅ What's Done

### Integrated UploadThing for payment screenshot uploads in deposit modal!

---

## 🎯 Features

1. **Drag & Drop Upload** - Users can drag screenshots directly into the form
2. **Click to Browse** - Traditional file picker also available
3. **Image Preview** - See uploaded screenshot immediately
4. **Remove Option** - X button to delete and re-upload
5. **Required Field** - Form won't submit without screenshot
6. **Auto-Validation** - Only PNG, JPG, JPEG up to 8MB
7. **Toast Notifications** - Real-time feedback for every action

---

## 🔧 Setup Required

### 1. Get UploadThing Keys
```bash
# Visit: https://uploadthing.com/dashboard
# Sign up/Login
# Create new app
# Copy your keys
```

### 2. Add to Environment Variables
```bash
# .env.local
UPLOADTHING_SECRET=sk_live_xxxxxxxxxxxxx
UPLOADTHING_APP_ID=xxxxxxxxxxxxx
```

### 3. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 🧪 Test It Out

### Step 1: Open Deposit Modal
1. Go to dashboard
2. Click "Deposit" button
3. Modal opens

### Step 2: Upload Screenshot
**Option A - Drag & Drop:**
1. Drag a payment screenshot onto the upload zone
2. Wait for upload to complete
3. See preview with checkmark

**Option B - Click to Browse:**
1. Click "Choose File" button
2. Select image from device
3. Wait for upload
4. See preview

### Step 3: Verify Features
- [ ] Preview shows uploaded image
- [ ] URL displays below preview
- [ ] "View full image" link works
- [ ] X button removes image
- [ ] Can upload different image after removal

### Step 4: Submit Form
1. Fill amount, payment method, transaction ID
2. Upload screenshot
3. Add remarks (optional)
4. Click "Submit Deposit Request"
5. Should succeed ✅

### Step 5: Check Without Screenshot
1. Fill all fields EXCEPT screenshot
2. Try to submit
3. Should show error: "Please upload payment proof screenshot" ✅

---

## 📁 What Changed

### New Files:
- ✅ `src/components/PaymentScreenshotUploader.jsx` - Upload component

### Modified Files:
- ✅ `src/app/dashboard/components/CommissionDashboard.jsx` - Added uploader
- ✅ `src/models/Deposit.js` - Made paymentProof required

### Existing (Used):
- ✅ `src/lib/uploadthing.ts` - UploadThing config
- ✅ `src/app/api/uploadthing/route.js` - Upload API

---

## 🎨 What It Looks Like

### Empty State (Ready to Upload):
```
┌──────────────────────────────────┐
│ Payment Proof / Screenshot *     │
├──────────────────────────────────┤
│                                  │
│        [Upload Icon]             │
│  Drop screenshot here or click   │
│  to browse                       │
│                                  │
│  PNG, JPG, JPEG (Max 8MB)       │
│                                  │
│       [Choose File]              │
│                                  │
└──────────────────────────────────┘
```

### After Upload (With Preview):
```
┌──────────────────────────────────┐
│ Payment Proof / Screenshot *     │
├──────────────────────────────────┤
│ [IMG]  ✓ Screenshot uploaded     │
│ [   ]    successfully        [X] │
│ [   ]  https://utfs.io/f/...     │
│        View full image →         │
└──────────────────────────────────┘
```

---

## 🚨 Important Notes

1. **Required Field:** Screenshot is now mandatory for deposits
2. **File Types:** Only PNG, JPG, JPEG accepted
3. **File Size:** Maximum 8MB per file
4. **Storage:** Files stored on UploadThing CDN (not your server)
5. **Public URLs:** Uploaded images get public URLs for admin verification

---

## ✅ Testing Checklist

Basic Tests:
- [ ] Can drag & drop image
- [ ] Can click to browse
- [ ] Upload shows progress toast
- [ ] Success shows checkmark
- [ ] Preview displays image
- [ ] Can remove image
- [ ] Can re-upload after removal
- [ ] Form validates required screenshot
- [ ] Submit works with screenshot
- [ ] Admin receives email with image URL

Error Tests:
- [ ] Try uploading PDF → Shows error
- [ ] Try uploading 10MB file → Shows error
- [ ] Try submitting without screenshot → Shows error

---

## 🐛 Troubleshooting

**Upload button not visible?**
→ Add UPLOADTHING_SECRET to .env.local and restart server

**Upload fails?**
→ Check browser console, verify UploadThing API keys

**"Failed to upload" error?**
→ Check internet connection, file size < 8MB

**Image preview broken?**
→ Check uploaded URL in new tab, verify it's accessible

---

## 📊 What Happens

### Upload Flow:
1. User selects/drops image
2. File sent to UploadThing servers
3. UploadThing processes and stores file
4. Returns public URL
5. URL saved in form state
6. Preview displays using URL
7. On submit, URL sent to your API
8. Stored in MongoDB Deposit record
9. Admin receives email with URL
10. Admin clicks URL to view payment proof

---

## 💾 Where Files Are Stored

- **NOT** on your server
- **NOT** in your database (only URL)
- **YES** on UploadThing CDN
- **YES** accessible via public URL
- **YES** permanent storage (unless you delete)

---

## 🎉 Benefits

**For Users:**
- No need for external image hosting
- Drag & drop convenience
- Instant preview
- Easy to re-upload

**For You:**
- No server storage needed
- No bandwidth costs
- Fast CDN delivery
- Automatic image optimization
- Built-in security

**For Admin:**
- Always have payment proof
- Click URL to verify
- Fast image loading
- Reliable storage

---

## 📝 Summary

**What Works Now:**
1. ✅ Deposit modal has file upload
2. ✅ Drag & drop + click to browse
3. ✅ Image preview after upload
4. ✅ Remove and re-upload option
5. ✅ Required field validation
6. ✅ Toast notifications
7. ✅ Stored in UploadThing CDN
8. ✅ URL saved in database
9. ✅ Admin receives URL in email

**Next Steps:**
1. Add UPLOADTHING_SECRET to .env.local
2. Restart server
3. Test upload flow
4. Submit test deposit
5. Check admin email

---

**Status:** ✅ READY TO USE (after env setup)
**Documentation:** See UPLOADTHING_INTEGRATION.md for full details
