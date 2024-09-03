import React from "react";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingComponent() {
  const plans = [
    {
      name: "Free",
      price: "0",
      period: "forever",
      cashback: "20%",
      color: "bg-gray-100",
      textColor: "text-gray-900",
      buttonColor: "bg-gray-800 hover:bg-gray-700",
      link: "/auth/signup?plan=Free",
    },
    {
      name: "Standard",
      price: "5,000",
      period: "one-time",
      cashback: "40%",
      color: "bg-blue-100",
      textColor: "text-blue-900",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      link: "/auth/signup?plan=Standard",
    },
    {
      name: "Pro",
      price: "10,000",
      period: "one-time",
      cashback: "60%",
      color: "bg-purple-600",
      textColor: "text-white",
      buttonColor: "bg-yellow-600 text-purple-600 hover:bg-purple-800",
      popular: true,
      link: "/auth/signup?plan=Pro",
    },
    {
      name: "Premium",
      price: "20,000",
      period: "one-time",
      cashback: "80%",
      color: "bg-yellow-100",
      textColor: "text-yellow-900",
      buttonColor: "bg-yellow-600 hover:bg-yellow-700",
      link: "/auth/signup?plan=Premium",
    },
  ];

  return (
    <section className='py-20'>
      <div className='container mx-auto px-4'>
        <h2 className='text-5xl font-bold text-center mb-10'>
          Choose Your Plan
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg shadow-lg overflow-hidden ${plan.color} ${
                plan.popular ? "transform scale-105" : ""
              }`}>
              {plan.popular && (
                <div className='bg-yellow-400 text-center py-1 px-4 text-sm font-semibold'>
                  Most Popular
                </div>
              )}
              <div className='p-6'>
                <h3 className={`text-2xl font-bold mb-4 ${plan.textColor}`}>
                  {plan.name}
                </h3>
                <div className={`text-4xl font-bold mb-6 ${plan.textColor}`}>
                  PKR {plan.price}
                  <span className='text-sm font-normal'>/{plan.period}</span>
                </div>
                <ul className='mb-6'>
                  <li className='flex items-center mb-3'>
                    <Check className={`mr-2 h-5 w-5 ${plan.textColor}`} />
                    <span className={`${plan.textColor}`}>
                      {plan.cashback} Cashback on Referral
                    </span>
                  </li>
                </ul>
                <Link href={plan.link} className='text-center'>
                  <p
                    className={`w-full py-2 text-center px-4 rounded-full font-bold text-white ${plan.buttonColor} transition duration-300`}>
                    {plan.name === "Free" ? "Sign Up" : "Choose Plan"}
                  </p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
