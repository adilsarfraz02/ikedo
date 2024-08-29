"use client";

import React from "react";
import { Logout } from "@/helpers/Logout";
import { Button, Chip } from "@nextui-org/react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, MailWarning } from "lucide-react";
import UserSession from "@/lib/UserSession";
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import ProfileImageModal from "@/components/myUi/ProfileImage";

export default function ProfilePage() {
  const { loading, data, error } = UserSession();

  if (error) {
    return (
      <div className='flex text-3xl items-center min-h-screen py-2 justify-content w-full'>
        <div className='w-full flex flex-col items-center gap-4 justify-centers'>
          {error}
          <Button variant='ghost' color='danger' as={Link} href='/auth/login'>
            Login again
          </Button>
        </div>
      </div>
    );
  }
  if (data.username) {
  return (
    <main className='pt-32'>
      <Navbar />
      <title>Profile</title>
      {loading ? (
        <div className='flex flex-col mb-4 transition-all w-full space-y-4 px-8 min-h-screen items-center'>
          <Skeleton className='w-full h-24 rounded-xl' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-44 w-full' />
          <Skeleton className='h-4 w-full' />
        </div>
      ) : (
        <div className='flex flex-col mb-4 transition-all w-full px-8 min-h-screen items-center'>
          {!data?.isVerified && (
            <div className='w-full rounded-xl mb-4 px-2 py-3 flex justify-center items-center h-14 bg-yellow-500/80'>
              <div className='text-center'>
                {data?.paymentStatus === "Processing" ? (
                  <div className='flex justify-center items-center gap-2'>
                    Your Account is Processing, Verified within 48hrs, You
                    received a mail <MailWarning />
                  </div>
                ) : (
                  <div className='flex justify-center items-center gap-2'>
                    Verify your account to become referral - otherwise your
                    account will be deleted in 48hrs <Clock />
                  </div>
                )}
              </div>
            </div>
          )}
          <Link href={`/`}>
            <ArrowLeft className='text-3xl top-20 left-8 absolute' />
          </Link>
          <div className='border-2 rounded-xl w-full divide-y-2 flex flex-col bg-zinc-500/5'>
            <h1 className='text-3xl font-bold px-8 py-8 w-full bg-zinc-500/20 rounded-t-xl'>
              Profile
            </h1>
            <div className='px-8 py-2 flex gap-8 items-center'>
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
            <div className='px-8 py-2 flex gap-8 items-center'>
              <strong>Email:</strong>
              <p>{data?.email}</p>
            </div>
            <div className='px-8 py-2 flex gap-8 items-center'>
              <strong>Is Verified:</strong>
              {data?.isVerified ? (
                <Chip className='bg-green-400 bg-opacity-40'>Verified</Chip>
              ) : data?.paymentStatus === "Processing" ? (
                <Chip className='bg-primary-400 bg-opacity-40'>
                  Processing (24hrs)
                </Chip>
              ) : (
                <Link
                  className='px-4 py-2 bg-warning-400 border-2 rounded-xl hover:opacity-60'
                  href='/auth/verify'>
                  Verify account
                </Link>
              )}
              </div>
              {
                data?.referralCount > 0 && (
                  <div className='px-8 py-2 flex gap-8 items-center'>
                    <strong>Referral Count:</strong>
                    <p>{data?.referralCount}</p>
                  </div>
                )
                
              }

            {data?.paymentStatus && (
              <div className='px-8 py-2 flex gap-8 items-center'>
                <strong>Payment Status:</strong>
                <Chip
                  className={`bg-opacity-40 ${
                    (data?.paymentStatus === "Processing" &&
                      "bg-primary-400") ||
                    (data?.paymentStatus === "Pending" && "bg-primary-500") ||
                    (data?.paymentStatus === "Approved" && "bg-green-500") ||
                    (data?.paymentStatus === "Rejected" && "bg-danger-600")
                  } px-2 py-1 rounded-xl`}>
                  {data?.paymentStatus}
                </Chip>
              </div>
            )}
            {data?.paymentReceipt && (
              <div className='px-8 py-2 flex gap-8 items-start'>
                <strong>Payment Receipt:</strong>
                <ProfileImageModal
                  size={200}
                  src={data?.paymentReceipt}
                  alt={data?.username}
                />
              </div>
            )}
            {data?.ReferralStatus === "Approved" && data?.isVerified && (
              <Button>Become Referral</Button>
            )}
            <div className='px-8 py-2 flex gap-8 items-center'>
              Logout:
              <Button
                onClick={Logout}
                className='bg-red-500 w-fit hover:bg-red-700 text-white font-bold py-2 px-4'>
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
      <SimpleFooter />
    </main>
  );
  }
  return <div className='flex justify-center items-center min-h-screen p-4 '>No user found</div>;
  
}
