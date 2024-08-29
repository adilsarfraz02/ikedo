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
import { Avatar } from "@nextui-org/react";
import { Eye, Trash } from "lucide-react";

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

  if (loading) return <Skeleton className='h-32 w-full' />;
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

  // Filter to exclude admins and include only users
  const filteredData = data
    ?.filter((user) => !user.isAdmin) // Only non-admin users
    ?.filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()),
    );

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
      closeDialog();
      router.refresh();
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
      router.refresh();
      toast.success("User deleted successfully");

    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className='flex items-center space-x-2 justify-between'>
            <h2 className='text-2xl font-bold py-6'>All Users</h2>
            <Input
              placeholder='Search user...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='max-w-xs'
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    className='flex items-center space-x-1'
                    onClick={() => handleSort("username")}>
                    Name
                    {sortOrder === "asc" ? (
                      <ArrowUpIcon className='h-4 w-4' />
                    ) : (
                      <ArrowDownIcon className='h-4 w-4' />
                    )}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    className='flex items-center space-x-1'
                    onClick={() => handleSort("email")}>
                    Email
                    {sortOrder === "asc" ? (
                      <ArrowUpIcon className='h-4 w-4' />
                    ) : (
                      <ArrowDownIcon className='h-4 w-4' />
                    )}
                  </button>
                </TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>   
            </TableHeader>
            <TableBody>
              {filteredData?.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Avatar src={user.image} alt={user.username} />
                    {user.email} 
                  </TableCell>
                  <TableCell>   {user.isAdmin ? "Admin" : "User"}</TableCell>
                  <TableCell>{user.paymentStatus}</TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <DotsHorizontalIcon />
                          <span className='sr-only'>Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem
                          className="flex items-center gap-3 "
                          onClick={() => handleDialogOpen(user, "view")} >
                          <Eye className="w-4 h-4 " />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-3"
                          onClick={() => handleDialogOpen(user, "delete")}>
                          <Trash className="w-4 h-4 " />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredData?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className='text-center'>
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "view" ? "View User" : "Confirm Delete"}
            </DialogTitle>
            {dialogType === "view" && (
              <DialogDescription>
                Name: {selectedUser?.username}
                <br />
                Email: {selectedUser?.email}
                <br />
                Role: {selectedUser?.isAdmin ? "Admin" : "User"}
                <br />
                <br />
                <Link
                  href={`/auth/profile/${selectedUser._id}`}
                  className='bg-blue-500 text-white px-4 py-2 rounded-md '>
                  View Details
                </Link>
              </DialogDescription>
            )}

            {dialogType === "delete" && (
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.username}?
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            {dialogType === "delete" && (
              <>
                <Button
                  onClick={handleDeleteUser}
                  variant='destructive'
                  disabled={isDeleting}>
                  {isDeleting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className='flex items-center'>
                      <AiOutlineLoading3Quarters className='mr-2 h-5 w-5' />
                    </motion.div>
                  ) : (
                    "Delete"
                  )}
                </Button>
                <Button onClick={closeDialog} disabled={isDeleting}>
                  Cancel
                </Button>
              </>
            )}
            {deleteError && (
              <div className='text-red-500 mt-2 flex items-center'>
                <AiOutlineExclamationCircle className='mr-2 h-5 w-5' />
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
