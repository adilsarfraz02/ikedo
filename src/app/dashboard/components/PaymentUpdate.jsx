"use client";
import React, { useState } from "react";
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PaymentNumberUpdate() {
    const [paymentMethod, setPaymentMethod] = useState("easypaisa");
    const [paymentNumber, setPaymentNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePaymentUpdate = async () => {
        if (!paymentNumber) {
            toast.error("Please enter the payment number.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("/api/admin/payment", {
                paymentMethod,
                paymentNumber,
            });
            toast.success("Payment method and number updated successfully.");
            console.log(response.data);
        } catch (error) {
            console.error("Update failed", error);
            toast.error(error.response?.data?.error || "Update failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-lg font-bold mb-4">Update Payment Information</h2>

            <Select
                isRequired
                label="Select Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}>
                <SelectItem key="easypasia">EasyPaisa</SelectItem>
                <SelectItem key="jazzcash">JazzCash</SelectItem>
                <SelectItem key="bank">Bank Account</SelectItem>
            </Select>

            <Input
                className="mt-4"
                label={`Enter ${
                    paymentMethod === "bank" ? "Bank Account Number" : "Payment Number"
                }`}
                placeholder={
                    paymentMethod === "bank"
                        ? "Enter your bank account number"
                        : "Enter your payment number"
                }
                value={paymentNumber}
                onChange={(e) => setPaymentNumber(e.target.value)}
            />

            <Button
                className="mt-4 w-full"
                color="primary"
                isLoading={loading}
                isDisabled={loading}
                onPress={handlePaymentUpdate}>
                Update Payment Info
            </Button>
        </div>
    );
}
