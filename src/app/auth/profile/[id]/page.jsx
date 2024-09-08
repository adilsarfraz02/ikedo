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
import Link from "next/link";

function UProfile({ params }) {
  const { data: session } = UserSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWithdrawAmount, setIsWithdrawAmount] = useState(0);
  const [isWithdrawRef, setIsWithdrawRef] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); // Ensure loading state is true at the start
      try {
        const res = await fetch(`/api/users/${params.id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user data");
        }
        const userData = await res.json();
        setData(userData.user);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false); // Always set loading to false
      }
    };

    fetchUser();
  }, [params.id]);

  useEffect(() => {
    if (data && session) {
      let amount = 0;
      switch (data.plan) {
        case "Standard":
          amount = 5000;
          break;
        case "Pro":
          amount = 10000;
          break;
        case "Premium":
          amount = 20000;
          break;
        default:
          amount = 0;
      }

      let percentage = 0;
      switch (session.plan) {
        case "Free":
          percentage = 20;
          break;
        case "Standard":
          percentage = 40;
          break;
        case "Pro":
          percentage = 60;
          break;
        case "Premium":
          percentage = 80;
          break;
        default:
          percentage = 0;
      }

      setIsWithdrawAmount((amount * percentage) / 100);
    }
    if (data && session) {
      // find refere user in session treferral array object
      const referral = session.tReferrals.find((ref) => {
        ref.isWithdrawRef === true;
        ref.email === data.email;
      });
      // if referral is found, set isWithdrawRef to true
      if (referral) {
        isWithdrawRef(true);
      }
    }
  }, [data, session]);

  const handleWithdraw = async () => {
    try {
      const res = await fetch(`/api/users/${session._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isWithdrawAmount,
          referemail: data.email,
        }),
      });

      if (res.ok) {
        toast.success("Withdrawal Approved");
        setIsWithdrawRef(true); // Set isWithdrawRef to true after successful withdrawal
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to send withdrawal request");
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred");
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen p-4'>
        <div className='flex flex-col items-center'>
          <ImSpinner2 className='animate-spin text-3xl text-blue-500' />
          <p className='mt-4 text-lg text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center min-h-screen p-4'>
        <div className='flex flex-col items-center'>
          <p className='text-lg text-red-500'>Error: {error}</p>
        </div>
      </div>
    );
  }

  if (data?.username) {
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
            <h1 className='text-3xl font-semibold capitalize'>
              {data.username}
            </h1>
            <p className='text-lg text-gray-600'>{data.email}</p>
            {session.isAdmin ? (
              <AdminDetails data={data} />
            ) : (
              <UserDetails
                isWithdrawRef={isWithdrawRef}
                data={data}
                handleWithdraw={handleWithdraw}
              />
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return null; // Return null if no conditions are met
}

const AdminDetails = ({ data }) => (
  <div className='w-full mt-6'>
    <div className='bg-gray-50/20 p-4 rounded-lg shadow mb-4'>
      <DetailRow icon={FaLink} label='Referral URL:' value={data.ReferralUrl} />
      <DetailRow
        icon={FaDollarSign}
        label='Bank Account:'
        value={data.bankAccount}
      />
      <DetailRow
        icon={FaReceipt}
        label='Payment Status:'
        value={data.paymentStatus}
      />
      <DetailRow
        icon={FaCalendarDay}
        label='Referral Count:'
        value={data.tReferralCount}
      />
    </div>
    <div className='bg-gray-50/20 p-4 rounded-lg shadow'>
      <DetailRow
        icon={FaCalendarDay}
        label='Created At:'
        value={new Date(data.createdAt).toLocaleDateString()}
      />
      {data.paymentReceipt && <PaymentReceiptLink href={data.paymentReceipt} />}
    </div>
  </div>
);

const UserDetails = ({ data, handleWithdraw, isWithdrawRef }) => (
  <>
    {data.paymentStatus === "Pending" && (
      <WarningMessage message='User is not Buy any Plan User Using Free Plan yet.' />
    )}
    {data.paymentStatus === "Processing" && (
      <WarningMessage message='User Purchased a Plan 1-2 Days ago. Please Wait for Processing!' />
    )}
    <div className='flex items-center mb-2'>
      <FaReceipt className='text-gray-600 mr-2' />
      <span className='font-semibold underline'>Payment Status:</span>
      <p className='ml-2 bg-gray-50/20 p-2 rounded-lg'>{data.paymentStatus}</p>
    </div>
    <div className='flex items-center mb-2'>
      {data.paymentStatus === "Approved" &&
        (isWithdrawRef === true ? (
          <Button color='primary' isDisabled>
            Already Claimed
          </Button>
        ) : (
          <Button color='success' onClick={handleWithdraw}>
            Claim Referral
          </Button>
        ))}
    </div>
  </>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className='flex items-center mb-2'>
    <Icon className='text-blue-500 mr-2' />
    <span className='font-bold text-gray-500 underline'>{label}</span>
    <p className='ml-2 bg-gray-50/5 p-2 rounded-lg'>{value}</p>
  </div>
);

const PaymentReceiptLink = ({ href }) => (
  <div className='flex items-center mb-2'>
    <FaReceipt className='text-gray-700 mr-2' />
    <span className='font-bold text-gray-500 underline'>Payment Receipt:</span>
    <Link
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className='text-blue-500 underline bg-gray-50/5 p-2 rounded-lg ml-2'>
      View Receipt
    </Link>
  </div>
);

const WarningMessage = ({ message }) => (
  <p className='ml-2 bg-yellow-500/20 text-yellow-400 opacity-80 p-2 rounded-lg mb-4'>
    {message}
  </p>
);

export default UProfile;
