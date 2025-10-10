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
    paymentGateway: "bank_transfer",
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

    fetchCommissions();
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
    if (!withdrawForm.accountHolderName || !withdrawForm.accountNumber || !withdrawForm.bankName) {
      toast.error("Please fill all bank details");
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
        toast.success("Withdrawal request submitted successfully!");
        setWithdrawModalOpen(false);
        setWithdrawForm({
          amount: "",
          accountHolderName: "",
          accountNumber: "",
          bankName: "",
          paymentGateway: "bank_transfer",
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
                onUploadComplete={(url) => handleInputChange("paymentProof", url)}
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
              Withdraw from Wallet
            </h2>
            <p className="text-sm text-gray-600">
              Enter your bank details for withdrawal
            </p>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Available Balance:</strong> Rs{" "}
                  {(commissionData?.walletBalance || 0).toFixed(2)}
                </p>
              </div>

              <Input
                type="number"
                label="Withdrawal Amount (Rs)"
                placeholder="Enter amount"
                value={withdrawForm.amount}
                onChange={(e) =>
                  handleWithdrawInputChange("amount", e.target.value)
                }
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">Rs</span>
                  </div>
                }
                isRequired
              />

              <Input
                type="text"
                label="Account Holder Name"
                placeholder="Enter account holder name"
                value={withdrawForm.accountHolderName}
                onChange={(e) =>
                  handleWithdrawInputChange("accountHolderName", e.target.value)
                }
                isRequired
              />

              <Input
                type="text"
                label="Account Number"
                placeholder="Enter account number"
                value={withdrawForm.accountNumber}
                onChange={(e) =>
                  handleWithdrawInputChange("accountNumber", e.target.value)
                }
                isRequired
              />

              <Input
                type="text"
                label="Bank Name"
                placeholder="Enter bank name"
                value={withdrawForm.bankName}
                onChange={(e) =>
                  handleWithdrawInputChange("bankName", e.target.value)
                }
                isRequired
              />

              <Select
                label="Payment Gateway"
                placeholder="Select payment method"
                selectedKeys={[withdrawForm.paymentGateway]}
                onChange={(e) =>
                  handleWithdrawInputChange("paymentGateway", e.target.value)
                }
                isRequired
              >
                <SelectItem key="bank_transfer" value="bank_transfer">
                  Bank Transfer
                </SelectItem>
                <SelectItem key="upi" value="upi">
                  UPI
                </SelectItem>
                <SelectItem key="paypal" value="paypal">
                  PayPal
                </SelectItem>
                <SelectItem key="other" value="other">
                  Other
                </SelectItem>
              </Select>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Withdrawal requests are processed
                  within 24 hours. You will receive an email once approved.
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setWithdrawModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-purple-700 text-white"
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
            onClick={() => setWithdrawModalOpen(true)}
          >
            <CardBody className="p-6 flex flex-col items-center justify-center">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl mb-3">
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
              </div>
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
                    ${commissionData?.todayEarnings?.toFixed(2) || 0}
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
                    ${commissionData?.totalEarnings?.toFixed(2) || 0}
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
                    ${commissionData?.walletBalance?.toFixed(2) || 0}
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
                        +${commission.amount.toFixed(2)}
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
