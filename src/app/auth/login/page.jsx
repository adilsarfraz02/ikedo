"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button, Image } from "@nextui-org/react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = React.useState({
    email: "",
    password: "",
  });
  const [buttonDisabled, setButtonDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showPass, setShowPass] = React.useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", user);
      console.log("Login success", response.data);
      toast.success("Login success");
      router.push("/auth/profile");
    } catch (error) {
      console.log("Login failed", error.response.data.error);
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.email.length > 0 && user.password.length > 7) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  }, [user]);

  return (
    <div className='min-h-screen px-6 flex items-center justify-center p-6'>
      <title>Login</title>
      <div className='w-1/2 max-md:w-full bg-zinc-800/50 backdrop-blur-xl px-6 min-h-[90vh] rounded-xl flex items-center justify-center'>
        <Link href={`/`}>
          <ArrowLeft className='text-3xl top-8 left-6 absolute' />
        </Link>
        <div className='max-sm:w-full py-2'>
          {" "}
          <h1 className='py-4 pb-10 text-4xl text-center font-bold'>Login</h1>
          <label htmlFor='email'>Email</label>
          <Input
            className='p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-purple-600 '
            id='email'
            type='text'
            required
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            placeholder='email'
          />
          <label htmlFor='password'>Password</label>
          <div className='flex w-full relative'>
            <Input
              className='p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-purple-600 '
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
          <Button
            onClick={onLogin}
            isLoading={loading}
            isDisabled={buttonDisabled}
            className='p-2 border mx-auto w-full bg-purple-700 !disabled:cursor-none border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-purple-600'>
            {loading ? "Processing" : "Login"}
          </Button>
          <p className='text-gray-400 text-center'>
            Don't have account! Please{" "}
            <Link href='/auth/signup' className='text-gray-100 underline'>
              Signup
            </Link>{" "}
            Here
          </p>{" "}
        </div>
      </div>
      <div className='w-1/2 max-md:!hidden !flex items-center justify-center'>
        <Image
          isBlurred
          alt='Login Image'
          src='https://doodleipsum.com/500x500/flat'
        />
      </div>
    </div>
  );
}
