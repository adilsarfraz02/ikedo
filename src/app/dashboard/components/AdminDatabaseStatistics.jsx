"use client";

import React from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Progress,
  Tabs,
  Tab,
} from "@nextui-org/react";
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Activity,
  BarChart3,
  PieChart,
} from "lucide-react";

const AdminDatabaseStatistics = ({ analyticsData }) => {
  if (!analyticsData) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-500">Loading statistics...</p>
        </CardBody>
      </Card>
    );
  }

  const {
    users,
    investments,
    wallets,
    commissions,
    deposits,
    withdrawals,
    referrals,
    financial,
  } = analyticsData;

  // Calculate percentages
  const verificationRate = ((users.verified / users.total) * 100).toFixed(1);
  const investmentRate = ((users.withInvestments / users.total) * 100).toFixed(1);
  const depositVerificationRate = ((deposits.verified / deposits.total) * 100).toFixed(1);
  const withdrawalCompletionRate = ((withdrawals.completed / withdrawals.total) * 100).toFixed(1);
  const commissionClaimRate = ((commissions.claimed / commissions.total) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Main Database Overview */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <CardHeader>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6" />
            Database Overview
          </h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm opacity-90">Total Users</p>
              <p className="text-3xl font-bold">{users.total}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Total Investments</p>
              <p className="text-3xl font-bold">${investments.total.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Total Commissions</p>
              <p className="text-3xl font-bold">{commissions.total}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">Platform Profit</p>
              <p className="text-3xl font-bold">${financial.profit.toFixed(0)}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="text-primary" />
            Financial Overview
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                <Chip color="success" size="sm" variant="flat">
                  Revenue
                </Chip>
              </div>
              <p className="text-2xl font-bold text-green-600">
                ${financial.revenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total platform revenue</p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <ArrowDownRight className="w-5 h-5 text-orange-600" />
                <Chip color="warning" size="sm" variant="flat">
                  Liability
                </Chip>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                ${financial.liability.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total owed to users</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <Chip color="primary" size="sm" variant="flat">
                  Profit
                </Chip>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ${financial.profit.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Net profit</p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <Chip color="secondary" size="sm" variant="flat">
                  Completed
                </Chip>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                ${financial.completedPayouts.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total paid out</p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-red-600" />
                <Chip color="danger" size="sm" variant="flat">
                  Pending
                </Chip>
              </div>
              <p className="text-2xl font-bold text-red-600">
                ${financial.pendingLiability.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600 mt-1">Pending payouts</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Detailed Statistics Tabs */}
      <Card>
        <CardBody>
          <Tabs color="primary" variant="underlined">
            {/* Users Tab */}
            <Tab
              key="users"
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Users ({users.total})</span>
                </div>
              }
            >
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardBody>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Verified Users</p>
                        <Chip color="success" size="sm" variant="flat">
                          {verificationRate}%
                        </Chip>
                      </div>
                      <p className="text-2xl font-bold">{users.verified}</p>
                      <Progress
                        value={parseFloat(verificationRate)}
                        color="success"
                        className="mt-2"
                        size="sm"
                      />
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">Unverified Users</p>
                        <Chip color="warning" size="sm" variant="flat">
                          {(100 - verificationRate).toFixed(1)}%
                        </Chip>
                      </div>
                      <p className="text-2xl font-bold">{users.unverified}</p>
                      <Progress
                        value={100 - parseFloat(verificationRate)}
                        color="warning"
                        className="mt-2"
                        size="sm"
                      />
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-600">With Investments</p>
                        <Chip color="primary" size="sm" variant="flat">
                          {investmentRate}%
                        </Chip>
                      </div>
                      <p className="text-2xl font-bold">{users.withInvestments}</p>
                      <Progress
                        value={parseFloat(investmentRate)}
                        color="primary"
                        className="mt-2"
                        size="sm"
                      />
                    </CardBody>
                  </Card>
                </div>

                <Card className="bg-gray-50">
                  <CardBody>
                    <h4 className="font-semibold mb-3">Users by Plan</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(users.byPlan).map(([plan, count]) => (
                        <div key={plan} className="p-3 bg-white rounded-lg">
                          <p className="text-sm text-gray-600">{plan}</p>
                          <p className="text-xl font-bold">{count}</p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            {/* Wallets Tab */}
            <Tab
              key="wallets"
              title={
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span>Wallets</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
                  <CardBody>
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium text-gray-700">
                        Total Wallet Balance
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      ${wallets.totalBalance.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Sum of all user wallets
                    </p>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-cyan-100">
                  <CardBody>
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <p className="text-sm font-medium text-gray-700">
                        Total Withdrawable
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">
                      ${wallets.totalWithdrawable.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Available for withdrawal
                    </p>
                  </CardBody>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-100">
                  <CardBody>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <p className="text-sm font-medium text-gray-700">
                        Total Earnings
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                      ${wallets.totalEarnings.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      Lifetime earnings
                    </p>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            {/* Commissions Tab */}
            <Tab
              key="commissions"
              title={
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  <span>Commissions ({commissions.total})</span>
                </div>
              }
            >
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardBody>
                      <p className="text-sm text-gray-600 mb-1">Claimed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {commissions.claimed}
                      </p>
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        ${commissions.claimedAmount.toFixed(2)}
                      </p>
                      <Progress
                        value={parseFloat(commissionClaimRate)}
                        color="success"
                        className="mt-2"
                        size="sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {commissionClaimRate}% claimed
                      </p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <p className="text-sm text-gray-600 mb-1">Unclaimed</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {commissions.unclaimed}
                      </p>
                      <p className="text-sm font-semibold text-orange-600 mt-1">
                        ${commissions.unclaimedAmount.toFixed(2)}
                      </p>
                      <Progress
                        value={100 - parseFloat(commissionClaimRate)}
                        color="warning"
                        className="mt-2"
                        size="sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {(100 - commissionClaimRate).toFixed(1)}% pending
                      </p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${commissions.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 mt-3">
                        All commission earnings
                      </p>
                    </CardBody>
                  </Card>
                </div>

                <Card className="bg-gray-50">
                  <CardBody>
                    <h4 className="font-semibold mb-3">Commissions by Type</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(commissions.byType).map(([type, data]) => (
                        <div key={type} className="p-3 bg-white rounded-lg">
                          <p className="text-sm text-gray-600 capitalize">{type.replace('_', ' ')}</p>
                          <p className="text-xl font-bold">{data.count}</p>
                          <p className="text-sm text-green-600 font-semibold">
                            ${data.amount.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            {/* Deposits Tab */}
            <Tab
              key="deposits"
              title={
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Deposits ({deposits.total})</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {deposits.pending}
                    </p>
                    <p className="text-sm font-semibold text-orange-600 mt-1">
                      ${deposits.pendingAmount.toFixed(2)}
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600 mb-1">Verified</p>
                    <p className="text-2xl font-bold text-green-600">
                      {deposits.verified}
                    </p>
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      ${deposits.verifiedAmount.toFixed(2)}
                    </p>
                    <Progress
                      value={parseFloat(depositVerificationRate)}
                      color="success"
                      className="mt-2"
                      size="sm"
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {deposits.rejected}
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${deposits.totalAmount.toFixed(2)}
                    </p>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            {/* Withdrawals Tab */}
            <Tab
              key="withdrawals"
              title={
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Withdrawals ({withdrawals.total})</span>
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {withdrawals.pending}
                    </p>
                    <p className="text-sm font-semibold text-orange-600 mt-1">
                      ${withdrawals.pendingAmount.toFixed(2)}
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600 mb-1">Processing</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {withdrawals.processing}
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-600">
                      {withdrawals.completed}
                    </p>
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      ${withdrawals.completedAmount.toFixed(2)}
                    </p>
                    <Progress
                      value={parseFloat(withdrawalCompletionRate)}
                      color="success"
                      className="mt-2"
                      size="sm"
                    />
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600 mb-1">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {withdrawals.rejected}
                    </p>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${withdrawals.totalAmount.toFixed(2)}
                    </p>
                  </CardBody>
                </Card>
              </div>
            </Tab>

            {/* Referrals Tab */}
            <Tab
              key="referrals"
              title={
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Referrals ({referrals.total})</span>
                </div>
              }
            >
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardBody>
                      <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {referrals.total}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        Across all users
                      </p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody>
                      <p className="text-sm text-gray-600 mb-1">Active Referrers</p>
                      <p className="text-3xl font-bold text-green-600">
                        {referrals.usersWithReferrals}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">
                        Users with 1+ referrals
                      </p>
                    </CardBody>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <h4 className="font-semibold">Top 10 Referrers</h4>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-2">
                      {referrals.topReferrers.map((referrer, index) => (
                        <div
                          key={referrer.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Chip size="sm" color="primary" variant="flat">
                              #{index + 1}
                            </Chip>
                            <div>
                              <p className="font-semibold">{referrer.username}</p>
                              <p className="text-xs text-gray-600">{referrer.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600">
                              {referrer.referralCount} referrals
                            </p>
                            <p className="text-sm text-green-600">
                              ${referrer.totalEarnings.toFixed(2)} earned
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDatabaseStatistics;
