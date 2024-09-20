"use client";
import Link from "next/link";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button, Image } from "@nextui-org/react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";

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
      toast.success("Login successful");
      router.push("/auth/profile");
    } catch (error) {
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
      <>
        <Navbar />
        <div className="py-20 px-6 flex items-center justify-center p-6 bg-gradient-to-br from-purple-900 to-indigo-900">
          <title>Login</title>
          <div className="w-1/2 max-md:w-full px-6 min-h-[90vh] rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md">
            <Link href={`/`}>
              <ArrowLeft className="text-3xl top-8 left-6 absolute text-white" />
            </Link>
            <div className="max-sm:w-full py-2 gap-2 flex flex-col">
              <h1 className="py-4 text-4xl text-center font-bold text-white">
                Login
              </h1>

              <label htmlFor="email" className="text-white">
                Email
              </label>
              <Input
                  id="email"
                  type="email"
                  required
                  value={user.email}
                  onChange={(e) =>
                      setUser({ ...user, email: e.target.value.toLowerCase() })
                  }
                  placeholder="email"
                  className="bg-white/20 text-white placeholder:text-gray-300"
              />

              <label htmlFor="password" className="text-white">
                Password
              </label>
              <div className="flex w-full relative">
                <Input
                    id="password"
                    type={showPass ? "text" : "password"}
                    required
                    minLength={8}
                    value={user.password}
                    onChange={(e) => setUser({ ...user, password: e.target.value })}
                    placeholder="password"
                    className="bg-white/20 text-white placeholder:text-gray-300"
                />
                <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 flex items-center justify-center size-4 cursor-pointer text-white"
                >
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <Button
                  onClick={onLogin}
                  isDisabled={buttonDisabled}
                  isLoading={loading}
                  className="w-full bg-black p-2 text-white !disabled:cursor-not-allowed !disabled:opacity-50 border-gray-300/50 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 ease-in-out"
              >
                {loading ? "Processing" : "Login"}
              </Button>

              <p className="text-gray-300 text-center">
                Don&apos;t have an account yet?{" "}
                <Link href="/auth/signup" className="text-white underline">
                  Sign up
                </Link>{" "}
                here.
              </p>
            </div>
          </div>
          <div className="w-1/2 max-md:!hidden !flex items-center justify-center">
            <Image
                isBlurred
                alt="Login Image"
                src="https://doodleipsum.com/500/flat"
                className="rounded-lg shadow-lg"
            />
          </div>
        </div>
        <SimpleFooter notBanner />
      </>
  );
}
