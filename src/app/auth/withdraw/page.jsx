"use client";

import React, { useEffect, useState } from "react";
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
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [paymentGateway, setPaymentGateway] = useState("easypaisa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  // Fetch withdrawal history - must be before conditional returns
  useEffect(() => {
    if (!session) return;
    
    const fetchWithdrawalHistory = async () => {
      try {
        const response = await fetch("/api/withdraw");
        if (response.ok) {
          const data = await response.json();
          setWithdrawalHistory(data.withdrawals || []);
        }
      } catch (error) {
        console.error("Failed to fetch withdrawal history:", error);
      }
    };
    fetchWithdrawalHistory();
  }, [session]);

  if (loading) {
    return (
      <div className='flex justify-center items-center h-screen'>
        Loading...
      </div>
    );
  }

  if (error || !session) {
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
          accountHolderName,
          bankName,
          paymentGateway,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Withdrawal request submitted! You will receive payment within 24 hours.");
        setWithdrawAmount("");
        setAccountNumber("");
        setAccountHolderName("");
        setBankName("");
        // Refresh withdrawal history
        const historyResponse = await fetch("/api/withdraw");
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setWithdrawalHistory(historyData.withdrawals || []);
        }
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
                <strong>Referral Count:</strong> {session?.tReferralCount || 0}
              </p>
              <p className='mb-2'>
                <strong>Wallet Balance:</strong> $
                {session?.walletBalance?.toFixed(2) || 0}
              </p>
              <p className='mb-2'>
                <strong>Available for Withdrawal:</strong> $
                {session?.isWithdrawAmount?.toFixed(2) || 0}
              </p>
              <p className='mb-2'>
                <strong>Total Earnings:</strong> $
                {session?.totalEarnings?.toFixed(2) || 0}
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
        {(session?.isWithdrawAmount ?? 0) <= 0 ? (
          <Card>
            <CardBody>
              <div className='mb-4 w-full text-red-500 flex items-center justify-center text-xl pt-3 gap-2'>
                <AlertCircle />
                <p>
                  Your balance is low, please deposit more to proceed with
                  withdrawal.
                </p>
              </div>
            </CardBody>
          </Card>
        ) : session?.isWithdraw ? (
          <Card>
            <CardBody>
              <div className='mb-4 w-full text-yellow-500 flex items-center justify-center text-xl pt-3 gap-2'>
                <AlertCircle />
                <p>Your withdrawal amount is pending</p>
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
                    isRequired
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
                    id='accountHolderName'
                    name='accountHolderName'
                    label='Account Holder Name'
                    isRequired
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                    placeholder='Enter Account Holder Name'
                  />
                </div>
                <div className='mb-4'>
                  <Input
                    type='text'
                    id='accountNumber'
                    name='accountNumber'
                    label='Account Number'
                    isRequired
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
                    <SelectItem key='easypaisa'>Easypaisa</SelectItem>
                    <SelectItem key='jazzcash'>Jazzcash</SelectItem>
                    <SelectItem key='bank'>Bank Account</SelectItem>
                  </Select>
                </div>
                {paymentGateway === 'bank' && (
                  <div className='mb-4'>
                    <Input
                      type='text'
                      id='bankName'
                      name='bankName'
                      label='Bank Name'
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                      placeholder='Enter Bank Name'
                    />
                  </div>
                )}

                <div className='mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
                  <p className='text-sm text-yellow-800'>
                    ⏰ <strong>Processing Time:</strong> Your withdrawal will be processed within 24 hours.
                  </p>
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

        {/* Withdrawal History */}
        {withdrawalHistory.length > 0 && (
          <Card className='mt-6'>
            <CardHeader>
              <h2 className='text-xl font-semibold'>Withdrawal History</h2>
            </CardHeader>
            <CardBody>
              <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Date
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Amount
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Method
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {withdrawalHistory.map((withdrawal) => (
                      <tr key={withdrawal._id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {new Date(withdrawal.requestedAt).toLocaleDateString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          ${withdrawal.amount}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {withdrawal.paymentGateway.toUpperCase()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              withdrawal.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : withdrawal.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : withdrawal.status === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
