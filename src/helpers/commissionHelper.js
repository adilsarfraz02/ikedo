import User from "@/models/userModel";
import Commission from "@/models/Commission";

/**
 * Award referral commission to the referrer when a new user signs up
 * @param {string} referrerId - The ID of the user who referred
 * @param {string} referredUserId - The ID of the new user who signed up
 * @param {number} commissionAmount - The commission amount (default: 12% of plan price)
 * @param {string} planName - The plan the new user purchased
 */
export async function awardReferralCommission(
  referrerId,
  referredUserId,
  commissionAmount,
  planName = "Standard"
) {
  try {
    const referrer = await User.findById(referrerId);
    const referredUser = await User.findById(referredUserId);

    if (!referrer || !referredUser) {
      console.error("Referrer or referred user not found");
      return false;
    }

    // Create commission record
    const commission = new Commission({
      userId: referrerId,
      referredUserId: referredUserId,
      amount: commissionAmount,
      commissionType: "referral",
      planName: planName,
      status: "approved",
      description: `Referral commission from ${referredUser.username} (${planName} plan)`,
    });
    await commission.save();

    // Update referrer's wallet
    referrer.walletBalance += commissionAmount;
    referrer.isWithdrawAmount += commissionAmount;
    referrer.totalEarnings += commissionAmount;
    await referrer.save();

    return true;
  } catch (error) {
    console.error("Error awarding referral commission:", error);
    return false;
  }
}

/**
 * Award commission when a referred user purchases a plan
 * @param {string} referrerId - The ID of the user who referred
 * @param {string} referredUserId - The ID of the user who made the purchase
 * @param {string} planName - The plan purchased
 * @param {number} planPrice - The price of the plan
 * @param {number} commissionRate - The commission rate (default: 0.12 = 12%)
 */
export async function awardPlanPurchaseCommission(
  referrerId,
  referredUserId,
  planName,
  planPrice,
  commissionRate = 0.12
) {
  try {
    const commissionAmount = planPrice * commissionRate;
    const referrer = await User.findById(referrerId);
    const referredUser = await User.findById(referredUserId);

    if (!referrer || !referredUser) {
      console.error("Referrer or referred user not found");
      return false;
    }

    // Create commission record
    const commission = new Commission({
      userId: referrerId,
      referredUserId: referredUserId,
      amount: commissionAmount,
      commissionType: "plan_purchase",
      planName: planName,
      status: "approved",
      description: `Commission from ${referredUser.username}'s ${planName} plan purchase ($${planPrice})`,
    });
    await commission.save();

    // Update referrer's wallet
    referrer.walletBalance += commissionAmount;
    referrer.isWithdrawAmount += commissionAmount;
    referrer.totalEarnings += commissionAmount;
    await referrer.save();

    return true;
  } catch (error) {
    console.error("Error awarding plan purchase commission:", error);
    return false;
  }
}

/**
 * Get commission rate for a plan
 * @param {string} planName - The plan name
 * @returns {number} Commission rate (12% for all plans currently)
 */
export function getCommissionRate(planName) {
  // Currently all plans have 12% commission
  return 0.12;
}

/**
 * Calculate commission amount
 * @param {number} planPrice - The price of the plan
 * @param {number} commissionRate - The commission rate (default: 0.12)
 * @returns {number} Commission amount
 */
export function calculateCommission(planPrice, commissionRate = 0.12) {
  return planPrice * commissionRate;
}
