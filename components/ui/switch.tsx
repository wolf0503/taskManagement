'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border shadow-xs transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted/70',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'pointer-events-none block size-4 rounded-full transition-transform',
          'data-[state=checked]:bg-primary-foreground data-[state=checked]:translate-x-[calc(100%-2px)]',
          'data-[state=unchecked]:bg-background data-[state=unchecked]:translate-x-0 data-[state=unchecked]:ring-1 data-[state=unchecked]:ring-border data-[state=unchecked]:shadow-sm',
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
