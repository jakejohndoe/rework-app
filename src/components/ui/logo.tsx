import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'detailed' | 'simple'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const sizeClasses = {
  small: 'w-5 h-5',
  medium: 'w-8 h-8', 
  large: 'w-10 h-10'
}

export function Logo({ 
  variant = 'detailed', 
  size = 'medium',
  className 
}: LogoProps) {
  const src = variant === 'detailed' 
    ? '/rework-logo-detailed.png' 
    : '/rework-logo-simple.png'
  
  return (
    <Image
      src={src}
      alt="ReWork Logo"
      width={40}
      height={40}
      className={cn(sizeClasses[size], className)}
      priority
    />
  )
}