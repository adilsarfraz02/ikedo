"use client";
import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import Features from "./FeaturesSec";
import ImageSec from "./ImageSec";
import UserSession from "@/lib/UserSession";
import Link from "next/link";
import { Image, Skeleton } from "@nextui-org/react";
import TimeLineSec from "./TimeLineSec";

export default function HeroSection() {
  const { data: session, loading } = UserSession();

  const data = [
    {
      title: "Sign Up or Login",
      content: (
        <div>
          <p className='text-neutral-800 dark:text-neutral-200 text-xs md:text-sm font-normal mb-8'>
            if you have an account then Log in or if not then sign up and the
            login
          </p>
          <div className='grid grid-cols-2 gap-4'>
            <Image
              src='/login.png'
              alt='startup template'
              width={500}
              height={500}
              className='rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
            <Image
              src='/signup.png'
              alt='startup template'
              width={500}
              height={500}
              className='rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
          </div>
        </div>
      ),
    },
    {
      title: "Profile and Verification",
      content: (
        <div>
          <p className='text-neutral-200 text-xs md:text-sm font-normal mb-8'>
            For a account Verification you have to need to 20k to pay user and
            Our Team view your profile and verified you
          </p>
          <div className='grid grid-cols-2 gap-4'>
            <Image
              src='/profile.png'
              alt='hero template'
              width={500}
              height={500}
              className='rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
            <Image
              src='/acc_verify.png'
              alt='feature template'
              width={500}
              height={500}
              className='rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
            <Image
              src='https://www.thunes.com/wp-content/uploads/2023/07/feature_img_7.png'
              alt='feature template'
              width={500}
              height={500}
              className='rounded-lg object-contain h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
          </div>
        </div>
      ),
    },
    {
      title: "Dashboard and Referral System",
      content: (
        <div>
          <div className='mb-8'>
            <div className='flex gap-2 items-center text-neutral-300 text-xs md:text-sm'>
              ✅ After verification you recieve a mail from team
            </div>
            <div className='flex gap-2 items-center text-neutral-300 text-xs md:text-sm'>
              ✅ Email about verification of Your account
            </div>
            <div className='flex gap-2 items-center text-neutral-300 text-xs md:text-sm'>
              ✅ With In 24 Hour's
            </div>
          </div>
          <p className='text-neutral-200 text-xs md:text-sm font-normal mb-4'>
            Let's Go After That You can Referral You can refer Some and Earn 50%
            (10k on One Refer)
          </p>
          <div className='grid grid-cols-2 gap-4'>
            <Image
              src='/verified_acc.png'
              alt='feature template'
              width={500}
              height={500}
              className='rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
            <Image
              src='/user_Dashboard.png'
              alt='bento template'
              width={500}
              height={500}
              className='rounded-lg object-contain h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
            <Image
              src='/referral.png'
              alt='cards template'
              width={500}
              height={500}
              className='rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
          </div>
        </div>
      ),
    },
    {
      title: " WithDraw and Earn",
      content: (
        <div>
          <p>it's time to earn money by referral system 🚀</p>
          <div className='grid grid-cols-2 gap-4 mt-4'>
            <Image
              src='/withdraw.png'
              alt='feature template'
              width={500}
              height={500}
              className='rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
            <Image
              src='/user_Dashboard.png'
              alt='bento template'
              width={500}
              height={500}
              className='rounded-lg object-contain h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
            <Image
              src='/referral.png'
              alt='cards template'
              width={500}
              height={500}
              className='rounded-lg object-cover h-20 md:h-44 lg:h-60 w-full shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]'
            />
          </div>
        </div>
      ),
    },
  ];
  return (
    <div className='flex flex-col'>
      <title>Home</title>
      <main className='flex-1'>
        <section className=' bg-gradient-to-br h-screen from-black to-zinc-900 flex flex-col items-center justify-center text-center '>
          <div className='container px-4 md:px-6 pt-14'>
            <h1 className='text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl'>
              Grow Your Business with Referrals
            </h1>
            <p className='max-w-[700px] text-zinc-500 mx-auto mt-4 text-lg md:text-xl px-8'>
              Our referral program makes it easy to reward your customers for
              spreading the services. {/* first PAY 20k */}
              <span className='font-bold !text-zinc-50'>
                first payment for create an account is required 20K during{" "}
              </span>
              Creating account here
            </p>
            <div className='mt-8'>
              {loading ? (
                <Skeleton className='w-full h-10 rounded-full' />
              ) : session?.username ? (
                <Link
                  href={`/dashboard`}
                  className='flex w-fit mx-auto group items-center gap-3 bg-white text-black hover:shadow-white/20 shadow-2xl hover:text-white hover:bg-zinc-500/10 relative  justify-center whitespace-nowrap text-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-zinc-500/20 py-3 rounded-full px-5'>
                  <span>Dashboard</span>{" "}
                  <FaArrowRight className='mt-1 group-hover:ml-2.5 group-hover:-rotate-45 transition-all duration-300' />
                </Link>
              ) : (
                <Link
                  href={`/auth/signup`}
                  className='flex w-fit mx-auto group items-center gap-3 bg-white text-black hover:shadow-white/20 shadow-2xl hover:text-white hover:bg-zinc-500/10 relative  justify-center whitespace-nowrap text-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-zinc-500/20 py-3 rounded-full px-5'>
                  <span>Sign Up Now</span>{" "}
                  <FaArrowRight className='mt-1 group-hover:ml-2.5 group-hover:-rotate-45 transition-all duration-300' />
                </Link>
              )}
            </div>
          </div>
        </section>
        <Features />
        <TimeLineSec data={data} />
        <ImageSec />
      </main>
    </div>
  );
}
