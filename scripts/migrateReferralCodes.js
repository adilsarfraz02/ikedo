// Migration script to update existing users with username-based referral codes
// Run this once to migrate all existing users

import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";

// Generate username-based referral code (cleaned and URL-safe)
function generateUsernameReferralCode(username) {
  if (!username) return null;
  
  // Remove special characters and spaces, keep only alphanumeric and hyphens
  let cleaned = username
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  
  // Add a short unique identifier to avoid collisions
  const uniqueId = Math.random().toString(36).substring(2, 8);
  return `${cleaned}-${uniqueId}`;
}

async function migrateReferralCodes() {
  try {
    await connect();
    console.log("Connected to database");

    // Find all users without a referralCode
    const users = await User.find({ 
      $or: [
        { referralCode: { $exists: false } },
        { referralCode: null },
        { referralCode: "" }
      ]
    });

    console.log(`Found ${users.length} users to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const referralCode = generateUsernameReferralCode(user.username);
        
        // Check if this code already exists
        const existing = await User.findOne({ referralCode });
        if (existing) {
          console.log(`Collision detected for ${user.username}, regenerating...`);
          // Regenerate until unique
          let newCode;
          let attempts = 0;
          do {
            newCode = generateUsernameReferralCode(user.username);
            const check = await User.findOne({ referralCode: newCode });
            attempts++;
            if (!check) break;
          } while (attempts < 10);
          
          user.referralCode = newCode;
        } else {
          user.referralCode = referralCode;
        }
        
        user.ReferralUrl = `${process.env.DOMAIN}/auth/signup?ref=${user.referralCode}`;
        
        // Use updateOne to avoid triggering pre-save hooks
        await User.updateOne(
          { _id: user._id },
          { 
            referralCode: user.referralCode,
            ReferralUrl: user.ReferralUrl
          }
        );
        
        successCount++;
        console.log(`✓ Updated ${user.username}: ${user.referralCode}`);
      } catch (error) {
        errorCount++;
        console.error(`✗ Error updating ${user.username}:`, error.message);
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total: ${users.length}`);

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit();
  }
}

// Run migration
migrateReferralCodes();
