"use client";

import React from "react";
import { CreditCard, Users } from "lucide-react";
import UserSession from "@/lib/UserSession";
import Sidebar from "@/components/Sidebar";

const WithdrawPage = () => {
  const { data: user, loading } = UserSession();

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex justify-center items-center h-screen'>
        No user data available
      </div>
    );
  }

  return (
    <div className='flex h-screen bg-gray-50'>
      <title>Withdarw Payment</title>
      <Sidebar />
      <div className='mx-auto p-6 bg-white shadow-lg rounded-lg flex-1'>
        <h1 className='text-3xl font-bold mb-6 flex items-center'>
          <CreditCard className='mr-2' /> Withdraw Referral Earnings
        </h1>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div>
            <h2 className='text-xl font-semibold mb-4 flex items-center'>
              <Users className='mr-2' /> Referral Stats
            </h2>
            <p className='mb-2'>
              <strong>Referral Count:</strong> {user.tReferralCount}
            </p>
            <p className='mb-2'>
              <strong>Referral URL:</strong> {user.ReferralUrl}
            </p>
            <p className='mb-2'>
              <strong>Available Balance:</strong> ${user.referralBalance || 0}
            </p>
          </div>
          <div>
            <h2 className='text-xl font-semibold mb-4'>
              Withdrawal Information
            </h2>
            <p className='mb-2'>
              <strong>Bank Account:</strong> {user.bankAccount}
            </p>
            <p className='mb-2'>
              <strong>Payment Status:</strong> {user.paymentStatus}
            </p>
          </div>
        </div>

        <form className='bg-gray-100 shadow-md rounded-lg p-6'>
          <div className='mb-4'>
            <label
              htmlFor='amount'
              className='block text-sm font-medium text-gray-700'>
              Withdrawal Amount
            </label>
            <input
              type='number'
              id='amount'
              name='amount'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
              placeholder='Enter amount to withdraw'
              max={user.referralBalance || 0}
            />
          </div>

          <div className='mb-4'>
            <label
              htmlFor='account'
              className='block text-sm font-medium text-gray-700'>
              Withdrawal Method
            </label>
            <select
              id='account'
              name='account'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'>
              <option value='bank'>Bank Account (Default)</option>
              <option value='paypal'>PayPal</option>
              <option value='crypto'>Crypto Wallet</option>
            </select>
          </div>

          <button
            type='submit'
            className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
            Withdraw Funds
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawPage;
