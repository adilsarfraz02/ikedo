"use client";

import React, { useState } from "react";
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
  User as NextUIUser,
  Chip,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Pagination,
} from "@nextui-org/react";
import { Search, Download, Filter, TrendingUp, DollarSign } from "lucide-react";

const AdminInvestmentDetails = ({ investments }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!investments || !investments.detailed) {
    return (
      <Card>
        <CardBody>
          <p className="text-center text-gray-500">No investment data available</p>
        </CardBody>
      </Card>
    );
  }

  const { detailed, total, byPlan } = investments;

  // Filter and search
  const filteredInvestments = detailed.filter((inv) => {
    const matchesSearch =
      inv.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || inv.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvestments = filteredInvestments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Get unique plans
  const uniquePlans = ["all", ...new Set(detailed.map((inv) => inv.plan))];

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Username",
      "Email",
      "Plan",
      "Investment Amount",
      "Purchase Date",
      "Daily Return",
      "Wallet Balance",
      "Withdrawable Amount",
      "Total Earnings",
      "Referral Count",
      "Status",
    ];

    const csvData = filteredInvestments.map((inv) => [
      inv.username,
      inv.email,
      inv.plan,
      inv.investmentAmount,
      new Date(inv.purchaseDate).toLocaleDateString(),
      inv.dailyReturn,
      inv.walletBalance,
      inv.withdrawableAmount,
      inv.totalEarnings,
      inv.referralCount,
      inv.accountStatus,
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investment-details-${new Date().toISOString()}.csv`;
    a.click();
  };

  // Calculate summary stats
  const summaryStats = {
    totalUsers: detailed.length,
    totalInvestment: total,
    avgInvestment: total / detailed.length || 0,
    totalEarnings: detailed.reduce((sum, inv) => sum + inv.totalEarnings, 0),
    totalWithdrawable: detailed.reduce((sum, inv) => sum + inv.withdrawableAmount, 0),
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "danger";
      case "Processing":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500">Total Investors</p>
            <p className="text-2xl font-bold">{summaryStats.totalUsers}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500">Total Investment</p>
            <p className="text-2xl font-bold text-green-600">
              ${summaryStats.totalInvestment.toFixed(2)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500">Avg. Investment</p>
            <p className="text-2xl font-bold text-blue-600">
              ${summaryStats.avgInvestment.toFixed(2)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500">Total Earnings</p>
            <p className="text-2xl font-bold text-purple-600">
              ${summaryStats.totalEarnings.toFixed(2)}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center">
            <p className="text-sm text-gray-500">Withdrawable</p>
            <p className="text-2xl font-bold text-orange-600">
              ${summaryStats.totalWithdrawable.toFixed(2)}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Plan Breakdown */}
      <Card>
        <CardHeader>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="text-primary" />
            Investment by Plan
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(byPlan).map(([plan, data]) => (
              <Card key={plan} className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardBody>
                  <h4 className="font-bold text-lg mb-2">{plan}</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Users: <span className="font-semibold">{data.count}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Total: <span className="font-semibold text-green-600">
                        ${data.totalAmount.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Avg: <span className="font-semibold">
                        ${(data.totalAmount / data.count).toFixed(2)}
                      </span>
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Detailed Investment Table */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="text-primary" />
            All User Investments ({filteredInvestments.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="w-4 h-4" />}
              className="max-w-xs"
              size="sm"
            />
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat" size="sm" startContent={<Filter className="w-4 h-4" />}>
                  {filterPlan === "all" ? "All Plans" : filterPlan}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                onAction={(key) => setFilterPlan(key)}
                selectedKeys={new Set([filterPlan])}
              >
                {uniquePlans.map((plan) => (
                  <DropdownItem key={plan}>
                    {plan === "all" ? "All Plans" : plan}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              color="primary"
              size="sm"
              onClick={exportToCSV}
              startContent={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            aria-label="Investment details table"
            className="min-w-full"
          >
            <TableHeader>
              <TableColumn>USER</TableColumn>
              <TableColumn>PLAN</TableColumn>
              <TableColumn>INVESTMENT</TableColumn>
              <TableColumn>PURCHASE DATE</TableColumn>
              <TableColumn>DAILY RETURN</TableColumn>
              <TableColumn>WALLET</TableColumn>
              <TableColumn>EARNINGS</TableColumn>
              <TableColumn>REFERRALS</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody>
              {paginatedInvestments.map((inv) => (
                <TableRow key={inv.userId}>
                  <TableCell>
                    <NextUIUser
                      name={inv.username}
                      description={inv.email}
                      avatarProps={{
                        src: inv.image,
                        size: "sm",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip color="primary" variant="flat" size="sm">
                      {inv.plan}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-green-600">
                      ${inv.investmentAmount.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {inv.purchaseDate ? formatDate(inv.purchaseDate) : "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-semibold text-blue-600">
                      ${inv.dailyReturn.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-semibold">${inv.walletBalance.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">
                        Withdrawable: ${inv.withdrawableAmount.toFixed(2)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-purple-600">
                      ${inv.totalEarnings.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">
                      {inv.referralCount}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(inv.accountStatus)}
                      size="sm"
                      variant="flat"
                    >
                      {inv.accountStatus}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={setCurrentPage}
                color="primary"
                showControls
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminInvestmentDetails;
