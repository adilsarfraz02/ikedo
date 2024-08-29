"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaLink,
  FaDollarSign,
  FaCalendarDay,
  FaReceipt,
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { Button } from "@nextui-org/react";
import UserSession from "@/lib/UserSession";
import toast from "react-hot-toast";

function UProfile({ params }) {
  const {data: session} = UserSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWithdraw, setIsWithdraw] = useState(false);
  const [isWithdrawAmount, setIsWithdrawAmount] = useState(0);  

  const handleWithdraw = async () => {

    setIsWithdraw(true);
    setIsWithdrawAmount(session.tReferralCount * 10000);
    const res = await fetch(`/api/users/${session._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isWithdraw: true, isWithdrawAmount: session.tReferralCount * 10000,
        referemail: data.email,
        bankAccount: session.bankAccount,
        referralemail: session.email,

      }),
    });

    toast.success("Withdrawal request sent");
  };



  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/users/${params.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await res.json();
        setData(userData.user);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    }

    fetchUser();
  }, [params.id]);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen p-4 '>
        <div className='flex flex-col items-center'>
          <ImSpinner2 className='animate-spin text-3xl text-blue-500' />
          <p className='mt-4 text-lg text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen p-4 '>
        <div className='flex flex-col items-center'>
          <p className='text-lg text-red-500'>Error: {error}</p>
        </div>
      </div>
    );
  }
  if (data.username) {
    return (
      <div className='flex justify-center items-center min-h-screen p-4'>
        <title>Profile</title>
        <motion.div
          className='w-full max-w-2xl bg-white/5 shadow-lg rounded-lg overflow-hidden p-6'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <div className='flex flex-col items-center'>
            <img
              src={data.image}
              alt='User Avatar'
              className='w-24 h-24 rounded-full border-4 border-gray-300/50 mb-4'
            />
            <h1 className='text-3xl font-semibold capitalize'>{data.username}</h1>
            <p className='text-lg text-gray-600'>{data.email}</p>
            {
              session.isAdmin ? (
            <div className='w-full mt-6'>
              <div className='bg-gray-50/20 p-4 rounded-lg shadow mb-4'>
                <div className='flex items-center mb-2 '>
                  <FaLink className='text-blue-500 mr-2' />
                  <span className='font-bold text-gray-500 underline '>Referral URL:</span>{" "}
                      <p className='ml-2 bg-gray-50/5 p-2 rounded-lg'>                   
                      {data.ReferralUrl}
                  </p>
                </div>
                <div className='flex items-center mb-2'>
                  <FaDollarSign className='text-green-500 mr-2' />
                      <span className='font-bold text-gray-500 underline'>Bank Account:</span>{" "}
                      <p className='ml-2 bg-gray-50/5 p-2 rounded-lg'>
                      {data.bankAccount}
                  </p>
                </div>
                <div className='flex items-center mb-2'>
                  <FaReceipt className='text-gray-300 mr-2' />
                      <span className='font-bold text-gray-500 underline'>Payment Status:</span>{" "}
                  
                      <p className='ml-2 bg-gray-50/5 p-2 rounded-lg'>
                      {data.paymentStatus}
                  </p>
                </div>
                <div className='flex items-center mb-2'>
                  <FaCalendarDay className='text-gray-500 mr-2' />
                  <span className='font-bold text-gray-500 underline'>Referral Count:</span>{" "}
                  <p className='ml-2 bg-gray-50/5 p-2 rounded-lg'>
                  {data.tReferralCount}
                  </p>
                </div>
              </div>
              <div className='bg-gray-50/20 p-4 rounded-lg shadow'>
                <div className='flex items-center mb-2'>
                  <FaCalendarDay className='text-gray-500 mr-2' />
                  <span className='font-bold text-gray-500 underline'>Created At:</span>{" "}
                  <span className='bg-gray-50/5 p-2 rounded-lg ml-2'>{new Date(data.createdAt).toLocaleDateString()}</span>
                </div>
              
                <div className='flex items-center mb-2'>
                  <FaReceipt className='text-gray-700 mr-2' />
                    <span className='font-bold text-gray-500 underline'>Payment Receipt:</span>{" "}
                  <a
                    href={data.paymentReceipt}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-500 underline bg-gray-50/5 p-2 rounded-lg ml-2'>
                    View Receipt
                  </a>
                </div>
              </div>
            </div>
              ) : <>
                  {
                    data.paymentStatus === "Pending" &&
                    <p className='ml-2 bg-yellow-500/20 text-yellow-500 opacity-50 p-2 rounded-lg mb-4'>
                      Payment is pending User is not verified yet
                    </p>
                  }
                <div className='flex items-center mb-2'>
                  <FaReceipt className='text-gray-700 mr-2' />
                    <span className='font-semibold text-gray-300 underline'>Payment Status:</span>{" "}
                  <p className='ml-2 bg-gray-50/20 p-2 rounded-lg'>{data.paymentStatus}</p>
                  </div>
                  <div className='flex items-center mb-2'>
                    {
                      data.paymentStatus === "Approved" &&
                      <Button color="success" onClick={handleWithdraw}>
                        Withdraw Referral
                      </Button>
                    }
                    </div>
                </>
            }
          </div>
        </motion.div>
      </div>
    ); 
  }
  return <div className='flex justify-center items-center min-h-screen p-4 '>No user found</div>;
}

export default UProfile;


