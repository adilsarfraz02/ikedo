import { BorderBeam } from "@/components/ui/Borderbeam";
import { FaCoins } from "react-icons/fa";
import { RiHandCoinFill } from "react-icons/ri";

export default function Features() {
  return (
    <>
      <div className='container mx-auto px-4 py-4 flex flex-col gap-12 items-center justify-center lg:px-8  xl:max-w-7xl min-h-screen'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          <div className='rounded-xl relative  bg-white/20 backdrop-blur-2xl p-5 shadow-xl transition group md:p-7 xl:p-10 hover:shadow-md hover:border-purple-500/50 border hover:shadow-purple-600/40 select-none'>
            <FaCoins className='hi-outline hi-rectangle-stack mb-5 inline-block size-12 text-purple-500' />
            <h4 className='mb-2 text-2xl font-extrabold'>Reward Referrals</h4>
            <p className='leading-relaxed text-gray-600 dark:text-gray-400'>
              centivize your customers to refer their friends and colleagues
              with rewards like discounts, gift cards, or exclusive offers.
            </p>
          </div>
          <div className='rounded-xl relative  bg-white/20 backdrop-blur-2xl p-5 shadow-xl transition group md:p-7 xl:p-10 hover:shadow-md hover:border-purple-500/50 border hover:shadow-purple-600/40 select-none'>
            <RiHandCoinFill className='hi-outline hi-rectangle-stack mb-5 inline-block size-12 text-purple-500' />
            <h4 className='mb-2 text-2xl font-extrabold'>Track Referrals</h4>
            <p className='text-muted-foreground'>
              Monitor the performance of your referral program with detailed
              analytics and reporting, so you can optimize your strategy.
            </p>
          </div>
          <div className='rounded-xl relative  bg-white/20 backdrop-blur-2xl p-5 shadow-xl transition group md:p-7 xl:p-10 hover:shadow-md hover:border-purple-500/50 border hover:shadow-purple-600/40 select-none'>
            <svg
              className='hi-outline hi-cog mb-5 inline-block size-12 text-purple-500'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              aria-hidden='true'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495'
              />
            </svg>
            <h4 className='mb-2 text-2xl font-extrabold'>Automate Referrals</h4>
            <p className='text-muted-foreground'>
              Streamline your referral process with automated workflows that
              handle everything from referral tracking to reward fulfillment.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
