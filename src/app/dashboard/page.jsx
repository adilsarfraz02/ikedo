"use client";

import React from "react";
import UserSession from "@/lib/UserSession"; // Ensure this path is correct
import { Skeleton } from "@nextui-org/react";
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import AdminDashboard from "./components/AdminDashboard";
import UsDashboard from "./components/UserDashboard"; // Check this path

const Dashboard = () => {
  const { loading, data, error } = UserSession();

  return (
    <>
      <title>Dashobard</title>
      <Navbar />
      <div className='w-full min-h-screen py-20 flex  flex-col justify-center items-center'>
        {loading ? (
          <div className='flex flex-col mb-4 transition-all w-full space-y-4 px-8 min-h-screen items-center'>
            <Skeleton className='w-full h-24 rounded-xl' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-44 w-full' />
            <Skeleton className='h-4 w-full' />
          </div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : data?.isAdmin ? (
          <AdminDashboard />
        ) : (
          <UsDashboard />
        )}
      </div>
      <SimpleFooter />
    </>
  );
};

export default Dashboard;
