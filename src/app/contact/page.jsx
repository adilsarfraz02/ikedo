"use client";

import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";
import { Button } from "@nextui-org/react";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject: `Message from ${firstName} ${lastName}`,
          text: message,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Email sent successfully!");
        setFirstName("");
        setLastName("");
        setEmail("");
        setMessage("");
      } else {
        toast.error(`Error: ${data.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='pt-20 bg-white text-gray-900 min-h-screen flex flex-col'>
      <title>Contact Us</title>
      <Toaster />
      <Navbar />
      <div className='flex-grow max-w-screen-xl mx-auto px-4 md:px-8 py-12'>
        <div className='max-w-lg mx-auto space-y-3 sm:text-center'>
          <h3 className='bg-purple-600 w-fit mx-auto px-4 py-1 rounded-full text-white font-semibold'>
            Contact Us
          </h3>
          <p className='text-gray-800 text-3xl font-semibold sm:text-4xl'>
            Get in touch
          </p>
          <p className='text-gray-600'>We'd love to hear from you! Please fill out the form below.</p>
        </div>
        <div className='mt-12 max-w-lg mx-auto'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <label htmlFor='firstname' className='font-medium'>
                  First name
                </label>
                <input
                  type='text'
                  name='firstname'
                  id='firstname'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className='w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-purple-600 shadow-sm rounded-lg'
                />
              </div>
              <div className='flex-1'>
                <label htmlFor='lastname' className='font-medium'>
                  Last name
                </label>
                <input
                  type='text'
                  name='lastname'
                  id='lastname'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className='w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-purple-600 shadow-sm rounded-lg'
                />
              </div>
            </div>
            <div>
              <label htmlFor='email' className='font-medium'>
                Email
              </label>
              <input
                type='email'
                name='email'
                id='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='w-full mt-2 px-3 py-2 text-gray-500 bg-transparent outline-none border focus:border-purple-600 shadow-sm rounded-lg'
              />
            </div>
            <div>
              <label htmlFor='message' className='font-medium'>
                Message
              </label>
              <textarea
                name='message'
                id='message'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className='w-full mt-2 h-36 px-3 py-2 resize-none appearance-none bg-transparent outline-none border focus:border-purple-600 shadow-sm rounded-lg'
              ></textarea>
            </div>
            <Button
              type='submit'
              disabled={loading}
              className='w-full px-4 py-2 text-white font-medium bg-purple-600 hover:bg-purple-500 active:bg-purple-600 rounded-lg duration-150'
            >
              {loading ? "Sending..." : "Submit"}
            </Button>
          </form>
        </div>
      </div>
      <SimpleFooter />
    </main>
  );
}
