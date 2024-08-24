"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button, Image, Skeleton } from "@nextui-org/react";
import { ArrowLeft } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import UserSession from "@/lib/UserSession";

export default function VerifyPage() {
  const { data, error, loading: sessionLoading } = UserSession();
  const router = useRouter();
  const [user, setUser] = useState({
    paymentReceipt: "",
    email: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [previewImage, setPreviewImage] = useState();

  useEffect(() => {
    if (data) {
      setUser({
        paymentReceipt: user.paymentReceipt,
        email: data.email || "",
        username: data.username || "",
      });
    }
  }, [data]);

  const onVerify = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/verify", user);
      console.log("Verification submitted", response.data);
      toast.success("Verification request submitted!");
      router.push("/dashboard");
    } catch (error) {
      console.log("Verification submission failed", error.message);
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (fileUrl) => {
    setUser({ ...user, paymentReceipt: fileUrl });
    setPreviewImage(fileUrl);
    setButtonDisabled(false);
  };

  if (sessionLoading) {
    return (
      <Skeleton>
        <div className='min-h-screen px-6 flex items-center justify-center'>
          <div className='w-1/2 max-sm:w-full bg-zinc-800/50 backdrop-blur-xl px-6 min-h-[90vh] rounded-xl flex flex-col items-center justify-center'></div>
        </div>
      </Skeleton>
    );
  }
  return (
    <div className='min-h-screen px-6 flex items-center justify-center'>
      <title>Verify</title>
      {data?.paymentStatus === "Processing" ? (
        <div className='w-1/2 max-sm:w-full bg-zinc-800/50 backdrop-blur-xl px-6 min-h-[90vh] rounded-xl flex flex-col items-center justify-center'>
          <Link
            href={`/`}
            className=' top-8 left-6 absolute flex items-center gap-2 transition-all hover:opacity-70'>
            <ArrowLeft className='text-3xl' /> <span>Home</span>
          </Link>
          <p className='text-3xl text-primary-400 leading-loose text-center px-20 font-extrabold'>
            Your Account is Processing approved in 48hrs
          </p>
          <p className='text-gray-400 text-center  absolute bottom-6'>
            Go back to{" "}
            <Link href='/auth/profile' className='text-gray-100 underline'>
              Profile
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className='w-1/2 max-sm:w-full bg-zinc-800/50 backdrop-blur-xl px-6 min-h-[90vh] rounded-xl flex items-center justify-center'>
          <Link
            href={`/`}
            className=' top-8 left-6 absolute flex items-center gap-2 transition-all hover:opacity-70'>
            <ArrowLeft className='text-3xl' /> <span>Home</span>
          </Link>
          <div className='max-sm:w-full py-2'>
            <h1 className='py-4 text-4xl text-center font-bold'>
              Verify Your Account
            </h1>

            <label htmlFor='receiptUpload'>Upload Payment Receipt</label>

            {previewImage ? (
              <div className='w-full mx-auto px-6 h-full'>
                <Image
                  src={previewImage}
                  alt='Receipt preview'
                  radius='md'
                  width={`44`}
                  height={`72`}
                  className='my-3 mx-auto w-full h-72 shadow-lg shadow-slate-100/10  border-2 p-0.5 border-white/20'
                />
              </div>
            ) : (
              <UploadButton
                endpoint='imageUploader'
                className='custom-class my-3 border-dashed border-2 p-2 rounded-xl bg-black/50'
                multiple={false}
                onClientUploadComplete={(res) => {
                  if (res && res.length > 0) {
                    handleUploadComplete(res[0].url);
                  }
                }}
                onUploadError={(error) => {
                  toast.error(`Upload failed: ${error.message}`);
                }}
              />
            )}

            <Button
              onClick={onVerify}
              isLoading={loading}
              isDisabled={buttonDisabled}
              classNames={{
                isDisabled: "cursor-not-allowed",
              }}
              className='p-2 border mx-auto w-full bg-purple-700 disabled:!cursor-not-allowed border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600'>
              {loading ? "Processing" : "Submit Verification"}
            </Button>

            <p className='text-gray-400 text-center'>
              Go back to{" "}
              <Link href='/auth/profile' className='text-gray-100 underline'>
                Profile
              </Link>
              .
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
