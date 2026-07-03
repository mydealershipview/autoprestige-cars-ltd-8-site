import React from 'react';
// import logo from '@/assets/lorem-icon.png';
import Image from 'next/image';

export default function Icon() {
  // const icon = "https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg"
  const icon = "/logo2.jpg"
  return (
    <div className='w-40 h-40 relative'>
      <Image className="w-40 h-40" fill src={icon} alt="" />
    </div>
  );
}