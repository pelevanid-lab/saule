'use client';
import Image from 'next/image';
import logoSrc from '../../public/saule-logo.png';

interface SauleLogoProps {
  size?: number;
  className?: string;
}

/**
 * Saule Yin-Yang-Zing Logo
 * Renders the high-quality brand asset logo using next/image.
 */
export default function SauleLogo({ size = 32, className = '' }: SauleLogoProps) {
  return (
    <Image
      src={logoSrc}
      alt="Saule Logo"
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      priority
    />
  );
}
