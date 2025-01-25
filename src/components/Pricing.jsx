"use client";

import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import UserSession from "@/lib/UserSession";
import ModalPricing from "../app/pricing/modalPricing";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const renderPlanCard = (plan, index) => (
    <Card
      key={index}
      className={`overflow-hidden ${plan.color} ${
        plan.popular ? "transform scale-105" : ""
      }`}
    >
      {plan.popular && (
        <div className="bg-yellow-400 text-center py-1 px-4 text-sm font-semibold">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className={`text-2xl font-bold ${plan.textColor}`}>
          {plan.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold mb-6 ${plan.textColor}`}>
          PKR {plan.price}
          <span className="text-sm font-normal">/{plan.period}</span>
        </div>
        <ul className="mb-6">
          <li className="flex items-center mb-3">
            <Check className={`mr-2 h-5 w-5 ${plan.textColor}`} />
            <span className={plan.textColor}>
              {plan.cashback} Cashback on Referral
            </span>
          </li>
        </ul>
        {userLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : userError ? (
          <Link href={`/auth/signup?plan=${plan.name}`} passHref>
            <Button
              className={`w-full ${plan.buttonColor} shadow-xl border-white ${plan.name === "Pro" && "!text-white"}`}
            >
              {plan.name === "Free" ? "Sign Up" : "Choose Plan"}
            </Button>
          </Link>
        ) : data?.username ? (
          <ModalPricing
            title={plan.name}
            buttonColor={plan.buttonColor}
            price={plan.price}
            cashback={plan.cashback}
            email={data.email}
          />
        ) : (
          <Link href={`/auth/signup?plan=${plan.name}`} passHref>
            <Button className={`w-full ${plan.buttonColor}`}>
              {data?.username
                ? "Buy Now"
                : plan.name === "Free"
                ? "Sign Up"
                : "Choose Plan"}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );

  const renderSkeletonCard = () => (
    <Card className="overflow-hidden">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-1/2 mb-6" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );

  return (
    <section className="py-20">
      <title>Pricing</title>

      <div className="mx-auto container">
        <h2 className="text-5xl font-bold text-center mb-10">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plansLoading
            ? Array(4)
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
