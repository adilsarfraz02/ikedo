// pages/api/admin/dashboard.ts
import type { NextApiRequest, NextApiResponse } from "next";

type User = {
  plan: string;
  _id: string;
  username: string;
  image: string;
  email: string;
  isVerified: boolean;
  isWithdraw: boolean;
  isWithdrawAmount: number;
  isAdmin: boolean;
  paymentStatus: string;
  tReferralCount: number;
};

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  // In a real-world scenario, you'd fetch this data from your database
  const users: User[] = [
  ];

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
