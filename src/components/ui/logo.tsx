import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'detailed' | 'simple'
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const sizeClasses = {
  small: 'w-10 h-10',  // was w-5 h-5
  medium: 'w-16 h-16', // was w-8 h-8
  large: 'w-20 h-20'   // was w-10 h-10
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
    small: { width: 64, height: 64 },    // was 32x32
    medium: { width: 96, height: 96 },   // was 48x48
    large: { width: 160, height: 160 }   // was 80x80
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