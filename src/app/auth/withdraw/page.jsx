"use client";

import React from "react";
import { CreditCard, Users } from "lucide-react";
import UserSession from "@/lib/UserSession";
import Sidebar from "@/components/Sidebar";
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";

const WithdrawPage = () => {
  const { data: user, loading } = UserSession();

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <title>Withdarw Payment</title>
      <Sidebar />
      {loading && (
        <div className='flex justify-center items-center h-screen'>
          Loading...
        </div>
      )}
      {!user && (
        <div className='flex justify-center items-center h-screen'>
          No user data available
        </div>
      )}
      <div className='mx-auto p-6 bg-white shadow-lg rounded-lg flex-1 flex flex-col gap-6 min-h-screen py-20 justify-center w-full'>
        <h1 className='text-3xl font-bold mb-6 flex items-center'>
          <CreditCard className='mr-2' /> Withdraw Referral Earnings
        </h1>
        <Card>
          <CardBody className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
            <div>
              <h2 className='text-xl font-semibold mb-4 flex items-center'>
                <Users className='mr-2' /> Referral Stats
              </h2>
              <p className='mb-2'>
                <strong>Referral Count:</strong> {user.tReferralCount}
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
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className='mb-4'>
              <Input
                type='number'
                id='amount'
                name='amount'
                label='amount'
                isReadOnly
                value={user.isWithdrawAmount}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                placeholder='Enter amount to withdraw'
                max={user.referralBalance || 0}
              />
            </div>

            <div className='mb-4'>
              <Select
                label='Select Payment Getway'
                isRequired
                defaultSelectedKeys={["jazzcash"]}
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'>
                <SelectItem key='easypaisa'>Easypaisa (Default)</SelectItem>
                <SelectItem key='jazzcash'>Jazzcash</SelectItem>
                <SelectItem key='bank'>Bank Account</SelectItem>
              </Select>
            </div>

            <Button
              type='submit'
              className='w-full text-white bg-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>
              Withdraw Funds
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default WithdrawPage;
