"use client";
import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@nextui-org/react";
import Link from "next/link";
import { Logout } from "@/helpers/Logout";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";

const DropdownNav = ({ user }) => {
  return (
    <div className='flex items-center gap-4'>
      <Link
        className='font-normal flex items-center gap-1 hover:underline transition-colors hover:text-yellow-400 focus:text-yellow-400 text-white'
        href='/dashboard'>
        <span>Dashboard</span>
        <FaArrowRight className='-rotate-45' />
      </Link>
      <Dropdown>
        <DropdownTrigger>
          <Avatar
            classNames={{
              base: "border-2 !border-purple-400 focus:ring-2 ring-white",
            }}
            as='button'
            className='transition-transform'
            src={user.image}
            name={user?.username}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label='Profile Actions' variant='flat' className="bg-white/10 backdrop-blur-md text-white">
          <DropdownItem key='profile' className='h-14 gap-2'>
            <p className='font-semibold opacity-60'>Signed in as</p>
            <p className='font-semibold'>{user.email}</p>
          </DropdownItem>
          <DropdownItem key='settings'>
            <Link href='/' className='!w-full'>
              Home
            </Link>
          </DropdownItem>
          <DropdownItem key='settings'>
            <Link href='/auth/profile' className='w-full'>
              Profile
            </Link>
          </DropdownItem>
          {user?.isVerified && (
            <DropdownItem key='settings'>
              <Link href='/dashboard' className='w-full'>
                Dashboard
              </Link>
            </DropdownItem>
          )}

          <DropdownItem key='privacy'>
            <Link href='/privacy' className='w-full'>
              Privacy and Policy
            </Link>
          </DropdownItem>
          <DropdownItem as='button' color='danger'>
            <button className='w-full text-left' onClick={Logout}>
              Log Out
            </button>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default DropdownNav;
