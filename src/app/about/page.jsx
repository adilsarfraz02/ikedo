import React from 'react';
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import { Button } from "@nextui-org/react";
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className='pt-20 bg-white text-gray-900 min-h-screen flex flex-col'>
      <title>About Us - Referral</title>
      <Navbar />
      <div className='flex-grow max-w-screen-xl mx-auto px-4 md:px-8 py-12'>
        <div className='max-w-3xl mx-auto space-y-6'>
          <h1 className='text-4xl font-bold text-center mb-8'>About Referral</h1>
          
          <p className='text-lg'>
            Referral is a cutting-edge platform designed to empower individuals and businesses 
            through the power of networking and recommendations. We believe that word-of-mouth 
            is the most effective form of marketing, and we've built a system to harness its potential.
          </p>

          <p className='text-lg'>
            Founded in 2023, our mission is to create a win-win ecosystem where users can earn 
            rewards for their social influence while helping businesses grow organically. We've 
            combined advanced technology with a user-friendly interface to make referrals easy, 
            trackable, and rewarding.
          </p>

          <h2 className='text-2xl font-semibold mt-8'>Our Vision</h2>
          <p className='text-lg'>
            We envision a world where every positive recommendation is recognized and rewarded. 
            By bridging the gap between satisfied customers and potential new ones, we're not just 
            facilitating transactions – we're building communities and fostering trust in the digital age.
          </p>

          <h2 className='text-2xl font-semibold mt-8'>Why Choose Us?</h2>
          <ul className='list-disc list-inside text-lg space-y-2'>
            <li>Transparent and fair reward system</li>
            <li>User-friendly platform with real-time tracking</li>
            <li>Multiple tiers to suit different levels of engagement</li>
            <li>Dedicated support team to assist you every step of the way</li>
            <li>Continuous innovation to stay ahead in the referral marketing space</li>
          </ul>

          <div className='mt-12 text-center'>
            <Button
              as={Link}
              href='/auth/signup'
              className='bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 px-8 py-3 text-lg'
            >
              Join Referral Today
            </Button>
          </div>
        </div>
      </div>
      <SimpleFooter />
    </main>
  );
}
