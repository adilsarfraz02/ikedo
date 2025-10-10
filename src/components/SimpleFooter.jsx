import Link from "next/link";
import { Button } from "@nextui-org/react";

export default function SimpleFooter({ notBanner }) {
  const year = new Date().getFullYear();

  const footerLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms and Conditions", href: "/terms" },
  ];

  return (
    <footer className='text-gray-600 p-4'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Pro Banner */}
        {!notBanner && (
          <div className='py-8 text-center text-white bg-purple-900 rounded-lg my-8 shadow-lg'>
            <h3 className='text-3xl font-bold text-white mb-4'>
              Unlock Your Earning Potential
            </h3>
            <p className='mb-6'>
              Discover the benefits of our Pro plan, designed to help you
              maximize your referrals and earnings.
            </p>
            <Button
              as={Link}
              href='/pricing'
              className='bg-white text-black hover:text-white hover:bg-black transition-colors duration-300 px-8 py-3 text-lg font-semibold'>
              Explore Pro Features
            </Button>
          </div>
        )}

        {/* Footer Links */}
        <div className='grid grid-cols-2 md:grid-cols-3 gap-8 py-8'>
          <div>
            <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>
              Company
            </h4>
            <ul className='mt-4 space-y-2'>
              {footerLinks.slice(0, 3).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-base hover:text-purple-600 transition-colors'>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>
              Resources
            </h4>
            <ul className='mt-4 space-y-2'>
              {footerLinks.slice(3, 5).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-base hover:text-purple-600 transition-colors'>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>
              Legal
            </h4>
            <ul className='mt-4 space-y-2'>
              {footerLinks.slice(5).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className='text-base hover:text-purple-600 transition-colors'>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='border-t border-gray-200 py-8 text-center'>
          <p>&copy; {year} Ikedo live. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
