"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import { DollarSign, TrendingUp, Calendar, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import UserSession from "@/lib/UserSession";
import { PaymentScreenshotUploader } from "@/components/PaymentScreenshotUploader";

const CommissionDashboard = () => {
  const [commissionData, setCommissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [adminPaymentInfo, setAdminPaymentInfo] = useState(null);
  const [depositForm, setDepositForm] = useState({
    amount: "",
    paymentMethod: "bank_transfer",
    transactionId: "",
    paymentProof: "",
    remarks: "",
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    accountHolderName: "",
    accountNumber: "",
    bankName: "",
    paymentGateway: "jazzcash",
    accountType: "mobile_wallet",
  });
  const [submitting, setSubmitting] = useState(false);
  const { data: userData } = UserSession();

  const paymentMethods = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "card", label: "Card" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const response = await fetch("/api/commissions");
        if (response.ok) {
          const data = await response.json();
          setCommissionData(data);
        } else {
          toast.error("Failed to load commission data");
        }
      } catch (error) {
        console.error("Error fetching commissions:", error);
        toast.error("An error occurred while loading commissions");
      } finally {
        setLoading(false);
      }
    };

    const fetchAdminPaymentInfo = async () => {
      try {
        const response = await fetch("/api/admin/payment");
        if (response.ok) {
          const data = await response.json();
          setAdminPaymentInfo(data);
        }
      } catch (error) {
        console.error("Error fetching admin payment info:", error);
      }
    };

    fetchCommissions();
    fetchAdminPaymentInfo();
  }, []);

  const handleDepositSubmit = async () => {
    // Validation
    if (!depositForm.amount || depositForm.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!depositForm.transactionId) {
      toast.error("Please enter transaction ID");
      return;
    }
    if (!depositForm.paymentProof) {
      toast.error("Please upload payment proof screenshot");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/deposit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(depositForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Deposit request submitted successfully! Awaiting admin verification.");
        setDepositModalOpen(false);
        setDepositForm({
          amount: "",
          paymentMethod: "bank_transfer",
          transactionId: "",
          paymentProof: "",
          remarks: "",
        });
      } else {
        toast.error(data.error || "Failed to submit deposit request");
      }
    } catch (error) {
      console.error("Deposit submission error:", error);
      toast.error("An error occurred while submitting deposit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setDepositForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWithdrawInputChange = (field, value) => {
    setWithdrawForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWithdrawSubmit = async () => {
    // Validation
    if (!withdrawForm.amount || withdrawForm.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (withdrawForm.amount > (commissionData?.walletBalance || 0)) {
      toast.error("Insufficient balance");
      return;
    }
    if (!withdrawForm.accountHolderName) {
      toast.error("Please enter account holder name");
      return;
    }
    if (!withdrawForm.accountNumber) {
      toast.error("Please enter account number");
      return;
    }
    if (withdrawForm.paymentGateway === "bank" && !withdrawForm.bankName) {
      toast.error("Please enter bank name");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(withdrawForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Withdrawal request submitted successfully! You will receive payment within 24 hours.");
        setWithdrawModalOpen(false);
        setWithdrawForm({
          amount: "",
          accountHolderName: "",
          accountNumber: "",
          bankName: "",
          paymentGateway: "jazzcash",
          accountType: "mobile_wallet",
        });
        // Refresh commission data
        const refreshResponse = await fetch("/api/commissions");
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setCommissionData(refreshData);
        }
      } else {
        toast.error(data.error || "Failed to submit withdrawal request");
      }
    } catch (error) {
      console.error("Withdrawal submission error:", error);
      toast.error("An error occurred while submitting withdrawal");
    } finally {
      setSubmitting(false);
    }
  };

  const copyReferralLink = () => {
    if (userData?.ReferralUrl) {
      navigator.clipboard.writeText(userData.ReferralUrl);
      toast.success("Referral link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div>
        <Card className='animate-pulse mb-6'>
          <CardBody className='h-48'></CardBody>
        </Card>
        <div className='grid grid-cols-3 gap-4 mb-6'>
          {[1, 2, 3].map((i) => (
            <Card key={i} className='animate-pulse'>
              <CardBody className='h-32'></CardBody>
            </Card>
          ))}
        </div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className='animate-pulse'>
              <CardBody className='h-24'></CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Deposit Modal */}
      <Modal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text text-transparent">
              Deposit to Wallet
            </h2>
            <p className="text-sm text-gray-600">
              Submit your payment details for verification
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Admin Payment Details Section */}
              {adminPaymentInfo && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded-lg shadow-sm">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Admin Payment Details
                  </h3>
                  <div className="space-y-2">
                    {adminPaymentInfo.easypasia && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-md">
                        <span className="font-semibold text-gray-700">
                          EasyPaisa:
                        </span>
                        <span className="text-blue-600 font-mono">
                          {adminPaymentInfo.easypasia}
                        </span>
                      </div>
                    )}
                    {adminPaymentInfo.jazzcash && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-md">
                        <span className="font-semibold text-gray-700">
                          JazzCash:
                        </span>
                        <span className="text-blue-600 font-mono">
                          {adminPaymentInfo.jazzcash}
                        </span>
                      </div>
                    )}
                    {adminPaymentInfo.bank && (
                      <div className="flex items-center justify-between bg-white p-3 rounded-md">
                        <span className="font-semibold text-gray-700">
                          Bank Account:
                        </span>
                        <span className="text-blue-600 font-mono">
                          {adminPaymentInfo.bank}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-blue-800 mt-3 bg-blue-100 p-2 rounded">
                    💡 Please send payment to any of the above accounts and
                    enter the transaction details below
                  </p>
                </div>
              )}

              <Input
                type="number"
                label="Amount (Rs)"
                placeholder="Enter amount"
                value={depositForm.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">Rs</span>
                  </div>
                }
                isRequired
              />

              <Select
                label="Payment Method"
                placeholder="Select payment method"
                selectedKeys={[depositForm.paymentMethod]}
                onChange={(e) =>
                  handleInputChange("paymentMethod", e.target.value)
                }
                isRequired
              >
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </Select>

              <Input
                type="text"
                label="Transaction ID / Reference Number"
                placeholder="Enter transaction ID"
                value={depositForm.transactionId}
                onChange={(e) =>
                  handleInputChange("transactionId", e.target.value)
                }
                isRequired
              />

              <PaymentScreenshotUploader
                currentUrl={depositForm.paymentProof}
                onUploadComplete={(url) =>
                  handleInputChange("paymentProof", url)
                }
              />

              <Textarea
                label="Remarks (Optional)"
                placeholder="Add any additional information"
                value={depositForm.remarks}
                onChange={(e) => handleInputChange("remarks", e.target.value)}
                minRows={3}
              />

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Your deposit will be credited to your
                  wallet once verified by our admin team (usually within 24-48
                  hours).
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setDepositModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white"
              onPress={handleDepositSubmit}
              isLoading={submitting}
            >
              Submit Deposit Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-700 bg-clip-text text-transparent">
              💰 Withdraw from Wallet
            </h2>
            <p className="text-sm text-gray-600">
              Enter your payment details for withdrawal
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              {/* Available Balance */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-semibold">
                  💵 Available Balance: PKR{" "}
                  {(commissionData?.walletBalance || 0).toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Maximum withdrawal amount
                </p>
              </div>

              {/* Amount Input */}
              <Input
                type="number"
                label="Withdrawal Amount"
                placeholder="Enter amount"
                value={withdrawForm.amount}
                onChange={(e) =>
                  handleWithdrawInputChange("amount", e.target.value)
                }
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">PKR</span>
                  </div>
                }
                description={`Minimum: PKR 100 | Maximum: PKR ${(
                  commissionData?.walletBalance || 0
                ).toFixed(2)}`}
                isRequired
              />

              {/* Account Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      handleWithdrawInputChange("accountType", "mobile_wallet");
                      handleWithdrawInputChange("paymentGateway", "jazzcash");
                      handleWithdrawInputChange("bankName", "");
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      withdrawForm.accountType === "mobile_wallet"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-semibold">Mobile Wallet</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleWithdrawInputChange("accountType", "bank_account");
                      handleWithdrawInputChange("paymentGateway", "bank");
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      withdrawForm.accountType === "bank_account"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">🏦</div>
                    <div className="text-sm font-semibold">Bank Account</div>
                  </button>
                </div>
              </div>

              {/* Payment Gateway Selection */}
              {withdrawForm.accountType === "mobile_wallet" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Select Mobile Wallet
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleWithdrawInputChange("paymentGateway", "jazzcash")
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        withdrawForm.paymentGateway === "jazzcash"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-xl mb-1">📱</div>
                      <div className="text-sm font-semibold">JazzCash</div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleWithdrawInputChange("paymentGateway", "easypaisa")
                      }
                      className={`p-3 rounded-lg border-2 transition-all ${
                        withdrawForm.paymentGateway === "easypaisa"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-xl mb-1">💳</div>
                      <div className="text-sm font-semibold">Easypaisa</div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <span className="text-xl">🏦</span>
                    <span className="text-sm font-semibold">
                      Bank Account Transfer
                    </span>
                  </div>
                </div>
              )}

              {/* Account Holder Name */}
              <Input
                type="text"
                label="Account Holder Name"
                placeholder="Enter your full name"
                value={withdrawForm.accountHolderName}
                onChange={(e) =>
                  handleWithdrawInputChange("accountHolderName", e.target.value)
                }
                description="Name as it appears on your account"
                isRequired
              />

              {/* Account Number */}
              <Input
                type="text"
                label={
                  withdrawForm.accountType === "mobile_wallet"
                    ? "Mobile Number"
                    : "Account Number (IBAN)"
                }
                placeholder={
                  withdrawForm.accountType === "mobile_wallet"
                    ? "03XXXXXXXXX"
                    : "PK + 22 digits"
                }
                value={withdrawForm.accountNumber}
                onChange={(e) =>
                  handleWithdrawInputChange("accountNumber", e.target.value)
                }
                description={
                  withdrawForm.accountType === "mobile_wallet"
                    ? "Enter your mobile wallet number"
                    : "Enter your bank account number (IBAN format)"
                }
                isRequired
              />

              {/* Bank Name - Only for Bank Accounts */}
              {withdrawForm.paymentGateway === "bank" && (
                <Input
                  type="text"
                  label="Bank Name"
                  placeholder="e.g., HBL, UBL, Meezan Bank"
                  value={withdrawForm.bankName}
                  onChange={(e) =>
                    handleWithdrawInputChange("bankName", e.target.value)
                  }
                  description="Enter the name of your bank"
                  isRequired
                />
              )}

              {/* Important Information */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded">
                <h4 className="font-semibold text-yellow-900 text-sm mb-2 flex items-center gap-2">
                  <span>⚠️</span> Important Information
                </h4>
                <ul className="text-xs text-yellow-800 space-y-1 ml-5 list-disc">
                  <li>Processing time: Within 24 hours</li>
                  <li>You will receive email notifications</li>
                  <li>Double-check your account details</li>
                  <li>Admin will verify before processing</li>
                  <li>Payment may take 1-3 business days to reflect</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setWithdrawModalOpen(false)}
              isDisabled={submitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold"
              onPress={handleWithdrawSubmit}
              isLoading={submitting}
            >
              Submit Withdrawal Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <div>
        {/* Main Balance Card with Gradient */}
        <div className="mb-6">
          <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0">
            <CardBody className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="text-white">
                  <p className="text-sm opacity-90 mb-2">Available Balance</p>
                  <h2 className="text-4xl font-bold mb-1">
                    Rs {(commissionData?.walletBalance || 0).toFixed(2)}
                  </h2>
                  <p className="text-xs opacity-75">
                    {userData?.username || "User"}
                  </p>
                </div>
              </div>

              {/* Referral Link Section */}
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <p className="text-white text-xs mb-2 opacity-90">
                  Your Referral Link
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="text"
                    value={userData?.ReferralUrl || ""}
                    readOnly
                    className="w-full sm:flex-1 bg-white/20 text-white px-3 py-2 rounded text-sm outline-none"
                  />
                  <Button
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white w-full sm:w-auto"
                    onClick={copyReferralLink}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-white/70 mt-2">
                  Share this link to earn referral commissions
                </p>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card
            className="bg-gradient-to-br from-red-500 to-pink-600 border-0 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setDepositModalOpen(true)}
          >
            <CardBody
              className="p-6 flex flex-col items-center justify-center"
              onClick={() => setDepositModalOpen(true)}
            >
              <div
                className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-3"
                onClick={() => setDepositModalOpen(true)}
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">Deposit</span>
            </CardBody>
          </Card>

          <Card
            className="bg-gradient-to-br from-purple-500 to-purple-700 border-0 cursor-pointer hover:scale-105 transition-transform"
          >
            <CardBody
              className="p-6 flex flex-col items-center justify-center"
            >
              <Link href="/auth/withdraw"
                className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-3"
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Link>
              <span className="text-white font-semibold text-sm">Withdraw</span>
            </CardBody>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Today</p>
                  <p className="text-lg font-bold">
                    PKR {commissionData?.todayEarnings?.toFixed(2) || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <TrendingUp className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className="text-lg font-bold">
                    PKR {commissionData?.totalEarnings?.toFixed(2) || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Users className="text-orange-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Count</p>
                  <p className="text-lg font-bold">
                    {commissionData?.todayCommissions?.length || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <DollarSign className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Wallet</p>
                  <p className="text-lg font-bold">
                    PKR {commissionData?.walletBalance?.toFixed(2) || 0}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Today's Commissions */}
        {commissionData?.todayCommissions?.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <h3 className="text-xl font-bold">Today's Commissions</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {commissionData.todayCommissions.map((commission) => (
                  <div
                    key={commission._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <DollarSign className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="font-medium">
                          {commission.commissionType === "daily_bonus"
                            ? "Daily Return"
                            : commission.commissionType === "referral"
                            ? "Referral Commission"
                            : "Plan Purchase Commission"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {commission.description ||
                            `From ${
                              commission.referredUserId?.username || "User"
                            }`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(commission.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        +PKR{commission.amount.toFixed(2)}
                      </p>
                      {commission.planName && (
                        <p className="text-xs text-gray-500">
                          {commission.planName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Recent Commissions */}
        {commissionData?.allCommissions?.length > 0 && (
          <Card>
            <CardHeader>
              <h3 className="text-xl font-bold">Recent Commissions</h3>
            </CardHeader>
            <CardBody>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {commissionData.allCommissions
                      .slice(0, 10)
                      .map((commission) => (
                        <tr key={commission._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(
                              commission.createdAt
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {commission.commissionType === "daily_bonus"
                              ? "Daily Return"
                              : commission.commissionType === "referral"
                              ? "Referral"
                              : "Plan Purchase"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {commission.description ||
                              `From ${
                                commission.referredUserId?.username || "User"
                              }`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            +${commission.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                commission.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : commission.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {commission.status.charAt(0).toUpperCase() +
                                commission.status.slice(1)}
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
    </>
  );
};

export default CommissionDashboard;
