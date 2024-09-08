"use client";

import React from "react";
import UserSession from "@/lib/UserSession";
import { Skeleton, Chip, Button, Card, Avatar } from "@nextui-org/react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  User,
  Wallet,
  Calendar,
  Clock,
  AlertCircle,
  LandPlot,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ProfileImageModal from "@/components/myUi/ProfileImage";

export default function ProfilePage() {
  const { loading, data, error } = UserSession();

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-3xl mb-4'>{error}</p>
          <Link href='/auth/login' className='text-blue-500 hover:underline'>
            Login again
          </Link>
        </div>
      </div>
    );
  }

  if (data) {
    return (
      <div className='flex h-screen bg-gray-50'>
        <title>Profile </title>
        <Sidebar />
        <div className='flex-1 flex pb-20 flex-col overflow-hidden'>
          <main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6'>
            <div className='max-w-7xl mx-auto'>
              {/* verify account alert email sended */}
              {loading ? (
                <Skeleton>
                  {" "}
                  <div className='flex items-center justify-center my-4 gap-2 px-4'>
                    <div className='w-full bg-yellow-300/40 rounded-xl items-center gap-3 backdrop-blur-xl text-yellow-500 p-2 flex'>
                      <AlertCircle className='mt-0.5 size-8' size={20} />
                      <span>
                        Verify your account and Payment - Email verification
                        sent !{" "}
                      </span>
                    </div>
                  </div>
                </Skeleton>
              ) : (
                !data?.isVerified && (
                  <div className='flex items-center justify-center my-4 gap-2 px-4'>
                    <div className='w-full bg-yellow-300/40 rounded-xl items-center gap-3 backdrop-blur-xl text-yellow-500 p-2 flex'>
                      <AlertCircle className='mt-0.5 size-8' size={20} />
                      <span>
                        Verify your account and Payment - Email verification
                        sent !{" "}
                      </span>
                    </div>
                  </div>
                )
              )}
              <h1 className='text-3xl py-4 font-semibold text-gray-900'>
                Profile
              </h1>
              {loading ? (
                <div className='flex flex-col space-y-4'>
                  <Skeleton className='h-8 w-full' />
                  <Skeleton className='h-64 w-full' />
                </div>
              ) : (
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                  <Card className='col-span-1 p-6'>
                    <div className='flex flex-col items-center text-center'>
                      <ProfileImageModal
                        src={data.image}
                        size={120}
                        alt={`Profile image`}
                      />
                      <h2 className='mt-4 text-xl font-semibold'>
                        {data.username}
                      </h2>
                      <p className='text-sm text-gray-500'>{data.email}</p>
                      <div className='mt-4 flex space-x-2'>
                        <Chip
                          color={data.isVerified ? "success" : "danger"}
                          variant='flat'>
                          {data.isVerified ? "Verified" : "Not Verified"}
                        </Chip>
                      </div>
                    </div>
                  </Card>

                  <Card className='col-span-1 lg:col-span-2 p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Account Details
                    </h3>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='flex items-center'>
                        <LandPlot className='w-5 h-5 mr-2 text-gray-400' />
                        <div>
                          <p className='text-sm text-gray-500'>Plan</p>
                          <Chip color='primary' className='font-medium'>
                            {data.plan} Plan
                          </Chip>{" "}
                          &nbsp;
                          <Link
                            href={`/pricing`}
                            className='underline text-sm text-blue-500 hover:opacity-80 transition-all'>
                            Upgrade Now
                          </Link>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <Wallet className='w-5 h-5 mr-2 text-gray-400' />
                        <div>
                          <p className='text-sm text-gray-500'>Bank Account</p>
                          <p className='font-medium'>{data.bankAccount}</p>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <User className='w-5 h-5 mr-2 text-gray-400' />
                        <div>
                          <p className='text-sm text-gray-500'>
                            Payment Status
                          </p>
                          <Chip
                            color={
                              data.paymentStatus === "Approved"
                                ? "success"
                                : "warning"
                            }
                            variant='flat'>
                            {data.paymentStatus}
                          </Chip>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <Calendar className='w-5 h-5 mr-2 text-gray-400' />
                        <div>
                          <p className='text-sm text-gray-500'>Joined</p>
                          <p className='font-medium'>
                            {new Date(data.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {data.isWithdraw && (
                    <Card className='col-span-1 lg:col-span-3 p-6'>
                      <h3 className='text-lg font-semibold mb-4'>Withdrawal</h3>
                      <p className='text-2xl font-semibold'>
                        ${data.isWithdrawAmount.toFixed(2)}
                      </p>
                      <p className='text-sm text-gray-500'>Withdrawal Amount</p>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return null;
}
