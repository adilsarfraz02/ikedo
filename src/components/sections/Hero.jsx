"use client";
import React from "react";
import { FaArrowRight } from "react-icons/fa6";
import Features from "./FeaturesSec";
import ImageSec from "./ImageSec";

import Link from "next/link";
export default function HeroSection() {
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
              <Link
                href={`/signup`}
                className='flex w-fit mx-auto group items-center gap-3 bg-white text-black hover:shadow-white/20 shadow-2xl hover:text-white hover:bg-zinc-500/10 relative  justify-center whitespace-nowrap text-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-zinc-500/20 py-3 rounded-full px-5'>
                <span>Sign Up Now</span>{" "}
                <FaArrowRight className='mt-1 group-hover:ml-2.5 group-hover:-rotate-45 transition-all duration-300' />
              </Link>
            </div>
          </div>
        </section>
        <Features />
        <ImageSec />
      </main>
    </div>
  );
}
