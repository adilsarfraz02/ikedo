import { Button, Image } from "@nextui-org/react";
import Link from "next/link";
import React from "react";

const ImageSec = () => {
  return (
    <section className='py-12 md:py-16 lg:py-24 !z-20'>
      <div className='container px-4 md:px-6'>
        <div className='grid gap-8 md:grid-cols-2'>
          <div className='place-content-center grid relative'>
            <Image
              src='/coins.png'
              alt='Referral Program'
              className='saturate-[1.25] contrast-125 drop-shadow-xl max-md:size-32'
            />
            <div className='absolute w-2/3 top-[20%] left-[20%] h-[85%] bg-yellow-500/50 rounded-full blur-2xl'></div>
          </div>
          <div className='space-y-4 flex flex-col justify-center max-md:text-center'>
            <h2 className='text-5xl  font-bold tracking-tighter md:text-4xl'>
              Boost Your Referral Program
            </h2>
            <p className='text-muted-foreground'>
              Our platform makes it easy to set up and manage a successful
              referral program. With customizable rewards, automated tracking,
              and detailed analytics, you can maximize the impact of your
              referrals. and earn{" "}
              <span className='text-yellow-600 font-bold text-lg underline'>
                50 % Profit on one Refer.
              </span>{" "}
            </p>
            <Link href='/pricing'>
              <Button className='w-fit max-md:w-full'>Learn More</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageSec;
