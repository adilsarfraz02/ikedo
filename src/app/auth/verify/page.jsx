"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle,
} from "react-icons/ai";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setError("Invalid verification link.");
      setLoading(false);
      return;
    }

    // Call the verification API
    const verifyEmail = async () => {
      try {
        const res = await fetch(
          `/api/auth/verify?imageUrl=${encodeURIComponent(imageUrl)}`,
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setVerified(true);
        toast.success("Email verified successfully!");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [imageUrl]);

  return (
    <div className='min-h-screen flex flex-col justify-center items-center'>
      {loading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className='flex items-center space-x-2 text-blue-500'>
          <AiOutlineLoading3Quarters className='h-10 w-10' />
          <span>Verifying...</span>
        </motion.div>
      ) : error ? (
        <div className='text-red-500 flex items-center space-x-2'>
          <AiOutlineExclamationCircle className='h-10 w-10' />
          <span>{error}</span>
        </div>
      ) : verified ? (
        <div className='text-green-500 flex items-center space-x-2'>
          <AiOutlineCheckCircle className='h-10 w-10' />
          <span>Email verified successfully!</span>
        </div>
      ) : null}
    </div>
  );
}
