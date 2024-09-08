"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function VerifyPlanContent() {
  const searchParams = useSearchParams();
  const [ref, setRef] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const urlRef = searchParams.get("ref");
    setRef(urlRef);

    if (!urlRef) {
      setError("Account ID is missing.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/users/verifyPlan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: urlRef }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify account.");
        }

        toast.success("Payment verified successfully!");
        setSuccess(true);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to verify payment.",
        );
        toast.error(
          error instanceof Error ? error.message : "Failed to verify payment.",
        );
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (success) {
      countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(countdownInterval);
            // Use a check for window to ensure it's only called on the client side
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      {success ? (
        <div className='text-center'>
          <h2 className='text-2xl font-bold mb-4'>Payment Verified!</h2>
          <p className='text-lg'>Closing window in {countdown} seconds...</p>
        </div>
      ) : (
        <p className='text-lg text-red-500'>
          Something went wrong. Please try again later.
        </p>
      )}
    </div>
  );
}

export default function VerifyPlanPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyPlanContent />
    </Suspense>
  );
}
