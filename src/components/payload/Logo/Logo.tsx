import React from 'react';
// import logo from '@/assets/lorem-logo.png'; // Make sure you have your correct images referenced here
// import logoDark from '@/assets/lorem-logo-dark.png';  // Make sure you have your correct images referenced here
import Image from 'next/image';

export default function Logo() {
  // const logo = "https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-light.svg"
  // const logoDark = "https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-logo-dark.svg"
  const logo = "/logo2.png"
  const logoDark = "/logo2.png"

  return (
    <div className='w-20 h-20 relative'>
      <Image className="h-20 object-contain dark:hidden" fill src={logo} alt="" />
      <Image className="h-20 object-contain hidden dark:block" fill src={logoDark} alt="" />
    </div>
  );
}

