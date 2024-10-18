"use client";

import React, { useState } from "react";
import FetchAllUser from "../utils/FetchAllUser";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import {
  AiOutlineLoading3Quarters,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Badge, Chip } from "@nextui-org/react";
import { Eye, Trash } from "lucide-react";
import toast from "react-hot-toast";

function AllUserTable() {
  const { data, loading, error } = FetchAllUser();
  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogType, setDialogType] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const router = useRouter();

  if (loading) return <Skeleton className="h-32 w-full" />;
  if (error) return <div>Error: {error}</div>;

  const handleDialogOpen = (user, type) => {
    setSelectedUser(user);
    setDialogType(type);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedUser(null);
    setDialogType(null);
    setIsDialogOpen(false);
    setDeleteError(null);
  };

  const handleSort = (key) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    data.sort((a, b) => {
      if (order === "asc") return a[key].localeCompare(b[key]);
      return b[key].localeCompare(a[key]);
    });
  };

  const filteredData = data
    ?.filter((user) => !user.isAdmin)
    ?.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: "DELETE",
        cache: "no-cache",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      toast.success("User deleted successfully");
      setIsDialogOpen(false);
      window.location.reload(true);
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2 justify-between">
            <h2 className="text-2xl font-bold py-6">All Users</h2>
            <Input
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => handleSort("username")}
                  >
                    Name
                    {sortOrder === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className="flex items-center space-x-1"
                    onClick={() => handleSort("email")}
                  >
                    Email
                    {sortOrder === "asc" ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Withdraw</TableHead>
                <TableHead>Referrals</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="flex items-center gap-2">
                    <Avatar src={user.image} alt={user.username} />
                    {user.username}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.plan}</TableCell>
                  <TableCell>
                    <Chip
                      color={
                        user.paymentStatus === "Pending"
                          ? "warning"
                          : user.paymentStatus === "Approved"
                          ? "success"
                          : "danger"
                      }
                    >
                      {user.paymentStatus}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {user.isWithdraw ? (
                      <Chip color="success">Yes</Chip>
                    ) : (
                      <Chip color="danger">No</Chip>
                    )}
                  </TableCell>
                  <TableCell>{user.tReferralCount}</TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Chip color="success">Yes</Chip>
                    ) : (
                      <Chip color="danger">No</Chip>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <DotsHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDialogOpen(user, "view")}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDialogOpen(user, "delete")}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "view" ? "User Details" : "Confirm Delete"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "view" && selectedUser && (
                <div className="space-y-2">
                  <p>Username: {selectedUser.username}</p>
                  <p>Email: {selectedUser.email}</p>
                  <p>Plan: {selectedUser.plan}</p>
                  <p>Payment Status: {selectedUser.paymentStatus}</p>
                  <p>Withdraw: {selectedUser.isWithdraw ? "Yes" : "No"}</p>
                  <p>Withdraw Amount: ${selectedUser.isWithdrawAmount}</p>
                  <p>Referrals: {selectedUser.tReferralCount}</p>
                  <p>Verified: {selectedUser.isVerified ? "Yes" : "No"}</p>
                  <p>Bank Account: {selectedUser.bankAccount}</p>
                  <p>
                    Created At:{" "}
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </p>
                  <Link
                    href={`/auth/profile/${selectedUser._id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md inline-block mt-2"
                  >
                    View Full Profile
                  </Link>
                </div>
              )}
              {dialogType === "delete" && (
                <p>Are you sure you want to delete {selectedUser?.username}?</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {dialogType === "delete" && (
              <>
                <Button onClick={closeDialog} variant="outline">
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteUser}
                  variant="destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </Button>
              </>
            )}
            {deleteError && (
              <div className="text-red-500 mt-2 flex items-center">
                <AiOutlineExclamationCircle className="mr-2 h-5 w-5" />
                {deleteError}
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AllUserTable;
