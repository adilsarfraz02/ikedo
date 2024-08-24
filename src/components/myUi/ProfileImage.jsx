import { Image } from "@nextui-org/react";
import { Eye, X } from "lucide-react";
import { useState } from "react";

export default function ProfileImageModal({ src, alt, size }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className='w-fit relative transition-all duration-250 group'>
        <Image src={src} alt={alt} width={size} height={size} />
        <Eye className='absolute hidden group-hover:block cursor-pointer inset-0 z-20 bg-black/50 size-full p-3' />
      </button>
      {isOpen && (
        <div className='fixed inset-0 w-full h-full bg-black bg-opacity-80 flex items-center justify-center z-50'>
          <div className='relative'>
            <Image src={src} alt='Full size' className='h-[80vh] w-full' />
            <button
              onClick={() => setIsOpen(false)}
              className='absolute !z-50 top-2 right-2 text-white bg-red-500 rounded-full p-2 '>
              <X />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
