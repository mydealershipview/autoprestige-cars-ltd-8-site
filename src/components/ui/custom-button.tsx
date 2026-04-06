"use client"

import { forwardRef } from "react"
import { motion } from "motion/react"
import { cn } from "@/utilities/ui"

interface CustomButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  gradient?: boolean
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    rounded = false,
    icon,
    iconPosition = 'left',
    gradient = false,
    children,
    onClick,
    disabled = false,
    type = 'button',
    ...props
  }, ref) => {
    const baseClasses = "cursor-pointer inline-flex items-center justify-center font-medium !transition-all !duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

    const variants = {
      primary: gradient
        ? "bg-gradient-primary hover:bg-gradient-primary-hover text-white shadow-button hover:shadow-button-hover border-0"
        : "bg-primary hover:bg-primary-dark text-primary-foreground shadow-button hover:shadow-button-hover border-0",
      secondary: "bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border hover:border-primary/20",
      outline: "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent",
      ghost: "text-primary hover:bg-primary/10 hover:text-primary-dark bg-transparent border-0",
      accent: gradient
        ? "bg-gradient-accent text-accent-foreground shadow-button-accent hover:shadow-button-accent-hover border-0"
        : "bg-accent hover:bg-accent-light text-accent-foreground shadow-button-accent hover:shadow-button-accent-hover border-0",
      premium: "bg-gradient-premium text-white shadow-lg hover:shadow-xl border-0 hover:scale-[1.02]"
    }

    const sizes = {
      sm: "px-4 py-2 text-sm gap-2",
      md: "px-6 py-3 text-base gap-2",
      lg: "px-8 py-4 text-lg gap-3"
    }

    const roundedClasses = rounded ? "rounded-full" : "rounded-lg"

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          roundedClasses,
          className
        )}
        onClick={onClick}
        disabled={disabled}
        type={type}
      >
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </motion.button>
    )
  }
)

CustomButton.displayName = "CustomButton"

export { CustomButton }
