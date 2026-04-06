import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/utilities/ui";
import Link from "next/link";

interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  showIcon?: boolean;
  Icon?: React.ElementType;
  variant?: 'call-button' | 'contact-button';
  href?: string;
}

const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ text = "Button", showIcon = true, className, Icon = ArrowRight, variant = 'contact-button', href, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative w-32 cursor-pointer overflow-hidden rounded-full border border-[#44903C] bg-background p-2 text-center font-semibold text-[#44903C] hover:text-white !!transition-colors !!duration-300",
        className,
      )}
      {...props}
    >
      {variant === 'call-button' ? (
        <Link href={href || ''} className="w-full h-full">
          <span className="inline-block translate-x-1 !!transition-all !!duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            {text}
          </span>
          <div className={`absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 !!transition-all !!duration-300 ${showIcon ? "group-hover:-translate-x-1" : "group-hover:-translate-x-6"} group-hover:opacity-100`}>
            <span>{text}</span>
            {showIcon && Icon && <Icon />}
          </div>
          <div className={`absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg !!transition-all !!duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:bg-[#44903C] group-hover:w-full group-hover:scale-[1.8] ${!showIcon ? "bg-white -z-10 group-hover:z-[1]" : " bg-[#44903C] "}`}></div>
        </Link>
      ) : (
        <>
          <span className="inline-block translate-x-1 !!transition-all !!duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            {text}
          </span>
          <div className={`absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 !!transition-all !!duration-300 ${showIcon ? "group-hover:-translate-x-1" : "group-hover:-translate-x-6"} group-hover:opacity-100`}>
            <span>{text}</span>
            {showIcon && Icon && <Icon />}
          </div>
          <div className={`absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg !!transition-all !!duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:bg-[#44903C] group-hover:w-full group-hover:scale-[1.8] ${!showIcon ? "bg-white -z-10 group-hover:z-[1]" : " bg-[#44903C] "}`}></div>
        </>
      )}
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";

export { InteractiveHoverButton };
