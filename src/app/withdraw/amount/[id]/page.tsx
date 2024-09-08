"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  AiOutlineLoading3Quarters,
  AiOutlineCheckCircle,
  AiOutlineCloseCircle,
} from "react-icons/ai";

function VerifyWithDrawContent({ param }: { param: any }) {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState<string | null>(null);
  const [ref, setRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const urlRef = param.id;
    const searchAmount = searchParams.get("amount");
    setRef(urlRef);
    setAmount(searchAmount);

    if (!urlRef) {
      setError("Account ID is missing.");
      setLoading(false);
      return;
    }

    if (!searchAmount) {
      setError("Amount is missing.");
      setLoading(false);
      return;
    }

    const verifyWithdraw = async () => {
      try {
        const response = await fetch("/api/withdraw/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: urlRef, amount: searchAmount }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify withdrawal.");
        }

        toast.success("Withdrawal verified successfully!");
        setSuccess(true);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to verify withdrawal.",
        );
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to verify withdrawal.",
        );
      } finally {
        setLoading(false);
      }
    };

    verifyWithdraw();
  }, [searchParams, param.id]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (success) {
      countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(countdownInterval);
            if (typeof window !== "undefined") {
              window.close();
            }
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [success]);

  if (loading)
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <AiOutlineLoading3Quarters className='animate-spin text-4xl text-blue-500' />
        <p className='mt-4 text-lg'>Verifying withdrawal...</p>
      </div>
    );

  if (error)
    return (
      <motion.div
        className='flex flex-col items-center justify-center min-h-screen text-red-500'
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}>
        <AiOutlineCloseCircle className='text-5xl mb-4' />
        <p className='text-lg font-bold'>Error: {error}</p>
      </motion.div>
    );

  return (
    <motion.div
      className='flex flex-col items-center justify-center min-h-screen bg-gray-100'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}>
      {success ? (
        <div className='text-center'>
          <AiOutlineCheckCircle className='text-green-500 text-6xl mb-4' />
          <h2 className='text-2xl font-bold mb-4'>Withdrawal Verified!</h2>
          <p className='text-lg'>Amount: ${amount}</p>
          <p className='text-lg mt-2'>
            Closing window in {countdown} seconds...
          </p>
        </div>
      ) : (
        <p className='text-lg text-red-500'>
          Something went wrong. Please try again later.
        </p>
      )}
    </motion.div>
  );
}

export default function VerifyWithDrawPage({ params }: { params: any }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyWithDrawContent param={params} />
    </Suspense>
  );
}
