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
  
  const dimensions = {
    small: { width: 32, height: 32 },
    medium: { width: 48, height: 48 },
    large: { width: 80, height: 80 }
  }
  
  return (
    <Image
      src={src}
      alt="ReWork Logo"
      width={dimensions[size].width}
      height={dimensions[size].height}
      className={cn(sizeClasses[size], 'object-contain', className)}
      priority
      unoptimized // For transparent PNGs
    />
  )
}