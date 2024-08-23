"use client";

import Navbar from "@/components/Header";
import SimpleFooter from "@/components/SimpleFooter";

export default function ContactPage() {
  return (
    <main className='py-12 bg-black text-white min-h-screen'>
      <Navbar />
      <div className='max-w-screen-xl mx-auto px-4 md:px-8 py-12'>
        <div className='max-w-lg mx-auto space-y-3 sm:text-center mt-12'>
          <h3 className='bg-indigo-600 w-fit mx-auto px-2.5 py-1 rounded-full font-semibold'>
            Contact Us
          </h3>
          <p className='text-gray-200 text-3xl font-semibold sm:text-4xl'>
            Get in touch
          </p>
          <p>We’d love to hear from you! Please fill out the form bellow.</p>
        </div>
        <div className='mt-12 max-w-lg mx-auto'>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className='space-y-5'>
            <div className='flex flex-col items-center gap-y-5 gap-x-6 [&>*]:w-full sm:flex-row'>
              <div>
                <label htmlFor='name' className='cursor-pointer font-medium'>
                  First name
                </label>
                <input
                  type='text'
                  name='firstname'
                  id='name'
                  required
                  className='w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg'
                />
              </div>
              <div>
                <label className='font-medium'>Last name</label>
                <input
                  type='text'
                  required
                  className='w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg'
                />
              </div>
            </div>
            <div>
              <label className='font-medium'>Email</label>
              <input
                type='email'
                required
                className='w-full mt-2 px-3 py-2 bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg'
              />
            </div>

            <div>
              <label className='font-medium'>Message</label>
              <textarea
                required
                className='w-full mt-2 px-3 py-2 resize-none appearance-none bg-transparent outline-none border focus:border-indigo-600 shadow-sm rounded-lg'></textarea>
            </div>
            <button className='w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150'>
              Submit
            </button>
          </form>
        </div>
      </div>
      <SimpleFooter />
    </main>
  );
}
