/**
 * Manual Testing Utilities for Commission System
 * Use these functions to test the commission system manually
 */

// Test data for development
export const testData = {
  planPrices: {
    Standard: 50,
    Pro: 100,
    Premium: 500,
    Free: 0,
  },
  commissionRate: 0.12, // 12%
  dailyReturnRates: {
    Standard: 0.05, // 5%
    Pro: 0.08, // 8%
    Premium: 0.1, // 10%
  },
};

/**
 * Calculate expected daily return for a plan
 * @param {string} planName - The plan name
 * @returns {number} Daily return amount
 */
export function calculateDailyReturn(planName) {
  const price = testData.planPrices[planName] || 0;
  const rate = testData.dailyReturnRates[planName] || 0;
  return price * rate;
}

/**
 * Calculate expected commission for a referral
 * @param {string} planName - The plan name
 * @returns {number} Commission amount
 */
export function calculateReferralCommission(planName) {
  const price = testData.planPrices[planName] || 0;
  return price * testData.commissionRate;
}

/**
 * Test daily returns calculation
 */
export function testDailyReturns() {
  console.log("=== Daily Returns Test ===");
  Object.keys(testData.planPrices).forEach((plan) => {
    if (plan !== "Free") {
      const dailyReturn = calculateDailyReturn(plan);
      console.log(
        `${plan}: $${testData.planPrices[plan]} -> Daily Return: $${dailyReturn.toFixed(2)}`
      );
    }
  });
}

/**
 * Test commission calculations
 */
export function testCommissions() {
  console.log("\n=== Commission Test ===");
  Object.keys(testData.planPrices).forEach((plan) => {
    if (plan !== "Free") {
      const commission = calculateReferralCommission(plan);
      console.log(
        `${plan}: $${testData.planPrices[plan]} -> Commission: $${commission.toFixed(2)} (${testData.commissionRate * 100}%)`
      );
    }
  });
}

/**
 * Test withdrawal scenarios
 */
export function testWithdrawal() {
  console.log("\n=== Withdrawal Test ===");
  
  const scenarios = [
    { balance: 100, withdrawal: 50, expected: "success" },
    { balance: 50, withdrawal: 51, expected: "insufficient funds" },
    { balance: 100, withdrawal: 100, expected: "success" },
    { balance: 0, withdrawal: 10, expected: "insufficient funds" },
  ];

  scenarios.forEach((scenario, index) => {
    const canWithdraw = scenario.balance >= scenario.withdrawal;
    const result = canWithdraw ? "✓ Success" : "✗ Failed";
    console.log(
      `Test ${index + 1}: Balance: $${scenario.balance}, Withdraw: $${scenario.withdrawal} -> ${result}`
    );
  });
}

/**
 * Test earnings accumulation over time
 * @param {string} planName - The plan name
 * @param {number} days - Number of days to simulate
 */
export function testEarningsOverTime(planName, days = 30) {
  console.log(`\n=== Earnings Simulation for ${planName} Plan (${days} days) ===`);
  
  const dailyReturn = calculateDailyReturn(planName);
  const planPrice = testData.planPrices[planName];
  let totalEarnings = 0;
  let daysToBreakEven = 0;

  for (let day = 1; day <= days; day++) {
    totalEarnings += dailyReturn;
    if (totalEarnings >= planPrice && daysToBreakEven === 0) {
      daysToBreakEven = day;
    }

    if (day % 5 === 0) {
      console.log(
        `Day ${day}: Total Earnings: $${totalEarnings.toFixed(2)} (${((totalEarnings / planPrice) * 100).toFixed(2)}% ROI)`
      );
    }
  }

  console.log(`\nSummary:`);
  console.log(`- Plan Price: $${planPrice}`);
  console.log(`- Daily Return: $${dailyReturn.toFixed(2)}`);
  console.log(`- Total Earnings (${days} days): $${totalEarnings.toFixed(2)}`);
  console.log(`- ROI: ${((totalEarnings / planPrice) * 100).toFixed(2)}%`);
  console.log(`- Break-even Day: Day ${daysToBreakEven}`);
}

/**
 * Test referral earning potential
 * @param {string} planName - The plan name
 * @param {number} referrals - Number of referrals
 */
export function testReferralEarnings(planName, referrals = 10) {
  console.log(`\n=== Referral Earnings Test (${referrals} referrals of ${planName} plan) ===`);
  
  const commissionPerReferral = calculateReferralCommission(planName);
  const totalCommission = commissionPerReferral * referrals;
  const planPrice = testData.planPrices[planName];

  console.log(`- Commission per referral: $${commissionPerReferral.toFixed(2)}`);
  console.log(`- Total referral earnings: $${totalCommission.toFixed(2)}`);
  console.log(`- Equivalent to ${(totalCommission / planPrice).toFixed(2)} ${planName} plans`);
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║        Commission System - Manual Test Suite              ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  
  testDailyReturns();
  testCommissions();
  testWithdrawal();
  testEarningsOverTime("Standard", 30);
  testEarningsOverTime("Pro", 30);
  testEarningsOverTime("Premium", 30);
  testReferralEarnings("Standard", 10);
  testReferralEarnings("Pro", 10);
  testReferralEarnings("Premium", 10);
  
  console.log("\n✅ All tests completed!");
}

// Browser-compatible version
if (typeof window !== "undefined") {
  window.commissionTests = {
    runAllTests,
    testDailyReturns,
    testCommissions,
    testWithdrawal,
    testEarningsOverTime,
    testReferralEarnings,
    calculateDailyReturn,
    calculateReferralCommission,
  };
}

// Node.js export
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    runAllTests,
    testDailyReturns,
    testCommissions,
    testWithdrawal,
    testEarningsOverTime,
    testReferralEarnings,
    calculateDailyReturn,
    calculateReferralCommission,
    testData,
  };
}
