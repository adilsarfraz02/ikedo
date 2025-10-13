"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, CreditCard, Users, Wallet, Building2, Smartphone } from "lucide-react";
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
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
  const [paymentGateway, setPaymentGateway] = useState("jazzcash");
  const [accountType, setAccountType] = useState("mobile_wallet");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Payment gateway options based on account type
  const paymentGateways = {
    mobile_wallet: [
      { key: "jazzcash", label: "JazzCash", icon: "📱" },
      { key: "easypaisa", label: "Easypaisa", icon: "💳" },
    ],
    bank_account: [
      { key: "bank", label: "Bank Account", icon: "🏦" },
    ],
  };

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
    
    // Validation
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(withdrawAmount) > session?.isWithdrawAmount) {
      toast.error("Insufficient balance for withdrawal");
      return;
    }

    if (!accountHolderName.trim()) {
      toast.error("Please enter account holder name");
      return;
    }

    if (!accountNumber.trim()) {
      toast.error("Please enter account number");
      return;
    }

    if (paymentGateway === 'bank' && !bankName.trim()) {
      toast.error("Please enter bank name");
      return;
    }

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
          accountType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Withdrawal request submitted! You will receive payment within 24 hours.");
        // Reset form
        setWithdrawAmount("");
        setAccountNumber("");
        setAccountHolderName("");
        setBankName("");
        onOpenChange(); // Close modal
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
      console.error("Withdrawal error:", error);
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
                <strong>Wallet Balance:</strong> PKR
                {session?.walletBalance?.toFixed(2) || 0}
              </p>
              <p className='mb-2'>
                <strong>Available for Withdrawal:</strong> PKR
                {session?.isWithdrawAmount?.toFixed(2) || 0}
              </p>
              <p className='mb-2'>
                <strong>Total Earnings:</strong> PKR
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
                <p>Your withdrawal request is pending approval</p>
              </div>
              <p className='text-center text-gray-600 mt-2'>
                Your withdrawal will be processed within 24 hours
              </p>
            </CardBody>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h1 className='font-bold text-2xl'>Request Withdrawal</h1>
            </CardHeader>
            <CardBody>
              <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-sm text-blue-800'>
                  💡 <strong>Available for Withdrawal:</strong> PKR {session?.isWithdrawAmount?.toFixed(2) || 0}
                </p>
              </div>
              
              <Button
                size="lg"
                color="primary"
                className='w-full font-bold'
                startContent={<Wallet />}
                onPress={onOpen}>
                Withdraw Funds
              </Button>

              <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md'>
                <p className='text-sm text-yellow-800'>
                  ⏰ <strong>Processing Time:</strong> Withdrawals are processed within 24 hours
                </p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Withdrawal Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          size="2xl"
          scrollBehavior="inside"
          className="!bg-white"
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <form onSubmit={handleWithdraw}>
                <ModalHeader className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Wallet className="text-primary" />
                    Withdraw Funds
                  </h2>
                  <p className="text-sm text-gray-500 font-normal">
                    Enter your payment details to withdraw funds
                  </p>
                </ModalHeader>
                <ModalBody>
                  {/* Amount */}
                  <div className='mb-2'>
                    <Input
                      type='number'
                      label='Withdrawal Amount (PKR)'
                      isRequired
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder='Enter amount'
                      max={session?.isWithdrawAmount || 0}
                      min="1"
                      step="0.01"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">PKR</span>
                        </div>
                      }
                      description={`Maximum: PKR ${session?.isWithdrawAmount?.toFixed(2) || 0}`}
                    />
                  </div>

                  {/* Account Type Selection */}
                  <div className='mb-2'>
                    <label className="text-sm font-medium mb-2 block">Account Type</label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={accountType === "mobile_wallet" ? "solid" : "bordered"}
                        color={accountType === "mobile_wallet" ? "primary" : "default"}
                        className="flex-1"
                        startContent={<Smartphone />}
                        onPress={() => {
                          setAccountType("mobile_wallet");
                          setPaymentGateway("jazzcash");
                          setBankName("");
                        }}
                      >
                        Mobile Wallet
                      </Button>
                      <Button
                        type="button"
                        variant={accountType === "bank_account" ? "solid" : "bordered"}
                        color={accountType === "bank_account" ? "primary" : "default"}
                        className="flex-1"
                        startContent={<Building2 />}
                        onPress={() => {
                          setAccountType("bank_account");
                          setPaymentGateway("bank");
                        }}
                      >
                        Bank Account
                      </Button>
                    </div>
                  </div>

                  {/* Payment Gateway Selection */}
                  <div className='mb-2'>
                    <label className="text-sm font-medium mb-2 block">
                      {accountType === "mobile_wallet" ? "Select Mobile Wallet" : "Payment Method"}
                    </label>
                    <div className="flex gap-2">
                      {paymentGateways[accountType].map((gateway) => (
                        <Button
                          key={gateway.key}
                          type="button"
                          variant={paymentGateway === gateway.key ? "solid" : "bordered"}
                          color={paymentGateway === gateway.key ? "success" : "default"}
                          className="flex-1"
                          onPress={() => setPaymentGateway(gateway.key)}
                        >
                          <span className="mr-2">{gateway.icon}</span>
                          {gateway.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Account Holder Name */}
                  <div className='mb-2'>
                    <Input
                      type='text'
                      label='Account Holder Name'
                      isRequired
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder='Enter your full name'
                      description="Name as it appears on your account"
                    />
                  </div>

                  {/* Account Number */}
                  <div className='mb-2'>
                    <Input
                      type='text'
                      label={accountType === "mobile_wallet" ? "Mobile Number" : "Account Number"}
                      isRequired
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={accountType === "mobile_wallet" ? "03XXXXXXXXX" : "Enter account number"}
                      description={accountType === "mobile_wallet" ? "Enter your mobile wallet number" : "Enter your bank account number (IBAN)"}
                    />
                  </div>

                  {/* Bank Name (only for bank accounts) */}
                  {paymentGateway === 'bank' && (
                    <div className='mb-2'>
                      <Input
                        type='text'
                        label='Bank Name'
                        isRequired
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder='Enter bank name (e.g., HBL, UBL, Meezan)'
                        description="Enter the name of your bank"
                      />
                    </div>
                  )}

                  {/* Information Box */}
                  <div className='p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg'>
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Important Information
                    </h3>
                    <ul className="text-xs text-gray-700 space-y-1">
                      <li>✓ Processing time: Within 24 hours</li>
                      <li>✓ You will receive email notifications</li>
                      <li>✓ Double-check your account details</li>
                      <li>✓ Admin will verify before processing</li>
                    </ul>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="danger" 
                    variant="light" 
                    onPress={onClose}
                    isDisabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    type='submit'
                    isLoading={isSubmitting}
                    startContent={!isSubmitting && <Wallet />}
                  >
                    {isSubmitting ? "Processing..." : "Submit Withdrawal"}
                  </Button>
                </ModalFooter>
              </form>
            )}
          </ModalContent>
        </Modal>

        {/* Withdrawal History */}
        {withdrawalHistory.length > 0 && (
          <Card className='mt-6'>
            <CardHeader>
              <h2 className='text-xl font-semibold flex items-center gap-2'>
                <CreditCard />
                Withdrawal History
              </h2>
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
                        Account Details
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {withdrawalHistory.map((withdrawal) => (
                      <tr key={withdrawal._id} className="hover:bg-gray-50">
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {new Date(withdrawal.requestedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900'>
                          PKR {withdrawal.amount.toFixed(2)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          <div className="flex items-center gap-2">
                            {withdrawal.paymentGateway === 'jazzcash' && '📱'}
                            {withdrawal.paymentGateway === 'easypaisa' && '💳'}
                            {withdrawal.paymentGateway === 'bank' && '🏦'}
                            <span className="font-medium">
                              {withdrawal.paymentGateway.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4 text-sm text-gray-600'>
                          <div className="space-y-1">
                            <div><strong>{withdrawal.accountHolderName}</strong></div>
                            <div className="text-xs">{withdrawal.accountNumber}</div>
                            {withdrawal.bankName && (
                              <div className="text-xs text-gray-500">{withdrawal.bankName}</div>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={
                              withdrawal.status === 'completed'
                                ? 'success'
                                : withdrawal.status === 'pending'
                                ? 'warning'
                                : withdrawal.status === 'processing'
                                ? 'primary'
                                : 'danger'
                            }
                          >
                            {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                          </Chip>
                          {withdrawal.completedAt && (
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(withdrawal.completedAt).toLocaleDateString()}
                            </div>
                          )}
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
