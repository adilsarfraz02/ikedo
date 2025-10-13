"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Input,
  Tabs,
  Tab,
  Avatar,
  Spinner,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Users,
  TrendingUp,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminWithdrawalDashboard = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchWithdrawals();
  }, [selectedTab]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const statusFilter = selectedTab === "all" ? "" : `status=${selectedTab}`;
      const response = await fetch(`/api/admin/withdrawals?${statusFilter}`);
      const result = await response.json();

      if (result.success) {
        setWithdrawals(result.withdrawals);
        setStats(result.stats);
      } else {
        toast.error("Failed to load withdrawals");
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Error loading withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (withdrawal, type) => {
    setSelectedWithdrawal(withdrawal);
    setActionType(type);
    setAdminNote("");
    setTransactionId("");
    setActionModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedWithdrawal || !actionType) return;

    // Validate required fields
    if (actionType === "completed" && !transactionId) {
      toast.error("Transaction ID is required for completion");
      return;
    }

    if (actionType === "rejected" && !adminNote) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch("/api/admin/withdrawals", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal._id,
          status: actionType,
          adminNote: adminNote || undefined,
          transactionId: transactionId || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Withdrawal ${actionType} successfully!`);
        setActionModalOpen(false);
        fetchWithdrawals(); // Refresh the list
      } else {
        toast.error(result.error || "Failed to update withdrawal");
      }
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      toast.error("Error updating withdrawal status");
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "completed":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <AlertCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPaymentMethod = (gateway) => {
    const methods = {
      jazzcash: "📱 JazzCash",
      easypaisa: "💳 Easypaisa",
      bank: "🏦 Bank Transfer",
    };
    return methods[gateway] || gateway;
  };

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      withdrawal.userId?.username?.toLowerCase().includes(query) ||
      withdrawal.userId?.email?.toLowerCase().includes(query) ||
      withdrawal.accountNumber.toLowerCase().includes(query) ||
      withdrawal.accountHolderName.toLowerCase().includes(query)
    );
  });

  if (loading && !withdrawals.length) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" label="Loading withdrawals..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
          <CardBody className="text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-orange-100 p-2 rounded-full">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-1">Pending</div>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.pending || 0}
            </div>
            <div className="text-xs text-gray-400">
              PKR {Number(stats?.pendingAmount || 0).toLocaleString()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
          <CardBody className="text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-blue-100 p-2 rounded-full">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-1">Processing</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.processing || 0}
            </div>
            <div className="text-xs text-gray-400">In Progress</div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
          <CardBody className="text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-600">
              {stats?.completed || 0}
            </div>
            <div className="text-xs text-gray-400">
              PKR {Number(stats?.completedAmount || 0).toLocaleString()}
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100">
          <CardBody className="text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-purple-100 p-2 rounded-full">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-purple-600">
              PKR {Number(stats?.totalAmount || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">All Time</div>
          </CardBody>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Wallet className="text-primary" />
              Withdrawal Requests
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and process withdrawal requests
            </p>
          </div>
          <Button
            color="primary"
            variant="flat"
            startContent={<RefreshCw className="w-4 h-4" />}
            onClick={fetchWithdrawals}
            isLoading={loading}
          >
            Refresh
          </Button>
        </CardHeader>
        <CardBody>
          {/* Search and Filter */}
          <div className="mb-4">
            <Input
              placeholder="Search by username, email, or account number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<Search className="w-4 h-4 text-gray-400" />}
              isClearable
              onClear={() => setSearchQuery("")}
            />
          </div>

          {/* Tabs */}
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={setSelectedTab}
            color="primary"
            variant="underlined"
            className="mb-4"
          >
            <Tab
              key="pending"
              title={
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Pending ({stats?.pending || 0})</span>
                </div>
              }
            />
            <Tab
              key="processing"
              title={
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Processing ({stats?.processing || 0})</span>
                </div>
              }
            />
            <Tab
              key="completed"
              title={
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Completed ({stats?.completed || 0})</span>
                </div>
              }
            />
            <Tab
              key="rejected"
              title={
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  <span>Rejected ({stats?.rejected || 0})</span>
                </div>
              }
            />
            <Tab
              key="all"
              title={
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>All ({stats?.total || 0})</span>
                </div>
              }
            />
          </Tabs>

          {/* Withdrawals Table */}
          <div className="overflow-x-auto">
            {filteredWithdrawals.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Wallet className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No withdrawal requests found</p>
              </div>
            ) : (
              <Table aria-label="Withdrawal requests table">
                <TableHeader>
                  <TableColumn>USER</TableColumn>
                  <TableColumn>AMOUNT</TableColumn>
                  <TableColumn>PAYMENT METHOD</TableColumn>
                  <TableColumn>ACCOUNT DETAILS</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>REQUESTED</TableColumn>
                  <TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={withdrawal.userId?.image || "/profile.png"}
                            name={withdrawal.userId?.username}
                            size="sm"
                          />
                          <div>
                            <p className="font-semibold">
                              {withdrawal.userId?.username || "Unknown"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {withdrawal.userId?.email}
                            </p>
                            <p className="text-xs text-gray-400">
                              Balance: PKR{" "}
                              {Number(
                                withdrawal.userId?.walletBalance || 0
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-lg text-green-600">
                          PKR {Number(withdrawal.amount).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="primary">
                          {formatPaymentMethod(withdrawal.paymentGateway)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-semibold">
                            {withdrawal.accountHolderName}
                          </p>
                          <p className="text-gray-600">
                            {withdrawal.accountNumber}
                          </p>
                          {withdrawal.bankName && (
                            <p className="text-gray-500 text-xs">
                              {withdrawal.bankName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={getStatusColor(withdrawal.status)}
                          variant="flat"
                          startContent={getStatusIcon(withdrawal.status)}
                          className="capitalize"
                        >
                          {withdrawal.status}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(withdrawal.requestedAt)}</p>
                          {withdrawal.completedAt && (
                            <p className="text-xs text-green-600">
                              Completed: {formatDate(withdrawal.completedAt)}
                            </p>
                          )}
                          {withdrawal.rejectedAt && (
                            <p className="text-xs text-red-600">
                              Rejected: {formatDate(withdrawal.rejectedAt)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {withdrawal.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                startContent={<AlertCircle className="w-3 h-3" />}
                                onClick={() =>
                                  handleActionClick(withdrawal, "processing")
                                }
                              >
                                Process
                              </Button>
                              <Button
                                size="sm"
                                color="success"
                                startContent={<CheckCircle2 className="w-3 h-3" />}
                                onClick={() =>
                                  handleActionClick(withdrawal, "completed")
                                }
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                startContent={<Ban className="w-3 h-3" />}
                                onClick={() =>
                                  handleActionClick(withdrawal, "rejected")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {withdrawal.status === "processing" && (
                            <>
                              <Button
                                size="sm"
                                color="success"
                                startContent={<CheckCircle2 className="w-3 h-3" />}
                                onClick={() =>
                                  handleActionClick(withdrawal, "completed")
                                }
                              >
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                startContent={<Ban className="w-3 h-3" />}
                                onClick={() =>
                                  handleActionClick(withdrawal, "rejected")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {(withdrawal.status === "completed" ||
                            withdrawal.status === "rejected") && (
                            <Chip size="sm" variant="flat" color="default">
                              No Actions
                            </Chip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        size="2xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-bold capitalize">
              {actionType} Withdrawal Request
            </h3>
          </ModalHeader>
          <ModalBody>
            {selectedWithdrawal && (
              <div className="space-y-4">
                {/* User Info */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      User Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={selectedWithdrawal.userId?.image || "/profile.png"}
                          name={selectedWithdrawal.userId?.username}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold">
                            {selectedWithdrawal.userId?.username}
                          </p>
                          <p className="text-gray-500">
                            {selectedWithdrawal.userId?.email}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                          <span className="text-gray-500">Wallet Balance:</span>
                          <p className="font-semibold text-green-600">
                            PKR{" "}
                            {Number(
                              selectedWithdrawal.userId?.walletBalance || 0
                            ).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Withdrawable Amount:
                          </span>
                          <p className="font-semibold text-blue-600">
                            PKR{" "}
                            {Number(
                              selectedWithdrawal.userId?.isWithdrawAmount || 0
                            ).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Withdrawal Details */}
                <Card>
                  <CardBody>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Withdrawal Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-bold text-lg text-green-600">
                          PKR {Number(selectedWithdrawal.amount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Payment Method:</span>
                        <span className="font-semibold">
                          {formatPaymentMethod(selectedWithdrawal.paymentGateway)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Holder:</span>
                        <span className="font-semibold">
                          {selectedWithdrawal.accountHolderName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Account Number:</span>
                        <span className="font-semibold font-mono">
                          {selectedWithdrawal.accountNumber}
                        </span>
                      </div>
                      {selectedWithdrawal.bankName && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Bank Name:</span>
                          <span className="font-semibold">
                            {selectedWithdrawal.bankName}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Requested:</span>
                        <span>{formatDate(selectedWithdrawal.requestedAt)}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Action-specific fields */}
                {actionType === "completed" && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 mb-3">
                      <strong>⚠️ Important:</strong> Completing this withdrawal
                      will automatically deduct PKR {Number(selectedWithdrawal.amount).toLocaleString()} from the user's wallet balance.
                    </p>
                    <Input
                      label="Transaction ID"
                      placeholder="Enter transaction ID or reference number"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      isRequired
                      description="Transaction ID from payment gateway"
                    />
                  </div>
                )}

                {/* Admin Note */}
                <Textarea
                  label="Admin Note"
                  placeholder={
                    actionType === "rejected"
                      ? "Enter reason for rejection (required)"
                      : "Add optional note for this action"
                  }
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  isRequired={actionType === "rejected"}
                  minRows={3}
                />

                {actionType === "rejected" && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800">
                      <strong>Note:</strong> The user will be able to submit a new
                      withdrawal request after rejection.
                    </p>
                  </div>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onClick={() => setActionModalOpen(false)}
              isDisabled={processing}
            >
              Cancel
            </Button>
            <Button
              color={actionType === "rejected" ? "danger" : "success"}
              onClick={handleUpdateStatus}
              isLoading={processing}
              startContent={
                actionType === "completed" ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : actionType === "rejected" ? (
                  <Ban className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )
              }
            >
              {actionType === "completed"
                ? "Complete & Deduct Amount"
                : actionType === "rejected"
                ? "Reject Request"
                : "Mark as Processing"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminWithdrawalDashboard;
