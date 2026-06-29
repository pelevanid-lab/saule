'use client';
import Image from 'next/image';

interface SauleLogoProps {
  size?: number;
  className?: string;
}

/**
 * Saule yin-yang-style river & sun logo symbol
 * Renders the official brand asset logo using next/image.
 */
export default function SauleLogo({ size = 32, className = '' }: SauleLogoProps) {
  return (
    <Image
      src="/saule-symbol.svg"
      alt="Saule Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}
