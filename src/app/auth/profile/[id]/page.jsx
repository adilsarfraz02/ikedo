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

function UProfile({ params }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className='flex justify-center items-center min-h-screen p-4'>
      <motion.div
        className='w-full max-w-2xl bg-white/10 shadow-lg rounded-lg overflow-hidden p-6'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <div className='flex flex-col items-center'>
          <img
            src={data.image}
            alt='User Avatar'
            className='w-24 h-24 rounded-full border-4 border-gray-300/50 mb-4'
          />
          <h1 className='text-3xl font-semibold'>{data.username}</h1>
          <p className='text-lg text-gray-600'>{data.email}</p>
          <div className='w-full mt-6'>
            <div className='bg-gray-50/20 p-4 rounded-lg shadow mb-4'>
              <div className='flex items-center mb-2'>
                <FaLink className='text-blue-500 mr-2' />
                <span className='font-semibold'>Referral URL:</span>{" "}
                {data.ReferralUrl}
              </div>
              <div className='flex items-center mb-2'>
                <FaDollarSign className='text-green-500 mr-2' />
                <span className='font-semibold'>Bank Account:</span>{" "}
                {data.bankAccount}
              </div>
              <div className='flex items-center mb-2'>
                <FaReceipt className='text-gray-700 mr-2' />
                <span className='font-semibold'>Payment Status:</span>{" "}
                {data.paymentStatus}
              </div>
              <div className='flex items-center mb-2'>
                <FaCalendarDay className='text-gray-500 mr-2' />
                <span className='font-semibold'>Referral Count:</span>{" "}
                {data.tReferralCount}
              </div>
            </div>
            <div className='bg-gray-50/20 p-4 rounded-lg shadow'>
              <div className='flex items-center mb-2'>
                <FaCalendarDay className='text-gray-500 mr-2' />
                <span className='font-semibold'>Created At:</span>{" "}
                {new Date(data.createdAt).toLocaleDateString()}
              </div>
              <div className='flex items-center mb-2'>
                <FaCalendarDay className='text-gray-500 mr-2' />
                <span className='font-semibold'>Updated At:</span>{" "}
                {new Date(data.updatedAt).toLocaleDateString()}
              </div>
              <div className='flex items-center mb-2'>
                <FaReceipt className='text-gray-700 mr-2' />
                <span className='font-semibold'>Payment Receipt:</span>{" "}
                <a
                  href={data.paymentReceipt}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 underline'>
                  View Receipt
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default UProfile;
