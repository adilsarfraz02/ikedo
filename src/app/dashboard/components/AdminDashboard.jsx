-"use client";

import React, { useEffect, useState } from "react";
import AllUserTable from "./AllUserTable";
import AdminCharts from "./AdminCharts";
import AdminReferralCommissionDashboard from "./AdminReferralCommissionDashboard";
import UserSession from "@/lib/UserSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, DollarSign, Users } from "lucide-react";
import PaymentNumberUpdate from "@/app/dashboard/components/PaymentUpdate";

const AdminDashboard = () => {
  const { data: user, loading, error } = UserSession();
  const [dashboardData, setDashboardData] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/users", {
          cache: "no-cache",
        });
        const users = await response.json();
        const totalUsers = users.length;
        const totalVerifiedUsers = users.filter(
          (user) => user.isVerified
        ).length;
        const totalWithdrawAmount = users.reduce(
          (sum, user) => sum + (user.isWithdrawAmount || 0),
          0
        );
        const totalReferrals = users.reduce(
          (sum, user) => sum + (user.tReferralCount || 0),
          0
        );
        setDashboardData({
          users,
          totalUsers,
          totalVerifiedUsers,
          totalWithdrawAmount,
          totalReferrals,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      <h1 className="text-3xl text-start font-bold mb-4 py-4">
        Welcome {user?.username}
      </h1>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalVerifiedUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total verified users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Withdraw Amount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData?.totalWithdrawAmount.toFixed(2) || "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Total amount withdrawn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalReferrals || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total referrals made
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="w-full grid grid-cols-1 py-2 gap-4">
        <AllUserTable />
        <AdminCharts dashboardData={dashboardData} />
        <AdminReferralCommissionDashboard />
        <PaymentNumberUpdate />
      </div>
    </>
  );
};

export default AdminDashboard;
