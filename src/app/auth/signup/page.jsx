"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button, Image } from "@nextui-org/react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
    imageUrl: "",
    bankAccount: "",
    referrerUrl: "",
    plan: "Free", // Add this line
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [previewImage, setPreviewImage] = useState();

  // Capture the referID from the URL if it exists
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referrerUrl = urlParams.get("ref") ? window.location.href : "";
    console.log(referrerUrl, "Captured referrer URL");

    setUser((prevUser) => ({ ...prevUser, referrerUrl }));
  }, []);

  const onSignup = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/signup", user);
      console.log("Signup success", response.data);
      toast.success("Signup Success");
      router.push("/auth/login");
    } catch (error) {
      console.log("Signup failed", error);
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      user.email.length > 0 &&
      user.password.length > 7 &&
      user.username.length > 3 &&
      user.imageUrl.length > 0
    ) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  const handleUploadComplete = (fileUrl) => {
    setUser({ ...user, imageUrl: fileUrl });
    setPreviewImage(fileUrl);
  };

  const handleInputChange = (e) => {
    setUser({ ...user, bankAccount: e.target.value });
  };

  return (
    <>
      <Navbar />
      <div className='p-6 py-20 flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900'>
        <title>Sign Up</title>
        <div className='w-1/2 max-md:w-full px-6 min-h-[90vh] rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md'>
          <Link href={`/`}>
            <ArrowLeft className='text-3xl top-8 left-6 absolute text-white' />
          </Link>
          <div className='max-sm:w-full py-2 gap-2 flex flex-col'>
            <h1 className='py-4 text-4xl text-center font-bold text-white'>
              Signup
            </h1>

            <label htmlFor='name' className='text-white'>
              Name
            </label>
            <Input
              id='name'
              type='text'
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
              placeholder='name'
              required
              className='bg-white/20 text-white placeholder:text-gray-300'
            />

            <label htmlFor='email' className='text-white'>
              Email
            </label>
            <Input
              id='email'
              type='email'
              required
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder='email'
              className='bg-white/20 text-white placeholder:text-gray-300'
            />

            <label htmlFor='password' className='text-white'>
              Password
            </label>
            <div className='flex w-full relative'>
              <Input
                id='password'
                type={showPass ? "text" : "password"}
                required
                minLength={8}
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                placeholder='password'
                className='bg-white/20 text-white placeholder:text-gray-300'
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className='absolute right-3 top-3 flex items-center justify-center size-4 cursor-pointer text-white'>
                {showPass ? <EyeOff /> : <Eye />}
              </button>
            </div>

            <label htmlFor='bankAccount' className='text-white'>
              JazzCash / EasyPaisa
            </label>
            <Input
              id='bankAccount'
              type='text'
              required
              value={user.bankAccount}
              onChange={handleInputChange}
              placeholder='92300000000'
              maxLength={19}
              className='bg-white/20 text-white placeholder:text-gray-300'
            />

            <label htmlFor='imageUpload' className='text-white'>
              Profile Picture :
            </label>
            {previewImage ? (
              <Image
                src={previewImage}
                alt='Profile preview'
                radius='full'
                className='my-3 rounded-full size-16 mx-auto border-2 p-0.5 border-white/50'
              />
            ) : (
              <UploadButton
                endpoint='imageUploader'
                className='ut-button:bg-purple-600 ut-button:hover:bg-purple-900 ut-button:text-white bg-black/40 border-dashed border rounded-2xl ut-button:rounded-lg'
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
              onClick={onSignup}
              isLoading={loading}
              isDisabled={buttonDisabled}
              className='p-2 border mx-auto w-full bg-black text-white !disabled:cursor-not-allowed !disabled:opacity-50 border-gray-300/50 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 ease-in-out'>
              {loading ? "Processing" : "Signup"}
            </Button>

            <p className='text-gray-300 text-center'>
              Already have an account? Please{" "}
              <Link href='/auth/login' className='text-white underline'>
                login
              </Link>{" "}
              here.
            </p>
          </div>
        </div>
        <div className='w-1/2 max-md:!hidden !flex items-center justify-center'>
          <Image
            isBlurred
            alt='Signup Image'
            src='https://doodleipsum.com/500/flat'
            className='rounded-lg shadow-lg'
          />
        </div>
      </div>
      <SimpleFooter notBanner />
    </>
  );
}
