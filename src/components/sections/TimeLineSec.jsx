"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Footprints } from "lucide-react";
export default function TimeLineSec({ data }) {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className='w-full bg-black relative font-sans md:px-10'
      ref={containerRef}>
      <div className='max-w-7xl mx-auto py-20 !pb-0 px-4 md:px-8 lg:px-10'>
        <h2 className='text-2xl md:text-5xl text-yellow-600 mb-4 font-bold max-w-4xl'>
          <Footprints /> Steps to Become a Referral
        </h2>
        <p className='text-white text-xl md:text-base max-w-sm'>
          These are steps to become a referral to earn money
        </p>
      </div>
      <div ref={ref} className='relative max-w-7xl mx-auto pb-20'>
        {data.map((item, index) => (
          <div
            key={index}
            className='flex justify-start pt-10 md:pt-40 md:gap-10'>
            <div className='sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full'>
              <div className='h-10 absolute left-3 md:left-3 w-10 rounded-full bg-zinc-500/50 backdrop-blur-lg flex items-center justify-center'>
                <div className='h-4 w-4 rounded-full bg-yellow-500 border border-yellow-700 p-2' />
              </div>
              <h3 className='hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-yellow-600 '>
                {item.title}
              </h3>
            </div>

            <div className='relative pl-20 pr-4 md:pl-4 w-full'>
              <h3 className='md:hidden block text-2xl mb-4 text-left font-bold text-yellow-500'>
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className='absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] '>
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className='absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-yellow-500 via-yellow-900 to-transparent from-[0%] via-[10%] rounded-full'
          />
        </div>
      </div>
    </div>
  );
}
