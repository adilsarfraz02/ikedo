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

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
    imageUrl: "",
    referrerUrl: "",
    bankAccount: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [previewImage, setPreviewImage] = useState();

  // Capture the referral ID from the URL if it exists
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
    let value = e.target.value;

    value = value.replace(/\D/g, "");

    // Optionally, you can format the bank account number
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setUser({ ...user, bankAccount: formattedValue });
  };

  return (
    <div className='min-h-screen p-6 flex items-center justify-center'>
      <title>Sign Up</title>
      <div className='w-1/2 max-sm:w-full bg-zinc-800/50 backdrop-blur-xl px-6 min-h-[90vh] rounded-xl flex items-center justify-center'>
        <Link href={`/`}>
          <ArrowLeft className='text-3xl top-8 left-6 absolute' />
        </Link>
        <div className='max-sm:w-full py-2 gap-2 flex flex-col'>
          <h1 className='py-4 text-4xl text-center font-bold'>Signup</h1>
          <label htmlFor='name'>Name</label>
          <Input
            id='name'
            type='text'
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            placeholder='name'
            required
          />

          <label htmlFor='email'>Email</label>
          <Input
            id='email'
            type='email'
            required
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder='email'
          />

          <label htmlFor='password'>Password</label>
          <div className='flex w-full relative'>
            <Input
              id='password'
              type={showPass ? "text" : "password"}
              required
              minLength={8}
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
              placeholder='password'
            />
            <button
              onClick={() => {
                setShowPass(!showPass);
              }}
              className='absolute right-3 top-3 flex items-center justify-center size-4 cursor-pointer'>
              {showPass ? <EyeOff /> : <Eye />}
            </button>
          </div>
          <label htmlFor='bankAccount'>Bank Account Number</label>

          <Input
            id='bankAccount'
            type='text'
            required
            value={user.bankAccount}
            onChange={handleInputChange}
            placeholder='0000 0000 0000 0000'
            maxLength={19}
          />
          <label htmlFor='imageUpload'>Profile Picture</label>

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
              className='custom-class'
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
            classNames={{
              isDisabled: "cursor-not-allowed",
            }}
            className='p-2 border mx-auto w-full bg-purple-700 disabled:!cursor-not-allowed border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600'>
            {loading ? "Processing" : "Signup"}
          </Button>

          <p className='text-gray-400 text-center'>
            Already have an account? Please{" "}
            <Link href='/auth/login' className='text-gray-100 underline'>
              login
            </Link>{" "}
            here.
          </p>
        </div>
      </div>
      <div className='w-1/2 max-sm:!hidden !flex items-center justify-center'>
        <Image
          isBlurred
          alt='Login Image'
          src='https://doodleipsum.com/500/flat'
        />
      </div>
    </div>
  );
}
