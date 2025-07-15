import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'detailed' | 'simple'
  size?: 'xs' | 'small' | 'medium' | 'large'
  className?: string
}

const sizeClasses = {
  xs: 'w-12 h-12',     // Perfect for navbar with cropped images
  small: 'w-40 h-40',  // 4x from w-10 h-10
  medium: 'w-64 h-64', // 4x from w-16 h-16
  large: 'w-80 h-80'   // 4x from w-20 h-20
}

export function Logo({ 
  variant = 'detailed', 
  size = 'medium',
  className 
}: LogoProps) {
  const src = variant === 'detailed' 
    ? '/rework-logo-detailed-cropped2.png' 
    : '/rework-logo-simple-cropped.png'
  
  const dimensions = {
    xs: { width: 80, height: 80 },         // Perfect for navbar with cropped images
    small: { width: 256, height: 256 },    // 4x from 64x64
    medium: { width: 384, height: 384 },   // 4x from 96x96
    large: { width: 640, height: 640 }     // 4x from 160x160
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