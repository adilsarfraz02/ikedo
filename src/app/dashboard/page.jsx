"use client";

import React from "react";
import UserSession from "@/lib/UserSession";
import { Skeleton } from "@nextui-org/react";
import Navbar from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";

const Dashboard = () => {
  const { loading, data, error } = UserSession();

  if (data?.username) {
    return (
      <div className='flex h-screen bg-gray-100'>
        <Sidebar />
        <div className='flex-1 flex flex-col overflow-hidden'>
          <main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-200'>
            <div className='container mx-auto px-6 py-8'>
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
  }

  return null;
};

export default Dashboard;
