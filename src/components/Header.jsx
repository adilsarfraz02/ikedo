"use client";
import Link from "next/link";
import DropdownNav from "./DropdownNav";
import { Button, Skeleton } from "@nextui-org/react";
import UserSession from "@/lib/UserSession";
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data, error, loading } = UserSession();
  const pathname = usePathname();

  const NavLink = ({ href, children }) => {
    const isActive = pathname === href;
    return (
      <Link
        className={`font-normal transition-colors hover:text-purple-600 focus:text-purple-600 ${
          isActive ? 'text-purple-600' : 'text-gray-700'
        }`}
        href={href}
      >
        {children}
      </Link>
    );
  };

  return (
    <header
      id='homeHeader'
      className='fixed top-0 w-full border-b border-gray-200 py-4 px-6 flex bg-white items-center justify-between !z-50 shadow-sm'>
      <Link className='flex items-center gap-2' href='/'>
        <span className='text-lg font-semibold text-gray-900'>Ikedo live</span>
      </Link>
      <div className='hidden sm:!block'>
        <nav className='flex items-center gap-6'>
          <NavLink href='/auth/signup'>Get Started</NavLink>
          <NavLink href='/pricing'>Pricing</NavLink>
          <NavLink href='/contact'>Contact</NavLink>
        </nav>
      </div>
      {loading ? (
        <div className='gap-2 flex items-center'>
          <Skeleton className='rounded-lg w-24 h-10'>
            <Button color='secondary'> </Button>
          </Skeleton>
          <Skeleton className='rounded-lg w-24 h-10'>
            <Button color='secondary'> </Button>
          </Skeleton>
        </div>
      ) : data?.username ? (
        <DropdownNav user={data} />
      ) : (
        <div className='gap-2 flex items-center'>
          <Button
            as={Link}
            href='/auth/login'
            className='bg-transparent border border-purple-600 text-purple-600 hover:bg-purple-100 transition-colors duration-300'>
            Login
          </Button>
          <Button
            as={Link}
            href='/auth/signup'
            className='bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-300'>
            Signup
          </Button>
        </div>
      )}
    </header>
  );
}
