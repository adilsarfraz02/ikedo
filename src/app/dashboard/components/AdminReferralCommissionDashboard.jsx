"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Avatar, Chip, Input } from "@nextui-org/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Award, 
  Calendar,
  Copy,
  CheckCircle2
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AdminReferralCommissionDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/referrals-commissions");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, code) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredUsers = data?.allUsers?.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-red-500">Failed to load data</div>;
  }

  const pieChartData = [
    { name: "Referral", value: data.commissionByType.referral },
    { name: "Plan Purchase", value: data.commissionByType.plan_purchase },
    { name: "Daily Bonus", value: data.commissionByType.daily_bonus },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Referral & Commission System</h2>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium">Total Referrals</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">{data.stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.stats.activeReferrers} active referrers
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium">Total Commissions Paid</p>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">Rs {data.stats.totalCommissionsPaid.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium">Today's Earnings</p>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">Rs {data.stats.todayEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.stats.todayCommissionsCount} commissions today
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <p className="text-sm font-medium">Total Wallet Balance</p>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardBody>
            <div className="text-2xl font-bold">Rs {data.stats.totalWalletBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All users combined
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Commission Timeline */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Commission Timeline (Last 7 Days)</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.commissionTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  name="Amount (Rs)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#82ca9d" 
                  name="Count"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Commission by Type */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Commission Breakdown by Type</h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Top 10 Referrers
          </h3>
        </CardHeader>
        <CardBody>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Referral Code</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Total Earnings</TableHead>
                <TableHead>Wallet Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topReferrers.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell className="font-bold">#{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar src={user.image} alt={user.username} size="sm" />
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {user.referralCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(user.referralCode, user.referralCode)}
                        className="hover:text-blue-500"
                      >
                        {copiedCode === user.referralCode ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip color="primary" variant="flat">
                      {user.referralCount}
                    </Chip>
                  </TableCell>
                  <TableCell className="font-semibold">Rs {user.totalEarnings.toFixed(2)}</TableCell>
                  <TableCell className="font-semibold text-green-600">Rs {user.walletBalance.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* All Users Referral Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All Users Referral System</h3>
            <Input
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Referrals</TableHead>
                  <TableHead>Today's Earnings</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers?.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar src={user.image} alt={user.username} size="sm" />
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {user.referralCode || "N/A"}
                          </code>
                          {user.referralCode && (
                            <button
                              onClick={() => copyToClipboard(user.ReferralUrl, user.referralCode)}
                              className="hover:text-blue-500"
                            >
                              {copiedCode === user.referralCode ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          color={
                            user.plan === "Premium" ? "success" :
                            user.plan === "Pro" ? "warning" :
                            user.plan === "Standard" ? "primary" :
                            "default"
                          }
                          variant="flat"
                        >
                          {user.plan}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Chip color="primary" variant="flat">
                          {user.tReferralCount || 0}
                        </Chip>
                      </TableCell>
                      <TableCell>Rs {(user.todayEarnings || 0).toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">Rs {(user.totalEarnings || 0).toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-green-600">Rs {(user.walletBalance || 0).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip color={user.isVerified ? "success" : "warning"}>
                          {user.isVerified ? "Verified" : "Pending"}
                        </Chip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Recent Commissions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Commissions (Last 50)</h3>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Earner</TableHead>
                  <TableHead>From User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentCommissions.map((commission) => (
                  <TableRow key={commission._id}>
                    <TableCell>
                      {new Date(commission.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar 
                          src={commission.userId?.image} 
                          alt={commission.userId?.username} 
                          size="sm" 
                        />
                        <span className="font-medium">{commission.userId?.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar 
                          src={commission.referredUserId?.image} 
                          alt={commission.referredUserId?.username} 
                          size="sm" 
                        />
                        <span>{commission.referredUserId?.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        color={
                          commission.commissionType === "plan_purchase" ? "success" :
                          commission.commissionType === "referral" ? "primary" :
                          "warning"
                        }
                        variant="flat"
                        size="sm"
                      >
                        {commission.commissionType.replace('_', ' ')}
                      </Chip>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      Rs {commission.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {commission.description || commission.planName || "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminReferralCommissionDashboard;
