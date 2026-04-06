'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/utilities/ui';

interface DualRangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  labelPosition?: 'top' | 'bottom';
  label?: (value: number | undefined) => React.ReactNode;
}

const DualRangeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualRangeSliderProps
>(({ className, label, labelPosition = 'top', ...props }, ref) => {
  const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn('relative flex w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#44903C] to-[#8F8F8F] rounded-full" />
      </SliderPrimitive.Track>
      {initialValue.map((value, index) => (
        <React.Fragment key={index}>
          <SliderPrimitive.Thumb className="relative block h-4 w-4 rounded-full border-2 border-[#44903C] bg-white shadow-lg ring-offset-background !transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#44903C]/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 hover:shadow-xl">
            {label && (
              <span
                className={cn(
                  'absolute flex w-full justify-center text-xs font-medium text-slate-600',
                  labelPosition === 'top' && '-top-7',
                  labelPosition === 'bottom' && 'top-6',
                )}
              >
                {label(value)}
              </span>
            )}
          </SliderPrimitive.Thumb>
        </React.Fragment>
      ))}
    </SliderPrimitive.Root>
  );
});
DualRangeSlider.displayName = 'DualRangeSlider';

export { DualRangeSlider };
