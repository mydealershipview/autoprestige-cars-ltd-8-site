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
            delay: 2.0 // Held on screen after animations finish, then slide up
          }}
          onAnimationComplete={() => setIsAnimating(false)}
        >
          <div className="relative flex items-center">
            {/* Custom stylized tick drawn from left to right */}
            <motion.div
              className="absolute left-[-2rem] md:left-[-4rem] top-1/2 -translate-y-1/2 z-[-1] w-28 h-28 md:w-44 md:h-44"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.01, delay: 0.89 }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <mask id="tick-mask">
                    <motion.path
                      d="M 15 50 L 36 85 L 95 15"
                      fill="transparent"
                      stroke="white"
                      strokeWidth="35"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.7,
                        ease: "easeOut",
                        delay: 0.9,
                      }}
                    />
                  </mask>
                </defs>
                <path
                  d="M 15 50 Q 25 60 34 76 Q 60 40 95 15 Q 60 50 37 90 Q 22 68 15 50 Z"
                  fill="#e7000b"
                  mask="url(#tick-mask)"
                />
              </svg>
            </motion.div>

            {"TEMPLATE".split("").map((char, index) => (
              <motion.span
                key={index}
                className="text-white text-5xl md:text-7xl font-medium tracking-[0.3em] uppercase"
                style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  ease: [0.33, 1, 0.68, 1], // Smooth easeOut
                  delay: index * 0.1, // Staggered appearance
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
      {children}
    </>
  )
}
