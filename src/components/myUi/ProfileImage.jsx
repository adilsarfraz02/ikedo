import { Image } from "@nextui-org/react";
import { Eye, X } from "lucide-react";
import { useState } from "react";

export default function ProfileImageModal({ src, alt, size }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='w-fit relative border-2 transition-all rounded-2xl duration-250 group p-1'>
        <Image
          radius='full'
          src={src}
          alt={alt}
          width={size}
          height={size}
          className='border'
        />
        <div className='flex items-center gap-2 justify-center text-center bg-gray-500/30 rounded-xl mt-1 text-sm'>
          <p>Preview</p>
          <Eye className=' block cursor-pointer inset-0 z-20 size-4' />
        </div>
      </button>
      {isOpen && (
        <div className='fixed inset-0 w-full h-screen bg-black bg-opacity-80 px-4 flex items-center justify-center z-50'>
          <div className='relative'>
            <Image
              src={src}
              alt='Full size'
              className='max-h-screen max-w-screen'
            />
            <button
              onClick={() => setIsOpen(false)}
              className='absolute !z-50 top-2 right-2 text-white bg-gradient-to-tr from-black/80 backdrop-blur-lg
               to-zinc-500/80 rounded-full p-2 '>
              <X />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
