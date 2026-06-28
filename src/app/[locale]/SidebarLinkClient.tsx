'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarLinkClient({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  // Normalize comparison by checking exact match or prefix if it's home
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`block font-serif text-[15px] py-2 border-l-2 pl-3 transition-all duration-200 ${
        isActive
          ? 'border-sage text-sage-dark font-semibold bg-sand-200/40 rounded-r'
          : 'border-transparent text-charcoal-muted hover:text-charcoal hover:border-sand-300'
      }`}
    >
      {label}
    </Link>
  );
}
