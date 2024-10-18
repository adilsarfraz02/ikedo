import Link from "next/link";
import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";

export const metadata = {
  title: "Terms and Conditions",
  description:
    "Welcome to Referral System! By accessing and using our website, you agree to comply with and be bound by the following terms and conditions.",
};

const Terms = () => {
  const date = new Date("2024-08-12").toLocaleDateString();
  return (
    <>
      <Navbar />
      <section className="bg-black py-12">
        <div className="flex container mx-auto  flex-col gap-4 p-8 max-md:p-4 text-white">
          <Link href="/" className="px-8 py-4">
            <FaArrowLeft
              size={`24`}
              className="opacity-70 hover:opacity-100 transition-all hover:-translate-x-3 hover:scale-110 cursor-pointer"
            />
          </Link>
          <div className="container mx-auto py-4">
            <h1 className="text-4xl font-extrabold mb-4">
              Terms and Conditions
            </h1>
            <p className="text-gray-400/80 mb-4">Last updated: {date}</p>
            <p className="text-gray-50 mb-4">
              Welcome to Referral System! By accessing and using our website,
              you agree to comply with and be bound by the following terms and
              conditions.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-50 mb-4">
              By accessing and using our website, you accept and agree to be
              bound by these Terms and Conditions. If you do not agree to these
              terms, please do not use our website.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              2. Use of the Website
            </h2>
            <p className="text-gray-50 mb-4">
              You agree to use the website for lawful purposes only. You must
              not use the website in any way that causes, or may cause, damage
              to the website or impairment of the availability or accessibility
              of the website.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              3. User Accounts
            </h2>
            <p className="text-gray-50 mb-4">
              You may need to create an account and log in with your Google
              account to access certain features of our website. You are
              responsible for maintaining the confidentiality of your account
              information and for all activities that occur under your account.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              4. Referral System
            </h2>
            <p className="text-gray-50 mb-4">
              Our website allows users to refer others to join. When you refer
              someone, you agree to provide accurate and truthful information.
              Any abuse or fraudulent activity related to the referral system
              may result in the termination of your account.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              5. Intellectual Property
            </h2>
            <p className="text-gray-50 mb-4">
              All content, trademarks, logos, and intellectual property
              displayed on the website are the property of Referral System or
              its licensors. You may not use, reproduce, or distribute any
              content without our prior written consent.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-50 mb-4">
              Referral System will not be liable for any indirect, incidental,
              special, or consequential damages arising out of or in connection
              with your use of the website.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              7. Governing Law
            </h2>
            <p className="text-gray-50 mb-4">
              These Terms and Conditions are governed by and construed in
              accordance with the laws of US, and you irrevocably submit to the
              exclusive jurisdiction of the courts in that location.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              8. Changes to Terms and Conditions
            </h2>
            <p className="text-gray-50 mb-4">
              We reserve the right to update or modify these Terms and
              Conditions at any time without prior notice. Your continued use of
              the website after any changes indicates your acceptance of the new
              terms.
            </p>
            <h2 className="text-2xl font-semibold mt-6 mb-4">
              9. Contact Information
            </h2>
            <p className="text-gray-50 mb-4">
              If you have any questions or concerns about these Terms and
              Conditions, please contact us at{" "}
              <a href="mailto:ikedopro@gmail.com">ikedopro@gmail.com</a>.
            </p>
          </div>
        </div>
      </section>
      <SimpleFooter />
    </>
  );
};

export default Terms;
