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

const DropdownNav = ({ user }) => {
  return (
    <div>
      <Dropdown>
        <DropdownTrigger>
          <Avatar
            classNames={{
              base: "border-2 !border-zinc-700 focus:ring-2 ring-white",
            }}
            as='button'
            className='transition-transform'
            src={user.image}
            name={user?.username}
          />
        </DropdownTrigger>
        <DropdownMenu aria-label='Profile Actions' variant='flat'>
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
