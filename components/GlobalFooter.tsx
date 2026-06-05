'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function GlobalFooter() {
  const pathname = usePathname();
  
  // Define working area routes where the footer should NOT be displayed
  const workingAreaRoutes = [
    '/dashboard', 
    '/marketplace', 
    '/trading', 
    '/agents', 
    '/build', 
    '/workflow'
  ];
  
  // Check if current path starts with any of the working area routes
  const isWorkingArea = workingAreaRoutes.some(route => pathname?.startsWith(route));
  
  if (isWorkingArea) return null;
  
  return <Footer />;
}
