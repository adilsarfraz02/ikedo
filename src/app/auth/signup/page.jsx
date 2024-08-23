"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button, Image } from "@nextui-org/react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/lib/uploadthing";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
    imageUrl: "",
  });
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [previewImage, setPreviewImage] = useState();

  const onSignup = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/signup", user);
      console.log("Signup success", response.data);
      toast.success("Signup Success");
      router.push("/auth/login");
    } catch (error) {
      console.log("Signup failed", error.message);
      toast.error(error.message);
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

  return (
    <div className='min-h-screen px-6 flex items-center justify-center '>
      <div className='w-1/2 max-sm:w-full bg-zinc-800/50 backdrop-blur-xl px-6 min-h-[90vh] rounded-xl flex items-center justify-center'>
        <Link href={`/`}>
          <ArrowLeft className='text-3xl top-8 left-6 absolute' />
        </Link>
        <div className='max-sm:w-full py-2'>
          <h1 className='py-4 text-4xl text-center'>Signup</h1>
          <label htmlFor='name'>Name</label>
          <Input
            className='p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600'
            id='name'
            type='text'
            value={user.username}
            onChange={(e) => setUser({ ...user, username: e.target.value })}
            placeholder='name'
            required
          />

          <label htmlFor='email'>Email</label>
          <Input
            className='p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600'
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
              className='p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600'
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

          <label htmlFor='imageUpload'>Profile Picture</label>

          {previewImage ? (
            <Image
              src={previewImage}
              alt='Profile preview'
              className='my-6 rounded-full size-14'
            />
          ) : (
            <UploadButton
              endpoint='imageUploader'
              multiple={false}
              onClientUploadComplete={(res) => {
                if (res && res.length > 0) {
                  handleUploadComplete(res[0].url); // Make sure you're using `url`
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
            className='p-2 border mx-auto w-full disabled:!cursor-not-allowed border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-gray-600'>
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
      <div className='w-1/2 max-sm:hidden flex items-center justify-center'>
        <Image
          isBlurred
          alt='Login Image'
          src='https://doodleipsum.com/500x500/flat'
        />
      </div>
    </div>
  );
}
