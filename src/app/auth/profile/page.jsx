"use client";

import React from "react";
import { Logout } from "@/helpers/Logout";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Mail, MailWarning, X } from "lucide-react";
import UserSession from "@/lib/UserSession";
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import ProfileImageModal from "@/components/myUi/ProfileImage";
export default function ProfilePage() {
  const { loading, data, error } = UserSession();

  if (error) {
    return (
      <div className='flex text-3xl flex-col items-center  min-h-screen py-2'>
        {error}
      </div>
    );
  }
  return (
    <main className='pt-24'>
      <Navbar />
      <title>Profile </title>
      <div className='flex flex-col mb-4 transition-all w-full px-8 min-h-screen  items-center '>
        {data?.isVerfied ? (
          <></>
        ) : (
          <div className='w-full rounded-xl mb-4 px-2 py-3 flex justify-center items-center h-14 bg-yellow-500/80'>
            <div className='text-center'>
              {data?.paymentStatus === "Processing" ? (
                <div className='flex justify-center items-center gap-2'>
                  Your Account is Processing, Verified within 48hrs, You recived
                  a mail <MailWarning />
                </div>
              ) : (
                <div className='flex justify-center items-center gap-2'>
                  Verify your account to become referral - otherwise your
                  account is deleted in 48hrs <Clock />
                </div>
              )}
            </div>
          </div>
        )}
        <Link href={`/`}>
          <ArrowLeft className='text-3xl top-8 left-6 absolute' />
        </Link>
        {loading ? (
          <div className='flex flex-col space-y-3'>
            <Skeleton className='w-full h-24 rounded-xl' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
            </div>
          </div>
        ) : (
          <div className='border-2 rounded-xl w-full divide-y-2 flex flex-col'>
            <h1 className='text-3xl font-bold px-8 py-3 '>Profile</h1>
            <div className='px-8 py-2 flex gap-8 items-center '>
              <strong>Profile Image:</strong>
              <ProfileImageModal
                size={`52`}
                src={data?.image}
                alt={data?.username}
              />
            </div>
            <div className='px-8 py-2 flex gap-8 items-center'>
              <strong>Name:</strong>
              <p>{data?.username}</p>
            </div>
            <div className='px-8 py-2 flex gap-8 items-center '>
              <strong>Email:</strong>
              <p>{data?.email}</p>
            </div>
            <div className='px-8 py-2 flex gap-8 items-center '>
              <strong>Is Verified:</strong>
              {data?.isVerfied ? (
                "Yes"
              ) : data?.paymentStatus === "Processing" ? (
                <p className='bg-primary-400 px-2 py-1 rounded-xl'>
                  {" "}
                  Processing (24hrs)
                </p>
              ) : (
                <Link
                  className='px-2 py-0.5 bg-warning-400 border-2 rounded-xl hover:opacity-60'
                  href='/auth/verify'>
                  Verify account
                </Link>
              )}
            </div>
            {data?.isAdmin && (
              <div className='px-8 py-2 flex gap-8 items-center '>
                <strong>Is Admin:</strong> <p>{data?.isAdmin ? "Yes" : "No"}</p>
              </div>
            )}
            {data?.paymentStatus && (
              <div className='px-8 py-2 flex gap-8 items-center '>
                <strong>Payment Status:</strong>{" "}
                <p
                  className={`${
                    (data?.paymentStatus === "Processing" &&
                      "bg-primary-400") ||
                    (data?.paymentStatus === "Pending" && "bg-primary-500") ||
                    (data?.paymentStatus === "Approved" && "bg-green-500") ||
                    (data?.paymentStatus === "Rejected" && "bg-danger-600")
                  } bg-primary-400 px-2 py-1 rounded-xl`}>
                  {data?.paymentStatus}
                </p>
              </div>
            )}
            {data?.paymentReceipt && (
              <div className='px-8 py-2 flex gap-8 items-center '>
                <strong>Payment Reciptant:</strong>
                <ProfileImageModal
                  size={200}
                  src={data?.paymentReceipt}
                  alt={data?.username}
                />
              </div>
            )}
            <div>
              {data?.tReferralStatus === "approved" && data?.isVerfied && (
                <Button>Become Referral</Button>
              )}
            </div>
            <div className='px-8 py-2 flex gap-8 items-center'>
              Logout :
              <Button
                onClick={Logout}
                className='bg-red-500 w-fit hover:bg-red-700 text-white font-bold py-2 px-4'>
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
      <SimpleFooter />
    </main>
  );
}
