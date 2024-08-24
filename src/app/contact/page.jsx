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
    setLoading(true); // Disable the button during submission

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
        // Clear form fields after successful submission
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
      setLoading(false); // Re-enable the button
    }
  };

  return (
    <main className='pt-12 bg-black text-white min-h-screen'>
      <title>Contact Us</title>
      <Toaster />
      <Navbar />
      <div className='max-w-screen-xl mx-auto px-4 md:px-8 py-12'>
        <div className='max-w-lg mx-auto space-y-3 sm:text-center mt-12'>
          <h3 className='bg-purple-600 w-fit mx-auto px-2.5 py-1 rounded-full font-semibold'>
            Contact Us
          </h3>
          <p className='text-gray-200 text-3xl font-semibold sm:text-4xl'>
            Get in touch
          </p>
          <p>We’d love to hear from you! Please fill out the form below.</p>
        </div>
        <div className='mt-12 max-w-lg mx-auto'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            <div className='flex flex-col items-center gap-y-5 gap-x-6 [&>*]:w-full sm:flex-row'>
              <div>
                <label
                  htmlFor='firstname'
                  className='cursor-pointer font-medium'>
                  First name
                </label>
                <input
                  type='text'
                  name='firstname'
                  id='firstname'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className='w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg'
                />
              </div>
              <div>
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
                  className='w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg'
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
                className='w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg'
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
                className='w-full mt-2 px-3 py-2 resize-none appearance-none bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg'></textarea>
            </div>
            <Button
              type='submit'
              disabled={loading}
              className='w-full px-4 py-2 text-white font-medium bg-purple-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150'>
              {loading ? "Sending..." : "Submit"}{" "}
            </Button>
          </form>
        </div>
      </div>
      <SimpleFooter />
    </main>
  );
}
