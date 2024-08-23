import Link from 'next/link';
import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const Privacy = () => {
    const date = new Date('2024-08-12').toLocaleDateString();

  return (
   <section className="bg-black">
      <div className="flex container mx-auto  flex-col gap-4 p-8 max-md:p-4  text-white">
          <Link href="/" className="px-8 py-4">
              <FaArrowLeft size={`24`} className="opacity-70 hover:opacity-100 transition-all hover:-translate-x-3 hover:scale-110 cursor-pointer" />
        </Link>
      <div className="container mx-auto py-4">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-gray-400/80 mb-4">Last updated: {date}</p>
        <p className="text-gray-400/80 mb-4">
          This Privacy Policy describes how Referral System collects, uses, and discloses your personal information when you visit and use our website (https://refferal.vercel.app/).
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
        <p className="text-gray-400/80 mb-4">
          <strong>Personal Information:</strong> When you create an account or log in using your Google account, we collect your name, email address, and any other information you provide.
        </p>
        <p className="text-gray-400/80 mb-4">
          <strong>Usage Data:</strong> We collect information about how you use our website, including your IP address, browser type, and the pages you visit.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">2. Use of Information</h2>
        <p className="text-gray-400/80 mb-4">
          We use the information we collect to:
          <ul className="list-disc ml-6">
            <li>Provide and improve our services.</li>
            <li>Manage user accounts and authenticate users.</li>
            <li>Communicate with you about updates, promotions, and other information.</li>
          </ul>
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">3. Sharing of Information</h2>
        <p className="text-gray-400/80 mb-4">
          We do not share your personal information with third parties except:
          <ul className="list-disc ml-6">
            <li>With your consent.</li>
            <li>To comply with legal obligations.</li>
            <li>To protect and defend our rights and property.</li>
          </ul>
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">4. Data Security</h2>
        <p className="text-gray-400/80 mb-4">
          We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure. However, no internet transmission is completely secure, and we cannot guarantee the security of your information.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">5. Your Rights</h2>
        <p className="text-gray-400/80 mb-4">
          You have the right to access, correct, or delete your personal information. You can also object to the processing of your personal information and request data portability. To exercise these rights, please contact us at [Your Contact Information].
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">6. Changes to Privacy Policy</h2>
        <p className="text-gray-400/80 mb-4">
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our website. Your continued use of the website after any changes indicates your acceptance of the new policy.
        </p>
        <h2 className="text-2xl font-semibold mt-6 mb-4">7. Contact Information</h2>
        <p className="text-gray-400/80 mb-4">
          If you have any questions or concerns about this Privacy Policy, please contact us at <a href="">adilsarfr00@gmail.com</a>.
        </p>
      </div>
      </div>
    </section>
  );
};

export default Privacy;
