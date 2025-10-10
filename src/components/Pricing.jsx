"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import UserSession from "@/lib/UserSession";
import ModalPricing from "../app/pricing/modalPricing";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PricingComponent() {
  const { data, loading: userLoading, error: userError } = UserSession();
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch("/api/pricing-plans", {
          cache: "no-cache",
        });
        const data = await response.json();
        setPlans(data);
        setPlansLoading(false);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setPlansLoading(false);
      }
    }
    fetchPlans();
  }, []);

  // Calculate dynamic values based on investment amount
  const calculatePlanDetails = (plan) => {
    let dailyReturn, commission, planLife;
    
    // All plans have 12% commission and 15-day plan life as per your notes
    commission = 12;
    planLife = 6;
    
    switch (plan.name.toLowerCase()) {
      case 'plan 1':
        dailyReturn = 40;
        break;
      case 'plan 2':
        dailyReturn = 80;
        break;
      case 'plan 3':
        dailyReturn = 180;
        break;
      case 'plan 4':
        dailyReturn = 400;
        break;
      case 'plan 5':
        dailyReturn = 800;
        break;
      case 'plan 6':
        dailyReturn = 1200;
        break;
      case 'plan 7':
        dailyReturn = 1800;
        break;
      case 'plan 8':
        dailyReturn = 3200;
        break;
      default:
        dailyReturn = 40;
    }
    
    return { dailyReturn, commission, planLife };
  };

  const renderPlanCard = (plan, index) => {
    const { dailyReturn, commission, planLife } = calculatePlanDetails(plan);
    
    return (
      <div
        key={index}
        className="relative bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white shadow-xl transform transition-transform hover:scale-105"
      >
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
          
          <div className="text-5xl font-bold mb-8">
            {plan.price} <span className="text-lg font-normal">Rs</span>
          </div>
          
          <div className="space-y-6 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-lg">Daily Return</span>
              <span className="text-lg font-semibold">{dailyReturn} pkr</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-lg">Commission</span>
              <span className="text-lg font-semibold">{commission}%</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-lg">Plan Life</span>
              <span className="text-lg font-semibold">{planLife} Months</span>
            </div>
          </div>
          
          {userLoading ? (
            <Skeleton className="h-12 w-full rounded-full" />
          ) : userError ? (
            <Link href={`/auth/signup?plan=${plan.name}`} passHref>
              <Button
                className="w-full bg-white text-blue-600 hover:bg-gray-100 rounded-full py-3 text-lg font-semibold flex items-center justify-center gap-2"
              >
                Invest Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : data?.username ? (
            <div>
              <ModalPricing
                title={plan.name}
                buttonColor="bg-white text-blue-600 hover:bg-gray-100"
                price={plan.price}
                cashback={plan.cashback}
                email={data.email}
                customButton={
                  <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 rounded-full py-3 text-lg font-semibold flex items-center justify-center gap-2">
                    Invest Now <ArrowRight className="w-5 h-5" />
                  </Button>
                }
              />
            </div>
          ) : (
            <Link href={`/auth/signup?plan=${plan.name}`} passHref>
              <Button className="w-full bg-white text-blue-600 hover:bg-gray-100 rounded-full py-3 text-lg font-semibold flex items-center justify-center gap-2">
                Invest Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    );
  };

  const renderSkeletonCard = () => (
    <div className="relative bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl p-6 animate-pulse">
      <div className="text-center">
        <Skeleton className="h-8 w-3/4 mx-auto mb-4 bg-gray-200" />
        <Skeleton className="h-12 w-1/2 mx-auto mb-8 bg-gray-200" />
        <div className="space-y-6 mb-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3 bg-gray-200" />
            <Skeleton className="h-6 w-1/4 bg-gray-200" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3 bg-gray-200" />
            <Skeleton className="h-6 w-1/4 bg-gray-200" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3 bg-gray-200" />
            <Skeleton className="h-6 w-1/4 bg-gray-200" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-full bg-gray-200" />
      </div>
    </div>
  );

  return (
    <section className="py-20 bg-gray-50 min-h-screen">
      <title>Pricing</title>

      <div className="mx-auto container px-4">
        <h2 className="text-5xl font-bold text-center mb-16 text-gray-800">
          Choose Your Investment Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plansLoading
            ? Array(8)
                .fill()
                .map((_, index) => (
                  <React.Fragment key={index}>
                    {renderSkeletonCard()}
                  </React.Fragment>
                ))
            : plans.map((plan, index) => renderPlanCard(plan, index))}
        </div>
        
       
      </div>
    </section>
  );
}
