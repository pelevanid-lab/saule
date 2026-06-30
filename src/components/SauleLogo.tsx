'use client';
import Image from 'next/image';

interface SauleLogoProps {
  size?: number;
  className?: string;
}

export default function SauleLogo({ size = 32, className = '' }: SauleLogoProps) {
  return (
    <Image
      src="/saule-logo.webp"
      alt="Saule Logo"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  );
}
