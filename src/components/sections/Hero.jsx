"use client";
import React from "react";
import { BorderBeam } from "@/components/ui/Borderbeam";
import { FaArrowRight } from "react-icons/fa6";
import Features from "./FeaturesSec";
import ImageSec from "./ImageSec";
import { motion } from "framer-motion";
import { Button } from "@nextui-org/react";
export default function HeroSection() {
  return (
    <div className='flex flex-col'>
      <main className='flex-1'>
        <section className=' bg-gradient-to-br h-screen from-black to-zinc-900 flex flex-col items-center justify-center text-center '>
          <div className='container px-4 md:px-6 pt-14'>
            <h1 className='text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl'>
              Grow Your Business with Referrals
            </h1>
            <p className='max-w-[700px] mx-auto mt-4 text-lg md:text-xl px-8'>
              Our referral program makes it easy to reward your customers for
              spreading the word about your products or services.
            </p>
            <div className='mt-8'>
              <Button className='flex mx-auto group items-center gap-3 bg-zinc-500/10 relative  justify-center whitespace-nowrap text-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-zinc-500/20 py-3 rounded-full px-6'>
                <span>Sign Up Now</span>{" "}
                <FaArrowRight className='mt-1 group-hover:ml-2.5 group-hover:-rotate-45 transition-all duration-300' />
              </Button>
            </div>
          </div>
        </section>
        <Features />
        <ImageSec />
      </main>
    </div>
  );
}
