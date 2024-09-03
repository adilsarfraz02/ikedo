import React from 'react';
import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import { Button } from "@nextui-org/react";
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      title: "Personal Referrals",
      description: "Earn rewards by referring friends and family to products and services you love.",
      features: [
        "Easy-to-share referral links",
        "Real-time tracking of referrals",
        "Tiered rewards system",
        "Instant notifications"
      ]
    },
    {
      title: "Business Partnerships",
      description: "Grow your business through our network of influential referrers.",
      features: [
        "Access to a wide network of referrers",
        "Customizable referral campaigns",
        "Detailed analytics and reporting",
        "Integration with your existing CRM"
      ]
    },
    {
      title: "Affiliate Program",
      description: "Monetize your online presence by promoting carefully selected products and services.",
      features: [
        "High commission rates",
        "Wide range of products to promote",
        "Performance bonuses",
        "Regular payouts"
      ]
    }
  ];

  return (
    <main className='pt-20 bg-white text-gray-900 min-h-screen flex flex-col'>
      <title>Our Services - Referral</title>
      <Navbar />
      <div className='flex-grow max-w-screen-xl mx-auto px-4 md:px-8 py-12'>
        <h1 className='text-4xl font-bold text-center mb-12'>Our Services</h1>
        
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {services.map((service, index) => (
            <div key={index} className='border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300'>
              <h2 className='text-2xl font-semibold mb-4'>{service.title}</h2>
              <p className='text-gray-600 mb-6'>{service.description}</p>
              <ul className='space-y-2'>
                {service.features.map((feature, fIndex) => (
                  <li key={fIndex} className='flex items-center'>
                    <CheckCircle className='text-green-500 mr-2' size={20} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='mt-16 text-center'>
          <h2 className='text-2xl font-semibold mb-4'>Ready to get started?</h2>
          <Button
            as={Link}
            href='/pricing'
            className='bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300 px-8 py-3 text-lg'
          >
            View Pricing Plans
          </Button>
        </div>
      </div>
      <SimpleFooter />
    </main>
  );
}