"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Chip } from "@nextui-org/react";
import { toast } from "react-hot-toast";
import { ArrowDownToLine, Clock, CheckCircle, XCircle } from "lucide-react";

const DepositHistory = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await fetch("/api/deposit");
        if (response.ok) {
          const data = await response.json();
          setDeposits(data.deposits);
        } else {
          toast.error("Failed to load deposit history");
        }
      } catch (error) {
        console.error("Error fetching deposits:", error);
        toast.error("An error occurred while loading deposits");
      } finally {
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardBody className="h-96"></CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-3">
        <ArrowDownToLine className="text-pink-600" size={24} />
        <h3 className="text-xl font-bold">Deposit History</h3>
      </CardHeader>
      <CardBody>
        {deposits.length === 0 ? (
          <div className="text-center py-12">
            <ArrowDownToLine className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600">No deposit history found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deposits.map((deposit) => (
                  <tr key={deposit._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(deposit.createdAt).toLocaleDateString()}
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(deposit.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      Rs {deposit.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {deposit.paymentMethod
                        .split("_")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={deposit.transactionId}>
                        {deposit.transactionId}
                      </div>
                      {deposit.paymentProof && (
                        <a
                          href={deposit.paymentProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs">
                          View Proof
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Chip
                        color={getStatusColor(deposit.status)}
                        variant="flat"
                        startContent={getStatusIcon(deposit.status)}
                        size="sm">
                        {deposit.status.charAt(0).toUpperCase() + deposit.status.slice(1)}
                      </Chip>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {deposit.status === "rejected" && deposit.rejectionReason ? (
                          <div className="text-red-600 text-xs">
                            <strong>Rejected:</strong> {deposit.rejectionReason}
                          </div>
                        ) : (
                          <div className="text-gray-600 text-xs">
                            {deposit.remarks || "-"}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DepositHistory;
