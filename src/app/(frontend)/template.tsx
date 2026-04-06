'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Template({ children }: { children: React.ReactNode }) {
  const [isAnimating, setIsAnimating] = useState(true)

  useEffect(() => {
    if (isAnimating) {
      document.body.style.overflow = 'hidden'
      window.scrollTo(0, 0)
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isAnimating])

  return (
    <>
      {isAnimating && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{
            duration: 0.9,
            ease: [0.76, 0, 0.24, 1],
            delay: 1.0 // Slide up quicker after logo appears
          }}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <div className="relative flex items-center overflow-hidden pb-4">
            <motion.div
              className="w-[80vw] max-w-[300px] md:max-w-[450px]"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.6,
                ease: [0.33, 1, 0.68, 1], // Smooth snappy easeOut, same as the original text
              }}
            >
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-auto object-contain"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
      {children}
    </>
  )
}

