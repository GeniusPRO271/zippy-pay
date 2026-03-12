'use client'

interface StepProps {
  isActive: boolean
  isPast: boolean
  direction: 'forward' | 'backward'
  children: React.ReactNode
}

export function Step({ isActive, isPast, direction, children }: StepProps) {
  const getTransformClass = () => {
    if (isActive) return 'opacity-100 translate-x-0'

    if (isPast) {
      return direction === 'forward'
        ? 'opacity-0 -translate-x-full absolute inset-0 pointer-events-none'
        : 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'
    }

    return 'opacity-0 translate-x-full absolute inset-0 pointer-events-none'
  }

  return (
    <div className={`flex-1 flex flex-col h-full transition-all duration-400 ease-in-out ${getTransformClass()}`}>
      {children}
    </div>
  )
}
