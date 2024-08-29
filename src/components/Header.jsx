"use client";
import Link from "next/link";
import DropdownNav from "./DropdownNav";
import { Button, Skeleton } from "@nextui-org/react";
import UserSession from "@/lib/UserSession";

export default function Navbar() {
  const { data, error, loading } = UserSession();
  return (
    <header
      id='homeHeader'
      className='fixed top-0 w-full border-b py-4 px-6 flex items-center justify-between !z-50 backdrop-blur-lg'>
      <Link className='flex items-center gap-2' href='/'>
        <span className='text-lg font-semibold'>Referral</span>
      </Link>
      <div className='hidden sm:!block'>
        <nav className='flex items-center gap-4'>
          <Link
            className='font-normal text-white transition-colors hover:text-blue-500 focus:text-blue-500'
            href='/auth/signup'>
            Get Started
          </Link>
          <Link
            className='font-normal transition-colors hover:text-blue-500 focus:text-blue-500'
            href='/dashboard'>
            Dashboard
          </Link>
          <Link
            className='font-normal transition-colors hover:text-blue-500 focus:text-blue-500'
            href='/contact'>
            Contact
          </Link>
        </nav>
      </div>
      {loading ? (
        <div className='gap-2 flex items-center'>
          <Skeleton className='rounded-2xl'>
            <Button color='secondary'> </Button>
          </Skeleton>
          <Skeleton className='rounded-2xl'>
            <Button color='secondary'> </Button>
          </Skeleton>
        </div>
      ) : data?.username ? (
        <DropdownNav user={data} />
      ) : (
        <div className='gap-2 flex items-center'>
          <Button color='secondary'>
            {" "}
            <Link href='/auth/login'>Login</Link>
          </Button>
          <Button className='bg-purple-700'>
            <Link href='/auth/signup'>Signup</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
