export async function GET(req, res) {
  const users = [];

  const totalUsers = users.length;
  const totalVerifiedUsers = users.filter((user) => user.isVerified).length;
  const totalWithdrawAmount = users.reduce(
    (sum, user) => sum + user.isWithdrawAmount,
    0,
  );
  const totalReferrals = users.reduce(
    (sum, user) => sum + user.tReferralCount,
    0,
  );

  res.status(200).json({
    totalUsers,
    totalVerifiedUsers,
    totalWithdrawAmount,
    totalReferrals,
  });
}
