import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Divider,
  Input,
  Image,
} from "@nextui-org/react";
import { UploadButton } from "@/lib/uploadthing";
import { Select, SelectItem } from "@nextui-org/react";
import toast from "react-hot-toast";
import axios from "axios";

export default function ModalPricing({
  title,
  buttonColor,
  cashback,
  price,
  email,
}) {
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [previewImage, setPreviewImage] = useState();
  const [paymentMethod, setPaymentMethod] = useState("easypaisa");
  const [plan, setPlan] = useState({
    title: title || "",
    cashback: cashback || "",
    price: price || "",
    paymentReceipt: "",
    paymentMethod: paymentMethod,
    email: email, // Setting email correctly
  });

  const handleUploadComplete = (fileUrl) => {
    setPreviewImage(fileUrl);
    setPlan((prevPlan) => ({
      ...prevPlan,
      paymentReceipt: fileUrl,
    })); // Update the plan with the payment receipt
  };

  const handleFormSubmit = async () => {
    if (!plan.paymentReceipt) {
      toast.error("Please upload a payment receipt.");
      return;
    }

    setLoading(true); // Set loading state to true

    // Make an API call to submit the form data
    try {
      const response = await axios.post("/api/verify-payment", {
        paymentReceipt: plan.paymentReceipt,
        title: plan.title,
        cashback: plan.cashback,
        price: plan.price,
        paymentMethod: plan.paymentMethod,
        email: plan.email, // Send email in API request
      });
      console.log("Payment success", response.data);
      toast.success(
        "Payment received. Verification will be completed within 24 hours.",
      );
    } catch (error) {
      console.error("Payment failed", error);
      toast.error(error.response?.data?.error || "Payment submission failed.");
    } finally {
      setLoading(false); // Set loading state to false after completion
    }
  };

  return (
    <>
      {title === "Free" ? (
        <Button
          isDisabled
          className={`w-full py-2 text-center px-4 rounded-full font-bold text-white ${buttonColor} transition duration-300`}>
          Already using
        </Button>
      ) : (
        <>
          <Button
            className={`w-full py-2 text-center px-4 rounded-full font-bold text-white ${buttonColor} transition duration-300`}
            onPress={onOpen}>
            Buy Now
          </Button>

          <Modal
            isOpen={isOpen}
            isDismissable='false'
            placement='center'
            onOpenChange={onOpenChange}
            backdrop='blur'>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className='flex flex-col gap-1'>
                    Buying {title} Plan - {cashback} Cashback
                  </ModalHeader>
                  <Divider />

                  <ModalBody className='py-6'>
                    <p className='opacity-60'>Fill all the blanks</p>
                    <Input label='Price' value={price} disabled />

                    <Select
                      isRequired
                      label='Select Payment Method'
                      value={paymentMethod}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPlan((prevPlan) => ({
                          ...prevPlan,
                          paymentMethod: e.target.value,
                        }));
                      }}>
                      <SelectItem key='easypaisa'>EasyPaisa</SelectItem>
                      <SelectItem key='jazzcash'>JazzCash</SelectItem>
                      <SelectItem key='bank'>Bank Account</SelectItem>
                    </Select>

                    <label htmlFor='imageUpload' className='text-black text-sm'>
                      Payment Receipt:
                    </label>
                    {previewImage ? (
                      <Image
                        src={previewImage}
                        alt='Payment receipt preview'
                        radius='full'
                        className='my-3 rounded-full size-16 mx-auto border-2 p-0.5 border-white/40'
                      />
                    ) : (
                      <UploadButton
                        endpoint='imageUploader'
                        className='ut-button:bg-purple-600 ut-button:hover:bg-purple-900 ut-button:text-white bg-black/5 border-dashed border rounded-2xl ut-button:rounded-lg'
                        multiple={false}
                        onClientUploadComplete={(res) => {
                          if (res && res.length > 0) {
                            handleUploadComplete(res[0].url);
                          }
                        }}
                        onUploadError={(error) => {
                          toast.error(`Upload failed: ${error.message}`);
                        }}
                      />
                    )}
                  </ModalBody>

                  <Divider />
                  <ModalFooter>
                    <Button color='danger' variant='light' onPress={onClose}>
                      Close
                    </Button>
                    <Button
                      color='primary'
                      onPress={handleFormSubmit}
                      isDisabled={loading} // Disable button during loading
                      isLoading={loading} // Show loading spinner on button
                    >
                      Submit Payment
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </>
  );
}
