"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { LuLoader } from "react-icons/lu";

const PaymentPageContent = () => {
  const searchParams = useSearchParams();
  const url = searchParams.get("ref");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!url) {
      setError("account ID is missing.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/users/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: url }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify account.");
        }

        setSuccess(true);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [url]);

  useEffect(() => {
    if (success) {
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      if (countdown === 0) {
        window.close();
      }

      return () => clearInterval(countdownInterval);
    }
  }, [success, countdown]);

  if (loading) {
    return (
      <main className='w-full max-md:px-12 min-h-screen flex flex-col justify-center items-center'>
        <div className='w-1/3 max-md:w-full bg-zinc-200  h-[40vh] flex text-center flex-col justify-center items-center rounded-2xl'>
          <LuLoader className='animate-spin text-7xl font-bold mb-4' />
          <h1 className='text-4xl pb-4 pt-2 font-bold'>Authentication</h1>
          <p className='text-lg opacity-50'>
            Verifying account, please wait...
          </p>
        </div>
        <p className='text-lg opacity-50 px-12'>
          This window will close in {countdown} seconds...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className='w-full max-md:px-12 min-h-screen flex flex-col justify-center items-center '>
        <div className='w-1/3 max-md:w-full bg-zinc-200 h-[40vh] flex text-center flex-col justify-center items-center rounded-2xl'>
          <FaExclamationCircle className='text-7xl text-red-500 mb-4' />
          <h1 className='text-4xl pb-4 pt-2 font-bold'>Error</h1>
          <p className='text-lg opacity-50'>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className='w-full max-md:px-12 min-h-screen flex flex-col justify-center items-center '>
      <div className='w-1/3 max-md:w-full bg-zinc-200 h-[40vh] flex text-center flex-col justify-center items-center rounded-2xl'>
        {success ? (
          <div className='flex flex-col items-center'>
            <FaCheckCircle className='text-7xl text-green-500 mb-4' />
            <h1 className='text-4xl pb-4 pt-2 font-bold text-green-500'>
              Verified
            </h1>
            <p className='text-lg opacity-50 px-12'>
              account verified and user updated successfully!
            </p>
          </div>
        ) : (
          <div className='flex flex-col items-center'>
            <FaExclamationCircle className='text-7xl text-yellow-500 mb-4' />
            <h1 className='text-4xl pb-4 pt-2 font-bold text-yellow-500'>
              Failed
            </h1>
            <p className='text-lg opacity-50 px-12'>
              Failed to verify account. Please try again later.
            </p>
          </div>
        )}
      </div>
      <p className='text-lg opacity-50 px-12'>
        This window will close in {countdown} seconds...
      </p>
    </main>
  );
};

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
