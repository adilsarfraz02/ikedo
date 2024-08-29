import Link from "next/link";

export default function SimpleFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className='px-8 border-t-2 !py-4 md:px-6 flex w-full flex-row flex-wrap items-center justify-between  text-center md:justify-between'>
      <Link href='/' className='font-bold'>
        &copy; Refferal {year}
      </Link>
      <ul className='flex flex-wrap items-center gap-y-2 gap-x-8'>
       
        <li>
          <Link
            href='/privacy'
            color='blue-gray'
            className='font-normal transition-colors hover:text-blue-500 focus:text-blue-500'>
            Privacy Policy
          </Link>
        </li>
        <li>
          <Link
            href='/terms'
            color='blue-gray'
            className='font-normal transition-colors hover:text-blue-500 focus:text-blue-500'>
            Terms and Condition{" "}
          </Link>
        </li>
        <li>
          <Link
            href='/contact'
            color='blue-gray'
            className='font-normal transition-colors hover:text-blue-500 focus:text-blue-500'>
            Contact Us
          </Link>
        </li>
      </ul>
    </footer>
  );
}
