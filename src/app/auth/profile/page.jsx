"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Logout } from "@/helpers/Logout";
import { Button } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UserSession from "@/lib/UserSession";
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
export default function ProfilePage() {
  const { loading, data, error } = UserSession();

  if (loading) {
    return (
      <div className='flex text-3xl flex-col items-center justify-center min-h-screen py-2'>
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className='flex text-3xl flex-col items-center justify-center min-h-screen py-2'>
        {error}
      </div>
    );
  }
  return (
    <main>
      <Navbar />
      <div className='flex w-full  min-h-screen justify-center items-center'>
        <Link href={`/`}>
          <ArrowLeft className='text-3xl top-8 left-6 absolute' />
        </Link>
        <Table aria-label='Example static collection table' className='w-fit'>
          <TableHeader>
            <TableColumn className='w-full text-center'>Profile</TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow key='1'>
              <TableCell className='flex flex-col gap-2.5 py-6'>
                <h1>
                  <strong>Name:</strong> {data?.username}
                </h1>
                <h1>
                  <strong>Email:</strong> {data?.email}
                </h1>
                <h1>
                  <strong>Is Verified:</strong>{" "}
                  {data?.isVerfied ? (
                    "Yes"
                  ) : (
                    <Link
                      className='px-2 py-0.5 hover:scale-80 border-2 rounded-xl hover:opacity-60'
                      href='/auth/verify'>
                      Verify account
                    </Link>
                  )}
                </h1>
                <h1>
                  <strong>Is Admin:</strong> {data?.isAdmin ? "Yes" : "No"}
                </h1>
                <p>
                  {data?.tReferralStatus === "approved" && data?.isVerfied && (
                    <Button>Become Referral</Button>
                  )}
                </p>
                <Button
                  onClick={Logout}
                  className='bg-red-500 mt-4 hover:bg-red-700 text-white font-bold py-2 px-4'>
                  Logout
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <SimpleFooter />
    </main>
  );
}
