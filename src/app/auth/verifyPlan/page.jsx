"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const VerifyPlanPage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get("ref");
  console.log(ref, "User iD");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!ref) {
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
          body: JSON.stringify({ url: ref }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to verify account.");
        }

        toast.success("Payment verified successfully!");
        setSuccess(true);
      } catch (error) {
        setError(error.message);
        toast.error(error.message || "Failed to verify payment.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [ref]);

  useEffect(() => {
    if (success) {
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);

      if (countdown === 0) {
        window.close(); // Close the window after countdown
      }

      return () => clearInterval(countdownInterval);
    }
  }, [success, countdown]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {success ? (
        <div>
          <h2>Payment Verified!</h2>
          <p>Closing window in {countdown} seconds...</p>
        </div>
      ) : (
        <p>Something went wrong. Please try again later.</p>
      )}
    </div>
  );
};

export default VerifyPlanPage;
