import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaHome,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { CreditCard } from "lucide-react";
import { Logout } from "@/helpers/Logout";
import UserSession from "@/lib/UserSession";
import { Card, Chip } from "@nextui-org/react";
import DropdownNav from "./DropdownNav";
import { FaCoins } from "react-icons/fa6";
const Sidebar = () => {
  const pathname = usePathname();
  const { data, error, loading } = UserSession();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    { icon: FaHome, text: "Dashboard", href: "/dashboard" },
    { icon: FaUser, text: "Profile", href: "/auth/profile" },
    {
      icon: CreditCard,
      text: "Withdraw",
      href: "/auth/withdraw",
      isDisable: data.isWithdrawAmount > 0 ? true : false,
    },
    // { icon: FaCog, text: "Settings", href: "/settings" },
  ];

  return (
    <div
      className={`
          ${isMobile ? "" : "w-64"}`}>
      <div
        className={`
          ${
            isMobile
              ? "fixed bottom-0 left-0 right-0 h-16 flex-row items-center justify-around "
              : "fixed top-0 left-0 h-full w-64 flex-col"
          }
          flex bg-indigo-800 text-white z-40 ease-in-out shadow-lg
        `}>
        {!isMobile && (
          <div className='p-5 border-b border-indigo-700'>
            <h2 className='text-2xl font-bold'>ikedo Pro</h2>
          </div>
        )}
        <nav
          className={` ${
            isMobile
              ? "flex-1 flex items-center"
              : "flex-1 overflow-y-auto py-4"
          }`}>
          <ul
            className={`${
              isMobile ? "flex justify-around w-full gap-0.5 px-1" : "space-y-2"
              }`}>
            
            {menuItems.map((item, index) => (
              <li key={index} className={isMobile ? "flex-1" : ""}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center p-2 hover:bg-indigo-700 rounded-md
                    ${isMobile ? "flex-col justify-center h-full" : "mx-2"}
                    ${pathname === item.href ? "bg-indigo-700 font-bold" : ""}
                    transition-colors duration-200
                  `}>
                  <item.icon
                    className={isMobile ? "mb-1" : "mr-3"}
                    size={isMobile ? 20 : 18}
                  />
                  <span className={isMobile ? "text-xs" : "text-sm"}>
                    {item.text}
                  </span>
                </Link>
              </li>
            ))}
            <li className={isMobile ? "flex-1" : ""}>
              <Link
                  href="/dashboard/plans"
                  className={`
                    flex items-center p-2 hover:bg-indigo-700 rounded-md
                    ${isMobile ? "flex-col justify-center h-full" : "mx-2"}
                    ${pathname === "/dashboard/plans" ? "bg-indigo-700 font-bold" : ""}
                    transition-colors duration-200
                  `}>
                  <FaCoins
                    className={isMobile ? "mb-1" : "mr-3"}
                    size={isMobile ? 20 : 18}
                  />
                  <span className={isMobile ? "text-xs" : "text-sm"}>
                    Payments
                  </span>
                </Link>
            </li>
            {isMobile && (
              <li className='w-fit flex items-center justify-center p-2  hover:bg-indigo-700 rounded-md'>
                <DropdownNav isMobile={isMobile} user={data} />
              </li>
            )}
          </ul>
        </nav>
        {!isMobile && (
          <>
            <div className='flex justify-between px-4 py-4 bg-black/40'>
              <h1 className='font-bold opacity-80'>Total Payment</h1>
              <Chip variant='flat' color='secondary'>
                {data?.isWithdrawAmount ?? data.isWithdrawAmount} PKR
              </Chip>
            </div>
            <div className='w-full flex items-center justify-center p-2 bg-indigo-500 hover:bg-indigo-700'>
              <DropdownNav isMobile={isMobile} user={data} />
            </div>
          </>
        )}
        {!isMobile && (
          <div className='p-4 border-t border-indigo-700 '>
            <button
              onClick={() => Logout()}
              className='flex items-center justify-center w-full bg-red-500 hover:bg-red-600 rounded-md px-4 py-2 transition-colors duration-200'>
              <FaSignOutAlt className='mr-2' size={16} />
              <span className='text-sm'>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
