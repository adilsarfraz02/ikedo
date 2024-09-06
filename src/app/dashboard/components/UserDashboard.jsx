"use client";

import React, { useEffect } from "react";
import {
  Snippet,
  Card,
  CardBody,
  Button,
  Image,
  CardHeader,
} from "@nextui-org/react";
import { Copy, Eye, Share } from "lucide-react";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import UserSession from "@/lib/UserSession";
import Link from "next/link";

const UsDashboard = () => {
  const { loading, data, error } = UserSession();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error("Failed to load user data.");
    }
  }, [error]);

  const handleCopyReferralUrl = () => {
    if (data?.ReferralUrl) {
      navigator.clipboard.writeText(data.ReferralUrl);
      toast.success("Referral URL copied to clipboard!");
    }
  };

  const handleShareReferralUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me using my referral link!",
          url: data?.ReferralUrl,
        });
        toast.success("Referral link shared!");
      } catch (error) {
        toast.error("Failed to share referral link.");
      }
    } else {
      toast.error("Sharing not supported in your browser.");
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Join me using my referral link: ${data?.ReferralUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      message,
    )}`;
    window.open(url, "_blank");
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      data?.ReferralUrl,
    )}`;
    window.open(url, "_blank");
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className='p-4 max-w-lg max-md:w-full mx-auto'>
      <Card className='mb-4'>
        <CardHeader>
          <Image
            src={data?.image}
            alt='Profile Image'
            radius='full'
            className='mr-3 border-4 bg-zinc-700'
          />
          <div className='p-2'>
            <h2 className='text-xl font-bold'>{data?.username}</h2>
            <p className='text-gray-600'>{data?.email}</p>
          </div>
        </CardHeader>
        <CardBody>
          <div className='flex justify-between items-center'>
            <div>
              <h3 className='text-lg font-semibold text-gray-400'>
                Referral Count:
              </h3>
              <p className='text-2xl'>{data?.tReferralCount}</p>
            </div>
          </div>
          <div className='flex gap-3 mt-4 justify-center'>
            {/* WhatsApp Share Button */}
            <Button
              onClick={handleWhatsAppShare}
              className='flex items-center gap-2 text-white'
              style={{ backgroundColor: "#25D366" }}>
              <FaWhatsapp size={20} />
              WhatsApp
            </Button>

            {/* Facebook Share Button */}
            <Button
              onClick={handleFacebookShare}
              className='flex items-center gap-2 text-white'
              style={{ backgroundColor: "#1877F2" }}>
              <FaFacebook size={20} />
              Facebook
            </Button>

            {/* Native Share Button */}
            <Button
              onClick={handleShareReferralUrl}
              className='flex items-center gap-2'>
              <Share className='mr-2' />
              Share
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className='text-xl font-bold text-gray-400'>Referrals</h3>
        </CardHeader>
        <CardBody>
          {data?.tReferrals.length > 0 ? (
            data.tReferrals.map((referral, index) => (
              <div
                key={index}
                className='mb-2 flex items-center gap-2 justify-between'>
                <div className='flex items-center gap-2'>
                  <Image
                    width={50}
                    height={50}
                    src={referral.imageUrl}
                    alt='Referral Image'
                  />
                  <div>
                    <p>{referral.username}</p>
                    <p className='text-sm text-gray-600'>{referral.email}</p>
                  </div>
                </div>
                <Link
                  href={`/auth/profile/${referral?._id}`}
                  className='flex items-center gap-2 text-sm text-gray-400 underline'>
                  <Eye className='w-4 h-4' />
                  <p>View Verification</p>
                </Link>
              </div>
            ))
          ) : (
            <p>No referrals yet.</p>
          )}
        </CardBody>
      </Card>

      <Card className='mt-4'>
        <div className='flex justify-between px-4 py-4'>
          <h1 className='font-bold'>Total Payment</h1>
          <h1>{data?.isWithdrawAmount ?? data.isWithdrawAmount}</h1>
        </div>
        {data.isWithdrawAmount > 0 && (
          <Link href='/auth/withdraw' className='w-full'>
            <Button color='primary' className='font-bold w-full'>
              Withdraw Now
            </Button>
          </Link>
        )}
      </Card>
    </div>
  );
};

export default UsDashboard;
