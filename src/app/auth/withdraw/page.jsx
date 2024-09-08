"use client";

import React, { useState } from "react";
import { AlertCircle, CreditCard, Users } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import UserSession from "@/lib/UserSession";

export default function WithdrawPage() {
  const { data: session, loading, error } = UserSession();
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [paymentGateway, setPaymentGateway] = useState("easypaisa");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-3xl mb-4'>
            You must be logged in to view this page
          </p>
          <Link href='/auth/login' className='text-blue-500 hover:underline'>
            Login
          </Link>
        </div>
      </div>
    );
  }

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(withdrawAmount),
          accountNumber,
          paymentGateway,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Withdrawal request submitted successfully");
        setWithdrawAmount("");
        setAccountNumber("");
      } else {
        toast.error(data.error || "Failed to submit withdrawal request");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <title>Withdraw Payment</title>
      <Sidebar />

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
                <strong>Referral Count:</strong>{" "}
                {session?.tReferralCount || 0}
              </p>
              <p className='mb-2'>
                <strong>Available Balance:</strong> $
                {session?.isWithdrawAmount || 0}
              </p>
            </div>
            <div>
              <h2 className='text-xl font-semibold mb-4'>
                Withdrawal Information
              </h2>
              <p className='mb-2'>
                <strong>Bank Account:</strong>{" "}
                {session?.bankAccount || "Not set"}
              </p>
              <p className='mb-2'>
                <strong>Payment Status:</strong>{" "}
                {session?.paymentStatus || "N/A"}
              </p>
            </div>
          </CardBody>
        </Card>
        {!(session.isWithdrawAmount > 0) ? (
          <Card>
            <CardBody>
              <div className='mb-4 w-full text-red-500 flex items-center justify-center text-xl pt-3 gap-2'>
                <AlertCircle />
                <p className=''>
                  Your balance is low, please deposit more to proceed with
                  withdrawal.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h1 className='font-bold'>Withdraw Amount</h1>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleWithdraw}>
                <div className='mb-4'>
                  <Input
                    type='number'
                    id='amount'
                    name='amount'
                    label='Amount'
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                    placeholder='Enter amount to withdraw'
                    max={session?.isWithdrawAmount || 0}
                  />
                </div>
                <div className='mb-4'>
                  <Input
                    type='text'
                    id='accountNumber'
                    name='accountNumber'
                    label='Account Number'
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                    placeholder='Enter Account Number'
                  />
                </div>
                <div className='mb-4'>
                  <Select
                    label='Select Payment Gateway'
                    isRequired
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'>
                    <SelectItem key='easypaisa'>Easypaisa (Default)</SelectItem>
                    <SelectItem key='jazzcash'>Jazzcash</SelectItem>
                    <SelectItem key='bank'>Bank Account</SelectItem>
                  </Select>
                </div>

                <Button
                  type='submit'
                  className='w-full text-white bg-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                  disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Withdraw Funds"}
                </Button>
              </form>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
