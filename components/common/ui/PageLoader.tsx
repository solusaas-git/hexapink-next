"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const PageLoader: React.FC = () => {
  const [loading, setLoading] = useState(true); // Start with true for initial load
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
    // Hide loader after initial page load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Handle route changes (but not initial mount)
  useEffect(() => {
    if (!mounted) return;

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname, mounted]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-pink/20 border-t-pink rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-pink/10 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-kanit font-semibold text-dark">Loading</span>
          <div className="flex gap-1">
            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;

