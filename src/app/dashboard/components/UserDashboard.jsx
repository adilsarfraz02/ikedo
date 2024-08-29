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
import { Copy, Eye } from "lucide-react";
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
          <Snippet
            copyable
            onClick={handleCopyReferralUrl}
            className='mb-4 overflow-hidden'>
            {data?.ReferralUrl}
          </Snippet>
          <div className='flex justify-between items-center'>
            <div>
              <h3 className='text-lg font-semibold text-gray-400'>Referral Count:</h3>
              <p className='text-2xl'>{data?.tReferralCount}</p>
            </div>
            <Button
              onClick={handleCopyReferralUrl}
              className='flex items-center'>
              <Copy className='mr-2' />
              Copy Referral URL
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
              <div key={index} className='mb-2 flex items-center gap-2 justify-between'>
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
                <Link href={`/auth/profile/${referral?._id}`} className='flex items-center gap-2 text-sm text-gray-400 underline'>
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
    </div>
  );
};

export default UsDashboard;
