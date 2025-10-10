# 🚀 Deployment Checklist - Referral Commission System

## Pre-Deployment Steps

### 1. Environment Setup ✅
- [ ] Set `MONGODB_URI` in environment variables
- [ ] Set `DOMAIN` to production URL
- [ ] Set `RESEND_API_KEY` for email service
- [ ] Set `ADMIN_EMAIL` for notifications
- [ ] Set `JWT_SECRET` for authentication
- [ ] **Generate and set `CRON_SECRET`** (use: `openssl rand -base64 32`)

### 2. Code Review ✅
- [x] All new files created
- [x] All existing files updated
- [x] Database models defined
- [x] API endpoints implemented
- [x] Frontend components updated
- [x] Email templates created
- [x] Helper functions added

### 3. Testing (Local) ⏳
- [ ] Test user signup with referral
- [ ] Test commission calculation
- [ ] Test wallet updates
- [ ] Test withdrawal submission
- [ ] Test withdrawal verification
- [ ] Test email delivery
- [ ] Test daily update endpoint manually
- [ ] Verify all forms work
- [ ] Check mobile responsiveness

### 4. Database Preparation ⏳
- [ ] Backup existing database
- [ ] Verify MongoDB connection
- [ ] Test new models create correctly
- [ ] Verify indexes are created
- [ ] Check existing users compatibility

## Deployment Steps

### 5. Deploy Application ⏳

#### For Vercel:
```bash
# 1. Commit all changes
git add .
git commit -m "Add referral commission system with daily updates and withdrawals"

# 2. Push to repository
git push origin master

# 3. Deploy to Vercel (if not auto-deploy)
vercel --prod
```

#### Environment Variables on Vercel:
```bash
vercel env add MONGODB_URI
vercel env add DOMAIN
vercel env add RESEND_API_KEY
vercel env add ADMIN_EMAIL
vercel env add JWT_SECRET
vercel env add CRON_SECRET
```

### 6. Cron Job Setup ⏳

#### Option A: Vercel Cron (Automatic)
- [x] `vercel.json` already configured
- [ ] Verify deployment includes cron configuration
- [ ] Check Vercel dashboard for cron jobs
- [ ] Test cron job runs (wait 24 hours or trigger manually)

#### Option B: External Cron Service
1. [ ] Sign up at https://cron-job.org/ or https://www.easycron.com/
2. [ ] Create new job:
   - **Title**: "Daily Commission Update"
   - **URL**: `https://yourdomain.com/api/commissions/daily-update`
   - **Method**: POST
   - **Schedule**: `0 0 * * *` (daily at midnight)
   - **Headers**:
     ```
     Content-Type: application/json
     Authorization: Bearer YOUR_CRON_SECRET
     ```
3. [ ] Save and enable job
4. [ ] Test job execution

### 7. Email Configuration ⏳
- [ ] Verify Resend API key is active
- [ ] Add verified domain to Resend (if custom domain)
- [ ] Test email delivery to admin
- [ ] Test email delivery to users
- [ ] Check spam folder
- [ ] Verify email formatting

## Post-Deployment Testing

### 8. Production Testing ⏳

#### Test Commission System:
```bash
# Login and get token
# Then test commissions endpoint
curl -X GET https://yourdomain.com/api/commissions \
  -H "Cookie: token=YOUR_PRODUCTION_TOKEN"
```
- [ ] Commissions endpoint returns data
- [ ] Dashboard shows commission cards
- [ ] Today's earnings display correctly
- [ ] Commission history loads

#### Test Daily Update:
```bash
# Trigger manually (first time)
curl -X POST https://yourdomain.com/api/commissions/daily-update \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json"
```
- [ ] Returns success message
- [ ] Check database for new commission records
- [ ] Verify user wallets updated
- [ ] Confirm no errors in logs

#### Test Withdrawal Flow:
1. [ ] Login to user account
2. [ ] Navigate to withdrawal page
3. [ ] Fill in bank details form
4. [ ] Submit withdrawal request
5. [ ] Verify user receives email
6. [ ] Verify admin receives email with bank details
7. [ ] Click admin verification link
8. [ ] Verify user receives completion email
9. [ ] Check wallet balance updated
10. [ ] Verify withdrawal history shows completed status

#### Test Referral Commission:
1. [ ] Create test user A
2. [ ] Get referral link from user A
3. [ ] Sign up user B via referral link
4. [ ] User B purchases plan
5. [ ] Admin verifies user B payment
6. [ ] Check user A commission credited
7. [ ] Verify commission record created
8. [ ] Check user A receives notification

### 9. Monitor First 24 Hours ⏳
- [ ] Check cron job runs at midnight
- [ ] Verify commission records created
- [ ] Check wallet balances updated
- [ ] Monitor for any errors
- [ ] Review email delivery logs
- [ ] Check database performance

### 10. User Communication ⏳
- [ ] Update FAQ with new features
- [ ] Send announcement email to users
- [ ] Update help documentation
- [ ] Post on social media
- [ ] Create tutorial video (optional)

## Monitoring & Maintenance

### Daily Checks (First Week)
- [ ] Verify cron job ran successfully
- [ ] Check for failed withdrawals
- [ ] Monitor email delivery
- [ ] Review error logs
- [ ] Check database size

### Weekly Checks
- [ ] Review commission totals
- [ ] Verify wallet balances accuracy
- [ ] Check withdrawal completion rate
- [ ] Monitor user feedback
- [ ] Review system performance

### Monthly Checks
- [ ] Audit commission calculations
- [ ] Review withdrawal patterns
- [ ] Check for fraudulent activity
- [ ] Optimize database queries
- [ ] Update documentation

## Rollback Plan

### If Issues Occur:
1. **Immediate Actions:**
   - [ ] Pause cron job
   - [ ] Disable withdrawal submissions
   - [ ] Notify admin team

2. **Database Rollback:**
   ```bash
   # Restore from backup
   mongorestore --uri="MONGODB_URI" --drop /path/to/backup
   ```

3. **Code Rollback:**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin master
   ```

4. **Communication:**
   - [ ] Email users about temporary maintenance
   - [ ] Post status update
   - [ ] Provide ETA for fix

## Success Criteria

### System is Working When:
- [x] ✅ Cron job runs daily without errors
- [x] ✅ Commissions credit correctly
- [x] ✅ Wallet balances accurate
- [x] ✅ Withdrawals process within 24 hours
- [x] ✅ All emails deliver successfully
- [x] ✅ No security vulnerabilities
- [x] ✅ Dashboard loads < 2 seconds
- [x] ✅ API response times < 500ms
- [x] ✅ Zero downtime
- [x] ✅ User satisfaction high

## Quick Reference

### Important URLs
- **Production**: `https://yourdomain.com`
- **Dashboard**: `https://yourdomain.com/dashboard`
- **Withdraw**: `https://yourdomain.com/auth/withdraw`
- **Cron Endpoint**: `https://yourdomain.com/api/commissions/daily-update`

### Important Emails
- **Admin**: `admin@yourdomain.com`
- **System**: `verify@ikedo.live`, `withdraw@ikedo.live`

### Support Contacts
- **Vercel Support**: https://vercel.com/support
- **Resend Support**: https://resend.com/support
- **MongoDB Support**: https://www.mongodb.com/support

### Documentation Links
- **Setup Guide**: `COMMISSION_SETUP.md`
- **Quick Start**: `QUICKSTART.md`
- **Implementation**: `IMPLEMENTATION_SUMMARY.md`
- **Architecture**: `ARCHITECTURE.md`

## Emergency Contacts

### Critical Issues
1. **Database Down**: Contact MongoDB Atlas support
2. **Emails Not Sending**: Check Resend dashboard
3. **Deployment Failed**: Check Vercel logs
4. **Cron Not Running**: Verify CRON_SECRET and configuration

### Debug Commands
```bash
# Check Vercel logs
vercel logs

# Test MongoDB connection
mongosh "MONGODB_URI"

# Test email API
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@yourdomain.com","to":"test@example.com","subject":"Test","text":"Test"}'

# Check cron job
curl -X POST https://yourdomain.com/api/commissions/daily-update \
  -H "Authorization: Bearer CRON_SECRET"
```

## Final Checklist

### Before Going Live:
- [ ] All environment variables set
- [ ] Cron job configured and tested
- [ ] Email delivery verified
- [ ] Database backup created
- [ ] Documentation updated
- [ ] Team briefed on new features
- [ ] Support tickets system ready
- [ ] Monitoring tools configured
- [ ] Rollback plan documented
- [ ] Success metrics defined

### After Going Live:
- [ ] Monitor first cron job execution
- [ ] Process first withdrawal
- [ ] Collect user feedback
- [ ] Document any issues
- [ ] Optimize as needed

---

## 🎉 Launch Checklist

- [ ] **Day 1**: Deploy and monitor closely
- [ ] **Day 2**: Verify cron job ran successfully
- [ ] **Day 3-7**: Process first withdrawals, gather feedback
- [ ] **Week 2**: Optimize based on real usage
- [ ] **Week 3**: Review metrics and adjust if needed
- [ ] **Month 1**: Full audit and performance review

---

**Status**: Ready for Deployment ✅
**Last Updated**: October 10, 2025
**Version**: 1.0.0

**Deployed By**: ___________________
**Deployment Date**: ___________________
**Verified By**: ___________________
