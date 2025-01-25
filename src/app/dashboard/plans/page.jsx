"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Sidebar from "@/components/Sidebar";
import toast, { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export default function AdminPricingPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingPlans, setUpdatingPlans] = useState({});
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch("/api/pricing-plans", {
          cache: "no-store",
        });
        const data = await response.json();
        setPlans(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plans:", error);
        setLoading(false);
        toast.error("Failed to fetch pricing plans");
      }
    }
    fetchPlans();
  }, []);

  const handleUpdate = async (id, updatedPlan) => {
    setUpdatingPlans((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await fetch(`/api/pricing-plans/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPlan),
      });
      if (response.ok) {
        const updatedPlansResponse = await fetch("/api/pricing-plans");
        const updatedPlansData = await updatedPlansResponse.json();
        setPlans(updatedPlansData);
        toast.success("Plan updated successfully");
      } else {
        throw new Error("Failed to update plan");
      }
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    } finally {
      setUpdatingPlans((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <title>Admin: Manage Pricing Plans</title>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            <h1 className="text-3xl font-medium text-gray-700 mb-6">
              Manage Pricing Plans
            </h1>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-[300px] w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans?.map((plan) => (
                  <Card key={plan._id}>
                    <CardHeader>
                      <CardTitle>{plan?.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target);
                          const updatedPlan = Object.fromEntries(
                            formData.entries()
                          );
                          handleUpdate(plan._id, updatedPlan);
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor={`price-${plan._id}`}>Price:</Label>
                          <Input
                            id={`price-${plan._id}`}
                            type="text"
                            name="price"
                            defaultValue={plan.price}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`period-${plan._id}`}>Period:</Label>
                          <Input
                            id={`period-${plan._id}`}
                            type="text"
                            name="period"
                            defaultValue={plan.period}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`cashback-${plan._id}`}>
                            Cashback:
                          </Label>
                          <Input
                            id={`cashback-${plan._id}`}
                            type="text"
                            name="cashback"
                            defaultValue={plan.cashback}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={updatingPlans[plan._id]}
                        >
                          {updatingPlans[plan._id] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            "Update Plan"
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
