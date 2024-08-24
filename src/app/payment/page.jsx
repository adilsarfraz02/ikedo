"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from "react-icons/fa";
import { LuLoader } from "react-icons/lu";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      setError("Payment ID is missing.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentReceipt: paymentId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify payment.");
        }

        setSuccess(true);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [paymentId]);

  if (loading) {
    return (
      <main className='w-full max-md:px-12 min-h-screen flex flex-col justify-center items-center'>
        <div className='w-1/3 max-md:w-full bg-zinc-900  h-[40vh] flex text-center flex-col justify-center items-center rounded-2xl'>
          <LuLoader className='animate-spin text-7xl font-bold mb-4' />
          <h1 className='text-4xl pb-4 pt-2 font-bold'>Authentication</h1>
          <p className='text-lg opacity-50'>
            Verifying payment, please wait...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className='w-full max-md:px-12 min-h-screen flex flex-col justify-center items-center '>
        <div className='w-1/3 max-md:w-full bg-zinc-900 h-[40vh] flex text-center flex-col justify-center items-center rounded-2xl'>
          <FaExclamationCircle className='text-7xl text-red-500 mb-4' />
          <h1 className='text-4xl pb-4 pt-2 font-bold'>Error</h1>
          <p className='text-lg opacity-50'>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className='w-full max-md:px-12 min-h-screen flex flex-col justify-center items-center '>
      <div className='w-1/3 max-md:w-full bg-zinc-900 h-[40vh] flex text-center flex-col justify-center items-center rounded-2xl'>
        {success ? (
          <div className='flex flex-col items-center'>
            <FaCheckCircle className='text-7xl text-green-500 mb-4' />
            <h1 className='text-4xl pb-4 pt-2 font-bold text-green-500'>
              Verified
            </h1>
            <p className='text-lg opacity-50 px-12'>
              {" "}
              Payment verified and user updated successfully!
            </p>
          </div>
        ) : (
          <div className='flex flex-col items-center'>
            <FaExclamationCircle className='text-7xl text-yellow-500 mb-4' />
            <h1 className='text-4xl pb-4 pt-2 font-bold text-yellow-500'>
              Failed
            </h1>
            <p className='text-lg opacity-50 px-12'>
              {" "}
              Failed to verify payment. Please try again later.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
