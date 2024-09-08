"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

export default function AdminCharts({ dashboardData }) {
  const [referralChartData, setReferralChartData] = useState([]);
  const [userChartData, setUserChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dashboardData && dashboardData.users) {
      const referralData = dashboardData.users.map((user) => ({
        username: user.username,
        referrals: user.tReferralCount || 0,
      }));
      setReferralChartData(referralData);

      const userData = dashboardData.users.reduce((acc, user, index) => {
        acc.push({
          username: user.username,
          totalUsers: index + 1,
        });
        return acc;
      }, []);
      setUserChartData(userData);

      setLoading(false);
    }
  }, [dashboardData]);

  const chartConfig = {
    referrals: {
      label: "Referrals",
      color: "hsl(var(--chart-1))",
    },
    totalUsers: {
      label: "Total Users",
      color: "hsl(var(--chart-2))",
    },
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='grid grid-cols-1 gap-4'>
      <Card className='w-full border'>
        <CardHeader>
          <CardTitle>Referrals Chart</CardTitle>
          <CardDescription>Displaying total referrals per user</CardDescription>
        </CardHeader>
        <CardContent className='p-0 pb-4'>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={referralChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='username'
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.split(" ")[0]}
                  interval={0}
                  tick={{ fontSize: 10, fill: "var(--foreground)" }}
                  angle={-45}
                  textAnchor='end'
                  height={60}
                />
                <YAxis
                  width={40}
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='bg-background p-2 border rounded shadow'>
                          <p className='font-bold'>
                            {payload[0].payload.username}
                          </p>
                          <p>Referrals: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey='referrals'
                  fill='var(--color-referrals)'
                  radius={4}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className='flex-col items-start gap-2 text-sm'>
          <div className='leading-none text-muted-foreground'>
            Showing total referrals per user
          </div>
        </CardFooter>
      </Card>

      <Card className='w-full border'>
        <CardHeader>
          <CardTitle>User Graph</CardTitle>
          <CardDescription>Displaying cumulative user count</CardDescription>
        </CardHeader>
        <CardContent className='p-0 pb-4'>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={userChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  dataKey='username'
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.split(" ")[0]}
                  interval={0}
                  tick={{ fontSize: 10, fill: "var(--foreground)" }}
                  angle={-45}
                  textAnchor='end'
                  height={60}
                />
                <YAxis
                  width={40}
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className='bg-background p-2 border rounded shadow'>
                          <p className='font-bold'>
                            {payload[0].payload.username}
                          </p>
                          <p>Total Users: {payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type='monotone'
                  dataKey='totalUsers'
                  stroke='var(--color-totalUsers)'
                  fill='var(--color-totalUsers)'
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className='flex-col items-start gap-2 text-sm'>
          <div className='leading-none text-muted-foreground'>
            Showing cumulative user count over time
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
