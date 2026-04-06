'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Search } from 'lucide-react';
import { CustomButton } from '@/components/ui/custom-button';
import SocialLinks from '@/components/ui/social-links';
import Link from 'next/link';
import { ContactData } from '@/types/contact';

interface MobileNavProps {
  navigationItems: any[];
  onNavClick: (item: any) => void;
  contactData?: ContactData | null;
  isPromotionsEnabled?: boolean;
}

export default function MobileNavigation({ navigationItems, onNavClick, contactData, isPromotionsEnabled }: MobileNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>(null);
  const displayName = contactData?.businessAddress?.name || 'Dealership'
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((token) => token[0]?.toUpperCase() || '')
    .join('')
    .padEnd(3, 'D')

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavItemClick = (item: any) => {
    setIsMobileMenuOpen(false);
    onNavClick(item);
  };

  const toggleDropdown = (label: string) => {
    setExpandedDropdown(expandedDropdown === label ? null : label);
  };

  return (
    <>
      {/* Mobile Navigation Bar - Fixed at top */}
      <div className="w-screen lg:hidden fixed top-0 left-0 right-0 z-[100] bg-black/30 backdrop-blur-sm">
        <div className="flex justify-between items-center h-14 px-4">
          {/* Menu Button */}
          <CustomButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-600 h-8 w-8 p-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">MENU</span>
          </CustomButton>

          {/* Logo Centered */}
          <Link href="/" className="flex flex-col items-center justify-center flex-1 gap-1">
            <div className="flex items-center">
              {/* VNC Logo Blocks */}
              <div className="bg-[#8F8F8F] skew-x-[-16deg] flex items-center justify-center w-6 h-6">
                <span className="font-bold skew-x-[16deg] text-white text-sm">{initials[0]}</span>
              </div>
              <div className="bg-white skew-x-[-16deg] flex items-center justify-center w-6 h-6">
                <span className="font-bold skew-x-[16deg] text-black text-sm">{initials[1]}</span>
              </div>
              <div className="bg-[#44903C] skew-x-[-16deg] flex items-center justify-center w-6 h-6">
                <span className="font-bold skew-x-[16deg] text-white text-sm">{initials[2]}</span>
              </div>
            </div>
            <div className="ml-2">
              <div className="text-white font-bold text-xs tracking-wider">{displayName}</div>
            </div>
          </Link>

          {/* Browse Button */}
          {/* <CustomButton
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-600 h-8 w-8 p-0"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">BROWSE</span>
          </CustomButton> */}
          <div />
        </div>
      </div>

      {/* Full Screen Mobile Menu Sidebar - Below the navbar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden fixed top-14 left-0 right-0 bottom-0 z-50 bg-white h-screen"
          // style={{ height: 'calc(100vh - 56px)' }}
          >
            <div className="flex flex-col h-full">
              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-6">
                <nav className="space-y-4">
                  {navigationItems.map((item) => {
                    if (item.label === 'Promotions' && !isPromotionsEnabled) {
                      return null
                    }
                    return (
                      <div key={item.label}>
                        <div
                          className="flex justify-between items-center py-3 border-b border-gray-100 cursor-pointer"
                          onClick={() => {
                            if (item.hasDropdown) {
                              toggleDropdown(item.label);
                            } else {
                              handleNavItemClick(item);
                            }
                          }}
                        >
                          <span className="text-lg font-medium text-slate-900 hover:text-[#44903C] !transition-colors">
                            {item.label}
                          </span>
                          {item.hasDropdown && (
                            <ChevronDown
                              className={`h-5 w-5 text-gray-500 !transition-transform !duration-200 ${expandedDropdown === item.label ? 'rotate-180' : ''
                                }`}
                            />
                          )}
                        </div>

                        {/* Dropdown Items */}
                        <AnimatePresence>
                          {item.hasDropdown && expandedDropdown === item.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="py-2 pl-4 space-y-2">
                                {item.dropdownItems?.map((dropdownItem: any) => (
                                  <a
                                    key={dropdownItem.label}
                                    href={dropdownItem.href}
                                    className="block py-2 text-base text-gray-600 hover:text-[#44903C] !transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {dropdownItem.label}
                                  </a>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </nav>

                {/* Social Links Section */}
                <div className="border-t border-gray-200 mt-8 pt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 text-center">Follow Us</h4>
                  <SocialLinks variant="mobile" contactData={contactData} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
