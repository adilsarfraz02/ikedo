"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Logout } from "@/helpers/Logout";
import { Button, Image } from "@nextui-org/react";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import UserSession from "@/lib/UserSession";
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import ProfileImageModal from "@/components/myUi/ProfileImage";
export default function ProfilePage() {
  const { loading, data, error } = UserSession();

  if (loading) {
    return (
      <div className='flex text-3xl flex-col items-center  min-h-screen py-2'>
        Loading...
      </div>
    );
  }
  if (error) {
    return (
      <div className='flex text-3xl flex-col items-center  min-h-screen py-2'>
        {error}
      </div>
    );
  }
  return (
    <main className='mt-24'>
      <Navbar />
      <title>Profile </title>
      <div className='flex flex-col mb-4 transition-all w-full px-8 min-h-screen  items-center '>
        {data?.isVerfied ? (
          <></>
        ) : (
          <div className='w-full rounded-xl mb-4 px-2 py-3 flex justify-between items-center h-14 bg-red-600/80'>
            <p className='text-center w-full'>
              verify your account to become a referral account otherwise your
              account is deleted in 48hrs
            </p>
          </div>
        )}
        <Link href={`/`}>
          <ArrowLeft className='text-3xl top-8 left-6 absolute' />
        </Link>
        <div className='border-2 rounded-xl w-full divide-y-2 flex flex-col'>
          <h1 className='text-3xl font-bold px-8 py-3 '>Profile</h1>
          <div className='px-8 py-2 flex gap-8 items-center '>
            <strong>Profile Image:</strong>
            <ProfileImageModal src={data?.image} alt={data?.username} />
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
            ) : (
              <Link
                className='px-2 py-0.5  border-2 rounded-xl hover:opacity-60'
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
      </div>
      <SimpleFooter />
    </main>
  );
}
