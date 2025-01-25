"use client";

import React from "react";
import UserSession from "@/lib/UserSession";
import { Skeleton, Card } from "@nextui-org/react";
import Navbar from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import Link from "next/link";

const Dashboard = () => {
  const { loading, data, error } = UserSession();
  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-3xl mb-4'>{error}</p>
          <Link href='/auth/login' className='text-blue-500 hover:underline'>
            Login again
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className='flex h-screen bg-gray-100'>
      <title>Dashboard</title>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-200'>
          <div className='container mx-auto px-6 py-20'>
            {!data?.isAdmin && data?.plan === "Free" && (
              <Card className='rounded-md border-l-4 border-black bg-gray-100 p-4 mb-4'>
                <div className='flex items-center justify-between space-x-4'>
                  <p className='text-sm font-medium'>
                    Upgrade to Pro Plans to Earn more 10x{" "}
                    <Link
                      href='/pricing'
                      className='underline hover:opacity-70 transition-all'>
                      View All Plans
                    </Link>
                  </p>
                </div>
              </Card>
            )}
            <h3 className='text-gray-700 text-3xl font-medium'>Dashboard</h3>
            {loading ? (
              <div className='flex flex-col space-y-4 mt-4'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-64 w-full' />
              </div>
            ) : error ? (
              <div className='text-red-500 mt-4'>Error: {error.message}</div>
            ) : data?.isAdmin ? (
              <AdminDashboard />
            ) : (
              <UserDashboard />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
