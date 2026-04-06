'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Instagram, Heart } from 'lucide-react';
import Link from 'next/link';
import SocialLinks from './social-links';
import { CustomButton } from '@/components/ui/custom-button';
import { ContactData } from '@/types/contact';
import { useWishlist } from '@/contexts/WishlistContext';

interface TopBarProps {
  contactData?: ContactData | null;
}

export default function TopBar({ contactData }: TopBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { wishlistCount } = useWishlist();
  const displayName = contactData?.businessAddress?.name || 'Dealership'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((token) => token[0]?.toUpperCase() || '')
    .join('')
    .padEnd(3, 'D')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const phoneNumbers = contactData?.phoneNumbers || []
  const primaryPhone = phoneNumbers.find(phone => phone.isPrimary) || phoneNumbers[0]
  const secondaryPhone = phoneNumbers.find(phone => !phone.isPrimary && phone !== primaryPhone) || phoneNumbers[1]

  return (
    <motion.div
      className={`hidden lg:block fixed top-0 left-0 right-0 z-50 !!transition-all !!duration-300 ${isScrolled
        ? 'bg-black/60 backdrop-blur-sm py-2'
        : 'bg-black/30 backdrop-blur-sm py-3'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Left Phone Numbers - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4 text-white">
            {primaryPhone && (
              <Link href={`tel:${primaryPhone.number.replace(/\s/g, '')}`} className="flex items-center space-x-2 hover:text-gray-300 hover:underline hover:underline-offset-4">
                <Phone className="h-4 w-4 text-[#44903C]" />
                <span className="text-sm font-medium">{primaryPhone.number}</span>
              </Link>
            )}
            {secondaryPhone && (
              <Link href={`tel:${secondaryPhone.number.replace(/\s/g, '')}`} className="flex items-center space-x-2 hover:text-gray-300 hover:underline hover:underline-offset-4">
                <Phone className="h-4 w-4 text-[#44903C]" />
                <span className="text-sm font-medium">{secondaryPhone.number}</span>
              </Link>
            )}
          </div>

          {/* Center Logo */}
          <motion.div
            animate={{
              scale: isScrolled ? 0.8 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Link href='/' className="flex flex-col items-center gap-2">
              <div className="flex items-center">
                {/* Y - Green Block */}
                <div className={` bg-[#8F8F8F] skew-x-[-16deg] flex items-center justify-center !!transition-all !!duration-300 ${isScrolled ? 'w-11 h-9' : 'w-[4.5rem] h-14'}`}>
                  <span className={`font-bold skew-x-[16deg] text-white !!transition-all !!duration-300 ${isScrolled ? 'text-lg' : 'text-4xl'}`}>{initials[0]}</span>
                </div>
                {/* N - Blue Block */}
                <div className={`bg-white skew-x-[-16deg] flex items-center justify-center !!transition-all !!duration-300 ${isScrolled ? 'w-11 h-9' : 'w-[4.5rem] h-14'}`}>
                  <span className={`font-bold skew-x-[16deg] text-black !!transition-all !!duration-300 ${isScrolled ? 'text-lg' : 'text-4xl'}`}>{initials[1]}</span>
                </div>
                {/* C - Red Block */}
                <div className={`bg-[#44903C] skew-x-[-16deg] flex items-center justify-center !!transition-all !!duration-300 ${isScrolled ? 'w-11 h-9' : 'w-[4.5rem] h-14'}`}>
                  <span className={`font-bold skew-x-[16deg] text-white !!transition-all !!duration-300 ${isScrolled ? 'text-lg' : 'text-4xl'}`}>{initials[2]}</span>
                </div>
              </div>
              <div className="ml-3 text-center">
                <div className={`text-white font-bold tracking-wider !!transition-all !!duration-300 ${isScrolled ? 'text-xs' : 'text-sm'}`}>{displayName}</div>
                {/* <div className={`pt-1 text-gray-300 tracking-wide !transition-all !duration-300 ${isScrolled ? 'text-xs hidden md:block' : 'text-xs'}`}>Prestige BMW Vehicle Sales Nottingham</div> */}
              </div>
            </Link>
          </motion.div>

          {/* Right Side - Wishlist and Social Links */}
          <div className="flex items-center space-x-4 text-white">
            <Link href="/wishlist">
              <CustomButton variant="ghost" size="sm" className="text-white hover:bg-white/10 h-8 w-8 p-0 relative">
                <Heart className={`h-4 w-4`} />
                {/* {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {wishlistCount}
                  </span>
                )} */}
              </CustomButton>
            </Link>
            <SocialLinks variant="header" contactData={contactData} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
